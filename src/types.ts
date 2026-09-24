export type UserRole = 'it_admin' | 'photo_team' | 'creative_team';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
}

export interface EANUploadItem {
  id: string;
  productName: string;
  eanCode: string;
  toonLabel: string;
  brand: string;
  size: string;
  color: string;
  createdAt: string;
  status?: string;
}

export interface ProductInventoryItem {
  id: string;
  ean: string;
  productName: string;
  brand: string;
  colour: string;
  size: string;
  toonLabel: string;
  sellingPrice: number;
  totalAggregatedStock: number;
  storesCount: number;
  gmFashionsWarehouseStock: number;
  karurStock: number;
  koottappalliStock: number;
  kumbakonamStock: number;
  mallurStock: number;
  namakkalStock: number;
  salemStock: number;
  scraGodownStock: number;
  tiruvannamalaiStock: number;
  wholesaleShowroomStock: number;
  storeBreakdown?: string;
  lastUpdated?: string;
}

export interface ImageDataItem {
  id: string;
  productName: string;
  ean: string;
  toonLabel: string;
  brand: string;
  size: string;
  color: string;
  imageCount?: number;
  imageThumbnail?: string;
  sharedToPhoto: boolean;
  sharedToCreative: boolean;
  photoSharedAt?: string;
  creativeSharedAt?: string;
}

export type HandOverStatus = 'Pending Pickup' | 'In Studio' | 'Shot Complete' | 'Returned to WH' | 'Sample Kept';
export type ArjunStatus = 'Pending' | 'Shoot Queued' | 'Shooting' | 'Editing' | 'Approved';
export type ManojStatus = 'Pending' | 'Raw QA' | 'Retouching' | 'Final QA' | 'Uploaded to S3' | 'Completed';

export interface PhotoDelegationItem {
  id: string;
  productName: string;
  ean: string;
  toonLabel: string;
  brand: string;
  size: string;
  color: string;
  outDate: string; // YYYY-MM-DD
  inDate: string; // YYYY-MM-DD
  handOver: HandOverStatus;
  arjunStatus: ArjunStatus;
  manojStatus: ManojStatus;
  syncedAt: string;
  lastUpdatedBy?: string;
  remarks?: string;
}

export type CreativeStatus = 'Brief Received' | 'In Design' | 'Revision' | 'Banner Ready' | 'Catalog Ready' | 'Completed';

export interface CreativeDepartmentItem {
  id: string;
  eanCode: string;
  productName: string;
  date: string;
  statusRemarks: CreativeStatus;
  assignedBy: string;
  lastUpdatedBy?: string;
  assetUrl?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface WorkflowState {
  eanList: EANUploadItem[];
  inventoryList: ProductInventoryItem[];
  imageList: ImageDataItem[];
  photoList: PhotoDelegationItem[];
  creativeList: CreativeDepartmentItem[];
  activityLogs: ActivityLogItem[];
}
