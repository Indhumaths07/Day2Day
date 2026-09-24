import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import {
  FileSpreadsheet,
  ExternalLink,
  Settings,
  X,
  RotateCcw,
  Camera,
  Palette,
  Barcode,
  Boxes,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export interface SheetButtonItem {
  id: string;
  name: string;
  subtitle: string;
  department: string;
  role: 'it_admin' | 'photo_team' | 'creative_team' | 'all';
  defaultUrl: string;
  description: string;
  borderHoverColor: string;
  iconBg: string;
  icon: React.ElementType;
}

export const COLORFUL_BUTTONS: SheetButtonItem[] = [
  {
    id: 'ean',
    name: 'EAN Code',
    subtitle: 'Master Barcode & EAN Catalog',
    department: 'IT Department',
    role: 'it_admin',
    defaultUrl: 'https://docs.google.com/spreadsheets/d/1hB7zh6BWQ8qowCRqOb6s4D7It7W_Wuhq6rsuOeupdH8/edit?gid=312408851#gid=312408851',
    description: 'Master EAN barcode catalog and SKU assignments.',
    borderHoverColor: 'hover:border-emerald-500 hover:shadow-emerald-500/25',
    iconBg: 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-emerald-500/35',
    icon: Barcode,
  },
  {
    id: 'inventory',
    name: 'Product Data',
    subtitle: 'Master Inventory Dataset',
    department: 'IT Department',
    role: 'it_admin',
    defaultUrl: 'https://docs.google.com/spreadsheets/d/1pgS94cEdnfcZEKOr38U8nboYX08UMK3DVNW6lU9mJ5U/edit?gid=516777217#gid=516777217',
    description: 'Master product inventory dataset with live stock and quantities.',
    borderHoverColor: 'hover:border-blue-500 hover:shadow-blue-500/25',
    iconBg: 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-blue-500/35',
    icon: Boxes,
  },
  {
    id: 'image',
    name: 'Image Data',
    subtitle: 'Asset Links & Google Drive Folders',
    department: 'IT Department',
    role: 'it_admin',
    defaultUrl: 'https://docs.google.com/spreadsheets/d/1n4g5rAQm8IYLEVgi-4lf00eC3iRtLqXTt0PkJhrd66c/edit?gid=0#gid=0',
    description: 'Google Drive folder links, raw shoot files, and image status tracking.',
    borderHoverColor: 'hover:border-violet-500 hover:shadow-violet-500/25',
    iconBg: 'bg-gradient-to-tr from-purple-600 via-violet-600 to-fuchsia-400 text-white shadow-purple-500/35',
    icon: ImageIcon,
  },
  {
    id: 'photo',
    name: 'Photo Team',
    subtitle: 'Photography Queue & Model Shoots',
    department: 'Photo Team',
    role: 'photo_team',
    defaultUrl: 'https://docs.google.com/spreadsheets/d/12WP5gDv3ChGlL2T8C6m2VbGZIX7zd2a691Pj_bV_55Q/edit?gid=0#gid=0',
    description: 'Studio photography assignment board and shot status.',
    borderHoverColor: 'hover:border-amber-500 hover:shadow-amber-500/25',
    iconBg: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white shadow-amber-500/35',
    icon: Camera,
  },
  {
    id: 'creative',
    name: 'Godown Team',
    subtitle: 'Godown Inventory & Stock Dispatch',
    department: 'Godown Team',
    role: 'creative_team',
    defaultUrl: 'https://docs.google.com/spreadsheets/d/11I7JWFuDZ98ew68K0EGrvczfKlHlKRf0EB38giYWrhg/edit?gid=0#gid=0',
    description: 'Godown stock dispatch, inventory tracking, and warehouse cataloging.',
    borderHoverColor: 'hover:border-pink-500 hover:shadow-pink-500/25',
    iconBg: 'bg-gradient-to-tr from-pink-600 via-rose-500 to-fuchsia-400 text-white shadow-pink-500/35',
    icon: Boxes,
  },
];

interface CleanButtonPortalProps {
  onOpenLoginModal?: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

export const CleanButtonPortal: React.FC<CleanButtonPortalProps> = ({
  isSettingsOpen,
  setIsSettingsOpen,
}) => {
  const { currentUser, googleSheetUrls, setGoogleSheetUrl, addToast } = useWorkflow();

  const [urlsInput, setUrlsInput] = useState<Record<string, string>>({});

  // Sync URLs when settings modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      const currentMap: Record<string, string> = {};
      COLORFUL_BUTTONS.forEach((btn) => {
        currentMap[btn.id] = googleSheetUrls[btn.id] || btn.defaultUrl;
      });
      setUrlsInput(currentMap);
    }
  }, [isSettingsOpen, googleSheetUrls]);

  // Get current role - default to it_admin
  const userRole = currentUser?.role || 'it_admin';

  // Visible buttons based on role: IT department shows all 5, other departments show their own
  const visibleButtons = COLORFUL_BUTTONS.filter((btn) => {
    if (userRole === 'it_admin') return true;
    if (btn.role === 'all') return true;
    return btn.role === userRole;
  });

  // Open Google Sheet in a brand new tab
  const handleOpenSheet = (btn: SheetButtonItem) => {
    const url = googleSheetUrls[btn.id] || btn.defaultUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
    addToast('Opening Google Sheet', `Opening "${btn.name}" in a new tab...`, 'success');
  };

  // Save all custom URLs
  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    COLORFUL_BUTTONS.forEach((btn) => {
      const entered = urlsInput[btn.id];
      if (entered && entered.trim()) {
        setGoogleSheetUrl(btn.id, entered.trim());
      }
    });
    addToast('Google Sheet Settings Saved', 'All Google Sheet URLs have been updated successfully.', 'success');
    setIsSettingsOpen(false);
  };

  // Reset a specific button to default in settings modal
  const handleResetSingleUrl = (btnId: string) => {
    const target = COLORFUL_BUTTONS.find((b) => b.id === btnId);
    if (target) {
      setUrlsInput((prev) => ({ ...prev, [btnId]: target.defaultUrl }));
    }
  };

  // Reset all buttons to defaults
  const handleResetAllUrls = () => {
    const defaultMap: Record<string, string> = {};
    COLORFUL_BUTTONS.forEach((btn) => {
      defaultMap[btn.id] = btn.defaultUrl;
      setGoogleSheetUrl(btn.id, btn.defaultUrl);
    });
    setUrlsInput(defaultMap);
    addToast('Reset to Defaults', 'All buttons have been reset to their default Google Sheets.', 'info');
  };

  // Minimalist Square Button Renderer with native anchor link for Chrome popup-blocker immunity
  const renderSquareButton = (btn: SheetButtonItem) => {
    const IconComponent = btn.icon;
    const sheetUrl = googleSheetUrls[btn.id] || btn.defaultUrl;

    return (
      <a
        key={btn.id}
        id={`square-btn-${btn.id}`}
        href={sheetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          addToast('Opening Google Sheet', `Opening "${btn.name}" in a new tab...`, 'success');
        }}
        className={`group relative aspect-square w-full max-w-[240px] mx-auto bg-white border-2 border-slate-200/90 ${btn.borderHoverColor} rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1.5 active:scale-95 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center no-underline`}
      >
        {/* Large Vibrant Icon */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${btn.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 mb-4`}
        >
          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        {/* Minimalist Button Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-800 group-hover:text-slate-950 transition-colors tracking-tight leading-snug">
          {btn.name}
        </h3>

        {/* Small subtle badge */}
        <span className="mt-2 text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 flex items-center gap-1 transition-colors">
          <span>Open Google Sheet</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      </a>
    );
  };

  return (
    <div id="clean-button-portal" className="max-w-5xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-200">
      {/* -------------------------------------------------------------
          MINIMALIST SQUARE BUTTONS GRID
          - For IT Department: 3 on Top Row, 2 on Bottom Row
          - For other departments: Single centered button
         ------------------------------------------------------------- */}
      {visibleButtons.length === 5 ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Top Row: Exactly 3 Square Buttons (EAN Code, Product Data, Image Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            {visibleButtons.slice(0, 3).map(renderSquareButton)}
          </div>

          {/* Bottom Row: Exactly 2 Square Buttons (Photo Team, Creative Department) */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 max-w-4xl mx-auto w-full">
            {visibleButtons.slice(3, 5).map((btn) => (
              <div key={btn.id} className="w-full sm:w-[calc(33.333%-1rem)] max-w-[240px]">
                {renderSquareButton(btn)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* For single department login */
        <div className="flex justify-center items-center max-w-xs mx-auto w-full py-6">
          <div className="w-full max-w-[240px]">
            {visibleButtons.map(renderSquareButton)}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SETTINGS MODAL: CONFIGURE ALL GOOGLE SHEET LINKS
         ------------------------------------------------------------- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Settings className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Google Sheet Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste your company's actual Google Sheet URL for each button.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAllSettings} className="flex flex-col flex-1 overflow-hidden mt-4">
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {COLORFUL_BUTTONS.map((btn) => {
                  const IconComp = btn.icon;
                  const currentVal = urlsInput[btn.id] || '';

                  return (
                    <div
                      key={btn.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${btn.iconBg} flex items-center justify-center shadow-xs`}>
                            <IconComp className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{btn.name}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({btn.department})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => window.open(currentVal || btn.defaultUrl, '_blank', 'noopener,noreferrer')}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                            title="Test open this link in a new tab"
                          >
                            <span>Test</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetSingleUrl(btn.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer hover:underline"
                            title="Reset this link to default"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      <input
                        type="url"
                        value={currentVal}
                        onChange={(e) =>
                          setUrlsInput((prev) => ({ ...prev, [btn.id]: e.target.value }))
                        }
                        placeholder={btn.defaultUrl}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800 bg-white shadow-2xs"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAllUrls}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium underline cursor-pointer"
                >
                  Reset All to Defaults
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All Links</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

