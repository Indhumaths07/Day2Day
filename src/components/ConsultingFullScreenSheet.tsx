import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import {
  FileSpreadsheet,
  ExternalLink,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Link2,
  Check,
  Globe,
  Info,
  Sparkles,
} from 'lucide-react';

interface ConsultingFullScreenSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultingFullScreenSheet: React.FC<ConsultingFullScreenSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { googleSheetUrls, setGoogleSheetUrl, addToast } = useWorkflow();

  const defaultConsultingUrl =
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview';

  const currentRawUrl = googleSheetUrls.consulting || defaultConsultingUrl;
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(currentRawUrl);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUrlModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUrlModalOpen, onClose]);

  if (!isOpen) return null;

  // Convert raw Google Sheet URL into embeddable format
  const getEmbedUrl = (raw: string) => {
    if (!raw) return defaultConsultingUrl;
    try {
      if (raw.includes('docs.google.com/spreadsheets')) {
        let clean = raw.split('?')[0];
        // If user pasted a publish embed link: already good
        if (raw.includes('/pubhtml')) return raw;
        // If /edit ending, switch to /preview or append /preview for clean embedding
        if (clean.endsWith('/edit')) {
          return clean.replace(/\/edit$/, '/preview');
        } else if (!clean.endsWith('/preview')) {
          return clean + '/preview';
        }
        return clean;
      }
      return raw;
    } catch {
      return raw;
    }
  };

  // Direct edit URL for opening in native Google Sheets tab (100% full features)
  const getDirectEditUrl = (raw: string) => {
    if (!raw) return defaultConsultingUrl;
    try {
      if (raw.includes('docs.google.com/spreadsheets')) {
        let clean = raw.split('?')[0];
        if (clean.endsWith('/preview') || clean.endsWith('/pubhtml')) {
          return clean.replace(/\/(preview|pubhtml)$/, '/edit');
        }
        if (!clean.endsWith('/edit')) {
          return clean + '/edit';
        }
        return clean;
      }
      return raw;
    } catch {
      return raw;
    }
  };

  const embedUrl = getEmbedUrl(currentRawUrl);
  const directEditUrl = getDirectEditUrl(currentRawUrl);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setGoogleSheetUrl('consulting', inputUrl.trim());
      setIsUrlModalOpen(false);
      setIframeKey((prev) => prev + 1);
      setIsLoading(true);
      addToast('Consulting Google Sheet Updated', 'Your sheet is now loaded in full screen.', 'success');
    }
  };

  return (
    <div
      id="consulting-fullscreen-overlay"
      className="fixed inset-0 z-50 bg-slate-900 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200"
    >
      {/* -------------------------------------------------------------
          TOP CONTROL BAR (FULL SCREEN HEADER)
         ------------------------------------------------------------- */}
      <header className="bg-[#0f9d58] text-white px-4 py-2.5 flex items-center justify-between shadow-md select-none shrink-0 z-10">
        {/* Left branding & title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-[#0f9d58] flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                CONSULTING • Actual Google Sheet
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-900/60 text-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                FULL SCREEN ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 hidden md:block">
              Full Google Sheet interactive mode • Edit cells, view formulas, and collaborate in real-time.
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Change Link Button */}
          <button
            type="button"
            onClick={() => {
              setInputUrl(currentRawUrl);
              setIsUrlModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer"
            title="Link your own Google Sheet"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Sheet Link</span>
          </button>

          {/* Refresh Sheet */}
          <button
            type="button"
            onClick={() => {
              setIframeKey((prev) => prev + 1);
              setIsLoading(true);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs cursor-pointer"
            title="Reload Google Sheet"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1.5">Reload</span>
          </button>

          {/* Direct Open in Google Sheets Tab (100% full Google features) */}
          <a
            href={directEditUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-emerald-900 rounded-lg transition shadow-xs cursor-pointer"
            title="Open directly in a full Google Sheets browser tab with all Google menus & extensions"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0f9d58]" />
            <span>Open in Google Sheets Tab</span>
          </a>

          {/* Close Full Screen Button */}
          <button
            id="close-consulting-fullscreen-btn"
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs cursor-pointer"
            title="Exit Full Screen (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Full Screen</span>
            <span className="text-[10px] bg-rose-800/80 px-1 py-0.2 rounded font-mono ml-0.5">ESC</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          ACTUAL GOOGLE SHEET FULL SCREEN IFRAME
         ------------------------------------------------------------- */}
      <main className="relative flex-1 w-full h-full bg-slate-100 overflow-hidden">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-800">Loading Actual Google Sheet...</p>
            <p className="text-xs text-slate-500 mt-1">Connecting to docs.google.com in full screen</p>
          </div>
        )}

        {/* Real Google Sheet Iframe */}
        <iframe
          key={iframeKey}
          src={embedUrl}
          title="Consulting Google Sheet Full Screen"
          className="w-full h-full border-0 bg-white"
          allow="clipboard-read; clipboard-write; fullscreen"
          onLoad={() => setIsLoading(false)}
        />
      </main>

      {/* -------------------------------------------------------------
          MODAL: CHANGE / PASTE GOOGLE SHEET LINK
         ------------------------------------------------------------- */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0f9d58] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Link Your Consulting Google Sheet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Paste your actual Google Sheet URL below. You can edit cells, formulas, formatting, and tabs right here in full screen.
            </p>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Sheet URL (docs.google.com)
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1.../edit"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                  required
                />
              </div>

              {/* Sample Sheet Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl(defaultConsultingUrl);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                >
                  Use Public Sample Consulting Sheet
                </button>
              </div>

              {/* Quick instructions in Tamil and English */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">📌 How to get your Google Sheet link (எப்படி எடுப்பது):</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
                  <li>Open your Google Sheet at <strong>docs.google.com</strong></li>
                  <li>Click <strong>File</strong> &gt; <strong>Share</strong> &gt; <strong>Publish to web</strong> &gt; <strong>Embed</strong> &gt; <strong>Publish</strong></li>
                  <li>Copy the link and paste it above!</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#0f9d58] hover:bg-emerald-700 text-white rounded-xl transition shadow-xs cursor-pointer"
                >
                  Apply & Open Full Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
