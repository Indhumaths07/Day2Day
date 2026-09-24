import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserRole,
  UserSession,
  EANUploadItem,
  ProductInventoryItem,
  ImageDataItem,
  PhotoDelegationItem,
  CreativeDepartmentItem,
  ActivityLogItem,
  WorkflowState,
} from '../types';
import {
  defaultWorkflowState,
} from '../lib/initialData';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  createOrExportD2DSpreadsheet,
  getCachedAccessToken,
} from '../lib/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

interface WorkflowContextType {
  // Auth
  currentUser: UserSession | null;
  loginAsRole: (role: UserRole) => void;
  loginWithPin: (pin: string, requestedRole?: UserRole) => { success: boolean; message: string; role?: UserRole };
  loginWithCredentials: (username: string, pass: string) => boolean;
  logout: () => void;
  googleUser: FirebaseUser | null;
  googleAccessToken: string | null;
  isConnectingGoogle: boolean;
  connectGoogle: () => Promise<boolean>;
  disconnectGoogle: () => Promise<void>;
  
  // Navigation / Views
  itActivePanel: 'all' | 'panel1' | 'panel2' | 'panel3';
  setItActivePanel: (panel: 'all' | 'panel1' | 'panel2' | 'panel3') => void;
  panel1SubTab: 'ean' | 'inventory' | 'image';
  setPanel1SubTab: (tab: 'ean' | 'inventory' | 'image') => void;

  // Data
  eanList: EANUploadItem[];
  inventoryList: ProductInventoryItem[];
  imageList: ImageDataItem[];
  photoList: PhotoDelegationItem[];
  creativeList: CreativeDepartmentItem[];
  activityLogs: ActivityLogItem[];

  // Actions
  shareToPhotoTeam: (selectedEanCodes: string[]) => void;
  shareToCreativeTeam: (selectedEanCodes: string[]) => void;
  
  // Updates & Deletes
  updateEanRecord: (id: string, updates: Partial<EANUploadItem>) => void;
  deleteEanRecord: (id: string) => void;
  addEanRecord: (item: Omit<EANUploadItem, 'id' | 'createdAt'>) => void;

  updateInventoryRecord: (id: string, updates: Partial<ProductInventoryItem>) => void;
  deleteInventoryRecord: (id: string) => void;

  updateImageRecord: (id: string, updates: Partial<ImageDataItem>) => void;
  deleteImageRecord: (id: string) => void;

  updatePhotoRecord: (id: string, updates: Partial<PhotoDelegationItem>) => void;
  deletePhotoRecord: (id: string) => void;
  addPhotoRecord: (item: Omit<PhotoDelegationItem, 'id' | 'syncedAt'>) => void;

  updateCreativeRecord: (id: string, updates: Partial<CreativeDepartmentItem>) => void;
  deleteCreativeRecord: (id: string) => void;
  addCreativeRecord: (item: Omit<CreativeDepartmentItem, 'id'>) => void;

  exportToGoogleDriveSheets: () => Promise<string | null>;

