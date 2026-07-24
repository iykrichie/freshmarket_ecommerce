import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Boxes, AlertTriangle, Plus, Check } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { products, updateProduct, showToast } = useStore();

  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});

  const handleStockChange = (id: string, val: number) => {
    setStockInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const newStock = stockInputs[id] !== undefined ? stockInputs[id] : prod.stock;
    updateProduct({ ...prod, stock: Math.max(0, newStock) });
    showToast(`Updated stock for ${prod.name} to ${newStock}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">Inventory & Stock Levels</h2>
          <p className="text-xs text-gray-500">
            Monitor stock levels, set low stock thresholds, and restock items quickly.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <th className="p-4">Item Name</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Update Quantity</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => {
                const currentVal =
                  stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{p.name}</td>
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
                          Healthy Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-black text-sm text-gray-900">{p.stock}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={currentVal}
                        onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                        className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-900"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSaveStock(p.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
