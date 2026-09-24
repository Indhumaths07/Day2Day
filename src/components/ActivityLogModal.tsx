import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { X, Activity, Clock, Shield, Camera, Palette } from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose }) => {
  const { activityLogs } = useWorkflow();

  if (!isOpen) return null;

  return (
    <div
      id="activity-logs-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="activity-logs-card"
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">D2D Real-Time Audit & Delegation Log</h3>
              <p className="text-[11px] text-slate-500">Cross-department sync trail & event history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {activityLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No activity logs recorded yet.</div>
          ) : (
            activityLogs.map((log) => {
              const isIT = log.role === 'it_admin';
              const isPhoto = log.role === 'photo_team';

              return (
                <div
                  key={log.id}
                  id={`log-item-${log.id}`}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 transition hover:border-slate-300"
                >
                  <div
                    className={`mt-0.5 p-2 rounded-lg shrink-0 border ${
                      isIT
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : isPhoto
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isIT ? (
                      <Shield className="w-4 h-4" />
                    ) : isPhoto ? (
                      <Camera className="w-4 h-4" />
                    ) : (
                      <Palette className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1">{log.details}</div>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-700">{log.userName}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wider font-semibold text-slate-400">
                        {log.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
