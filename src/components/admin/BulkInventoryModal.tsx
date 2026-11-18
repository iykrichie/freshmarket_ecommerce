import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BulkImportRowResult,
  StockUpdateMode,
  parseInventoryFile,
  buildUpdatedAndNewProducts,
  exportInventorySpreadsheet,
  downloadInventoryTemplate,
} from '../../utils/inventorySpreadsheet';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface BulkInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'catalog' | 'stock_only';
}

export const BulkInventoryModal: React.FC<BulkInventoryModalProps> = ({
  isOpen,
  onClose,
  mode = 'catalog',
}) => {
  const { products, categories, storeSettings, bulkUpsertInventory, showToast } = useStore();
  const isStockOnly = mode === 'stock_only';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [stockMode, setStockMode] = useState<StockUpdateMode>('set');
  const [allowCreateNew, setAllowCreateNew] = useState<boolean>(!isStockOnly);
  const [results, setResults] = useState<BulkImportRowResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'update' | 'create' | 'error'>('all');

  const storeSlug = storeSettings.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'store';

  const runParse = useCallback(
    async (file: File, mode: StockUpdateMode, createNew: boolean) => {
      setIsParsing(true);
      setParseError(null);
      try {
        const parsed = await parseInventoryFile(file, products, categories, mode, createNew);
        setResults(parsed);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to parse spreadsheet file.';
        setParseError(message);
        setResults([]);
      } finally {
        setIsParsing(false);
      }
    },
    [products, categories]
  );

  useEffect(() => {
    setAllowCreateNew(!isStockOnly);
  }, [isStockOnly]);

  useEffect(() => {
    if (selectedFile) {
      runParse(selectedFile, stockMode, isStockOnly ? false : allowCreateNew);
    }
  }, [selectedFile, stockMode, allowCreateNew, isStockOnly, runParse]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setParseError('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }
    setSelectedFile(file);
    setActiveFilter('all');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResults([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateCount = results.filter((r) => r.action === 'update').length;
  const createCount = results.filter((r) => r.action === 'create').length;
  const unchangedCount = results.filter((r) => r.action === 'unchanged').length;
  const errorCount = results.filter((r) => r.action === 'error').length;

  const filteredResults = results.filter((r) =>
    activeFilter === 'all' ? true : r.action === activeFilter
  );

  const handleApplyImport = () => {
    const { updatedProducts, newProducts } = buildUpdatedAndNewProducts(results, categories);
    if (updatedProducts.length === 0 && newProducts.length === 0) {
      showToast('No changes or new items to apply.', 'info');
      return;
    }
    bulkUpsertInventory(updatedProducts, newProducts);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-gray-900">
                {isStockOnly
                  ? 'Bulk Stock Count & Restock Sync (CSV / Excel)'
                  : 'Bulk Product & Catalog Upload (CSV / Excel)'}
              </h3>
              <p className="text-xs text-gray-500">
                {isStockOnly
                  ? 'Upload a spreadsheet to update stock quantities for existing SKUs. To create new products, use Product Catalog.'
                  : 'Upload new products or update existing catalog items, pricing, stock, and image URLs in bulk via .xlsx, .xls, or .csv.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors"
            aria-label="Close bulk upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Step 1: Download Export / Template */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-gray-900">
                1. Export Current {isStockOnly ? 'Stock Sheet' : 'Catalog'} or Download Template
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isStockOnly ? (
                  <>
                    Match existing items by <code className="bg-gray-200 px-1 rounded">ID</code> or{' '}
                    <code className="bg-gray-200 px-1 rounded">Name</code> and enter updated{' '}
                    <code className="bg-gray-200 px-1 rounded">Stock</code> quantities.
                  </>
                ) : (
                  <>
                    Keep the <code className="bg-gray-200 px-1 rounded">ID</code> (or exact{' '}
                    <code className="bg-gray-200 px-1 rounded">Name</code>) to update existing items, or leave{' '}
                    <code className="bg-gray-200 px-1 rounded">ID</code> blank to add new products. Use{' '}
                    <code className="bg-gray-200 px-1 rounded">Image</code> and{' '}
                    <code className="bg-gray-200 px-1 rounded">GalleryImages</code> columns for photo URLs.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportInventorySpreadsheet(products, 'xlsx', `${storeSlug}_inventory`)}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold text-[11px] px-3 py-2 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-green-600" />
                <span>Current Stock (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => exportInventorySpreadsheet(products, 'csv', `${storeSlug}_inventory`)}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 font-bold text-[11px] px-3 py-2 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-green-600" />
                <span>Current Stock (.csv)</span>
              </button>
              {!isStockOnly && (
                <button
                  type="button"
                  onClick={() => downloadInventoryTemplate('xlsx', products[0])}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] px-3 py-2 rounded-xl transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Sample Template (.xlsx)</span>
                </button>
              )}
            </div>
          </div>

          {/* Step 2: Import Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <label className="text-[11px] font-black uppercase tracking-wide text-gray-500 block mb-2">
                Stock Quantity Behavior (Existing Items)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStockMode('set')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all ${
                    stockMode === 'set'
                      ? 'bg-green-50 border-green-600 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div>Set Exact Stock</div>
                  <div className="text-[10px] font-medium opacity-75">Replace old qty</div>
                </button>
                <button
                  type="button"
                  onClick={() => setStockMode('add')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all ${
                    stockMode === 'add'
                      ? 'bg-green-50 border-green-600 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div>Restock (Add Qty)</div>
                  <div className="text-[10px] font-medium opacity-75">Old qty + uploaded</div>
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
              <label className="text-[11px] font-black uppercase tracking-wide text-gray-500 block mb-2">
                {isStockOnly ? 'Stock Sync Scope' : 'New / Unmatched Rows'}
              </label>
              {isStockOnly ? (
                <div className="text-xs text-gray-600">
                  <span className="font-bold text-gray-900 block">
                    Existing Inventory SKUs Only
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Unmatched rows will be flagged so new products are cleanly created in{' '}
                    <strong>Product Catalog</strong>.
                  </span>
                </div>
              ) : (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCreateNew}
                    onChange={(e) => setAllowCreateNew(e.target.checked)}
                    className="mt-0.5 rounded text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      Create new products for unmatched rows
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Rows without an existing ID/Name will be added as new catalog items (requires Name & Price).
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Step 3: Upload Zone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-500 hover:bg-gray-50/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-black text-gray-900">
                Drop your CSV or Excel file here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports <span className="font-bold">.xlsx</span>,{' '}
                <span className="font-bold">.xls</span>, and <span className="font-bold">.csv</span>{' '}
                spreadsheets
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Banner */}
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-green-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-gray-600">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {results.length} rows detected
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Change File</span>
                </button>
              </div>

              {parseError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Could not process file</p>
                    <p className="mt-0.5">{parseError}</p>
                  </div>
                </div>
              )}

              {!isParsing && results.length > 0 && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveFilter(activeFilter === 'update' ? 'all' : 'update')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeFilter === 'update'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px]">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Updates (Old)</span>
                      </div>
                      <div className="text-xl font-black text-gray-900 mt-1">{updateCount}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter(activeFilter === 'create' ? 'all' : 'create')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeFilter === 'create'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-green-700 font-bold text-[11px]">
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>New Items</span>
                      </div>
                      <div className="text-xl font-black text-gray-900 mt-1">{createCount}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter('all')}
                      className="p-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-left transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unchanged</span>
                      </div>
                      <div className="text-xl font-black text-gray-900 mt-1">{unchangedCount}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFilter(activeFilter === 'error' ? 'all' : 'error')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeFilter === 'error'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-red-600 font-bold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Errors / Skipped</span>
                      </div>
                      <div className="text-xl font-black text-gray-900 mt-1">{errorCount}</div>
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-gray-500">
                        Preview ({filteredResults.length} rows)
                      </span>
                      {activeFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setActiveFilter('all')}
                          className="text-[11px] font-bold text-green-700 hover:underline"
                        >
                          Show All Rows
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white sticky top-0 border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400">
                          <tr>
                            <th className="p-3">Row</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Product</th>
                            <th className="p-3">Stock (Old → New)</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredResults.map((row) => (
                            <tr key={row.rowNumber} className="hover:bg-gray-50/70">
                              <td className="p-3 font-mono text-[11px] text-gray-400">
                                #{row.rowNumber}
                              </td>
                              <td className="p-3">
                                {row.action === 'update' && (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                                    Update
                                  </span>
                                )}
                                {row.action === 'create' && (
                                  <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                                    New
                                  </span>
                                )}
                                {row.action === 'unchanged' && (
                                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                    No Change
                                  </span>
                                )}
                                {row.action === 'error' && (
                                  <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                                    Error
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-gray-900">
                                  {row.parsed.name || row.matchedProduct?.name || '—'}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {row.matchedProduct
                                    ? `ID: ${row.matchedProduct.id}`
                                    : row.parsed.category || 'New item'}
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {row.action === 'update' && row.matchedProduct ? (
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-gray-400">
                                      {row.matchedProduct.stock}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-blue-500" />
                                    <span className="text-blue-700 font-black">
                                      {row.computedNewStock}
                                    </span>
                                  </div>
                                ) : row.action === 'create' ? (
                                  <span className="font-black text-green-700">
                                    +{row.computedNewStock}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">
                                    {row.matchedProduct?.stock ?? row.parsed.stock ?? '—'}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {row.computedPrice !== undefined ? (
                                  <span className="font-bold text-gray-900">
                                    {storeSettings.currencySymbol}
                                    {row.computedPrice.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="p-3 text-[11px]">
                                {row.errorMessage ? (
                                  <span className="text-red-600 font-semibold">
                                    {row.errorMessage}
                                  </span>
                                ) : row.changes.length > 0 ? (
                                  <span className="text-gray-600">{row.changes.join(' • ')}</span>
                                ) : (
                                  <span className="text-gray-400">Matches existing values</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {results.length > 0 ? (
              <span>
                Ready to apply <strong className="text-gray-900">{updateCount}</strong> update(s)
                and <strong className="text-gray-900">{createCount}</strong> new item(s).
                {errorCount > 0 && (
                  <span className="text-red-600 ml-1">
                    ({errorCount} invalid row{errorCount > 1 ? 's' : ''} will be skipped)
                  </span>
                )}
              </span>
            ) : (
              <span>Upload a .csv, .xlsx, or .xls file to preview inventory changes.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isParsing || (updateCount === 0 && createCount === 0)}
              onClick={handleApplyImport}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-green-600/20 transition-all"
            >
              Apply Bulk Inventory Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
