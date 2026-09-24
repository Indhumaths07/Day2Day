import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { DataTable, ColumnDef } from './DataTable';
import { PhotoDelegationItem, HandOverStatus, ArjunStatus, ManojStatus } from '../types';
import {
  Camera,
  UserCheck,
} from 'lucide-react';

interface PhotoTeamDashboardProps {
  onOpenSheetsModal: () => void;
}

export const PhotoTeamDashboard: React.FC<PhotoTeamDashboardProps> = ({ onOpenSheetsModal }) => {
  const { photoList, updatePhotoRecord, addToast } = useWorkflow();

  const handOverOptions: HandOverStatus[] = [
    'Pending Pickup',
    'In Studio',
    'Shot Complete',
    'Returned to WH',
    'Sample Kept',
  ];

  const arjunOptions: ArjunStatus[] = [
    'Pending',
    'Shoot Queued',
    'Shooting',
    'Editing',
    'Approved',
  ];

  const manojOptions: ManojStatus[] = [
    'Pending',
    'Raw QA',
    'Retouching',
    'Final QA',
    'Uploaded to S3',
    'Completed',
  ];

  // Columns for Photo Team Sheet with inline editable status fields
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
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
    {
      key: 'size',
      header: 'SIZE',
      render: (item) => (
        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
          {item.size}
        </span>
      ),
    },
    { key: 'color', header: 'COLOR' },

    // INLINE EDITABLE: Out Date
    {
      key: 'outDate',
      header: 'Out Date (Editable)',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={item.outDate || ''}
            onChange={(e) => {
              updatePhotoRecord(item.id, { outDate: e.target.value });
              addToast('Out Date Updated', `EAN ${item.ean} set to ${e.target.value}`, 'info');
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-emerald-600 transition font-mono shadow-xs"
          />
        </div>
      ),
    },

    // INLINE EDITABLE: In Date
    {
      key: 'inDate',
      header: 'In Date (Editable)',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={item.inDate || ''}
            onChange={(e) => {
              updatePhotoRecord(item.id, { inDate: e.target.value });
              addToast('In Date Updated', `EAN ${item.ean} set to ${e.target.value}`, 'info');
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-emerald-600 transition font-mono shadow-xs"
          />
        </div>
      ),
    },

    // INLINE EDITABLE: Hand Over Status
    {
      key: 'handOver',
      header: 'Hand Over (Editable)',
      render: (item) => (
        <select
          value={item.handOver}
          onChange={(e) => {
            const val = e.target.value as HandOverStatus;
            updatePhotoRecord(item.id, { handOver: val });
            addToast('Hand Over Status Updated', `EAN ${item.ean} -> ${val}`, 'info');
          }}
          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-emerald-600 transition cursor-pointer shadow-xs"
        >
          {handOverOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-slate-800">
              {opt}
            </option>
          ))}
        </select>
      ),
    },

    // INLINE EDITABLE: Arjun Status
    {
      key: 'arjunStatus',
      header: 'Arjun Status (Editable)',
      render: (item) => (
        <select
          value={item.arjunStatus}
          onChange={(e) => {
            const val = e.target.value as ArjunStatus;
            updatePhotoRecord(item.id, { arjunStatus: val });
            addToast('Arjun Status Updated', `EAN ${item.ean} -> ${val}`, 'success');
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer shadow-xs ${
            item.arjunStatus === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : item.arjunStatus === 'Shooting'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-50 text-slate-700 border-slate-300'
          }`}
        >
          {arjunOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-slate-800">
              {opt}
            </option>
          ))}
        </select>
      ),
    },

    // INLINE EDITABLE: Manoj Status
    {
      key: 'manojStatus',
      header: 'Manoj Status (Editable)',
      render: (item) => (
        <select
          value={item.manojStatus}
          onChange={(e) => {
            const val = e.target.value as ManojStatus;
            updatePhotoRecord(item.id, { manojStatus: val });
            addToast('Manoj Status Updated', `EAN ${item.ean} -> ${val}`, 'success');
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer shadow-xs ${
            item.manojStatus === 'Completed' || item.manojStatus === 'Uploaded to S3'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : item.manojStatus === 'Raw QA' || item.manojStatus === 'Retouching'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
              : 'bg-slate-50 text-slate-700 border-slate-300'
          }`}
        >
          {manojOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-slate-800">
              {opt}
            </option>
          ))}
        </select>
      ),
    },
  ];

  // Quick stats for the photo team
  const pendingCount = photoList.filter((p) => p.arjunStatus === 'Pending' || p.arjunStatus === 'Shoot Queued').length;
  const shootingCount = photoList.filter((p) => p.arjunStatus === 'Shooting').length;
  const readyCount = photoList.filter((p) => p.manojStatus === 'Completed').length;

  return (
    <div id="photo-team-dashboard-container" className="space-y-6">
      {/* Department Role Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-white to-white border border-emerald-200 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                  Photo Team Department Portal
                </span>
                <span className="text-xs text-slate-500">Arjun & Manoj Studio</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                Assigned Photo Tracking Sheet
              </h2>
              <p className="text-xs text-slate-600">
                Mirrored in real-time with IT Department Panel 2. Update shoot dates, handover, and team statuses below.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">Queue Pending</span>
              <span className="text-base font-bold text-amber-700">{pendingCount}</span>
            </div>
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">In Shoot</span>
              <span className="text-base font-bold text-indigo-700">{shootingCount}</span>
            </div>
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">Completed</span>
              <span className="text-base font-bold text-emerald-700">{readyCount}</span>
            </div>
          </div>
        </div>

        {/* Security & RBAC Notice */}
        <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Restricted View: Master IT Inventory & Creative Dept sheets are isolated from this portal.</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Real-time synchronization active • {photoList.length} items assigned
          </span>
        </div>
      </div>

      {/* Main Interactive Photo Sheet Table */}
      <DataTable
        id="photo-team-restricted-sheet"
        title="Photo Team Action Status Sheet"
        subtitle="Columns: Product Name | EAN | TOON LABEL | BRAND | SIZE | COLOR | Out Date | In Date | Hand Over | Arjun Status | Manoj Status"
        data={photoList}
        columns={photoColumns}
        keyField="id"
        emptyMessage="No photo shoot tasks assigned yet. The IT Department forwards selected items from Panel 1."
        onExportToGoogleSheets={onOpenSheetsModal}
      />
    </div>
  );
};
