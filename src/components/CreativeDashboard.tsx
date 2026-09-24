import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { DataTable, ColumnDef } from './DataTable';
import { CreativeDepartmentItem, CreativeStatus } from '../types';
import { Boxes, UserCheck } from 'lucide-react';

interface CreativeDashboardProps {
  onOpenSheetsModal: () => void;
}

export const CreativeDashboard: React.FC<CreativeDashboardProps> = ({ onOpenSheetsModal }) => {
  const { creativeList, updateCreativeRecord, addToast } = useWorkflow();

  const creativeStatusOptions: CreativeStatus[] = [
    'Brief Received',
    'In Design',
    'Revision',
    'Banner Ready',
    'Catalog Ready',
    'Completed',
  ];

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
    // INLINE EDITABLE: Date
    {
      key: 'date',
      header: 'Date (Editable)',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={item.date || ''}
            onChange={(e) => {
              updateCreativeRecord(item.id, { date: e.target.value });
              addToast('Date Updated', `EAN ${item.eanCode} date changed to ${e.target.value}`, 'info');
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-amber-600 transition font-mono shadow-xs"
          />
        </div>
      ),
    },
    // INLINE EDITABLE: Upload / Design Status & Remarks
    {
      key: 'statusRemarks',
      header: 'Upload / Design Status (Editable)',
      render: (item) => (
        <select
          value={item.statusRemarks}
          onChange={(e) => {
            const val = e.target.value as CreativeStatus;
            updateCreativeRecord(item.id, { statusRemarks: val });
            addToast('Creative Status Updated', `EAN ${item.eanCode} -> ${val}`, 'success');
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer shadow-xs ${
            item.statusRemarks === 'Completed' || item.statusRemarks === 'Catalog Ready'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : item.statusRemarks === 'Banner Ready' || item.statusRemarks === 'In Design'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-50 text-slate-700 border-slate-300'
          }`}
        >
          {creativeStatusOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-slate-800">
              {opt}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'assignedBy',
      header: 'Assigned By',
      render: (item) => <span className="text-slate-600 text-xs">{item.assignedBy}</span>,
    },
    {
      key: 'lastUpdatedBy',
      header: 'Last Updated By',
      render: (item) => <span className="text-slate-500 text-xs font-mono">{item.lastUpdatedBy || '-'}</span>,
    },
  ];

  const inDesignCount = creativeList.filter((c) => c.statusRemarks === 'In Design' || c.statusRemarks === 'Brief Received').length;
  const completedCount = creativeList.filter((c) => c.statusRemarks === 'Completed' || c.statusRemarks === 'Catalog Ready').length;

  return (
    <div id="creative-team-dashboard-container" className="space-y-6">
      {/* Department Role Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-50/70 via-white to-white border border-amber-200 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shadow-xs">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wide">
                  GODOWN TEAM PORTAL
                </span>
                <span className="text-xs text-slate-500">Inventory, Stock Dispatch & Warehouse Listings</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                Assigned Godown Tasks Sheet
              </h2>
              <p className="text-xs text-slate-600">
                Mirrored directly with IT Department Panel 3. Update EAN progress and release dates below.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">In Progress</span>
              <span className="text-base font-bold text-amber-700">{inDesignCount}</span>
            </div>
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">Completed</span>
              <span className="text-base font-bold text-emerald-700">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Security & RBAC Notice */}
        <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Restricted View: IT Master Operations and Photo Team studio data are isolated from this portal.</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Real-time synchronization active • {creativeList.length} items assigned
          </span>
        </div>
      </div>

      {/* Main Godown Sheet Table */}
      <DataTable
        id="creative-department-restricted-sheet"
        title="Godown Team Sheet"
        subtitle="Columns: EAN Code | Product Name | Date | Status"
        data={creativeList}
        columns={creativeColumns}
        keyField="id"
        emptyMessage="No godown tasks assigned yet. Items are assigned by the IT Department from Master Data."
        onExportToGoogleSheets={onOpenSheetsModal}
      />
    </div>
  );
};
