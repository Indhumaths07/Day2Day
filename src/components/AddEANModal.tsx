import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { X, Plus, Upload, Check, AlertCircle } from 'lucide-react';

interface AddEANModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEANModal: React.FC<AddEANModalProps> = ({ isOpen, onClose }) => {
  const { addEanRecord, addToast } = useWorkflow();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single form state
  const [productName, setProductName] = useState('');
  const [eanCode, setEanCode] = useState('');
  const [toonLabel, setToonLabel] = useState('');
  const [brand, setBrand] = useState('Karur Spark');
  const [size, setSize] = useState('L');
  const [color, setColor] = useState('Navy Blue');

  // Bulk paste state
  const [bulkText, setBulkText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !eanCode.trim()) {
      setErrorMsg('Product Name and EAN Code are required.');
      return;
    }

    addEanRecord({
      productName: productName.trim(),
      eanCode: eanCode.trim(),
      toonLabel: toonLabel.trim() || `TOON-${brand.slice(0, 3).toUpperCase()}-01`,
      brand: brand.trim(),
      size: size.trim(),
      color: color.trim(),
    });

    // Reset & close
    setProductName('');
    setEanCode('');
    setToonLabel('');
    setErrorMsg(null);
    onClose();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      setErrorMsg('Please paste tab-separated or comma-separated rows.');
      return;
    }

    const lines = bulkText.trim().split('\n');
    let addedCount = 0;

    lines.forEach((line) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const pName = parts[0]?.trim() || 'Imported Product';
        const eCode = parts[1]?.trim();
        const tLabel = parts[2]?.trim() || `TOON-IMP-${addedCount + 1}`;
        const bBrand = parts[3]?.trim() || 'Karur Spark';
        const sSize = parts[4]?.trim() || 'M';
        const cColor = parts[5]?.trim() || 'Blue';

        if (eCode) {
          addEanRecord({
            productName: pName,
            eanCode: eCode,
            toonLabel: tLabel,
            brand: bBrand,
            size: sSize,
            color: cColor,
          });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      addToast('Bulk Import Completed', `Successfully added ${addedCount} products to Master Sheets.`, 'success');
      setBulkText('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('No valid rows detected. Ensure columns match: Product Name, EAN Code, Toon Label, Brand, Size, Color');
    }
  };

  return (
    <div
      id="add-ean-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="add-ean-modal-card"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upload New EAN Catalog Item</h3>
              <p className="text-[11px] text-slate-500">Panel 1: Master Operations & Product Register</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Single Form vs Bulk Sheet Paste */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
              mode === 'single'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Single Item Entry
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
              mode === 'bulk'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bulk Paste from Sheets
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Product Name *</label>
              <input
                id="input-product-name"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Slim Fit Cotton Casual Shirt"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">EAN Code (13 Digits) *</label>
                <input
                  id="input-ean-code"
                  type="text"
                  required
                  value={eanCode}
                  onChange={(e) => setEanCode(e.target.value)}
                  placeholder="8907541203099"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Toon Label</label>
                <input
                  id="input-toon-label"
                  type="text"
                  value={toonLabel}
                  onChange={(e) => setToonLabel(e.target.value)}
                  placeholder="TOON-M-SHT-05"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                <input
                  id="input-brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Karur Spark"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Size</label>
                <input
                  id="input-size"
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="L, XL, 32..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Color</label>
                <input
                  id="input-color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Navy Blue"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                id="submit-add-ean-btn"
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Master Sheets</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="p-6 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Paste Tab-Separated or CSV Data
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Order: Product Name | EAN Code | Toon Label | Brand | Size | Color
              </p>
              <textarea
                id="bulk-ean-textarea"
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Classic Oxford Shirt\t8907541209991\tTOON-M-SHT-99\tKarur Spark\tL\tWhite\nChino Trousers\t8907541209992\tTOON-M-TRS-99\tAllen Solly\t34\tBeige`}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                id="submit-bulk-ean-btn"
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Pasted Rows</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
