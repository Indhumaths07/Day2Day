import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { X, FileSpreadsheet, ExternalLink, Check, Download, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const {
    googleUser,
    connectGoogle,
    disconnectGoogle,
    isConnectingGoogle,
    exportToGoogleDriveSheets,
    eanList,
    inventoryList,
    imageList,
    photoList,
    creativeList,
    addToast,
  } = useWorkflow();

  const [isExporting, setIsExporting] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setNotice(null);
    if (!googleUser) {
      // Connect first
      const connected = await connectGoogle();
      if (!connected) {
        setNotice('Please complete Google Sign-In to create files directly in your Google Drive, or use the Instant CSV download below.');
        return;
      }
    }

    try {
      setIsExporting(true);
      const url = await exportToGoogleDriveSheets();
      if (url) {
        setCreatedUrl(url);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Instant export all sheets as CSV file
  const handleDownloadAllSheetsCsv = () => {
    try {
      const sheetsData = [
        '=== SHEET 1: EAN UPLOAD ===',
        'Product Name,EAN Code,Toon Label,Brand,Size,Color,Created At',
        ...eanList.map(
          (e) =>
            `"${e.productName}","${e.eanCode}","${e.toonLabel}","${e.brand}","${e.size}","${e.color}","${e.createdAt}"`
        ),
        '',
        '=== SHEET 2: MASTER PRODUCT & INVENTORY ===',
        'EAN,Product Name,Brand,Colour,Size,Toon Label,Selling Price,Total Aggregated Stock,Stores Count,GM Fashions WH,Karur,Koottappalli,Kumbakonam,Mallur,Namakkal,Salem,SCRA Godown,Tiruvannamalai,Wholesale Showroom,Store Breakdown',
        ...inventoryList.map(
          (i) =>
            `"${i.ean}","${i.productName}","${i.brand}","${i.colour}","${i.size}","${i.toonLabel}",${i.sellingPrice},${i.totalAggregatedStock},${i.storesCount},${i.gmFashionsWarehouseStock},${i.karurStock},${i.koottappalliStock},${i.kumbakonamStock},${i.mallurStock},${i.namakkalStock},${i.salemStock},${i.scraGodownStock},${i.tiruvannamalaiStock},${i.wholesaleShowroomStock},"${i.storeBreakdown}"`
        ),
        '',
        '=== SHEET 3: IMAGE DATA ===',
        'Product Name,EAN,TOON LABEL,BRAND,SIZE,COLOR,Photo Synced,Creative Synced',
        ...imageList.map(
          (m) =>
            `"${m.productName}","${m.ean}","${m.toonLabel}","${m.brand}","${m.size}","${m.color}","${m.sharedToPhoto}","${m.sharedToCreative}"`
        ),
        '',
        '=== SHEET 4: PHOTO TEAM TRACKING ===',
        'Product Name,EAN,TOON LABEL,BRAND,SIZE,COLOR,Out Date,In Date,Hand Over,Arjun Status,Manoj Status',
        ...photoList.map(
          (p) =>
            `"${p.productName}","${p.ean}","${p.toonLabel}","${p.brand}","${p.size}","${p.color}","${p.outDate}","${p.inDate}","${p.handOver}","${p.arjunStatus}","${p.manojStatus}"`
        ),
        '',
        '=== SHEET 5: CREATIVE DEPARTMENT ===',
        'EAN Code,Product Name,Date,Status Remarks,Assigned By',
        ...creativeList.map(
          (c) => `"${c.eanCode}","${c.productName}","${c.date}","${c.statusRemarks}","${c.assignedBy}"`
        ),
      ].join('\n');

      const blob = new Blob([sheetsData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `D2D_Master_Workflow_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Download Started', 'Exported all 5 sheets to D2D_Master_Workflow.csv', 'success');
    } catch (e) {
      console.error(e);
      addToast('Download Failed', 'Could not generate CSV file.', 'error');
    }
  };

  return (
    <div
      id="google-sheets-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="google-sheets-card"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Google Sheets & Drive Integration</h3>
              <p className="text-[11px] text-slate-500">Official Google Workspace OAuth & Sheets API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            D2D replicates Google Sheets workflows directly in the web app with interactive spreadsheet grids.
            Connecting your Google account lets you also export and live-sync master catalog, photo delegation,
            and creative department records directly into a native Google Spreadsheet in your Google Drive.
          </p>

          {notice && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* Connection Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            {googleUser ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-800">Connected to Google Workspace</span>
                  </div>
                  <button
                    onClick={disconnectGoogle}
                    className="text-[11px] text-slate-500 hover:text-rose-600 transition"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="text-xs text-slate-700">
                  <div className="font-semibold text-slate-900">{googleUser.displayName || 'Google Account'}</div>
                  <div className="text-slate-500 text-[11px]">{googleUser.email}</div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Permissions: spreadsheets (read/write), drive.file</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs text-slate-600">
                  Sign in with your Google account to enable direct Google Sheets creation in your Google Drive.
                </p>

                {/* Official Google Sign-In Styled Button */}
                <button
                  id="google-signin-popup-btn"
                  type="button"
                  onClick={async () => {
                    setNotice(null);
                    await connectGoogle();
                  }}
                  disabled={isConnectingGoogle}
                  className="mx-auto flex items-center justify-center gap-3 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs rounded-lg border border-slate-300 shadow-xs transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isConnectingGoogle ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Action Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Sheet Workbook Structure</span>
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li>Sheet 1: EAN Upload (Product Name, EAN, Toon Label, Brand, Size, Color)</li>
              <li>Sheet 2: Product Inventory (19 columns including all warehouse & store breakdowns)</li>
              <li>Sheet 3: Image Data (Catalog records & delegation status)</li>
              <li>Sheet 4: Photo Team Tracking (Synced records with Arjun & Manoj statuses)</li>
              <li>Sheet 5: Creative Department (EAN, Date, Design Status)</li>
            </ul>

            <div className="pt-2 flex flex-col gap-2">
              <button
                id="export-to-google-drive-action-btn"
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  {isExporting ? 'Generating Google Spreadsheet...' : 'Create & Sync Google Spreadsheet in Drive'}
                </span>
              </button>

              <button
                id="download-all-sheets-csv-btn"
                type="button"
                onClick={handleDownloadAllSheetsCsv}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download All 5 Sheets (.CSV / Excel)</span>
              </button>
            </div>

            {createdUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1.5 animate-fadeIn">
                <div className="text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Google Spreadsheet created successfully!</span>
                </div>
                <a
                  href={createdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 underline hover:text-emerald-800 font-medium text-[11px]"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
