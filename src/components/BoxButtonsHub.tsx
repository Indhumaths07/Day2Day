import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { SheetType } from './GoogleSheetFrame';
import {
  FileSpreadsheet,
  Package,
  Image as ImageIcon,
  Camera,
  Palette,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  Users,
  Layers,
  Sparkles,
  Link2,
} from 'lucide-react';

interface BoxButtonsHubProps {
  onSelectSheet: (sheet: SheetType) => void;
  onOpenConsulting: () => void;
  userRole: 'it_admin' | 'photo_team' | 'creative_team';
}

export const BoxButtonsHub: React.FC<BoxButtonsHubProps> = ({ onSelectSheet, onOpenConsulting, userRole }) => {
  const { eanList, inventoryList, imageList, photoList, creativeList, googleSheetUrls } = useWorkflow();

  return (
    <div id="box-buttons-hub-container" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                {userRole === 'it_admin'
                  ? 'IT Master Admin'
                  : userRole === 'photo_team'
                  ? 'Photo Studio Portal'
                  : 'Godown Team Portal'}
              </span>
              <span className="text-xs text-slate-500">• Public Live Access</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Google Sheet Dashboard Hub
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any button box below to open its dedicated Google Sheet frame, or click Consulting to open in Full Screen.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onOpenConsulting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0f9d58] hover:bg-[#0b8043] text-white shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Consulting (Full Screen)</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Embedded Google Sheet Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          BOX BUTTONS GRID (CONSULTING, EAN CODE, PRODUCT DATA, ETC)
         ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* SPECIAL BOX BUTTON: CONSULTING (ACTUAL GOOGLE SHEET FULL SCREEN) */}
        <div
          id="box-btn-consulting"
          onClick={onOpenConsulting}
          className="group relative bg-gradient-to-br from-emerald-50/50 via-white to-emerald-100/30 hover:to-emerald-100/70 border-2 border-[#0f9d58] rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between ring-2 ring-emerald-500/20"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#0f9d58] text-white flex items-center justify-center group-hover:scale-105 transition shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#0f9d58] border border-emerald-300 shadow-2xs">
                  docs.google.com
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0f9d58] text-white font-mono shadow-xs">
                  Full Screen
                </span>
              </div>
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f9d58] mb-1 flex items-center gap-1">
              <span>Interactive Google Sheet</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0f9d58] transition">
              CONSULTING (Actual Google Sheet)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Opens the <strong>actual Google Sheet in Full Screen</strong>. You can perform all regular Google Sheet tasks: edit cells, calculate formulas, manage sheets, and collaborate live.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-emerald-200 flex items-center justify-between text-xs font-bold text-[#0f9d58]">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Open Actual Google Sheet in Full Screen</span>
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
        {/* BOX BUTTON 1: EAN CODE / EAN DATA */}
        {(userRole === 'it_admin' || userRole === 'photo_team' || userRole === 'creative_team') && (
          <div
            id="box-btn-ean-code"
            onClick={() => onSelectSheet('ean')}
            className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {googleSheetUrls.ean && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Live URL Linked
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    {eanList.length} Rows
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Google Sheet 1
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                EAN CODE / EAN DATA
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Category Matrix (Mens T-Shirt, Men's Shorts, men Pant, Track pant, Shirt) & Master Catalog.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open Google Sheet</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}

        {/* BOX BUTTON 2: PRODUCT DATA (19 COLUMNS) */}
        {userRole === 'it_admin' && (
          <div
            id="box-btn-product-data"
            onClick={() => onSelectSheet('inventory')}
            className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {googleSheetUrls.inventory && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Live URL Linked
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    19 Columns
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Google Sheet 2
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                PRODUCT DATA (Inventory)
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Full 19-column spreadsheet: GM Fashions WH, Karur, Kumbakonam, Salem, SCRA, etc. with total aggregated stock.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open Google Sheet</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}

        {/* BOX BUTTON 3: IMAGE DATA & DELEGATION (WITH OUTSIDE SHARE TO PHOTO TEAM) */}
        {userRole === 'it_admin' && (
          <div
            id="box-btn-image-data"
            onClick={() => onSelectSheet('image')}
            className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-purple-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center group-hover:scale-105 transition">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {googleSheetUrls.image && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Live URL Linked
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                    {imageList.length} Items
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-1">
                Google Sheet 3 • Forwarding Center
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                IMAGE DATA (Share to Teams)
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Enter/select image data rows and use the outside <strong>"Share to Photo Team"</strong> button to send tasks directly.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open Google Sheet & Share</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}

        {/* BOX BUTTON 4: PHOTO TEAM TRACKING */}
        {(userRole === 'it_admin' || userRole === 'photo_team') && (
          <div
            id="box-btn-photo-team"
            onClick={() => onSelectSheet('photo')}
            className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-teal-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center group-hover:scale-105 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {googleSheetUrls.photo && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Live URL Linked
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 font-mono">
                    {photoList.length} Tasks
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-1">
                Google Sheet 4
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition">
                PHOTO TEAM DASHBOARD
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Product Name, EAN, TOON LABLE, BRAND, SIZE, COLOR, HAND OVER, ARJUN STATUS, MANOJ STATUS.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open Google Sheet</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}

        {/* BOX BUTTON 5: CREATIVE DEPARTMENT TASKS */}
        {(userRole === 'it_admin' || userRole === 'creative_team') && (
          <div
            id="box-btn-creative-dept"
            onClick={() => onSelectSheet('creative')}
            className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-amber-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition">
                  <Palette className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  {googleSheetUrls.creative && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Live URL Linked
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                    {creativeList.length} Tasks
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                Google Sheet 5
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                GODOWN TEAM
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                EAN CODE, STYLE NO, Product Name, Status / Remarks, and Date.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open Google Sheet</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Google Sheet Integration:</strong> Each box button opens the Google Sheet frame right here inside our site. You can also paste your own Google Sheet share link into each section.
          </span>
        </div>
      </div>
    </div>
  );
};
