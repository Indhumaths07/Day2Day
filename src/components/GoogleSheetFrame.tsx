import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  Share2,
  Camera,
  Palette,
  ExternalLink,
  Link2,
  CheckCircle2,
  Layers,
  Sparkles,
  Save,
  Clock,
  Eye,
  Check,
  RotateCcw,
  Printer,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Star,
  FolderSync,
  Cloud,
  MessageSquare,
  Video,
  Undo2,
  Redo2,
  DollarSign,
  Percent,
  Strikethrough,
  PaintBucket,
  Grid,
  Menu,
  ChevronDown,
  Info,
  Globe,
  Sparkle,
  Maximize2,
} from 'lucide-react';
import { downloadCSV } from '../lib/csvExport';
import {
  rawEanCategoryMatrix,
  rawBoysEanCategoryMatrix,
  rawKidsEanCategoryMatrix,
  CategoryEanRow,
} from '../lib/realDataset';

export type SheetType = 'ean' | 'inventory' | 'image' | 'photo' | 'creative' | 'consulting';

interface GoogleSheetFrameProps {
  sheetType: SheetType;
  onBack: () => void;
  onSwitchSheet: (sheet: SheetType) => void;
  userRole: 'it_admin' | 'photo_team' | 'creative_team';
}

export const GoogleSheetFrame: React.FC<GoogleSheetFrameProps> = ({
  sheetType,
  onBack,
  onSwitchSheet,
  userRole,
}) => {
  const {
    eanList,
    inventoryList,
    imageList,
    photoList,
    creativeList,
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
    shareToPhotoTeam,
    shareToCreativeTeam,
    lastSyncedAt,
    addToast,
    googleSheetUrls,
    setGoogleSheetUrl,
  } = useWorkflow();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageEans, setSelectedImageEans] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'table'>('matrix');
  const [subSheetTab, setSubSheetTab] = useState<'MENS' | 'BOYS' | 'KIDS' | 'CATALOG'>('MENS');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(googleSheetUrls[sheetType] || '');
  const [viewMode, setViewMode] = useState<'interactive' | 'embed'>(
    googleSheetUrls[sheetType] ? 'embed' : 'interactive'
  );

  // Cell selection state for Google Sheets formula bar (defaults to J7 exactly as in screenshot)
  const [selectedCellCoord, setSelectedCellCoord] = useState<string>('J7');
  const [selectedCellValue, setSelectedCellValue] = useState<string>('');
  const [editableMatrix, setEditableMatrix] = useState<CategoryEanRow[]>(rawEanCategoryMatrix);

  // -------------------------------------------------------------
  // CSV EXPORT LOGIC
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (sheetType === 'ean') {
      if (subSheetTab !== 'CATALOG') {
        const headers = ['Mens T- Shirt', "Men's Shorts", 'men Pant', 'Mens-Track pant', 'Mens-Shirt'];
        const matrixToExport =
          subSheetTab === 'BOYS'
            ? rawBoysEanCategoryMatrix
            : subSheetTab === 'KIDS'
            ? rawKidsEanCategoryMatrix
            : editableMatrix;
        const rows = matrixToExport.map((r) => [
          r.mensTShirt,
          r.mensShorts,
          r.menPant,
          r.mensTrackPant,
          r.mensShirt,
        ]);
        downloadCSV(`D2D_Sheet1_EAN_${subSheetTab}_Category_Matrix_${timestamp}`, headers, rows);
      } else {
        const headers = ['Product Name', 'EAN Code', 'Toon Label', 'Brand', 'Size', 'Color', 'Status'];
        const rows = eanList.map((i) => [
          i.productName,
          i.eanCode,
          i.toonLabel,
          i.brand,
          i.size,
          i.color,
          i.status,
        ]);
        downloadCSV(`D2D_Sheet1_EAN_Master_${timestamp}`, headers, rows);
      }
    } else if (sheetType === 'inventory') {
      const headers = [
        'EAN',
        'Product Name',
        'Brand',
        'Colour',
        'Size',
        'Toon Label',
        'Selling Price',
        'Total Aggregated Stock',
        'Stores Count',
        'GM Fashions WH',
        'Karur',
        'Koottappalli',
        'Kumbakonam',
        'Mallur',
        'Namakkal',
        'Salem',
        'SCRA Godown',
        'Tiruvannamalai',
        'Wholesale Showroom',
        'Store Breakdown',
      ];
      const rows = inventoryList.map((i) => [
        i.ean,
        i.productName,
        i.brand,
        i.colour,
        i.size,
        i.toonLabel,
        i.sellingPrice,
        i.totalAggregatedStock,
        i.storesCount,
        i.gmFashionsWarehouseStock,
        i.karurStock,
        i.koottappalliStock,
        i.kumbakonamStock,
        i.mallurStock,
        i.namakkalStock,
        i.salemStock,
        i.scraGodownStock,
        i.tiruvannamalaiStock,
        i.wholesaleShowroomStock,
        i.storeBreakdown || '',
      ]);
      downloadCSV(`D2D_Sheet2_Master_Inventory_${timestamp}`, headers, rows);
    } else if (sheetType === 'image') {
      const headers = ['Product Name', 'EAN', 'TOON LABLE', 'BRAND', 'SIZE', 'COLOR', 'Photo Status', 'Creative Status'];
      const rows = imageList.map((i) => [
        i.productName,
        i.ean,
        i.toonLabel,
        i.brand,
        i.size,
        i.color,
        i.sharedToPhoto ? 'Shared to Photo Team' : 'Not Delegated',
        i.sharedToCreative ? 'Shared to Creative' : 'Not Assigned',
      ]);
      downloadCSV(`D2D_Sheet3_Image_Data_${timestamp}`, headers, rows);
    } else if (sheetType === 'photo') {
      const headers = ['Product Name', 'EAN', 'TOON LABLE', 'BRAND', 'SIZE', 'COLOR', 'HAND OVER', 'ARJUN STATUS', 'MANOJ STATUS'];
      const rows = photoList.map((i) => [
        i.productName,
        i.ean,
        i.toonLabel,
        i.brand,
        i.size,
        i.color,
        i.handOver,
        i.arjunStatus,
        i.manojStatus,
      ]);
      downloadCSV(`D2D_Sheet4_Photo_Team_Tracking_${timestamp}`, headers, rows);
    } else if (sheetType === 'creative') {
      const headers = ['EAN CODE', 'STYLE NO', 'Product Name', 'Status / Remarks', 'Date'];
      const rows = creativeList.map((i) => [
        i.eanCode,
        i.productName,
        i.productName,
        i.statusRemarks,
        i.date,
      ]);
      downloadCSV(`D2D_Sheet5_Creative_Tasks_${timestamp}`, headers, rows);
    } else if (sheetType === 'consulting') {
      const headers = ['Category', 'Details', 'Source'];
      const rows = [
        ['Google Sheet URL', googleSheetUrls.consulting || 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit', 'docs.google.com'],
        ['Mode', 'Full Screen Interactive Google Sheet', 'Live Synchronized'],
      ];
      downloadCSV(`D2D_Consulting_Sheet_${timestamp}`, headers, rows);
    }
    addToast('Excel Exported', 'Downloaded Google Sheet data as CSV file successfully.', 'success');
  };

  // Sheet titles and document names
  const sheetMeta = {
    ean: {
      title: 'EAN FOR WEBSITE PRODUCTS',
      docName: 'EAN FOR WEBSITE PRODUCTS',
      tag: 'EAN Barcode Data',
      count: eanList.length,
    },
    inventory: {
      title: 'PRODUCT DATA - Google Sheets (19 Columns)',
      docName: 'D2D - Product Data & Store Inventory Stock',
      tag: '19 Master Columns',
      count: inventoryList.length,
    },
    image: {
      title: 'IMAGE DATA & DELEGATION - Google Sheets',
      docName: 'D2D - Image Data Path & Delegation',
      tag: 'Forwarding Center',
      count: imageList.length,
    },
    photo: {
      title: 'PHOTO TEAM - Google Sheets',
      docName: 'D2D - Photo Team Tracking Sheet',
      tag: 'Photo Studio',
      count: photoList.length,
    },
    creative: {
      title: 'CREATIVE DEPARTMENT - Google Sheets',
      docName: 'D2D - Creative Department Design Tasks',
      tag: 'Creative Dept',
      count: creativeList.length,
    },
    consulting: {
      title: 'CONSULTING - Actual Google Sheet (Full Screen)',
      docName: 'D2D - Live Consulting Google Sheet',
      tag: 'Consulting',
      count: 0,
    },
  }[sheetType];

  // Save custom Google Sheet URL
  const handleSaveGoogleSheetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleSheetUrl(sheetType, tempUrl.trim());
    setIsUrlModalOpen(false);
    if (tempUrl.trim()) {
      setViewMode('embed');
      addToast('Google Sheet Linked', 'Your custom Google Sheet URL has been linked successfully.', 'success');
    }
  };

  // Convert Google Sheet edit URL to embeddable preview or iframe URL
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    try {
      // If it's a standard docs.google.com/spreadsheets/d/.../edit
      if (rawUrl.includes('docs.google.com/spreadsheets')) {
        let clean = rawUrl.split('?')[0];
        if (clean.endsWith('/edit')) {
          clean = clean.replace(/\/edit$/, '/preview');
        } else if (!clean.endsWith('/preview') && !clean.endsWith('/pubhtml')) {
          clean += '/preview';
        }
        return clean;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const currentEmbedUrl = getEmbedUrl(googleSheetUrls[sheetType] || '');

  // Filter lists
  const filteredEan = eanList.filter((i) =>
    `${i.productName} ${i.eanCode} ${i.brand} ${i.toonLabel}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredInventory = inventoryList.filter((i) =>
    `${i.productName} ${i.ean} ${i.brand} ${i.toonLabel}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredImage = imageList.filter((i) =>
    `${i.productName} ${i.ean} ${i.brand} ${i.toonLabel}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPhoto = photoList.filter((i) =>
    `${i.productName} ${i.ean} ${i.brand} ${i.arjunStatus} ${i.manojStatus}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCreative = creativeList.filter((i) =>
    `${i.productName} ${i.eanCode} ${i.statusRemarks}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="google-sheet-frame-outer" className="space-y-4">
      {/* -------------------------------------------------------------
          OUTSIDE THE GOOGLE SHEET FRAME: ACTION BAR
          (As user requested: "google sheet frame ku velila share to photo team nu potta adhu vandhu photo team ku pooganum avlo dhan")
         ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              id="back-to-box-buttons"
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Box Buttons</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-300">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Sheet Frame</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Public Live Access
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{sheetMeta.title}</h2>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* IN IMAGE DATA: SPECIAL "SHARE TO PHOTO TEAM" OUTSIDE FRAME */}
            {sheetType === 'image' && (
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 px-2">
                  {selectedImageEans.length} Selected
                </span>

                {/* Select All Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedImageEans.length === filteredImage.length) {
                      setSelectedImageEans([]);
                    } else {
                      setSelectedImageEans(filteredImage.map((i) => i.ean));
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  {selectedImageEans.length === filteredImage.length ? 'Clear' : 'Select All'}
                </button>

                {/* SHARE TO PHOTO TEAM BUTTON */}
                <button
                  id="outside-share-to-photo-btn"
                  type="button"
                  disabled={selectedImageEans.length === 0}
                  onClick={() => {
                    shareToPhotoTeam(selectedImageEans);
                    setSelectedImageEans([]);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition shadow-xs cursor-pointer"
                  title="Forward selected items from Google Sheet to Photo Team"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Share to Photo Team</span>
                </button>

                {/* SHARE TO CREATIVE TEAM BUTTON */}
                <button
                  id="outside-share-to-creative-btn"
                  type="button"
                  disabled={selectedImageEans.length === 0}
                  onClick={() => {
                    shareToCreativeTeam(selectedImageEans);
                    setSelectedImageEans([]);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg transition shadow-xs cursor-pointer"
                  title="Forward selected items from Google Sheet to Creative Dept"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Share to Creative Dept</span>
                </button>
              </div>
            )}

            {/* Permanent View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-300 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'interactive'
                    ? 'bg-[#0f9d58] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Exact Google Sheets visual grid (Formula bar, J7 cell, lime columns)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Google Sheet View (Screenshot UI)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('embed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'embed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Embed live docs.google.com iframe inside your site"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Real Live Google Sheet (docs.google.com)</span>
              </button>
            </div>

            {/* Set/Change Google Sheet URL */}
            <button
              id="link-google-sheet-url-btn"
              type="button"
              onClick={() => {
                setTempUrl(googleSheetUrls[sheetType] || '');
                setIsUrlModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition shadow-xs cursor-pointer"
              title="Set or edit live docs.google.com link"
            >
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{googleSheetUrls[sheetType] ? 'Change Link' : 'Set Google Sheet Link'}</span>
            </button>

            {/* Download Excel CSV */}
            <button
              id="sheet-frame-export-csv"
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer"
              title="1-Click immediate download without Google Sign-In"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Sheet Hop Bar for IT Department */}
        {userRole === 'it_admin' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Switch Sheet:</span>
            <button
              onClick={() => onSwitchSheet('ean')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'ean' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              EAN Data
            </button>
            <button
              onClick={() => onSwitchSheet('inventory')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'inventory' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Product Data (19 Cols)
            </button>
            <button
              onClick={() => onSwitchSheet('image')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'image' ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Image Data & Share
            </button>
            <button
              onClick={() => onSwitchSheet('photo')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'photo' ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Photo Team Sheet
            </button>
            <button
              onClick={() => onSwitchSheet('creative')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'creative' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Creative Dept Sheet
            </button>
            <button
              onClick={() => {
                const btn = document.getElementById('navbar-consulting-btn');
                if (btn) btn.click();
              }}
              className="px-3 py-1 rounded-lg font-bold whitespace-nowrap transition bg-emerald-50 text-[#0f9d58] border border-emerald-300 hover:bg-[#0f9d58] hover:text-white flex items-center gap-1 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Consulting (Full Screen)</span>
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          LINK GOOGLE SHEET URL MODAL
         ------------------------------------------------------------- */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                <span>Link Live Google Sheet URL</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              If you have created an actual Google Sheet on <strong>docs.google.com</strong> for{' '}
              <span className="font-semibold text-slate-800">{sheetMeta.docName}</span>, paste its sharing link below. It will open and embed directly inside our site frame!
            </p>
            <form onSubmit={handleSaveGoogleSheetUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Sheet URL (Public / Anyone with Link can view/edit)
                </label>
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1.../edit?usp=sharing"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                {googleSheetUrls[sheetType] && (
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSheetUrl(sheetType, '');
                      setTempUrl('');
                      setViewMode('interactive');
                      setIsUrlModalOpen(false);
                      addToast('Link Removed', 'Switched back to internal Google Sheet grid.', 'info');
                    }}
                    className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition mr-auto"
                  >
                    Clear Link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs"
                >
                  Save & Embed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          IF EMBED MODE IS ACTIVE (REAL GOOGLE SHEET VIA DOCS.GOOGLE.COM)
         ------------------------------------------------------------- */}
      {viewMode === 'embed' ? (
        currentEmbedUrl ? (
          <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[750px]">
            {/* Header */}
            <div className="bg-[#0f9d58] text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span className="font-bold">{sheetMeta.docName}</span>
                <span className="text-emerald-100 text-[11px] bg-emerald-700/60 px-2 py-0.5 rounded">
                  • Live Embedded Google Sheet
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(true)}
                  className="text-emerald-100 hover:text-white underline text-[11px] cursor-pointer"
                >
                  Change Link
                </button>
                <a
                  href={googleSheetUrls[sheetType]}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-white bg-emerald-900/60 hover:bg-emerald-900 px-2.5 py-1 rounded transition"
                >
                  <span>Open in Google Sheets tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            {/* Real Google Sheet Iframe */}
            <iframe
              src={currentEmbedUrl}
              title={sheetMeta.docName}
              className="w-full flex-1 border-0"
              allow="clipboard-read; clipboard-write"
            />
          </div>
        ) : (
          /* EMBED SETUP CARD IF USER HASN'T ENTERED A LINK YET */
          <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-sm p-8 max-w-2xl mx-auto my-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-[#0f9d58] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Connect Real Google Sheet (docs.google.com)
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Paste your Google Sheet link below to load and interact with your actual Google Sheet directly inside this site.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (tempUrl.trim()) {
                  setGoogleSheetUrl(sheetType, tempUrl.trim());
                  addToast('Live Google Sheet Connected', 'Your sheet is now embedded directly inside the site.', 'success');
                }
              }}
              className="space-y-4 max-w-lg mx-auto"
            >
              <div className="flex gap-2">
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0f9d58] hover:bg-emerald-700 text-white rounded-xl transition shadow-xs cursor-pointer"
                >
                  Embed Now
                </button>
              </div>

              {/* Demo sheet quick test button */}
              <button
                type="button"
                onClick={() => {
                  const demoUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview';
                  setTempUrl(demoUrl);
                  setGoogleSheetUrl(sheetType, demoUrl);
                  addToast('Sample Live Sheet Loaded', 'Now showing live Google Sheet iframe inside your site.', 'info');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
              >
                Or click here to test with a Public Sample Google Sheet
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">📌 How to get your Google Sheet Link (எப்படி எடுப்பது):</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Open your Google Sheet at <b>docs.google.com</b></li>
                <li>Go to <b>File</b> &gt; <b>Share</b> &gt; <b>Publish to web</b> (கோப்பு &gt; பகிர் &gt; வலைப்பின்னலில் வெளியிடு)</li>
                <li>Click <b>Embed</b> &gt; Click <b>Publish</b></li>
                <li>Copy the link and paste it above!</li>
              </ol>
            </div>
          </div>
        )
      ) : (
        /* -------------------------------------------------------------
            THE AUTHENTIC GOOGLE SHEET INTERACTIVE FRAME (SCREENSHOT MATCH)
           ------------------------------------------------------------- */
        <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-sm overflow-hidden">
          {/* 1. Google Sheets Header (Document Name & Menus) */}
          <div className="bg-[#f9fbfd] border-b border-slate-200 px-4 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Google Green Spreadsheet Logo */}
                <div className="w-9 h-9 rounded bg-[#0f9d58] text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={sheetMeta.docName}
                      className="text-base font-semibold text-slate-900 bg-transparent hover:border-slate-300 border border-transparent rounded px-1.5 py-0.5 focus:bg-white focus:border-blue-500 focus:outline-none transition max-w-md"
                      title="Spreadsheet Document Name"
                    />
                    <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-amber-500 transition" title="Star">
                      <Star className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition" title="Move">
                      <FolderSync className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-emerald-600 transition" title="Document Status: Saved to Drive">
                      <Cloud className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  {/* Google Sheets Menu Bar */}
                  <div className="flex items-center gap-3 text-xs text-slate-700 mt-0.5 select-none font-normal">
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">File</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Edit</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">View</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Insert</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Format</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Data</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Tools</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Extensions</span>
                    <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Help</span>
                  </div>
                </div>
              </div>

              {/* Right Controls: Version history, Comments, Meet, Share button & Avatar */}
              <div className="flex items-center gap-2 text-xs">
                <button type="button" className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition" title="Open version history">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition" title="Open comment history">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition" title="Join a call">
                  <Video className="w-4 h-4" />
                </button>
                {/* Authentic Google Blue Share Button */}
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c2e7ff] hover:bg-[#b3dcf8] text-[#001d35] font-semibold text-xs rounded-full transition shadow-xs cursor-pointer"
                  title="Share or Link Google Sheet"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {/* Profile avatar circle */}
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-white">
                  IT
                </div>
              </div>
            </div>
          </div>

          {/* 2. Google Sheets Toolbar (Matches Screenshot exactly) */}
          <div className="bg-[#edf2fa] border-b border-slate-300 px-3 py-1 flex flex-wrap items-center gap-1 text-xs text-slate-700 select-none">
            <button type="button" className="p-1 hover:bg-white rounded transition" title="Undo">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1 hover:bg-white rounded transition" title="Redo">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1 hover:bg-white rounded transition"
              title="Print Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <span className="px-1.5 py-0.5 hover:bg-white rounded font-medium text-[11px] cursor-pointer">100% ▾</span>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <button type="button" className="p-1 hover:bg-white rounded transition font-bold" title="Format as currency">
              <DollarSign className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1 hover:bg-white rounded transition font-bold" title="Format as percent">
              <Percent className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 py-0.5 hover:bg-white rounded font-mono text-[11px] cursor-pointer" title="Decrease decimal places">.0</span>
            <span className="px-1 py-0.5 hover:bg-white rounded font-mono text-[11px] cursor-pointer" title="Increase decimal places">.00</span>
            <span className="px-1.5 py-0.5 hover:bg-white rounded font-medium text-[11px] cursor-pointer" title="More formats">123 ▾</span>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <span className="px-2 py-0.5 hover:bg-white rounded font-medium text-[11px] cursor-pointer">Default (Arial) ▾</span>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <div className="flex items-center gap-0.5">
              <button type="button" className="px-1 hover:bg-white rounded cursor-pointer">-</button>
              <span className="px-1 font-mono text-[11px]">11</span>
              <button type="button" className="px-1 hover:bg-white rounded cursor-pointer">+</button>
            </div>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <button type="button" className="p-1 hover:bg-white rounded transition font-bold" title="Bold">
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1 hover:bg-white rounded transition italic" title="Italic">
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1 hover:bg-white rounded transition" title="Strikethrough">
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            {/* Text color A with black bar */}
            <div className="flex flex-col items-center px-1 hover:bg-white rounded cursor-pointer" title="Text color">
              <span className="font-bold text-[11px] leading-tight">A</span>
              <div className="w-3 h-0.5 bg-black" />
            </div>
            {/* Fill color Paint bucket with neon lime green bar matching screenshot! */}
            <div className="flex flex-col items-center px-1 hover:bg-white rounded cursor-pointer" title="Fill color">
              <PaintBucket className="w-3.5 h-3.5 text-slate-700" />
              <div className="w-3 h-0.5 bg-[#00ff00]" />
            </div>
            <button type="button" className="p-1 hover:bg-white rounded transition" title="Borders">
              <Grid className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <div className="flex items-center">
              <button type="button" className="p-1 hover:bg-white rounded transition" title="Horizontal align">
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-white rounded transition">
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-white rounded transition">
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <span className="px-1.5 py-0.5 hover:bg-white rounded text-[11px] font-mono font-bold cursor-pointer" title="Functions">Σ ▾</span>

            {/* Quick Search */}
            <div className="ml-auto relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in sheet..."
                className="pl-7 pr-2 py-0.5 text-xs bg-white border border-slate-300 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-44"
              />
            </div>
          </div>

          {/* 3. Google Sheets Formula Bar (fx) */}
          <div className="bg-white border-b border-slate-300 px-3 py-1 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 min-w-16 justify-between px-2 font-mono font-semibold text-slate-700 bg-slate-100 py-0.5 rounded border border-slate-200 text-[11px] cursor-pointer">
              <span>{selectedCellCoord}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
            </div>
            <span className="font-serif italic font-bold text-slate-400 text-sm">fx</span>
            <div className="h-4 w-px bg-slate-300" />
            <input
              type="text"
              value={selectedCellValue}
              onChange={(e) => {
                const newVal = e.target.value;
                setSelectedCellValue(newVal);
                // Live edit matrix cells
                const col = selectedCellCoord[0];
                const row = parseInt(selectedCellCoord.slice(1), 10);
                if (row >= 2 && subSheetTab !== 'CATALOG') {
                  const idx = row - 2;
                  const cleanVal = newVal.startsWith("'") ? newVal.slice(1) : newVal;
                  setEditableMatrix((prev) => {
                    const copy = [...prev];
                    if (!copy[idx]) {
                      copy[idx] = { mensTShirt: '', mensShorts: '', menPant: '', mensTrackPant: '', mensShirt: '' };
                    }
                    if (col === 'A') copy[idx] = { ...copy[idx], mensTShirt: cleanVal };
                    else if (col === 'B') copy[idx] = { ...copy[idx], mensShorts: cleanVal };
                    else if (col === 'C') copy[idx] = { ...copy[idx], menPant: cleanVal };
                    else if (col === 'D') copy[idx] = { ...copy[idx], mensTrackPant: cleanVal };
                    else if (col === 'E') copy[idx] = { ...copy[idx], mensShirt: cleanVal };
                    return copy;
                  });
                }
              }}
              placeholder=""
              className="flex-1 text-xs text-slate-900 font-mono focus:outline-none bg-transparent"
            />
          </div>

          {/* 4. The Spreadsheet Grid */}
          <div className="overflow-x-auto max-h-[580px] bg-white">
            {/* =========================================================
                SHEET 1: EAN DATA (Category Matrix OR Master List)
               ========================================================= */}
            {sheetType === 'ean' && (
              <>
                {subSheetTab !== 'CATALOG' ? (
                  /* 5-CATEGORY MATRIX: MATCHES USER SCREENSHOT 100% WITH COLS A-S & NEON LIME CELLS */
                  <table className="w-full text-xs text-left border-collapse border border-slate-300 font-mono">
                    <thead>
                      {/* Column Letters Row (A to S) */}
                      <tr className="bg-[#f8f9fa] text-slate-600 select-none border-b border-slate-300">
                        <th className="w-10 px-2 py-1 text-center text-slate-500 bg-[#e9eef6] border-r border-b border-slate-300 font-mono text-[11px] font-normal"></th>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map((col) => (
                          <th
                            key={col}
                            className={`px-3 py-1 text-center border-r border-b border-slate-300 font-mono text-[11px] font-normal ${
                              selectedCellCoord.startsWith(col) ? 'bg-[#d3e3fd] text-blue-900 font-bold' : 'bg-[#f8f9fa]'
                            }`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* Row 1: Header Row in Google Sheets */}
                      <tr className="hover:bg-slate-50">
                        <td className={`px-2 py-1 text-center font-mono text-[11px] border-r border-b border-slate-300 select-none ${
                          selectedCellCoord.endsWith('1') ? 'bg-[#d3e3fd] text-blue-900 font-bold' : 'bg-[#f8f9fa] text-slate-500'
                        }`}>
                          1
                        </td>
                        <td
                          onClick={() => {
                            setSelectedCellCoord('A1');
                            setSelectedCellValue('Mens T- Shirt');
                          }}
                          className={`px-3 py-1 border-r border-b border-slate-300 font-bold text-slate-900 bg-white cursor-cell select-none ${
                            selectedCellCoord === 'A1' ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                          }`}
                        >
                          Mens T- Shirt
                          {selectedCellCoord === 'A1' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                          )}
                        </td>
                        <td
                          onClick={() => {
                            setSelectedCellCoord('B1');
                            setSelectedCellValue("Men's Shorts");
                          }}
                          className={`px-3 py-1 border-r border-b border-slate-300 font-bold text-slate-900 bg-white cursor-cell select-none ${
                            selectedCellCoord === 'B1' ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                          }`}
                        >
                          Men's Shorts
                          {selectedCellCoord === 'B1' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                          )}
                        </td>
                        <td
                          onClick={() => {
                            setSelectedCellCoord('C1');
                            setSelectedCellValue('men Pant');
                          }}
                          className={`px-3 py-1 border-r border-b border-slate-300 font-bold text-slate-900 bg-white cursor-cell select-none ${
                            selectedCellCoord === 'C1' ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                          }`}
                        >
                          men Pant
                          {selectedCellCoord === 'C1' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                          )}
                        </td>
                        <td
                          onClick={() => {
                            setSelectedCellCoord('D1');
                            setSelectedCellValue('Mens-Track pant');
                          }}
                          className={`px-3 py-1 border-r border-b border-slate-300 font-bold text-slate-900 bg-white cursor-cell select-none ${
                            selectedCellCoord === 'D1' ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                          }`}
                        >
                          Mens-Track pant
                          {selectedCellCoord === 'D1' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                          )}
                        </td>
                        <td
                          onClick={() => {
                            setSelectedCellCoord('E1');
                            setSelectedCellValue('Mens-Shirt');
                          }}
                          className={`px-3 py-1 border-r border-b border-slate-300 font-bold text-slate-900 bg-white cursor-cell select-none ${
                            selectedCellCoord === 'E1' ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                          }`}
                        >
                          Mens-Shirt
                          {selectedCellCoord === 'E1' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                          )}
                        </td>
                        {['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map((col) => {
                          const coord = `${col}1`;
                          const isSel = selectedCellCoord === coord;
                          return (
                            <td
                              key={coord}
                              onClick={() => {
                                setSelectedCellCoord(coord);
                                setSelectedCellValue('');
                              }}
                              className={`px-3 py-1 border-r border-b border-slate-200 bg-white cursor-cell min-w-[80px] ${
                                isSel ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                              }`}
                            >
                              {isSel && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Data Rows 2 to 32 (with neon lime cells matching screenshot) */}
                      {Array.from({ length: 31 }, (_, rIdx) => {
                        const rowNum = rIdx + 2;
                        const dataIdx = rIdx;
                        const activeList =
                          subSheetTab === 'BOYS'
                            ? rawBoysEanCategoryMatrix
                            : subSheetTab === 'KIDS'
                            ? rawKidsEanCategoryMatrix
                            : editableMatrix;
                        const rowData = activeList[dataIdx];

                        const valA = rowData?.mensTShirt ? `'${rowData.mensTShirt}` : '';
                        const valB = rowData?.mensShorts ? `'${rowData.mensShorts}` : '';
                        const valC = rowData?.menPant || '';
                        const valD = rowData?.mensTrackPant ? `'${rowData.mensTrackPant}` : '';
                        const valE = rowData?.mensShirt ? `'${rowData.mensShirt}` : '';

                        return (
                          <tr key={rowNum} className="hover:bg-slate-50/60">
                            {/* Row number column */}
                            <td
                              className={`px-2 py-1 text-center font-mono text-[11px] border-r border-b border-slate-300 select-none ${
                                selectedCellCoord.endsWith(String(rowNum))
                                  ? 'bg-[#d3e3fd] text-blue-900 font-bold'
                                  : 'bg-[#f8f9fa] text-slate-500'
                              }`}
                            >
                              {rowNum}
                            </td>

                            {/* Col A: Mens T-Shirt (Neon Lime Green) */}
                            <td
                              onClick={() => {
                                setSelectedCellCoord(`A${rowNum}`);
                                setSelectedCellValue(valA);
                              }}
                              className={`px-3 py-1 border-r border-b border-slate-300 font-mono text-xs cursor-cell select-text ${
                                valA ? 'bg-[#00ff00] text-black font-normal' : 'bg-white'
                              } ${
                                selectedCellCoord === `A${rowNum}`
                                  ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20'
                                  : ''
                              }`}
                            >
                              {valA}
                              {selectedCellCoord === `A${rowNum}` && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                              )}
                            </td>

                            {/* Col B: Men's Shorts (Neon Lime Green when present) */}
                            <td
                              onClick={() => {
                                setSelectedCellCoord(`B${rowNum}`);
                                setSelectedCellValue(valB);
                              }}
                              className={`px-3 py-1 border-r border-b border-slate-300 font-mono text-xs cursor-cell select-text ${
                                valB ? 'bg-[#00ff00] text-black font-normal' : 'bg-white'
                              } ${
                                selectedCellCoord === `B${rowNum}`
                                  ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20'
                                  : ''
                              }`}
                            >
                              {valB}
                              {selectedCellCoord === `B${rowNum}` && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                              )}
                            </td>

                            {/* Col C: Men Pant (White background as in user screenshot) */}
                            <td
                              onClick={() => {
                                setSelectedCellCoord(`C${rowNum}`);
                                setSelectedCellValue(valC);
                              }}
                              className={`px-3 py-1 border-r border-b border-slate-300 font-mono text-xs bg-white text-black cursor-cell select-text ${
                                selectedCellCoord === `C${rowNum}`
                                  ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20'
                                  : ''
                              }`}
                            >
                              {valC}
                              {selectedCellCoord === `C${rowNum}` && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                              )}
                            </td>

                            {/* Col D: Mens-Track pant (Neon Lime Green when present) */}
                            <td
                              onClick={() => {
                                setSelectedCellCoord(`D${rowNum}`);
                                setSelectedCellValue(valD);
                              }}
                              className={`px-3 py-1 border-r border-b border-slate-300 font-mono text-xs cursor-cell select-text ${
                                valD ? 'bg-[#00ff00] text-black font-normal' : 'bg-white'
                              } ${
                                selectedCellCoord === `D${rowNum}`
                                  ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20'
                                  : ''
                              }`}
                            >
                              {valD}
                              {selectedCellCoord === `D${rowNum}` && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                              )}
                            </td>

                            {/* Col E: Mens-Shirt (Neon Lime Green when present) */}
                            <td
                              onClick={() => {
                                setSelectedCellCoord(`E${rowNum}`);
                                setSelectedCellValue(valE);
                              }}
                              className={`px-3 py-1 border-r border-b border-slate-300 font-mono text-xs cursor-cell select-text ${
                                valE ? 'bg-[#00ff00] text-black font-normal' : 'bg-white'
                              } ${
                                selectedCellCoord === `E${rowNum}`
                                  ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20'
                                  : ''
                              }`}
                            >
                              {valE}
                              {selectedCellCoord === `E${rowNum}` && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                              )}
                            </td>

                            {/* Col F to S: Empty cells, including J7 which is selected by default! */}
                            {['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map((col) => {
                              const coord = `${col}${rowNum}`;
                              const isSel = selectedCellCoord === coord;
                              return (
                                <td
                                  key={coord}
                                  onClick={() => {
                                    setSelectedCellCoord(coord);
                                    setSelectedCellValue('');
                                  }}
                                  className={`px-3 py-1 border-r border-b border-slate-200 bg-white cursor-cell min-w-[70px] ${
                                    isSel ? 'outline-2 outline-[#1a73e8] -outline-offset-1 relative z-20' : ''
                                  }`}
                                >
                                  {isSel && (
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1a73e8] z-30 pointer-events-none" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  /* MASTER CATALOG TABLE */
                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-[#f3f4f6] text-slate-700 select-none border-b border-slate-300 font-semibold">
                        <th className="w-10 px-2 py-2 text-center text-slate-400 bg-slate-200 border-r border-slate-300">#</th>
                        <th className="px-4 py-2 border-r border-slate-300">A: Product Name</th>
                        <th className="px-4 py-2 border-r border-slate-300">B: EAN Code</th>
                        <th className="px-4 py-2 border-r border-slate-300">C: Toon Label</th>
                        <th className="px-4 py-2 border-r border-slate-300">D: Brand</th>
                        <th className="px-4 py-2 border-r border-slate-300">E: Size</th>
                        <th className="px-4 py-2 border-r border-slate-300">F: Color</th>
                        <th className="px-4 py-2 border-r border-slate-300">G: Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-normal">
                      {filteredEan.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition">
                          <td className="px-2 py-1.5 text-center text-slate-400 bg-[#f8fafc] border-r border-slate-300 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-1.5 border-r border-slate-200 font-medium text-slate-900">
                            <input
                              type="text"
                              value={row.productName}
                              onChange={(e) => updateEanRecord(row.id, { productName: e.target.value })}
                              className="w-full bg-transparent focus:bg-white px-1 py-0.5 rounded border border-transparent focus:border-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-1.5 border-r border-slate-200 font-mono text-indigo-700 font-semibold">
                            {row.eanCode}
                          </td>
                          <td className="px-4 py-1.5 border-r border-slate-200 font-mono text-amber-800">
                            {row.toonLabel}
                          </td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-slate-700">{row.brand}</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-slate-700 font-bold">{row.size}</td>
                          <td className="px-4 py-1.5 border-r border-slate-200 text-slate-700">{row.color}</td>
                          <td className="px-4 py-1.5 border-r border-slate-200">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* =========================================================
                SHEET 2: PRODUCT & STOCK INVENTORY (19 COLUMNS)
               ========================================================= */}
            {sheetType === 'inventory' && (
              <table className="w-full text-xs text-left border-collapse border border-slate-300 whitespace-nowrap font-mono">
                <thead>
                  <tr className="bg-[#f3f4f6] text-slate-700 select-none border-b border-slate-300 font-semibold">
                    <th className="w-10 px-2 py-2 text-center text-slate-400 bg-slate-200 border-r border-slate-300">#</th>
                    <th className="px-3 py-2 border-r border-slate-300">A: EAN</th>
                    <th className="px-4 py-2 border-r border-slate-300 font-sans">B: Product Name</th>
                    <th className="px-3 py-2 border-r border-slate-300">C: Brand</th>
                    <th className="px-3 py-2 border-r border-slate-300">D: Colour</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">E: Size</th>
                    <th className="px-3 py-2 border-r border-slate-300">F: Toon Label</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-right">G: Price (₹)</th>
                    <th className="px-3 py-2 border-r border-slate-300 bg-indigo-100 text-indigo-950 font-bold text-center">
                      H: Total Aggregated Stock
                    </th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">I: Stores</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center font-bold bg-amber-100 text-amber-950">
                      J: GM Fashions WH
                    </th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">K: Karur</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">L: Koottappalli</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">M: Kumbakonam</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">N: Mallur</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">O: Namakkal</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">P: Salem</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">Q: SCRA Godown</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">R: Tiruvannamalai</th>
                    <th className="px-3 py-2 border-r border-slate-300 text-center">S: Wholesale Showroom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredInventory.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-2 py-1 text-center text-slate-400 bg-[#f8fafc] border-r border-slate-300 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-indigo-700 font-semibold">{row.ean}</td>
                      <td className="px-4 py-1 border-r border-slate-200 font-sans font-medium text-slate-900 max-w-xs truncate">
                        {row.productName}
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-slate-700">{row.brand}</td>
                      <td className="px-3 py-1 border-r border-slate-200 text-slate-700">{row.colour}</td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center font-bold text-slate-800">{row.size}</td>
                      <td className="px-3 py-1 border-r border-slate-200 text-amber-800">{row.toonLabel}</td>
                      <td className="px-3 py-1 border-r border-slate-200 text-right font-semibold text-emerald-700">
                        ₹{row.sellingPrice}
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center font-bold text-indigo-800 bg-indigo-50/40">
                        {row.totalAggregatedStock}
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center text-slate-600">{row.storesCount}</td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center font-bold text-amber-900 bg-amber-50/30">
                        <input
                          type="number"
                          value={row.gmFashionsWarehouseStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { gmFashionsWarehouseStock: Number(e.target.value) || 0 })
                          }
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500 font-bold"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.karurStock}
                          onChange={(e) => updateInventoryRecord(row.id, { karurStock: Number(e.target.value) || 0 })}
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.koottappalliStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { koottappalliStock: Number(e.target.value) || 0 })
                          }
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.kumbakonamStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { kumbakonamStock: Number(e.target.value) || 0 })
                          }
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.mallurStock}
                          onChange={(e) => updateInventoryRecord(row.id, { mallurStock: Number(e.target.value) || 0 })}
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.namakkalStock}
                          onChange={(e) => updateInventoryRecord(row.id, { namakkalStock: Number(e.target.value) || 0 })}
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.salemStock}
                          onChange={(e) => updateInventoryRecord(row.id, { salemStock: Number(e.target.value) || 0 })}
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.scraGodownStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { scraGodownStock: Number(e.target.value) || 0 })
                          }
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.tiruvannamalaiStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { tiruvannamalaiStock: Number(e.target.value) || 0 })
                          }
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1 border-r border-slate-200 text-center">
                        <input
                          type="number"
                          value={row.wholesaleShowroomStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { wholesaleShowroomStock: Number(e.target.value) || 0 })
                          }
                          className="w-12 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* =========================================================
                SHEET 3: IMAGE DATA & DELEGATION (WITH CHECKBOXES & SHARE)
               ========================================================= */}
            {sheetType === 'image' && (
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#f3f4f6] text-slate-700 select-none border-b border-slate-300 font-semibold">
                    <th className="w-10 px-2 py-2 text-center text-slate-400 bg-slate-200 border-r border-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedImageEans.length > 0 && selectedImageEans.length === filteredImage.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImageEans(filteredImage.map((i) => i.ean));
                          } else {
                            setSelectedImageEans([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-2 border-r border-slate-300">A: Product Name</th>
                    <th className="px-3 py-2 border-r border-slate-300 font-mono">B: EAN Code</th>
                    <th className="px-3 py-2 border-r border-slate-300 font-mono">C: TOON LABLE</th>
                    <th className="px-3 py-2 border-r border-slate-300">D: BRAND</th>
                    <th className="px-3 py-2 border-r border-slate-300">E: SIZE</th>
                    <th className="px-3 py-2 border-r border-slate-300">F: COLOR</th>
                    <th className="px-4 py-2 border-r border-slate-300 bg-emerald-50/60 text-emerald-950 font-bold">
                      G: Photo Team Status
                    </th>
                    <th className="px-4 py-2 border-r border-slate-300 bg-amber-50/60 text-amber-950 font-bold">
                      H: Creative Dept Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredImage.map((row, idx) => {
                    const isSelected = selectedImageEans.includes(row.ean);
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-blue-50/40 transition ${isSelected ? 'bg-blue-50/70' : ''}`}
                      >
                        <td className="px-2 py-1.5 text-center text-slate-400 bg-[#f8fafc] border-r border-slate-300">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedImageEans((prev) => [...prev, row.ean]);
                              } else {
                                setSelectedImageEans((prev) => prev.filter((code) => code !== row.ean));
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-1.5 border-r border-slate-200 font-medium text-slate-900">
                          <input
                            type="text"
                            value={row.productName}
                            onChange={(e) => updateImageRecord(row.id, { productName: e.target.value })}
                            className="w-full bg-transparent focus:bg-white px-1 py-0.5 rounded border border-transparent focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-200 font-mono text-indigo-700 font-semibold">
                          {row.ean}
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-200 font-mono text-amber-800">
                          {row.toonLabel}
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-200 text-slate-700">{row.brand}</td>
                        <td className="px-3 py-1.5 border-r border-slate-200 text-slate-700 font-bold">{row.size}</td>
                        <td className="px-3 py-1.5 border-r border-slate-200 text-slate-700">{row.color}</td>
                        <td className="px-4 py-1.5 border-r border-slate-200">
                          {row.sharedToPhoto ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Synced to Photo Team</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Ready to delegate
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-1.5 border-r border-slate-200">
                          {row.sharedToCreative ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                              <CheckCircle2 className="w-3 h-3 text-amber-600" />
                              <span>Synced to Creative</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Not delegated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* =========================================================
                SHEET 4: PHOTO TEAM TRACKING (PHOTO TEAM DASHBOARD)
               ========================================================= */}
            {sheetType === 'photo' && (
              <table className="w-full text-xs text-left border-collapse border border-slate-300 whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f3f4f6] text-slate-700 select-none border-b border-slate-300 font-semibold">
                    <th className="w-10 px-2 py-2 text-center text-slate-400 bg-slate-200 border-r border-slate-300">#</th>
                    <th className="px-4 py-2 border-r border-slate-300">A: Product Name</th>
                    <th className="px-3 py-2 border-r border-slate-300 font-mono">B: EAN</th>
                    <th className="px-3 py-2 border-r border-slate-300 font-mono">C: TOON LABLE</th>
                    <th className="px-3 py-2 border-r border-slate-300">D: BRAND</th>
                    <th className="px-3 py-2 border-r border-slate-300">E: SIZE</th>
                    <th className="px-3 py-2 border-r border-slate-300">F: COLOR</th>
                    <th className="px-3 py-2 border-r border-slate-300 bg-indigo-50 font-bold text-indigo-950">
                      G: HAND OVER
                    </th>
                    <th className="px-3 py-2 border-r border-slate-300 bg-emerald-50 font-bold text-emerald-950">
                      H: ARJUN STATUS
                    </th>
                    <th className="px-3 py-2 border-r border-slate-300 bg-teal-50 font-bold text-teal-950">
                      I: MANOJ STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredPhoto.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No tasks in Photo Team sheet yet. Select items in Sheet 3 Image Data and click "Share to Photo Team".
                      </td>
                    </tr>
                  ) : (
                    filteredPhoto.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-blue-50/40 transition">
                        <td className="px-2 py-1 text-center text-slate-400 bg-[#f8fafc] border-r border-slate-300 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-1 border-r border-slate-200 font-medium text-slate-900">{row.productName}</td>
                        <td className="px-3 py-1 border-r border-slate-200 font-mono text-indigo-700 font-semibold">{row.ean}</td>
                        <td className="px-3 py-1 border-r border-slate-200 font-mono text-amber-800">{row.toonLabel}</td>
                        <td className="px-3 py-1 border-r border-slate-200 text-slate-700">{row.brand}</td>
                        <td className="px-3 py-1 border-r border-slate-200 text-center font-bold text-slate-700">{row.size}</td>
                        <td className="px-3 py-1 border-r border-slate-200 text-slate-700">{row.color}</td>

                        {/* Hand Over Dropdown */}
                        <td className="px-3 py-1 border-r border-slate-200">
                          <select
                            value={row.handOver}
                            onChange={(e) => updatePhotoRecord(row.id, { handOver: e.target.value as any })}
                            className="bg-white px-2 py-1 rounded border border-slate-300 font-semibold text-slate-800 text-xs shadow-2xs"
                          >
                            <option value="In Studio">In Studio</option>
                            <option value="Shot Complete">Shot Complete</option>
                            <option value="Returned to WH">Returned to WH</option>
                            <option value="Pending Pickup">Pending Pickup</option>
                            <option value="Sample Kept">Sample Kept</option>
                          </select>
                        </td>

                        {/* Arjun Status Dropdown */}
                        <td className="px-3 py-1 border-r border-slate-200">
                          <select
                            value={row.arjunStatus}
                            onChange={(e) => updatePhotoRecord(row.id, { arjunStatus: e.target.value as any })}
                            className="bg-white px-2 py-1 rounded border border-slate-300 font-semibold text-emerald-800 text-xs shadow-2xs"
                          >
                            <option value="Shoot Queued">Shoot Queued</option>
                            <option value="Shooting">Shooting</option>
                            <option value="Editing">Editing</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>

                        {/* Manoj Status Dropdown */}
                        <td className="px-3 py-1 border-r border-slate-200">
                          <select
                            value={row.manojStatus}
                            onChange={(e) => updatePhotoRecord(row.id, { manojStatus: e.target.value as any })}
                            className="bg-white px-2 py-1 rounded border border-slate-300 font-semibold text-teal-800 text-xs shadow-2xs"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Raw QA">Raw QA</option>
                            <option value="Retouching">Retouching</option>
                            <option value="Final QA">Final QA</option>
                            <option value="Uploaded to S3">Uploaded to S3</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* =========================================================
                SHEET 5: CREATIVE DEPARTMENT (CREATIVE DEPT DASHBOARD)
               ========================================================= */}
            {sheetType === 'creative' && (
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#f3f4f6] text-slate-700 select-none border-b border-slate-300 font-semibold">
                    <th className="w-10 px-2 py-2 text-center text-slate-400 bg-slate-200 border-r border-slate-300">#</th>
                    <th className="px-4 py-2 border-r border-slate-300 font-mono">A: EAN CODE</th>
                    <th className="px-4 py-2 border-r border-slate-300">B: STYLE NO / PRODUCT</th>
                    <th className="px-4 py-2 border-r border-slate-300 bg-amber-50 font-bold text-amber-950">
                      C: STATUS / REMARKS
                    </th>
                    <th className="px-4 py-2 border-r border-slate-300">D: DATE</th>
                    <th className="px-4 py-2 border-r border-slate-300">E: ASSIGNED BY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredCreative.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No tasks in Creative Department sheet yet. Select items in Sheet 3 Image Data and click "Share to Creative Dept".
                      </td>
                    </tr>
                  ) : (
                    filteredCreative.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-blue-50/40 transition">
                        <td className="px-2 py-1.5 text-center text-slate-400 bg-[#f8fafc] border-r border-slate-300 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-1.5 border-r border-slate-200 font-mono text-indigo-700 font-semibold">
                          {row.eanCode}
                        </td>
                        <td className="px-4 py-1.5 border-r border-slate-200 font-medium text-slate-900">{row.productName}</td>
                        <td className="px-4 py-1.5 border-r border-slate-200">
                          <select
                            value={row.statusRemarks}
                            onChange={(e) => updateCreativeRecord(row.id, { statusRemarks: e.target.value as any })}
                            className="bg-white px-2.5 py-1 rounded border border-slate-300 font-semibold text-amber-900 text-xs shadow-2xs"
                          >
                            <option value="Brief Received">Brief Received</option>
                            <option value="In Design">In Design</option>
                            <option value="Banner Ready">Banner Ready</option>
                            <option value="Catalog Ready">Catalog Ready</option>
                            <option value="Revision">Revision</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-1.5 border-r border-slate-200 font-mono text-slate-600">{row.date}</td>
                        <td className="px-4 py-1.5 border-r border-slate-200 text-slate-600">{row.assignedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* =========================================================
                SHEET 6: CONSULTING (ACTUAL GOOGLE SHEET)
               ========================================================= */}
            {sheetType === 'consulting' && (
              <div className="p-8 flex flex-col items-center justify-center min-h-[480px] bg-slate-50">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#0f9d58] flex items-center justify-center mx-auto mb-4 shadow-2xs">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Consulting • Actual Google Sheet
                  </h3>
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    Open the complete Google Sheet in Full Screen mode. You can edit cells, compute formulas, add sheets, and format columns directly in real-time.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const btn = document.getElementById('navbar-consulting-btn');
                      if (btn) btn.click();
                    }}
                    className="w-full py-3 bg-[#0f9d58] hover:bg-[#0b8043] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Open Consulting in Full Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Google Sheets Bottom Tab Bar */}
          <div className="bg-[#edf2fa] border-t border-slate-300 px-2 py-1 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1 overflow-x-auto">
              {/* Add Sheet (+) and All Sheets (☰) buttons */}
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-700 transition"
                title="Add Sheet"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-700 transition"
                title="All Sheets"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-300 mx-1" />

              {sheetType === 'ean' ? (
                <div className="flex items-center gap-1">
                  {/* MENS Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubSheetTab('MENS');
                      setActiveTab('matrix');
                    }}
                    className={`flex items-center gap-1 px-3 py-1 text-xs transition cursor-pointer rounded-t ${
                      subSheetTab === 'MENS' && activeTab === 'matrix'
                        ? 'bg-white text-slate-900 font-bold border-b-2 border-[#1a73e8] shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/70 font-medium'
                    }`}
                  >
                    <span>MENS</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* BOYS Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubSheetTab('BOYS');
                      setActiveTab('matrix');
                    }}
                    className={`flex items-center gap-1 px-3 py-1 text-xs transition cursor-pointer rounded-t ${
                      subSheetTab === 'BOYS' && activeTab === 'matrix'
                        ? 'bg-white text-slate-900 font-bold border-b-2 border-[#1a73e8] shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/70 font-medium'
                    }`}
                  >
                    <span>BOYS</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* KIDS Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubSheetTab('KIDS');
                      setActiveTab('matrix');
                    }}
                    className={`flex items-center gap-1 px-3 py-1 text-xs transition cursor-pointer rounded-t ${
                      subSheetTab === 'KIDS' && activeTab === 'matrix'
                        ? 'bg-white text-slate-900 font-bold border-b-2 border-[#1a73e8] shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/70 font-medium'
                    }`}
                  >
                    <span>KIDS</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Master EAN Catalog Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubSheetTab('CATALOG');
                      setActiveTab('table');
                    }}
                    className={`flex items-center gap-1 px-3 py-1 text-xs transition cursor-pointer rounded-t ${
                      subSheetTab === 'CATALOG' || activeTab === 'table'
                        ? 'bg-white text-slate-900 font-bold border-b-2 border-[#1a73e8] shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/70 font-medium'
                    }`}
                  >
                    <span>Master Catalog (All Products)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 bg-white text-slate-900 font-bold border-b-2 border-[#1a73e8] rounded-t text-xs">
                  <span>Sheet 1 ({sheetMeta.tag})</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Auto-saved {lastSyncedAt.toLocaleTimeString()}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
