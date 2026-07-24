import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, UnitType } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Download,
  Upload,
  Check,
  Package,
} from 'lucide-react';

export const ProductManagement: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    storeSettings,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: categories[0]?.name || 'Grains & Flour',
    price: 5000,
    discountPrice: undefined,
    unit: '50kg Bag',
    weight: '',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: '',
    origin: '',
    isFeatured: false,
    isBestSeller: false,
    isDailyDeal: false,
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCatFilter === 'all' || p.category === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: categories[0]?.name || 'Grains & Flour',
      price: 5000,
      discountPrice: undefined,
      unit: 'Paint Rubber',
      weight: '',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      description: '',
      origin: '',
      isFeatured: false,
      isBestSeller: false,
      isDailyDeal: false,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...(formData as Product),
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        category: formData.category || 'Grains & Flour',
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        unit: (formData.unit as UnitType) || 'Paint Rubber',
        weight: formData.weight || undefined,
        stock: Number(formData.stock || 0),
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        images: [
          formData.image ||
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        ],
        description: formData.description || 'Fresh quality local foodstuff item.',
        origin: formData.origin || undefined,
        rating: 5.0,
        reviewsCount: 0,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isDailyDeal: formData.isDailyDeal,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const csvHeader = 'ID,Name,Category,Unit,Price,DiscountPrice,Stock,Origin\n';
    const csvRows = products
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.category}","${p.unit}",${p.price},${p.discountPrice || ''},${p.stock},"${p.origin || ''}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodstuff_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported foodstuff catalog CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-gray-900">Foodstuff Catalog Management</h2>
          <p className="text-xs text-gray-500">
            Add, edit, set discounts, and organize products in your store.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-green-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by product name..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-green-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <th className="p-4">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Packaging Unit</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.origin || 'Local supplier'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{p.category}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-800 font-bold text-[10px] px-2.5 py-1 rounded-md">
                      {p.unit}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-gray-900">
                      {storeSettings.currencySymbol}
                      {(p.discountPrice || p.price).toLocaleString()}
                    </div>
                    {p.discountPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {storeSettings.currencySymbol}
                        {p.price.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold text-xs ${
                        p.stock <= 5 ? 'text-red-600 font-black' : 'text-gray-900'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-green-50/60">
              <h3 className="font-black text-base text-gray-900">
                {editingProduct ? 'Edit Foodstuff Product' : 'Add New Foodstuff Product'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Honey Beans Oloyin (25kg Bag)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Packaging Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value as UnitType })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                  >
                    <option value="50kg Bag">50kg Bag</option>
                    <option value="25kg Bag">25kg Bag</option>
                    <option value="10kg Bag">10kg Bag</option>
                    <option value="Paint Rubber">Paint Rubber</option>
                    <option value="5L Bottle">5L Bottle</option>
                    <option value="4L Bottle">4L Bottle</option>
                    <option value="1L Bottle">1L Bottle</option>
                    <option value="Carton">Carton</option>
                    <option value="Basket">Basket</option>
                    <option value="Tubers">Tubers</option>
                    <option value="Bunch">Bunch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Regular Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Discount Price (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-green-600"
                  />
                  <span>Featured Item</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller || false}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-green-600"
                  />
                  <span>Best Seller Tag</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
