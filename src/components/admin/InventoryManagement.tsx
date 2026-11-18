import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BulkInventoryModal } from './BulkInventoryModal';
import { exportInventorySpreadsheet } from '../../utils/inventorySpreadsheet';
import {
  Upload,
  Search,
  FileSpreadsheet,
  Boxes,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  Save,
  ArrowUpRight,
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const {
    products,
    updateProduct,
    bulkUpsertInventory,
    setActiveAdminTab,
    storeSettings,
    showToast,
  } = useStore();

  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isStockSyncOpen, setIsStockSyncOpen] = useState(false);

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const healthyCount = products.length - lowStockCount - outOfStockCount;

  const storeSlug =
    storeSettings.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'store';

  const handleStockChange = (id: string, val: number) => {
    const clean = Math.max(0, Math.round(val));
    setStockInputs((prev) => ({ ...prev, [id]: clean }));
  };

  const handleQuickAdjust = (id: string, currentStock: number, delta: number) => {
    const base = stockInputs[id] !== undefined ? stockInputs[id] : currentStock;
    handleStockChange(id, Math.max(0, base + delta));
  };

  const handleSaveStock = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const newStock = stockInputs[id] !== undefined ? stockInputs[id] : prod.stock;
    updateProduct({ ...prod, stock: Math.max(0, newStock) });
    setStockInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast(`Updated stock for ${prod.name} to ${newStock}`, 'success');
  };

  const dirtyProducts = products.filter(
    (p) => stockInputs[p.id] !== undefined && stockInputs[p.id] !== p.stock
  );

  const handleSaveAllModified = () => {
    if (dirtyProducts.length === 0) return;
    const updated = dirtyProducts.map((p) => ({
      ...p,
      stock: Math.max(0, stockInputs[p.id]),
    }));
    bulkUpsertInventory(updated, []);
    setStockInputs({});
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'out') return p.stock === 0;
    if (statusFilter === 'low') return p.stock > 0 && p.stock <= 5;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">Inventory & Stock Control</h2>
          <p className="text-xs text-gray-500">
            Track live stock levels, perform quick warehouse restocks, or sync cycle-count quantities via CSV/Excel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveAdminTab('products')}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
            title="Create or bulk upload new products in Product Catalog"
          >
            <span>Manage Products</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => exportInventorySpreadsheet(products, 'xlsx', `${storeSlug}_stock_sheet`)}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Stock Sheet</span>
          </button>

          <button
            onClick={() => setIsStockSyncOpen(true)}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-green-600/20 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Stock Sync (CSV / Excel)</span>
          </button>
        </div>
      </div>

      {/* Stock KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Units</p>
            <p className="text-xl font-black text-gray-900">{totalUnits.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Healthy SKUs</p>
            <p className="text-xl font-black text-gray-900">{healthyCount}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
            statusFilter === 'low'
              ? 'bg-amber-50 border-amber-400'
              : 'bg-white border-gray-100 hover:border-amber-200 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Low Stock</p>
            <p className="text-xl font-black text-amber-700">{lowStockCount}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
            statusFilter === 'out'
              ? 'bg-red-50 border-red-400'
              : 'bg-white border-gray-100 hover:border-red-200 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <PackageX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Out of Stock</p>
            <p className="text-xl font-black text-red-600">{outOfStockCount}</p>
          </div>
        </button>
      </div>

      {/* Search, Filter & Batch Save */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stock by SKU name, ID, or category..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-green-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'low' | 'out')}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All SKUs ({products.length})</option>
          <option value="low">Low Stock ({lowStockCount})</option>
          <option value="out">Out of Stock ({outOfStockCount})</option>
        </select>

        {dirtyProducts.length > 0 && (
          <button
            onClick={handleSaveAllModified}
            className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save All Modified ({dirtyProducts.length})</span>
          </button>
        )}
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <th className="p-4">SKU / Item Name</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Status</th>
                <th className="p-4">On Hand</th>
                <th className="p-4">Quick Adjust / New Qty</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => {
                const currentVal =
                  stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;
                const isDirty = stockInputs[p.id] !== undefined && stockInputs[p.id] !== p.stock;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isDirty ? 'bg-amber-50/50' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {p.id} • {p.category}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{p.unit}</td>
                    <td className="p-4">
                      {p.stock === 0 ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          Out of Stock
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-black text-sm text-gray-900">{p.stock}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(p.id, p.stock, -1)}
                          className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px]"
                          title="Decrease by 1"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentVal}
                          onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                          className={`w-20 border rounded-xl p-2 text-xs font-bold text-center text-gray-900 ${
                            isDirty
                              ? 'bg-white border-amber-400 ring-1 ring-amber-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(p.id, p.stock, 5)}
                          className="px-2 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 font-bold text-[11px]"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(p.id, p.stock, 10)}
                          className="px-2 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 font-bold text-[11px]"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSaveStock(p.id)}
                        disabled={!isDirty}
                        className={`font-bold text-xs px-3.5 py-2 rounded-xl transition-all ${
                          isDirty
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BulkInventoryModal
        isOpen={isStockSyncOpen}
        mode="stock_only"
        onClose={() => {
          setIsStockSyncOpen(false);
          setStockInputs({});
        }}
      />
    </div>
  );
};