  // Custom Google Sheet URL per sheet
  googleSheetUrls: Record<string, string>;
  setGoogleSheetUrl: (sheetKey: string, url: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Sync state
  lastSyncedAt: Date;
  isSyncing: boolean;
}

const STORAGE_KEY = 'd2d_workflow_state_v4';
const USER_KEY = 'd2d_workflow_current_user_v4';

export const defaultUsers: Record<UserRole, UserSession> = {
  it_admin: {
    id: 'user-it-01',
    username: 'it',
    name: 'IT Department',
    role: 'it_admin',
    email: 'it@d2d-systems.io',
  },
  photo_team: {
    id: 'user-photo-01',
    username: 'pt',
    name: 'Photo Team',
    role: 'photo_team',
    email: 'pt@d2d-systems.io',
  },
  creative_team: {
    id: 'user-creative-01',
    username: 'gd',
    name: 'Godown Team',
    role: 'creative_team',
    email: 'godown@d2d-systems.io',
  },
};

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Active user session: Check saved session or start as null so PIN authorization screen is displayed first
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && defaultUsers[parsed.role as UserRole]) {
          return defaultUsers[parsed.role as UserRole];
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Google OAuth State
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Navigation tabs
  const [itActivePanel, setItActivePanel] = useState<'all' | 'panel1' | 'panel2' | 'panel3'>('all');
  const [panel1SubTab, setPanel1SubTab] = useState<'ean' | 'inventory' | 'image'>('ean');

  // Workflow Data
  const [state, setState] = useState<WorkflowState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.eanList && parsed.inventoryList && parsed.imageList && parsed.photoList) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return defaultWorkflowState;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  // Custom Google Sheet URL state
  const [googleSheetUrls, setGoogleSheetUrls] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('d2d_google_sheet_urls');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const setGoogleSheetUrl = useCallback((sheetKey: string, url: string) => {
    setGoogleSheetUrls((prev) => {
      const updated = { ...prev, [sheetKey]: url };
      try {
        localStorage.setItem('d2d_google_sheet_urls', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Toast helper
  const addToast = useCallback(
    (title: string, message: string, type: ToastMessage['type'] = 'info') => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, timestamp: Date.now() }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Storage sync failed:', err);
    }
  }, [state]);

  // Persist user session across refresh
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // BroadcastChannel for cross-tab synchronization
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('d2d_workflow_channel_v2');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE' && event.data.payload) {
          setState(event.data.payload);
          setLastSyncedAt(new Date());
        }
      };
    } catch {
      // BroadcastChannel not supported in all sandboxes
    }
    return () => {
      if (bc) bc.close();
    };
  }, []);

  const broadcastState = useCallback((newState: WorkflowState) => {
    try {
      const bc = new BroadcastChannel('d2d_workflow_channel_v2');
      bc.postMessage({ type: 'SYNC_STATE', payload: newState });
      bc.close();
    } catch {
      // ignore
    }
  }, []);

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Google sign in handler
  const connectGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setIsConnectingGoogle(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleAccessToken(res.accessToken);
        addToast('Google Connected', `Signed in as ${res.user.email}.`, 'success');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Google authentication could not be completed';
      console.warn('Google Sign In:', errMsg);
      addToast('Sign-In Notice', errMsg, 'info');
      return false;
    } finally {
      setIsConnectingGoogle(false);
    }
  }, [addToast]);

  const disconnectGoogle = useCallback(async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleAccessToken(null);
      addToast('Disconnected', 'Signed out from Google account.', 'info');
    } catch (err: unknown) {
      console.error(err);
    }
  }, [addToast]);

  // Role authentication
  const loginAsRole = useCallback((role: UserRole) => {
    const user = defaultUsers[role];
    setCurrentUser(user);
    if (role === 'it_admin') {
      setItActivePanel('all');
    }
    addToast('Logged In', `Signed in to ${user.name} portal`, 'success');
  }, [addToast]);

  // Department PIN Authorization:
  // IT Admin PIN: 9922
  // Photo Team PIN: 4411
  // Godown Team PIN: 7733
  const loginWithPin = useCallback(
    (pin: string, requestedRole?: UserRole): { success: boolean; message: string; role?: UserRole } => {
      const cleanPin = pin.trim();

      // Check against specific department PINs
      if (cleanPin === '9922') {
        loginAsRole('it_admin');
        return { success: true, message: 'Welcome to IT Department Portal', role: 'it_admin' };
      }
      if (cleanPin === '4411') {
        loginAsRole('photo_team');
        return { success: true, message: 'Welcome to Photo Team Portal', role: 'photo_team' };
      }
      if (cleanPin === '7733') {
        loginAsRole('creative_team');
        return { success: true, message: 'Welcome to Godown Team Portal', role: 'creative_team' };
      }

      // If a department was preselected, give clean error message without exposing PIN
      if (requestedRole === 'it_admin') {
        return { success: false, message: 'Incorrect PIN entered for IT Department.' };
      }
      if (requestedRole === 'photo_team') {
        return { success: false, message: 'Incorrect PIN entered for Photo Team.' };
      }
      if (requestedRole === 'creative_team') {
        return { success: false, message: 'Incorrect PIN entered for Godown Team.' };
      }

      return { success: false, message: 'Incorrect Department PIN entered.' };
    },
    [loginAsRole]
  );

  // USER & PASSWORD CHECK:
  // IT: user: "it", pass: "it@123"
  // Photo: user: "pt", pass: "pt@123"
  // Godown: user: "gd" or "crd", pass: "gd@123" or "crd@123"
  const loginWithCredentials = useCallback(
    (username: string, pass: string): boolean => {
      const u = username.trim().toLowerCase();
      const p = pass.trim();

      if (u === 'it' && p === 'it@123') {
        loginAsRole('it_admin');
        return true;
      }
      if (u === 'pt' && p === 'pt@123') {
        loginAsRole('photo_team');
        return true;
      }
      if ((u === 'gd' || u === 'godown') && (p === 'gd@123' || p === 'godown@123' || p === 'crd@123')) {
        loginAsRole('creative_team');
        return true;
      }
      if (u === 'crd' && (p === 'crd@123' || p === 'gd@123')) {
        loginAsRole('creative_team');
        return true;
      }

      // Backward compatible fallbacks
      if ((u === 'it_admin' || u === 'admin') && (p === 'admin123' || p === 'it@123')) {
        loginAsRole('it_admin');
        return true;
      }
      if (u === 'photo_team' && (p === 'photo123' || p === 'pt@123')) {
        loginAsRole('photo_team');
        return true;
      }
      if ((u === 'creative_team' || u === 'godown_team') && (p === 'creative123' || p === 'crd@123' || p === 'gd@123')) {
        loginAsRole('creative_team');
        return true;
      }

      return false;
    },
    [loginAsRole]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    addToast('Signed Out', 'You have been logged out.', 'info');
  }, [addToast]);

  // Share to Photo Team Action
  const shareToPhotoTeam = useCallback(
    (selectedEanCodes: string[]) => {
      if (selectedEanCodes.length === 0) return;
      setIsSyncing(true);

      setState((prev) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const expectedInDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const itemsToShare = prev.imageList.filter((item) => selectedEanCodes.includes(item.ean));
        const existingEans = new Set(prev.photoList.map((p) => p.ean));
        const newPhotoItems: PhotoDelegationItem[] = [];

        itemsToShare.forEach((item) => {
          if (!existingEans.has(item.ean)) {
            newPhotoItems.push({
              id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productName: item.productName,
              ean: item.ean,
              toonLabel: item.toonLabel,
              brand: item.brand,
              size: item.size,
              color: item.color,
              outDate: todayStr,
              inDate: expectedInDate,
              handOver: 'In Studio',
              arjunStatus: 'Shoot Queued',
              manojStatus: 'Pending',
              syncedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            });
          }
        });

        const updatedImageList = prev.imageList.map((item) => {
          if (selectedEanCodes.includes(item.ean)) {
            return {
              ...item,
              sharedToPhoto: true,
              photoSharedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            };
          }
          return item;
        });

        const newLogs: ActivityLogItem[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            userName: currentUser?.name || 'IT Department',
            role: currentUser?.role || 'it_admin',
            action: 'Share to Photo Team',
            details: `Delegated ${itemsToShare.length} item(s) to Photo Team (EAN: ${selectedEanCodes.join(', ')})`,
          },
          ...prev.activityLogs,
        ];

        const newState: WorkflowState = {
          ...prev,
          imageList: updatedImageList,
          photoList: [...newPhotoItems, ...prev.photoList],
          activityLogs: newLogs,
        };

        broadcastState(newState);
        return newState;
      });

      setLastSyncedAt(new Date());
      setIsSyncing(false);

      addToast(
        'Records Transferred!',
        `Successfully synced ${selectedEanCodes.length} product(s) to Photo Team Sheet.`,
        'success'
      );
    },
    [currentUser, broadcastState, addToast]
  );

  // Share to Creative Team Action
  const shareToCreativeTeam = useCallback(
    (selectedEanCodes: string[]) => {
      if (selectedEanCodes.length === 0) return;
      setIsSyncing(true);

      setState((prev) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const itemsToShare = prev.imageList.filter((item) => selectedEanCodes.includes(item.ean));

        const existingEans = new Set(prev.creativeList.map((c) => c.eanCode));
        const newCreativeItems: CreativeDepartmentItem[] = [];

        itemsToShare.forEach((item) => {
          if (!existingEans.has(item.ean)) {
            newCreativeItems.push({
              id: `crt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              eanCode: item.ean,
              productName: item.productName,
              date: todayStr,
              statusRemarks: 'Brief Received',
              assignedBy: currentUser?.name || 'IT Department',
              lastUpdatedBy: currentUser?.name || 'IT Department',
            });
          }
        });

        const updatedImageList = prev.imageList.map((item) => {
          if (selectedEanCodes.includes(item.ean)) {
            return {
              ...item,
              sharedToCreative: true,
              creativeSharedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            };
          }
          return item;
        });

        const newLogs: ActivityLogItem[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            userName: currentUser?.name || 'IT Department',
            role: currentUser?.role || 'it_admin',
            action: 'Share to Creative Dept',
            details: `Delegated ${itemsToShare.length} item(s) to Creative Dept (EAN: ${selectedEanCodes.join(', ')})`,
          },
          ...prev.activityLogs,
        ];

        const newState: WorkflowState = {
          ...prev,
          imageList: updatedImageList,
          creativeList: [...newCreativeItems, ...prev.creativeList],
          activityLogs: newLogs,
        };

        broadcastState(newState);
        return newState;
      });

      setLastSyncedAt(new Date());
      setIsSyncing(false);

      addToast(
        'Assigned to Creative Dept!',
        `Synced ${selectedEanCodes.length} product(s) to Creative Department Sheet.`,
        'success'
      );
    },
    [currentUser, broadcastState, addToast]
  );

  // EAN Handlers
  const addEanRecord = useCallback(
    (item: Omit<EANUploadItem, 'id' | 'createdAt'>) => {
      setState((prev) => {
        const id = `ean-${Date.now()}`;
        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        const newEan: EANUploadItem = {
          ...item,
          id,
          createdAt,
          status: 'Verified',
        };

        const newInventory: ProductInventoryItem = {
          id: `inv-${Date.now()}`,
          ean: item.eanCode,
          productName: item.productName,
          brand: item.brand,
          colour: item.color,
          size: item.size,
          toonLabel: item.toonLabel,
          sellingPrice: 1299,
          totalAggregatedStock: 100,
          storesCount: 4,
          gmFashionsWarehouseStock: 50,
          karurStock: 20,
          koottappalliStock: 10,
          kumbakonamStock: 10,
          mallurStock: 10,
          namakkalStock: 0,
          salemStock: 0,
          scraGodownStock: 0,
          tiruvannamalaiStock: 0,
          wholesaleShowroomStock: 0,
          storeBreakdown: 'WH: 50, Karur: 20, Koottappalli: 10, Kumbakonam: 10, Mallur: 10',
          lastUpdated: createdAt,
        };

        const newImage: ImageDataItem = {
          id: `img-${Date.now()}`,
          productName: item.productName,
          ean: item.eanCode,
          toonLabel: item.toonLabel,
          brand: item.brand,
          size: item.size,
          color: item.color,
          imageCount: 0,
          sharedToPhoto: false,
          sharedToCreative: false,
        };

        const newLogs: ActivityLogItem[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: createdAt,
            userName: currentUser?.name || 'User',
            role: currentUser?.role || 'it_admin',
            action: 'EAN Added',
            details: `Added new product ${item.productName} (EAN: ${item.eanCode})`,
          },
          ...prev.activityLogs,
        ];

        const newState: WorkflowState = {
          ...prev,
          eanList: [newEan, ...prev.eanList],
          inventoryList: [newInventory, ...prev.inventoryList],
          imageList: [newImage, ...prev.imageList],
          activityLogs: newLogs,
        };

        broadcastState(newState);
        return newState;
      });

      addToast('EAN Added', `Added ${item.productName} (${item.eanCode})`, 'success');
    },
    [currentUser, broadcastState, addToast]
  );

  const updateEanRecord = useCallback(
    (id: string, updates: Partial<EANUploadItem>) => {
      setState((prev) => {
        const updated = prev.eanList.map((item) => (item.id === id ? { ...item, ...updates } : item));
        const newState = { ...prev, eanList: updated };
        broadcastState(newState);
        return newState;
      });
      setLastSyncedAt(new Date());
    },
    [broadcastState]
  );

  const deleteEanRecord = useCallback(
    (id: string) => {
      setState((prev) => {
        const itemToDelete = prev.eanList.find((i) => i.id === id);
        const updated = prev.eanList.filter((i) => i.id !== id);
        const newState = { ...prev, eanList: updated };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Deleted', 'Removed item from EAN Sheet.', 'info');
    },
    [broadcastState, addToast]
  );

  // Inventory Handlers
  const updateInventoryRecord = useCallback(
    (id: string, updates: Partial<ProductInventoryItem>) => {
      setState((prev) => {
        const updatedInventoryList = prev.inventoryList.map((item) => {
          if (item.id === id) {
            const merged = { ...item, ...updates, lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) };
            const total =
              (merged.gmFashionsWarehouseStock || 0) +
              (merged.karurStock || 0) +
              (merged.koottappalliStock || 0) +
              (merged.kumbakonamStock || 0) +
              (merged.mallurStock || 0) +
              (merged.namakkalStock || 0) +
              (merged.salemStock || 0) +
              (merged.scraGodownStock || 0) +
              (merged.tiruvannamalaiStock || 0) +
              (merged.wholesaleShowroomStock || 0);
            merged.totalAggregatedStock = total;
            return merged;
          }
          return item;
        });

        const newState: WorkflowState = {
          ...prev,
          inventoryList: updatedInventoryList,
        };
        broadcastState(newState);
        return newState;
      });
      setLastSyncedAt(new Date());
    },
    [broadcastState]
  );

  const deleteInventoryRecord = useCallback(
    (id: string) => {
      setState((prev) => {
        const updated = prev.inventoryList.filter((i) => i.id !== id);
        const newState = { ...prev, inventoryList: updated };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Deleted', 'Removed item from Inventory Sheet.', 'info');
    },
    [broadcastState, addToast]
  );

  // Image Handlers
  const updateImageRecord = useCallback(
    (id: string, updates: Partial<ImageDataItem>) => {
      setState((prev) => {
        const updated = prev.imageList.map((item) => (item.id === id ? { ...item, ...updates } : item));
        const newState = { ...prev, imageList: updated };
        broadcastState(newState);
        return newState;
      });
      setLastSyncedAt(new Date());
    },
    [broadcastState]
  );

  const deleteImageRecord = useCallback(
    (id: string) => {
      setState((prev) => {
        const updated = prev.imageList.filter((i) => i.id !== id);
        const newState = { ...prev, imageList: updated };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Deleted', 'Removed item from Image Data Sheet.', 'info');
    },
    [broadcastState, addToast]
  );

  // Photo Handlers
  const updatePhotoRecord = useCallback(
    (id: string, updates: Partial<PhotoDelegationItem>) => {
      setState((prev) => {
        let updatedItem: PhotoDelegationItem | undefined;
        const updatedPhotoList = prev.photoList.map((item) => {
          if (item.id === id) {
            updatedItem = {
              ...item,
              ...updates,
              lastUpdatedBy: currentUser?.name || 'Photo Team',
            };
            return updatedItem;
          }
          return item;
        });

        const newLogs: ActivityLogItem[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            userName: currentUser?.name || 'Photo Team',
            role: currentUser?.role || 'photo_team',
            action: 'Photo Status Update',
            details: `Updated ${updatedItem?.productName || 'item'} (EAN: ${updatedItem?.ean || id}): ${Object.entries(
              updates
            )
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}`,
          },
          ...prev.activityLogs,
        ];

        const newState: WorkflowState = {
          ...prev,
          photoList: updatedPhotoList,
          activityLogs: newLogs,
        };

        broadcastState(newState);
        return newState;
      });
      setLastSyncedAt(new Date());
    },
    [currentUser, broadcastState]
  );

  const deletePhotoRecord = useCallback(
    (id: string) => {
      setState((prev) => {
        const updated = prev.photoList.filter((i) => i.id !== id);
        const newState = { ...prev, photoList: updated };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Deleted', 'Removed item from Photo Team Sheet.', 'info');
    },
    [broadcastState, addToast]
  );

  const addPhotoRecord = useCallback(
    (item: Omit<PhotoDelegationItem, 'id' | 'syncedAt'>) => {
      setState((prev) => {
        const id = `photo-${Date.now()}`;
        const syncedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        const newItem: PhotoDelegationItem = { ...item, id, syncedAt };
        const newState = { ...prev, photoList: [newItem, ...prev.photoList] };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Added', `Added ${item.productName} to Photo Sheet.`, 'success');
    },
    [broadcastState, addToast]
  );

  // Creative Handlers
  const updateCreativeRecord = useCallback(
    (id: string, updates: Partial<CreativeDepartmentItem>) => {
      setState((prev) => {
        let updatedItem: CreativeDepartmentItem | undefined;
        const updatedCreativeList = prev.creativeList.map((item) => {
          if (item.id === id) {
            updatedItem = {
              ...item,
              ...updates,
              lastUpdatedBy: currentUser?.name || 'Creative Team',
            };
            return updatedItem;
          }
          return item;
        });

        const newLogs: ActivityLogItem[] = [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            userName: currentUser?.name || 'Creative Team',
            role: currentUser?.role || 'creative_team',
            action: 'Creative Status Update',
            details: `Updated EAN ${updatedItem?.eanCode || id}: ${Object.entries(updates)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}`,
          },
          ...prev.activityLogs,
        ];

        const newState: WorkflowState = {
          ...prev,
          creativeList: updatedCreativeList,
          activityLogs: newLogs,
        };

        broadcastState(newState);
        return newState;
      });
      setLastSyncedAt(new Date());
    },
    [currentUser, broadcastState]
  );

  const deleteCreativeRecord = useCallback(
    (id: string) => {
      setState((prev) => {
        const updated = prev.creativeList.filter((i) => i.id !== id);
        const newState = { ...prev, creativeList: updated };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Deleted', 'Removed item from Creative Dept Sheet.', 'info');
    },
    [broadcastState, addToast]
  );

  const addCreativeRecord = useCallback(
    (item: Omit<CreativeDepartmentItem, 'id'>) => {
      setState((prev) => {
        const id = `crt-${Date.now()}`;
        const newItem: CreativeDepartmentItem = { ...item, id };
        const newState = { ...prev, creativeList: [newItem, ...prev.creativeList] };
        broadcastState(newState);
        return newState;
      });
      addToast('Row Added', `Added ${item.productName} to Creative Sheet.`, 'success');
    },
    [broadcastState, addToast]
  );

  // Export to Google Sheets
  const exportToGoogleDriveSheets = useCallback(async (): Promise<string | null> => {
    let token = googleAccessToken || getCachedAccessToken();
    if (!token) {
      const connected = await connectGoogle();
      token = getCachedAccessToken() || googleAccessToken;
      if (!connected || !token) {
        addToast('Notice', 'Use the 1-click Download CSV button below for instant Excel download.', 'info');
        return null;
      }
    }

    try {
      const res = await createOrExportD2DSpreadsheet(state, token);
      addToast('Google Sheet Created', `Spreadsheet created in Google Drive!`, 'success');
      return res.spreadsheetUrl;
    } catch (err: unknown) {
      console.warn('Google Sheets creation notice:', err);
      const errMsg = err instanceof Error ? err.message : 'Could not create spreadsheet';
      addToast('Export Notice', errMsg, 'error');
      return null;
    }
  }, [googleAccessToken, state, connectGoogle, addToast]);

  return (
    <WorkflowContext.Provider
      value={{
        currentUser,
        loginAsRole,
        loginWithPin,
        loginWithCredentials,
        logout,
        googleUser,
        googleAccessToken,
        isConnectingGoogle,
        connectGoogle,
        disconnectGoogle,

        itActivePanel,
        setItActivePanel,
        panel1SubTab,
        setPanel1SubTab,

        eanList: state.eanList,
        inventoryList: state.inventoryList,
        imageList: state.imageList,
        photoList: state.photoList,
        creativeList: state.creativeList,
        activityLogs: state.activityLogs,

        shareToPhotoTeam,
        shareToCreativeTeam,

        updateEanRecord,
        deleteEanRecord,
        addEanRecord,

        updateInventoryRecord,
        deleteInventoryRecord,

        updateImageRecord,
        deleteImageRecord,

        updatePhotoRecord,
        deletePhotoRecord,
        addPhotoRecord,

        updateCreativeRecord,
        deleteCreativeRecord,
        addCreativeRecord,

        exportToGoogleDriveSheets,

        googleSheetUrls,
        setGoogleSheetUrl,

        toasts,
        addToast,
        removeToast,

        lastSyncedAt,
        isSyncing,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
