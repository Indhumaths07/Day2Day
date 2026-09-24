import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { DataTable, ColumnDef } from './DataTable';
import {
  EANUploadItem,
  ProductInventoryItem,
  ImageDataItem,
  PhotoDelegationItem,
  CreativeDepartmentItem,
} from '../types';
import {
  Plus,
  Send,
  Database,
  Image as ImageIcon,
  Camera,
  Palette,
  Columns3,
  Calendar,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface ITDashboardProps {
  onOpenAddEan: () => void;
  onOpenSheetsModal: () => void;
}

export const ITDashboard: React.FC<ITDashboardProps> = ({ onOpenAddEan, onOpenSheetsModal }) => {
  const {
    itActivePanel,
    setItActivePanel,
    panel1SubTab,
    setPanel1SubTab,
    eanList,
    inventoryList,
    imageList,
    photoList,
    creativeList,
    shareToPhotoTeam,
    shareToCreativeTeam,
  } = useWorkflow();

  // Selection states for Image Data table
  const [selectedImageEans, setSelectedImageEans] = useState<string[]>([]);

  // -------------------------------------------------------------
  // COLUMNS DEFINITIONS
  // -------------------------------------------------------------

  // 1. EAN Upload Sheet Columns: Product Name | EAN Code | Toon Label | Brand | Size | Color
  const eanColumns: ColumnDef<EANUploadItem>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      render: (item) => (
        <div>
          <span className="font-medium text-slate-900">{item.productName}</span>
          <div className="text-[10px] text-slate-500">{item.createdAt}</div>
        </div>
      ),
    },
    {
      key: 'eanCode',
      header: 'EAN Code',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {item.eanCode}
        </span>
      ),
    },
    {
      key: 'toonLabel',
      header: 'Toon Label',
      render: (item) => (
        <span className="font-mono text-xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          {item.toonLabel}
        </span>
      ),
    },
    { key: 'brand', header: 'Brand' },
    {
      key: 'size',
      header: 'Size',
      render: (item) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
          {item.size}
        </span>
      ),
    },
    {
      key: 'color',
      header: 'Color',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-300" />
          <span>{item.color}</span>
        </div>
      ),
    },
  ];

  // 2. Product Data Sheet Columns (19 Master Product & Inventory columns)
  const inventoryColumns: ColumnDef<ProductInventoryItem>[] = [
    {
      key: 'ean',
      header: 'EAN',
      width: '140px',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {item.ean}
        </span>
      ),
    },
    {
      key: 'productName',
      header: 'Product Name',
      width: '200px',
      render: (item) => <span className="font-medium text-slate-900">{item.productName}</span>,
    },
    { key: 'brand', header: 'Brand' },
    { key: 'colour', header: 'Colour' },
    { key: 'size', header: 'Size' },
    { key: 'toonLabel', header: 'Toon Label' },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      render: (item) => <span className="font-semibold text-emerald-700">₹{item.sellingPrice}</span>,
    },
    {
      key: 'totalAggregatedStock',
      header: 'Total Aggregated Stock',
      render: (item) => (
        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-xs">
          {item.totalAggregatedStock} pcs
        </span>
      ),
    },
    {
      key: 'storesCount',
      header: 'Stores Count',
      render: (item) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          {item.storesCount}
        </span>
      ),
    },
    {
      key: 'gmFashionsWarehouseStock',
      header: 'GM FASHIONS WAREHOUSE',
      render: (item) => (
        <span className="font-mono text-amber-800 font-semibold">{item.gmFashionsWarehouseStock}</span>
      ),
    },
    { key: 'karurStock', header: 'KARUR Stock' },
    { key: 'koottappalliStock', header: 'KOOTTAPPALLI Stock' },
    { key: 'kumbakonamStock', header: 'KUMBAKONAM Stock' },
    { key: 'mallurStock', header: 'MALLUR Stock' },
    { key: 'namakkalStock', header: 'NAMAKKAL Stock' },
    { key: 'salemStock', header: 'SALEM Stock' },
    { key: 'scraGodownStock', header: 'SCRA GODOWN Stock' },
    { key: 'tiruvannamalaiStock', header: 'TIRUVANNAMALAI Stock' },
    { key: 'wholesaleShowroomStock', header: 'WHOLESALE SHOWROOM Stock' },
    {
      key: 'storeBreakdown',
      header: 'Store-wise Breakdown',
      render: (item) => (
        <span className="text-[11px] text-slate-600 font-sans">{item.storeBreakdown || '-'}</span>
      ),
    },
  ];

  // 3. Image Data Sheet Columns
  const imageColumns: ColumnDef<ImageDataItem>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-slate-900">{item.productName}</span>
        </div>
      ),
    },
    {
      key: 'ean',
      header: 'EAN',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {item.ean}
        </span>
      ),
    },
    {
      key: 'toonLabel',
      header: 'TOON LABEL',
      render: (item) => (
        <span className="font-mono text-xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          {item.toonLabel}
        </span>
      ),
    },
    { key: 'brand', header: 'BRAND' },
    { key: 'size', header: 'SIZE' },
    { key: 'color', header: 'COLOR' },
    {
      key: 'sharedToPhoto',
      header: 'Photo Team Status',
      render: (item) =>
        item.sharedToPhoto ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Synced to Panel 2</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Not Delegated
          </span>
        ),
    },
    {
      key: 'sharedToCreative',
      header: 'Creative Dept Status',
      render: (item) =>
        item.sharedToCreative ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Synced to Panel 3</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Not Assigned
          </span>
        ),
    },
  ];

  // 4. Panel 2: Photo Team Tracking Sheet Columns
  const photoColumns: ColumnDef<PhotoDelegationItem>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      render: (item) => (
        <div>
          <span className="font-medium text-slate-900">{item.productName}</span>
          <div className="text-[10px] text-slate-500">Synced: {item.syncedAt}</div>
        </div>
      ),
    },
    {
      key: 'ean',
      header: 'EAN',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {item.ean}
        </span>
      ),
    },
    { key: 'toonLabel', header: 'TOON LABEL' },
    { key: 'brand', header: 'BRAND' },
    { key: 'size', header: 'SIZE' },
    { key: 'color', header: 'COLOR' },
    {
      key: 'outDate',
      header: 'Out Date',
      render: (item) => (
        <div className="flex items-center gap-1 font-mono text-slate-700">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{item.outDate}</span>
        </div>
      ),
    },
    {
      key: 'inDate',
      header: 'In Date',
      render: (item) => (
        <div className="flex items-center gap-1 font-mono text-slate-700">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{item.inDate}</span>
        </div>
      ),
    },
    {
      key: 'handOver',
      header: 'Hand Over',
      render: (item) => {
        const bg =
          item.handOver === 'In Studio'
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : item.handOver === 'Shot Complete'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : item.handOver === 'Returned to WH'
            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
            : 'bg-slate-100 text-slate-700 border-slate-200';

        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${bg}`}>
            {item.handOver}
          </span>
        );
      },
    },
    {
      key: 'arjunStatus',
      header: 'Arjun Status',
      render: (item) => {
        const isShooting = item.arjunStatus === 'Shooting';
        const isApproved = item.arjunStatus === 'Approved';

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isApproved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isShooting
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {item.arjunStatus}
          </span>
        );
      },
    },
    {
      key: 'manojStatus',
      header: 'Manoj Status',
      render: (item) => {
        const isComp = item.manojStatus === 'Completed' || item.manojStatus === 'Uploaded to S3';
        const isQA = item.manojStatus === 'Raw QA' || item.manojStatus === 'Retouching';

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isComp
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isQA
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {item.manojStatus}
          </span>
        );
      },
    },
  ];

  // 5. Panel 3: Creative Department Sheet Columns
  const creativeColumns: ColumnDef<CreativeDepartmentItem>[] = [
    {
      key: 'eanCode',
      header: 'EAN Code',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {item.eanCode}
        </span>
      ),
    },
    {
      key: 'productName',
      header: 'Product Name',
      render: (item) => <span className="font-medium text-slate-900">{item.productName}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span className="font-mono text-xs text-slate-700">{item.date}</span>
      ),
    },
    {
      key: 'statusRemarks',
      header: 'Status / Remarks',
      render: (item) => {
        const isDone = item.statusRemarks === 'Completed' || item.statusRemarks === 'Catalog Ready';
        const isProgress = item.statusRemarks === 'In Design' || item.statusRemarks === 'Banner Ready';

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isDone
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isProgress
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {item.statusRemarks}
          </span>
        );
      },
    },
    {
      key: 'assignedBy',
      header: 'Assigned By',
      render: (item) => <span className="text-slate-600 text-xs">{item.assignedBy}</span>,
    },
  ];

  return (
    <div id="it-master-dashboard-container" className="space-y-6">
      {/* Top Banner with Panel Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                IT Master Admin Portal
              </span>
              <span className="text-xs text-slate-500">Full Access & Central Delegation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Horizontal 3-Panel Workflow Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control Master Data, delegate photos to Arjun & Manoj, and coordinate with Creative Content.
            </p>
          </div>

          {/* Panel Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
            <button
              id="view-all-panels-btn"
              type="button"
              onClick={() => setItActivePanel('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                itActivePanel === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Columns3 className="w-4 h-4" />
              <span>All 3 Panels (Horizontal View)</span>
            </button>

            <button
              id="view-panel-1-btn"
              type="button"
              onClick={() => setItActivePanel('panel1')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                itActivePanel === 'panel1'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Panel 1: Master Ops</span>
            </button>

            <button
              id="view-panel-2-btn"
              type="button"
              onClick={() => setItActivePanel('panel2')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                itActivePanel === 'panel2'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Panel 2: Photo Team View</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                {photoList.length}
              </span>
            </button>

            <button
              id="view-panel-3-btn"
              type="button"
              onClick={() => setItActivePanel('panel3')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                itActivePanel === 'panel3'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Panel 3: Creative Dept</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                {creativeList.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          RENDER PANELS ACCORDING TO USER'S SELECTION
         ------------------------------------------------------------- */}

      {/* PANEL 1: MASTER DATA & OPERATIONS */}
      {(itActivePanel === 'all' || itActivePanel === 'panel1') && (
        <section id="it-panel-1-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">PANEL 1: MASTER DATA & OPERATIONS</h3>
                <p className="text-xs text-slate-500">
                  Switch between EAN Upload, Master Product & Inventory, and Image Tracking with delegation action.
                </p>
              </div>
            </div>

            {/* Dynamic Buttons for Panel 1 Sheets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-subtab-ean"
                type="button"
                onClick={() => setPanel1SubTab('ean')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  panel1SubTab === 'ean'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1. EAN Upload Sheet</span>
              </button>

              <button
                id="btn-subtab-inventory"
                type="button"
                onClick={() => setPanel1SubTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  panel1SubTab === 'inventory'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>2. Product Data & Inventory</span>
              </button>

              <button
                id="btn-subtab-image"
                type="button"
                onClick={() => setPanel1SubTab('image')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  panel1SubTab === 'image'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Image Data (Delegation Sheet)</span>
              </button>
            </div>
          </div>

          {/* Subview 1: EAN Upload Sheet */}
          {panel1SubTab === 'ean' && (
            <DataTable
              id="ean-upload-sheet"
              title="EAN Upload Sheet"
              subtitle="Columns: Product Name | EAN Code | Toon Label | Brand | Size | Color"
              data={eanList}
              columns={eanColumns}
              keyField="id"
              topActionButtons={
                <button
                  id="open-add-ean-modal-btn"
                  type="button"
                  onClick={onOpenAddEan}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload / Add EAN</span>
                </button>
              }
              onExportToGoogleSheets={onOpenSheetsModal}
            />
          )}

          {/* Subview 2: Master Product & Inventory Sheet (19 columns) */}
          {panel1SubTab === 'inventory' && (
            <DataTable
              id="product-inventory-sheet"
              title="Master Product & Inventory Sheet"
              subtitle="Columns: EAN | Product Name | Brand | Colour | Size | Toon Label | Selling Price | Total Aggregated Stock | Stores Count | GM FASHIONS WAREHOUSE Stock | KARUR Stock | KOOTTAPPALLI Stock | KUMBAKONAM Stock | MALLUR Stock | NAMAKKAL Stock | SALEM Stock | SCRA GODOWN Stock | TIRUVANNAMALAI Stock | WHOLESALE SHOWROOM Stock | Store-wise Breakdown"
              data={inventoryList}
              columns={inventoryColumns}
              keyField="id"
              onExportToGoogleSheets={onOpenSheetsModal}
            />
          )}

          {/* Subview 3: Image Data Sheet with "Share to Photo Team" Special Action Button */}
          {panel1SubTab === 'image' && (
            <DataTable
              id="image-data-sheet"
              title="Image Tracking Sheet & Delegation"
              subtitle="Columns: Product Name | EAN | TOON LABEL | BRAND | SIZE | COLOR | Action Checkbox"
              data={imageList}
              columns={imageColumns}
              keyField="ean"
              selectable={true}
              selectedKeys={selectedImageEans}
              onSelectionChange={setSelectedImageEans}
              topActionButtons={
                <div className="flex items-center gap-2">
                  {/* SPECIAL FEATURE: Share to Photo Team Action Button */}
                  <button
                    id="share-to-photo-team-action-btn"
                    type="button"
                    onClick={() => {
                      if (selectedImageEans.length === 0) {
                        alert('Please select at least one row using the checkboxes to share to the Photo Team.');
                        return;
                      }
                      shareToPhotoTeam(selectedImageEans);
                      setSelectedImageEans([]);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition shadow-xs ${
                      selectedImageEans.length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share to Photo Team ({selectedImageEans.length})</span>
                  </button>

                  {/* Share to Creative Team Action Button */}
                  <button
                    id="share-to-creative-team-action-btn"
                    type="button"
                    onClick={() => {
                      if (selectedImageEans.length === 0) {
                        alert('Please select at least one row using the checkboxes to assign to the Creative Team.');
                        return;
                      }
                      shareToCreativeTeam(selectedImageEans);
                      setSelectedImageEans([]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-lg transition"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Assign Creative ({selectedImageEans.length})</span>
                  </button>
                </div>
              }
              onExportToGoogleSheets={onOpenSheetsModal}
            />
          )}
        </section>
      )}

      {/* PANEL 2: PHOTO TEAM DELEGATION VIEW */}
      {(itActivePanel === 'all' || itActivePanel === 'panel2') && (
        <section id="it-panel-2-section" className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">PANEL 2: PHOTO TEAM DELEGATION VIEW</h3>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Mirrored with Studio
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Displays Photo Team Tracking Sheet containing synced rows forwarded from Panel 1. Status changes by Arjun & Manoj reflect here in real-time.
                </p>
              </div>
            </div>
          </div>

          <DataTable
            id="it-photo-delegation-sheet"
            title="Photo Team Tracking Sheet (Master IT View)"
            subtitle="Columns: Product Name | EAN | TOON LABEL | BRAND | SIZE | COLOR | Out Date | In Date | Hand Over | Arjun Status | Manoj Status"
            data={photoList}
            columns={photoColumns}
            keyField="id"
            onExportToGoogleSheets={onOpenSheetsModal}
          />
        </section>
      )}

      {/* PANEL 3: CREATIVE DEPARTMENT VIEW */}
      {(itActivePanel === 'all' || itActivePanel === 'panel3') && (
        <section id="it-panel-3-section" className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-amber-50/40 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">PANEL 3: CREATIVE DEPARTMENT VIEW</h3>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Design & Asset Briefs
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Displays Creative Department Sheet containing EAN Code, Product Name, Date, and Status / Remarks.
                </p>
              </div>
            </div>
          </div>

          <DataTable
            id="it-creative-department-sheet"
            title="Creative Department Tracking Sheet (Master IT View)"
            subtitle="Columns: EAN Code | Product Name | Date | Status / Remarks"
            data={creativeList}
            columns={creativeColumns}
            keyField="id"
            onExportToGoogleSheets={onOpenSheetsModal}
          />
        </section>
      )}
    </div>
  );
};
