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
  Calendar,
  CheckCircle2,
  Check,
  Building2,
  Clock,
  Sparkles,
  Camera,
  Palette,
  Eye,
} from 'lucide-react';
import { downloadCSV } from '../lib/csvExport';
import {
  EANUploadItem,
  ProductInventoryItem,
  ImageDataItem,
  PhotoDelegationItem,
  CreativeDepartmentItem,
} from '../types';

export type SheetType = 'ean' | 'inventory' | 'image' | 'photo' | 'creative';

interface ExcelSheetViewProps {
  sheetType: SheetType;
  onBack: () => void;
  onSwitchSheet: (sheet: SheetType) => void;
  userRole: 'it_admin' | 'photo_team' | 'creative_team';
}

export const ExcelSheetView: React.FC<ExcelSheetViewProps> = ({
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
  } = useWorkflow();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageEans, setSelectedImageEans] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  // New row modal or inline state
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  // -------------------------------------------------------------
  // CSV EXPORT LOGIC
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (sheetType === 'ean') {
      const headers = ['Product Name', 'EAN Code', 'Toon Label', 'Brand', 'Size', 'Color', 'Status', 'Created At'];
      const rows = eanList.map((i) => [
        i.productName,
        i.eanCode,
        i.toonLabel,
        i.brand,
        i.size,
        i.color,
        i.status,
        i.createdAt,
      ]);
      downloadCSV(`D2D_Sheet1_EAN_Master_${timestamp}`, headers, rows);
    } else if (sheetType === 'inventory') {
      const headers = [
        'EAN',
        'Product Name',
        'Brand',
        'Colour',
        'Size',
        'Toon Label',
        'Selling Price (INR)',
        'Total Aggregated Stock',
        'Stores Count',
        'GM Fashions WH Stock',
        'Karur Stock',
        'Koottappalli Stock',
        'Kumbakonam Stock',
        'Mallur Stock',
        'Namakkal Stock',
        'Salem Stock',
        'SCRA Godown Stock',
        'Tiruvannamalai Stock',
        'Wholesale Showroom Stock',
        'Last Updated',
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
        i.lastUpdated,
      ]);
      downloadCSV(`D2D_Sheet2_Master_Inventory_${timestamp}`, headers, rows);
    } else if (sheetType === 'image') {
      const headers = [
        'Product Name',
        'EAN',
        'Toon Label',
        'Brand',
        'Size',
        'Color',
        'Photo Team Status',
        'Photo Synced At',
        'Creative Dept Status',
        'Creative Synced At',
      ];
      const rows = imageList.map((i) => [
        i.productName,
        i.ean,
        i.toonLabel,
        i.brand,
        i.size,
        i.color,
        i.sharedToPhoto ? 'Synced to Photo' : 'Not Delegated',
        i.photoSharedAt || '',
        i.sharedToCreative ? 'Synced to Creative' : 'Not Assigned',
        i.creativeSharedAt || '',
      ]);
      downloadCSV(`D2D_Sheet3_Image_Collection_${timestamp}`, headers, rows);
    } else if (sheetType === 'photo') {
      const headers = [
        'Product Name',
        'EAN',
        'Toon Label',
        'Brand',
        'Size',
        'Color',
        'Out Date',
        'In Date',
        'Hand Over',
        'Arjun Status',
        'Manoj Status',
        'Synced At',
        'Last Updated By',
      ];
      const rows = photoList.map((i) => [
        i.productName,
        i.ean,
        i.toonLabel,
        i.brand,
        i.size,
        i.color,
        i.outDate,
        i.inDate,
        i.handOver,
        i.arjunStatus,
        i.manojStatus,
        i.syncedAt,
        i.lastUpdatedBy || '',
      ]);
      downloadCSV(`D2D_Sheet4_Photo_Team_Tracking_${timestamp}`, headers, rows);
    } else if (sheetType === 'creative') {
      const headers = ['EAN Code', 'Product Name', 'Date', 'Status / Remarks', 'Assigned By', 'Last Updated By'];
      const rows = creativeList.map((i) => [
        i.eanCode,
        i.productName,
        i.date,
        i.statusRemarks,
        i.assignedBy,
        i.lastUpdatedBy || '',
      ]);
      downloadCSV(`D2D_Sheet5_Creative_Tasks_${timestamp}`, headers, rows);
    }
    addToast('Excel Downloaded', 'Spreadsheet CSV file downloaded successfully.', 'success');
  };

  // -------------------------------------------------------------
  // SHEET METADATA & TITLE
  // -------------------------------------------------------------
  const sheetMeta = {
    ean: {
      title: 'Sheet 1: EAN Master Upload',
      desc: 'Product catalog registration, EAN Barcodes, Toon Labels, Brand & Sizes',
      tag: 'E-Commerce Master',
      count: eanList.length,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    inventory: {
      title: 'Sheet 2: Master Inventory & Stock (19 Columns)',
      desc: 'Live stock tracking across GM Warehouse & 10 Retail Stores with Auto-Aggregated Total',
      tag: '19 Master Columns',
      count: inventoryList.length,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    image: {
      title: 'Sheet 3: Image Collection & Delegation',
      desc: 'Visual catalog with 1-click delegation buttons to Photo Studio & Creative Dept',
      tag: 'Central Delegation Hub',
      count: imageList.length,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    photo: {
      title: 'Sheet 4: Photo Team Tracking Sheet',
      desc: 'Studio sample tracking, Out Date, In Date, Hand Over, Arjun & Manoj live shoot status',
      tag: 'Photo Studio Queue',
      count: photoList.length,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    creative: {
      title: 'Sheet 5: Creative Department Tasks Sheet',
      desc: 'Creative graphic design tasks, catalog banner artwork, and revision remarks',
      tag: 'Creative Queue',
      count: creativeList.length,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  }[sheetType];

  // -------------------------------------------------------------
  // ADD ROW HANDLER
  // -------------------------------------------------------------
  const handleAddNewRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetType === 'ean') {
      if (!newRowData.productName || !newRowData.eanCode) {
        addToast('Required Fields', 'Please enter Product Name and EAN Code', 'warning');
        return;
      }
      addEanRecord({
        productName: newRowData.productName,
        eanCode: newRowData.eanCode,
        toonLabel: newRowData.toonLabel || 'TN-' + Math.floor(1000 + Math.random() * 9000),
        brand: newRowData.brand || 'Spark Classic',
        size: newRowData.size || 'M',
        color: newRowData.color || 'Navy Blue',
        status: 'Verified',
      });
    } else if (sheetType === 'photo') {
      if (!newRowData.productName || !newRowData.ean) {
        addToast('Required Fields', 'Please enter Product Name and EAN', 'warning');
        return;
      }
      addPhotoRecord({
        productName: newRowData.productName,
        ean: newRowData.ean,
        toonLabel: newRowData.toonLabel || 'TN-NEW',
        brand: newRowData.brand || 'Brand',
        size: newRowData.size || 'L',
        color: newRowData.color || 'Black',
        outDate: newRowData.outDate || new Date().toISOString().slice(0, 10),
        inDate: newRowData.inDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        handOver: newRowData.handOver || 'In Studio',
        arjunStatus: newRowData.arjunStatus || 'Shoot Queued',
        manojStatus: newRowData.manojStatus || 'Pending',
      });
    } else if (sheetType === 'creative') {
      if (!newRowData.productName || !newRowData.eanCode) {
        addToast('Required Fields', 'Please enter Product Name and EAN', 'warning');
        return;
      }
      addCreativeRecord({
        eanCode: newRowData.eanCode,
        productName: newRowData.productName,
        date: newRowData.date || new Date().toISOString().slice(0, 10),
        statusRemarks: newRowData.statusRemarks || 'Brief Received',
        assignedBy: 'User',
      });
    }
    setNewRowData({});
    setIsAddingRow(false);
  };

  // Filter lists based on search
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
    <div id="excel-sheet-view-container" className="space-y-4">
      {/* -------------------------------------------------------------
          TOP EXCEL NAVIGATION & ACTION BAR
         ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="back-to-box-buttons-btn"
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition border border-slate-200"
              title="Return to Box Button Tiles"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Sheets</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel Sheet View</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">({sheetMeta.count} rows)</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Public Access: Auto-Saved
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{sheetMeta.title}</h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="sheet-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search spreadsheet..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 w-44 sm:w-56"
              />
            </div>

            {/* Add Row Button */}
            {(sheetType === 'ean' || sheetType === 'photo' || sheetType === 'creative') && (
              <button
                id="add-row-to-sheet-btn"
                type="button"
                onClick={() => setIsAddingRow(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            )}

            {/* Download Excel / CSV Button */}
            <button
              id="direct-download-excel-btn"
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg transition shadow-xs cursor-pointer"
              title="Download as Excel CSV file immediately without Google sign-in"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Sheet Tabs to quickly hop between sheets */}
        {userRole === 'it_admin' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Switch Sheet:</span>
            <button
              onClick={() => onSwitchSheet('ean')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'ean' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sheet 1: EAN Master
            </button>
            <button
              onClick={() => onSwitchSheet('inventory')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'inventory' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sheet 2: Stock (19 Cols)
            </button>
            <button
              onClick={() => onSwitchSheet('image')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'image' ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sheet 3: Image & Delegation
            </button>
            <button
              onClick={() => onSwitchSheet('photo')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'photo' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sheet 4: Photo Studio
            </button>
            <button
              onClick={() => onSwitchSheet('creative')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                sheetType === 'creative' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sheet 5: Creative Dept
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          ADD ROW MODAL FORM (IF CLICKED)
         ------------------------------------------------------------- */}
      {isAddingRow && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Insert New Row into {sheetMeta.title}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingRow(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleAddNewRowSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={newRowData.productName || ''}
                onChange={(e) => setNewRowData({ ...newRowData, productName: e.target.value })}
                placeholder="e.g., Men Printed Oxford Shirt"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">EAN Code *</label>
              <input
                type="text"
                required
                value={newRowData.eanCode || newRowData.ean || ''}
                onChange={(e) =>
                  setNewRowData({ ...newRowData, eanCode: e.target.value, ean: e.target.value })
                }
                placeholder="e.g., 890781200999"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                value={newRowData.brand || ''}
                onChange={(e) => setNewRowData({ ...newRowData, brand: e.target.value })}
                placeholder="e.g., Spark Classic"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Toon Label</label>
              <input
                type="text"
                value={newRowData.toonLabel || ''}
                onChange={(e) => setNewRowData({ ...newRowData, toonLabel: e.target.value })}
                placeholder="e.g., TN-7788"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-4 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs"
              >
                Save Row to Spreadsheet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------------------------------------------------
          SHEET 3 SPECIFIC ACTIONS (DELEGATE TO PHOTO / CREATIVE)
         ------------------------------------------------------------- */}
      {sheetType === 'image' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Multi-Select Delegation:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              {selectedImageEans.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedImageEans.length === 0}
              onClick={() => {
                shareToPhotoTeam(selectedImageEans);
                setSelectedImageEans([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Delegate to Photo Team (Sheet 4)</span>
            </button>

            <button
              type="button"
              disabled={selectedImageEans.length === 0}
              onClick={() => {
                shareToCreativeTeam(selectedImageEans);
                setSelectedImageEans([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg transition shadow-xs cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Delegate to Creative Dept (Sheet 5)</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DIRECT EXCEL SPREADSHEET GRID
         ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Excel Spreadsheet Top Green Ribbon */}
        <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="font-bold tracking-wide">D2D SPREADSHEET GRID</span>
            <span className="text-emerald-200 text-[11px]">• Click on cells to edit values live</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-emerald-100">
            <span>Public Live Sync: Active</span>
            <span>All devices synchronized</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* =========================================================
              SHEET 1: EAN MASTER UPLOAD TABLE
             ========================================================= */}
          {sheetType === 'ean' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th className="w-12 px-3 py-2.5 text-center text-slate-400 bg-slate-200/60 border-r border-slate-200">#</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Product Name</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">EAN Code</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Toon Label</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Brand</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Size</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Color</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Status</th>
                  <th className="w-16 px-3 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal">
                {filteredEan.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No records found in Sheet 1. Click "+ Add Row" to add.
                    </td>
                  </tr>
                ) : (
                  filteredEan.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-emerald-50/40 transition">
                      <td className="px-3 py-2 text-center text-slate-400 bg-slate-50 border-r border-slate-200 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.productName}
                          onChange={(e) => updateEanRecord(row.id, { productName: e.target.value })}
                          className="w-full bg-transparent hover:bg-white focus:bg-white px-1.5 py-1 rounded border border-transparent focus:border-emerald-500 focus:outline-none font-medium text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200 font-mono">
                        <input
                          type="text"
                          value={row.eanCode}
                          onChange={(e) => updateEanRecord(row.id, { eanCode: e.target.value })}
                          className="w-full bg-transparent hover:bg-white focus:bg-white px-1.5 py-1 rounded border border-transparent focus:border-emerald-500 focus:outline-none text-indigo-700 font-semibold"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200 font-mono">
                        <input
                          type="text"
                          value={row.toonLabel}
                          onChange={(e) => updateEanRecord(row.id, { toonLabel: e.target.value })}
                          className="w-full bg-transparent hover:bg-white focus:bg-white px-1.5 py-1 rounded border border-transparent focus:border-emerald-500 focus:outline-none text-amber-800 font-semibold"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.brand}
                          onChange={(e) => updateEanRecord(row.id, { brand: e.target.value })}
                          className="w-full bg-transparent hover:bg-white focus:bg-white px-1.5 py-1 rounded border border-transparent focus:border-emerald-500 focus:outline-none text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.size}
                          onChange={(e) => updateEanRecord(row.id, { size: e.target.value })}
                          className="w-16 bg-transparent hover:bg-white focus:bg-white px-1.5 py-1 rounded border border-transparent focus:border-emerald-500 focus:outline-none text-slate-700 text-center font-bold"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.color}
                          onChange={(e) => updateEanRecord(row.id, { color: e.target.value })}
                          className="w-full bg-transparent hover:bg-white focus:bg-white px-1.5 py-1 rounded border border-transparent focus:border-emerald-500 focus:outline-none text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteEanRecord(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* =========================================================
              SHEET 2: MASTER INVENTORY & STOCK (19 COLUMNS) TABLE
             ========================================================= */}
          {sheetType === 'inventory' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold select-none whitespace-nowrap">
                  <th className="w-10 px-3 py-2.5 text-center text-slate-400 bg-slate-200/60 border-r border-slate-200">#</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">EAN</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Product Name</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Brand</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Colour</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Size</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Toon Label</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-right">Price (₹)</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 bg-indigo-50/50 text-indigo-900 font-bold text-center">
                    Aggregated Stock
                  </th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Stores</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center font-bold bg-amber-50/40 text-amber-900">
                    GM Fashions WH
                  </th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Karur</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Koottappalli</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Kumbakonam</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Mallur</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Namakkal</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Salem</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">SCRA Godown</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Tiruvannamalai</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 text-center">Wholesale Showroom</th>
                  <th className="w-12 px-2 py-2.5 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal whitespace-nowrap">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-12 text-center text-slate-400">
                      No stock records found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-emerald-50/30 transition">
                      <td className="px-3 py-1.5 text-center text-slate-400 bg-slate-50 border-r border-slate-200 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 font-mono text-indigo-700 font-semibold">
                        {row.ean}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 font-medium text-slate-900 max-w-xs truncate">
                        {row.productName}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-slate-600">{row.brand}</td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-slate-600">{row.colour}</td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-bold text-slate-700">{row.size}</td>
                      <td className="px-3 py-1.5 border-r border-slate-200 font-mono text-amber-800">{row.toonLabel}</td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-right font-semibold text-emerald-700">
                        ₹{row.sellingPrice}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-bold text-indigo-700 bg-indigo-50/30">
                        {row.totalAggregatedStock} pcs
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center text-slate-600">{row.storesCount}</td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono font-bold bg-amber-50/30 text-amber-900">
                        <input
                          type="number"
                          value={row.gmFashionsWarehouseStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { gmFashionsWarehouseStock: Number(e.target.value) || 0 })
                          }
                          className="w-16 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500 font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.karurStock}
                          onChange={(e) => updateInventoryRecord(row.id, { karurStock: Number(e.target.value) || 0 })}
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.koottappalliStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { koottappalliStock: Number(e.target.value) || 0 })
                          }
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.kumbakonamStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { kumbakonamStock: Number(e.target.value) || 0 })
                          }
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.mallurStock}
                          onChange={(e) => updateInventoryRecord(row.id, { mallurStock: Number(e.target.value) || 0 })}
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.namakkalStock}
                          onChange={(e) => updateInventoryRecord(row.id, { namakkalStock: Number(e.target.value) || 0 })}
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.salemStock}
                          onChange={(e) => updateInventoryRecord(row.id, { salemStock: Number(e.target.value) || 0 })}
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.scraGodownStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { scraGodownStock: Number(e.target.value) || 0 })
                          }
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.tiruvannamalaiStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { tiruvannamalaiStock: Number(e.target.value) || 0 })
                          }
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-200 text-center font-mono">
                        <input
                          type="number"
                          value={row.wholesaleShowroomStock}
                          onChange={(e) =>
                            updateInventoryRecord(row.id, { wholesaleShowroomStock: Number(e.target.value) || 0 })
                          }
                          className="w-14 text-center bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => deleteInventoryRecord(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* =========================================================
              SHEET 3: IMAGE COLLECTION & DELEGATION TABLE
             ========================================================= */}
          {sheetType === 'image' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th className="w-10 px-3 py-2.5 text-center text-slate-400 bg-slate-200/60 border-r border-slate-200">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedImageEans(filteredImage.map((i) => i.ean));
                        } else {
                          setSelectedImageEans([]);
                        }
                      }}
                      checked={selectedImageEans.length > 0 && selectedImageEans.length === filteredImage.length}
                    />
                  </th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Product Name</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">EAN Code</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Toon Label</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Brand</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Size</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Color</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Photo Team Status</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Creative Dept Status</th>
                  <th className="w-16 px-3 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal">
                {filteredImage.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No images found in Sheet 3.
                    </td>
                  </tr>
                ) : (
                  filteredImage.map((row, idx) => {
                    const isSelected = selectedImageEans.includes(row.ean);
                    return (
                      <tr key={row.id} className={`hover:bg-purple-50/30 transition ${isSelected ? 'bg-purple-50/60' : ''}`}>
                        <td className="px-3 py-2 text-center text-slate-400 bg-slate-50 border-r border-slate-200 font-mono text-[11px]">
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
                        <td className="px-4 py-2 border-r border-slate-200 font-medium text-slate-900">{row.productName}</td>
                        <td className="px-4 py-2 border-r border-slate-200 font-mono text-indigo-700 font-semibold">{row.ean}</td>
                        <td className="px-4 py-2 border-r border-slate-200 font-mono text-amber-800">{row.toonLabel}</td>
                        <td className="px-4 py-2 border-r border-slate-200 text-slate-700">{row.brand}</td>
                        <td className="px-4 py-2 border-r border-slate-200 text-slate-700 font-bold">{row.size}</td>
                        <td className="px-4 py-2 border-r border-slate-200 text-slate-700">{row.color}</td>
                        <td className="px-4 py-2 border-r border-slate-200">
                          {row.sharedToPhoto ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Synced (Sheet 4)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Not Delegated
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 border-r border-slate-200">
                          {row.sharedToCreative ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Synced (Sheet 5)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Not Assigned
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => deleteImageRecord(row.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* =========================================================
              SHEET 4: PHOTO TEAM TRACKING SHEET TABLE
             ========================================================= */}
          {sheetType === 'photo' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold select-none whitespace-nowrap">
                  <th className="w-10 px-3 py-2.5 text-center text-slate-400 bg-slate-200/60 border-r border-slate-200">#</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Product Name</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 font-mono">EAN Code</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Toon Label</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Brand</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">Size / Color</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 bg-slate-200/30">Out Date (WH Dispatch)</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 bg-slate-200/30">In Date (Expected Studio)</th>
                  <th className="px-3 py-2.5 border-r border-slate-200 bg-indigo-50/50 text-indigo-900 font-bold">
                    Hand Over Status
                  </th>
                  <th className="px-3 py-2.5 border-r border-slate-200 bg-emerald-50/50 text-emerald-900 font-bold">
                    Arjun Shoot Status
                  </th>
                  <th className="px-3 py-2.5 border-r border-slate-200 bg-teal-50/50 text-teal-900 font-bold">
                    Manoj Post-Prod Status
                  </th>
                  <th className="w-12 px-2 py-2.5 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal whitespace-nowrap">
                {filteredPhoto.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      No tasks currently in Photo Team sheet. Click "+ Add Row" or delegate from Sheet 3.
                    </td>
                  </tr>
                ) : (
                  filteredPhoto.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-emerald-50/30 transition">
                      <td className="px-3 py-2 text-center text-slate-400 bg-slate-50 border-r border-slate-200 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200 font-medium text-slate-900">{row.productName}</td>
                      <td className="px-3 py-2 border-r border-slate-200 font-mono text-indigo-700 font-semibold">{row.ean}</td>
                      <td className="px-3 py-2 border-r border-slate-200 font-mono text-amber-800">{row.toonLabel}</td>
                      <td className="px-3 py-2 border-r border-slate-200 text-slate-700">{row.brand}</td>
                      <td className="px-3 py-2 border-r border-slate-200 text-slate-600">
                        {row.size} / {row.color}
                      </td>

                      {/* Out Date (Editable) */}
                      <td className="px-3 py-2 border-r border-slate-200 font-mono">
                        <input
                          type="date"
                          value={row.outDate}
                          onChange={(e) => updatePhotoRecord(row.id, { outDate: e.target.value })}
                          className="bg-transparent hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-emerald-500 text-slate-700"
                        />
                      </td>

                      {/* In Date (Editable) */}
                      <td className="px-3 py-2 border-r border-slate-200 font-mono">
                        <input
                          type="date"
                          value={row.inDate}
                          onChange={(e) => updatePhotoRecord(row.id, { inDate: e.target.value })}
                          className="bg-transparent hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-emerald-500 text-slate-700"
                        />
                      </td>

                      {/* Hand Over Dropdown */}
                      <td className="px-3 py-2 border-r border-slate-200">
                        <select
                          value={row.handOver}
                          onChange={(e) => updatePhotoRecord(row.id, { handOver: e.target.value as any })}
                          className="bg-white px-2 py-1 rounded-md border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs shadow-2xs"
                        >
                          <option value="In Studio">In Studio</option>
                          <option value="Shot Complete">Shot Complete</option>
                          <option value="Returned to WH">Returned to WH</option>
                          <option value="Pending WH Dispatch">Pending WH Dispatch</option>
                        </select>
                      </td>

                      {/* Arjun Status Dropdown */}
                      <td className="px-3 py-2 border-r border-slate-200">
                        <select
                          value={row.arjunStatus}
                          onChange={(e) => updatePhotoRecord(row.id, { arjunStatus: e.target.value as any })}
                          className="bg-white px-2 py-1 rounded-md border border-slate-200 font-semibold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs shadow-2xs"
                        >
                          <option value="Shoot Queued">Shoot Queued</option>
                          <option value="Angle 1 & 2 Done">Angle 1 & 2 Done</option>
                          <option value="All Angles Shot">All Angles Shot</option>
                          <option value="Reshoot Needed">Reshoot Needed</option>
                        </select>
                      </td>

                      {/* Manoj Status Dropdown */}
                      <td className="px-3 py-2 border-r border-slate-200">
                        <select
                          value={row.manojStatus}
                          onChange={(e) => updatePhotoRecord(row.id, { manojStatus: e.target.value as any })}
                          className="bg-white px-2 py-1 rounded-md border border-slate-200 font-semibold text-teal-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs shadow-2xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Lighting Adjusted">Lighting Adjusted</option>
                          <option value="Color Graded">Color Graded</option>
                          <option value="Final Packshot Ready">Final Packshot Ready</option>
                        </select>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => deletePhotoRecord(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* =========================================================
              SHEET 5: CREATIVE DEPARTMENT TASKS TABLE
             ========================================================= */}
          {sheetType === 'creative' && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th className="w-10 px-3 py-2.5 text-center text-slate-400 bg-slate-200/60 border-r border-slate-200">#</th>
                  <th className="px-4 py-2.5 border-r border-slate-200 font-mono">EAN Code</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Product Name</th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Assigned Date</th>
                  <th className="px-4 py-2.5 border-r border-slate-200 bg-amber-50/50 text-amber-900 font-bold">
                    Status / Remarks
                  </th>
                  <th className="px-4 py-2.5 border-r border-slate-200">Assigned By</th>
                  <th className="w-16 px-3 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-normal">
                {filteredCreative.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No tasks in Creative Department sheet. Click "+ Add Row" or delegate from Sheet 3.
                    </td>
                  </tr>
                ) : (
                  filteredCreative.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-amber-50/30 transition">
                      <td className="px-3 py-2 text-center text-slate-400 bg-slate-50 border-r border-slate-200 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200 font-mono text-indigo-700 font-semibold">
                        {row.eanCode}
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200 font-medium text-slate-900">{row.productName}</td>
                      <td className="px-4 py-2 border-r border-slate-200 font-mono">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => updateCreativeRecord(row.id, { date: e.target.value })}
                          className="bg-transparent hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-amber-500 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200">
                        <select
                          value={row.statusRemarks}
                          onChange={(e) => updateCreativeRecord(row.id, { statusRemarks: e.target.value as any })}
                          className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs shadow-2xs"
                        >
                          <option value="Brief Received">Brief Received</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Banner Ready">Banner Ready</option>
                          <option value="Catalog Published">Catalog Published</option>
                          <option value="Revision Requested">Revision Requested</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 border-r border-slate-200 text-slate-600">{row.assignedBy}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteCreativeRecord(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Excel Spreadsheet Status Bar (Bottom) */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span>Ready • {sheetMeta.count} Records Loaded</span>
            <span>Cell edits broadcast in real-time</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Last Synced: {lastSyncedAt.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
