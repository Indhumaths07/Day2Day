import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { WorkflowState } from '../types';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token storage only (per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = () => cachedAccessToken;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      isSigningIn = false;
      return null;
    }
    cachedAccessToken = credential.accessToken;
    isSigningIn = false;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    isSigningIn = false;
    const errorCode = error?.code || '';
    if (
      errorCode === 'auth/popup-closed-by-user' ||
      errorCode === 'auth/cancelled-popup-request' ||
      errorCode === 'auth/popup-blocked'
    ) {
      // The user closed or dismissed the popup window.
      console.info('Google sign-in popup was closed or cancelled by user.');
      return null;
    }
    console.error('Google Sign In error:', error);
    throw error;
  }
};

export const googleSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  await firebaseSignOut(auth);
};

// Google Sheets API Integration
export interface CreatedSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function createOrExportD2DSpreadsheet(
  data: WorkflowState,
  token: string
): Promise<CreatedSpreadsheetResult> {
  const timestamp = new Date().toISOString().slice(0, 10);
  const title = `D2D Workflow Master Sheet (${timestamp})`;

  // 1. Create spreadsheet with sheets for all panels
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'EAN Upload', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Product Inventory', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Image Data', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Photo Team Tracking', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Creative Department', gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const createdSheet = await createResponse.json();
  const spreadsheetId = createdSheet.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare value data batches
  const eanRows = [
    ['Product Name', 'EAN Code', 'Toon Label', 'Brand', 'Size', 'Color', 'Created At', 'Status'],
    ...data.eanList.map((item) => [
      item.productName,
      item.eanCode,
      item.toonLabel,
      item.brand,
      item.size,
      item.color,
      item.createdAt,
      item.status || 'Verified',
    ]),
  ];

  const inventoryRows = [
    [
      'EAN',
      'Product Name',
      'Brand',
      'Colour',
      'Size',
      'Toon Label',
      'Selling Price',
      'Total Aggregated Stock',
      'Stores Count',
      'GM FASHIONS WAREHOUSE Stock',
      'KARUR Stock',
      'KOOTTAPPALLI Stock',
      'KUMBAKONAM Stock',
      'MALLUR Stock',
      'NAMAKKAL Stock',
      'SALEM Stock',
      'SCRA GODOWN Stock',
      'TIRUVANNAMALAI Stock',
      'WHOLESALE SHOWROOM Stock',
      'Store-wise Breakdown',
    ],
    ...data.inventoryList.map((inv) => [
      inv.ean,
      inv.productName,
      inv.brand,
      inv.colour,
      inv.size,
      inv.toonLabel,
      inv.sellingPrice,
      inv.totalAggregatedStock,
      inv.storesCount,
      inv.gmFashionsWarehouseStock,
      inv.karurStock,
      inv.koottappalliStock,
      inv.kumbakonamStock,
      inv.mallurStock,
      inv.namakkalStock,
      inv.salemStock,
      inv.scraGodownStock,
      inv.tiruvannamalaiStock,
      inv.wholesaleShowroomStock,
      inv.storeBreakdown || '',
    ]),
  ];

  const imageRows = [
    ['Product Name', 'EAN', 'TOON LABEL', 'BRAND', 'SIZE', 'COLOR', 'Shared to Photo', 'Shared to Creative'],
    ...data.imageList.map((img) => [
      img.productName,
      img.ean,
      img.toonLabel,
      img.brand,
      img.size,
      img.color,
      img.sharedToPhoto ? 'YES' : 'NO',
      img.sharedToCreative ? 'YES' : 'NO',
    ]),
  ];

  const photoRows = [
    [
      'Product Name',
      'EAN',
      'TOON LABEL',
      'BRAND',
      'SIZE',
      'COLOR',
      'Out Date',
      'In Date',
      'Hand Over',
      'Arjun Status',
      'Manoj Status',
      'Synced At',
      'Last Updated By',
    ],
    ...data.photoList.map((p) => [
      p.productName,
      p.ean,
      p.toonLabel,
      p.brand,
      p.size,
      p.color,
      p.outDate,
      p.inDate,
      p.handOver,
      p.arjunStatus,
      p.manojStatus,
      p.syncedAt,
      p.lastUpdatedBy || '',
    ]),
  ];

  const creativeRows = [
    ['EAN Code', 'Product Name', 'Date', 'Status / Remarks', 'Assigned By', 'Last Updated By'],
    ...data.creativeList.map((c) => [
      c.eanCode,
      c.productName,
      c.date,
      c.statusRemarks,
      c.assignedBy,
      c.lastUpdatedBy || '',
    ]),
  ];

  // 3. Batch update values
  const batchUpdateValuesResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: "'EAN Upload'!A1", values: eanRows },
          { range: "'Product Inventory'!A1", values: inventoryRows },
          { range: "'Image Data'!A1", values: imageRows },
          { range: "'Photo Team Tracking'!A1", values: photoRows },
          { range: "'Creative Department'!A1", values: creativeRows },
        ],
      }),
    }
  );

  if (!batchUpdateValuesResponse.ok) {
    console.warn('Batch value update warning:', await batchUpdateValuesResponse.text());
  }

  return { spreadsheetId, spreadsheetUrl };
}
