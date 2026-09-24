import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  CheckSquare,
  Square,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  editable?: boolean;
  onEdit?: (item: T, newValue: any) => void;
}

interface DataTableProps<T> {
  id: string;
  data: T[];
  columns: ColumnDef<T>[];
  keyField: keyof T;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  title?: string;
  subtitle?: string;
  topActionButtons?: React.ReactNode;
  filterPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  onExportToGoogleSheets?: () => void;
  isExportingGoogle?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  id,
  data,
  columns,
  keyField,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  title,
  subtitle,
  topActionButtons,
  filterPlaceholder = 'Search spreadsheet rows...',
  pageSize = 15,
  emptyMessage = 'No records found matching your filters.',
  onExportToGoogleSheets,
  isExportingGoogle = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const query = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchTerm]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const allVisibleKeys = sortedData.map((d) => String(d[keyField]));
    const areAllSelected = allVisibleKeys.every((k) => selectedKeys.includes(k));
    if (areAllSelected) {
      onSelectionChange(selectedKeys.filter((k) => !allVisibleKeys.includes(k)));
    } else {
      const merged = Array.from(new Set([...selectedKeys, ...allVisibleKeys]));
      onSelectionChange(merged);
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  // CSV Export
  const exportCsv = () => {
    const headers = columns.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((item) =>
      columns
        .map((c) => {
          const val = item[c.key];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'd2d_sheet'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllSelected =
    sortedData.length > 0 && sortedData.every((d) => selectedKeys.includes(String(d[keyField])));
  const isSomeSelected =
    sortedData.some((d) => selectedKeys.includes(String(d[keyField]))) && !isAllSelected;

  return (
    <div
      id={`table-container-${id}`}
      className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
    >
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div>
          {title && (
            <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              {title}
            </h3>
          )}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id={`search-input-${id}`}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={filterPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          {/* Export to CSV */}
          <button
            id={`export-csv-btn-${id}`}
            onClick={exportCsv}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition shadow-xs"
            title="Export view to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Export to Google Sheets */}
          {onExportToGoogleSheets && (
            <button
              id={`export-google-sheets-btn-${id}`}
              onClick={onExportToGoogleSheets}
              disabled={isExportingGoogle}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg transition shadow-xs"
              title="Sync to Google Drive Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingGoogle ? 'Syncing...' : 'Google Sheets'}</span>
            </button>
          )}

          {/* Slot for custom buttons (e.g. Share to Photo Team, Add EAN) */}
          {topActionButtons}
        </div>
      </div>

      {/* Sticky Selection Bar (shows when items are checked) */}
      {selectable && selectedKeys.length > 0 && (
        <div
          id={`selection-action-bar-${id}`}
          className="px-4 py-2 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between animate-fadeIn text-xs text-indigo-900"
        >
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
              {selectedKeys.length}
            </span>
            <span>row{selectedKeys.length > 1 ? 's' : ''} selected</span>
          </div>
          <button
            id={`clear-selection-btn-${id}`}
            onClick={() => onSelectionChange && onSelectionChange([])}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline underline-offset-2 transition"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Spreadsheet Table Scroll Container */}
      <div className="overflow-x-auto max-h-[580px] custom-scrollbar border-b border-slate-200">
        <table id={`data-table-${id}`} className="w-full text-left border-collapse text-xs">
          {/* Header */}
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold tracking-wide uppercase text-[10px]">
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-3 text-center border-r border-slate-200">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 focus:outline-none"
                    title={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : isSomeSelected ? (
                      <Square className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-3.5 py-3 border-r border-slate-200 whitespace-nowrap select-none ${
                    col.sortable !== false ? 'cursor-pointer hover:text-slate-900 hover:bg-slate-100' : ''
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <span className="w-3.5 h-3.5 inline-block opacity-30 hover:opacity-100">↕</span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-200 font-mono">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-500 font-sans text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowKey = String(row[keyField]);
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    id={`row-${id}-${rowKey}`}
                    className={`transition-colors hover:bg-slate-50/90 ${
                      isSelected ? 'bg-indigo-50/70' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-2.5 text-center border-r border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSelectRow(rowKey)}
                          className="text-slate-400 hover:text-slate-700 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3.5 py-2.5 border-r border-slate-200 whitespace-nowrap text-slate-800"
                      >
                        {col.render ? col.render(row, idx) : String(row[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="px-4 py-3 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-slate-800">
              {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-slate-800">{sortedData.length}</strong> entries
          </span>
          {searchTerm && (
            <span className="text-indigo-600 font-medium">
              (filtered from {data.length} total rows)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id={`prev-page-btn-${id}`}
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 py-1 font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            id={`next-page-btn-${id}`}
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
