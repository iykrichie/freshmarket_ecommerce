import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductUnitOption, UnitType } from '../../types';
import { BulkInventoryModal } from './BulkInventoryModal';
import { BulkImageManagerModal } from './BulkImageManagerModal';
import { exportInventorySpreadsheet } from '../../utils/inventorySpreadsheet';
import {
  compressImageFile,
  getPresetImagesFromCategories,
} from '../../utils/imageProcessor';
import { ResilientImage } from '../ResilientImage';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Images,
  ImagePlus,
  Star,
  Link2,
  Copy,
  Tag,
  Award,
  Sparkles,
} from 'lucide-react';

const UNIT_PRESETS: string[] = [
  '50kg Bag',
  '25kg Bag',
  '20kg Bag',
  '10kg Bag',
  '5kg Bag',
  'Paint Rubber',
  '5L Bottle',
  '4L Bottle',
  '1L Bottle',
  '1kg Pack',
  '1kg Box',
  '500g Tub',
  '5kg Box',
  'Carton',
  'Crate',
  'Basket',
  'Tubers',
  'Piece',
  'Bunch',
  'Case of 24',
  'Diaspora Box',
  'Care Package',
  'Export Pack',
];

export const ProductManagement: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    storeSettings,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [unitVariants, setUnitVariants] = useState<ProductUnitOption[]>([]);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: categories[0]?.name || 'Grains & Flour',
    price: 25,
    discountPrice: undefined,
    unit: '5kg Bag',
    weight: '',
    stock: 20,
    image: '',
    description: '',
    origin: '',
    isFeatured: false,
    isBestSeller: false,
    isDailyDeal: false,
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCatFilter === 'all' || p.category === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  const presetImages = getPresetImagesFromCategories(categories, products);

  const handleOpenAddModal = () => {
    const defaultImg = presetImages[0]?.url || products[0]?.image || '';
    setFormData({
      name: '',
      category: categories[0]?.name || 'Grains & Flour',
      price: 15,
      discountPrice: undefined,
      unit: '5kg Bag',
      weight: '',
      stock: 25,
      image: defaultImg,
      images: defaultImg ? [defaultImg] : [],
      description: '',
      origin: '',
      isFeatured: false,
      isBestSeller: false,
      isDailyDeal: false,
    });
    setTagsInput('');
    setUnitVariants([]);
    setNewGalleryUrl('');
    setShowPresets(false);
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    const gallery =
      prod.images && prod.images.length > 0
        ? prod.images
        : prod.image
        ? [prod.image]
        : [];
    setFormData({ ...prod, images: gallery });
    setTagsInput((prod.tags || []).join(', '));
    setUnitVariants(prod.availableUnits ? [...prod.availableUnits] : []);
    setNewGalleryUrl('');
    setShowPresets(false);
    setIsAddModalOpen(true);
  };

  const handleDeviceImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImageFile(file);
        uploadedUrls.push(compressed);
      }
      if (uploadedUrls.length > 0) {
        setFormData((prev) => {
          const existing = prev.images || (prev.image ? [prev.image] : []);
          const merged = Array.from(new Set([...existing, ...uploadedUrls]));
          const primary = prev.image || merged[0];
          return {
            ...prev,
            image: primary,
            images: merged,
          };
        });
        showToast(`Added ${uploadedUrls.length} image(s) to product gallery!`, 'success');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not process selected image.';
      showToast(msg, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddGalleryUrl = () => {
    const clean = newGalleryUrl.trim();
    if (!clean) return;
    setFormData((prev) => {
      const existing = prev.images || (prev.image ? [prev.image] : []);
      const merged = Array.from(new Set([...existing, clean]));
      return {
        ...prev,
        image: prev.image || clean,
        images: merged,
      };
    });
    setNewGalleryUrl('');
  };

  const handleSetPrimaryImage = (url: string) => {
    setFormData((prev) => {
      const existing = prev.images || [];
      const reordered = Array.from(new Set([url, ...existing]));
      return {
        ...prev,
        image: url,
        images: reordered,
      };
    });
  };

  const handleRemoveGalleryImage = (url: string) => {
    setFormData((prev) => {
      const remaining = (prev.images || []).filter((img) => img !== url);
      const nextPrimary = prev.image === url ? remaining[0] || '' : prev.image;
      return {
        ...prev,
        image: nextPrimary,
        images: remaining,
      };
    });
  };

  const handleAddUnitVariant = () => {
    setUnitVariants((prev) => [
      ...prev,
      {
        unit: prev.length === 0 ? (formData.unit || '10kg Bag') : '10kg Bag',
        price: Number(formData.price || 10),
        discountPrice: formData.discountPrice,
      },
    ]);
  };

  const handleUpdateVariant = (
    index: number,
    patch: Partial<ProductUnitOption>
  ) => {
    setUnitVariants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveVariant = (index: number) => {
    setUnitVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price || Number(formData.price) <= 0) {
      showToast('Please provide a valid product name and regular price.', 'error');
      return;
    }

    const fallbackImg = presetImages[0]?.url || products[0]?.image || '';
    const primaryImage = formData.image?.trim() || formData.images?.[0] || fallbackImg;
    const galleryImages =
      formData.images && formData.images.length > 0
        ? Array.from(new Set([primaryImage, ...formData.images].filter(Boolean)))
        : primaryImage
        ? [primaryImage]
        : [];

    const cleanedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const cleanedVariants = unitVariants
      .filter((v) => String(v.unit).trim() !== '' && Number(v.price) > 0)
      .map((v) => ({
        unit: String(v.unit).trim() as UnitType,
        price: Number(v.price),
        ...(v.discountPrice && Number(v.discountPrice) > 0
          ? { discountPrice: Number(v.discountPrice) }
          : {}),
      }));

    const payload = {
      name: formData.name.trim(),
      category: formData.category || categories[0]?.name || 'Grains & Flour',
      price: Number(formData.price),
      discountPrice:
        formData.discountPrice && Number(formData.discountPrice) > 0
          ? Number(formData.discountPrice)
          : undefined,
      unit: (String(formData.unit || '').trim() || 'Unit') as UnitType,
      availableUnits: cleanedVariants.length > 0 ? cleanedVariants : undefined,
      weight: formData.weight?.trim() || undefined,
      stock: Math.max(0, Number(formData.stock || 0)),
      image: primaryImage,
      images: galleryImages,
      description: formData.description?.trim() || 'Fresh quality store item.',
      origin: formData.origin?.trim() || undefined,
      tags: cleanedTags.length > 0 ? cleanedTags : undefined,
      isFeatured: Boolean(formData.isFeatured),
      isBestSeller: Boolean(formData.isBestSeller),
      isDailyDeal: Boolean(formData.isDailyDeal),
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...payload,
      });
    } else {
      addProduct({
        ...payload,
        rating: 5.0,
        reviewsCount: 0,
      });
    }

    setIsAddModalOpen(false);
  };

  const toggleProductFlag = (
    product: Product,
    flag: 'isFeatured' | 'isBestSeller' | 'isDailyDeal'
  ) => {
    updateProduct({
      ...product,
      [flag]: !product[flag],
    });
  };

  const storeSlug =
    storeSettings.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'store';

  const handleExportCSV = () => {
    exportInventorySpreadsheet(products, 'csv', `${storeSlug}_catalog`);
    showToast('Exported product catalog CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-950">
            Product Catalog & Uploads
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create or edit products, customize multi-size pricing, toggle homepage promotions, and bulk upload CSV/Excel sheets.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              exportInventorySpreadsheet(products, 'xlsx', `${storeSlug}_catalog`);
              showToast('Exported product catalog Excel (.xlsx)!', 'success');
            }}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsBulkImageModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Images className="w-4 h-4" />
            <span>Bulk Images</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
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
            placeholder="Search catalog by name, category, or tag..."
            className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600/30"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-600/30"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit / Variants</th>
                <th className="p-4">Price</th>
                <th className="p-4">Quick Highlights</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const isConfirming = confirmDeleteId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                          <ResilientImage
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          {p.images && p.images.length > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 bg-stone-900/90 text-white text-[9px] font-bold px-1 rounded">
                              +{p.images.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-950 text-xs truncate max-w-[220px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-stone-500 tabular-nums">
                            {p.stock} in stock · {p.origin || 'Standard supplier'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-stone-700">{p.category}</td>
                    <td className="p-4">
                      <span className="font-medium text-stone-800">{p.unit}</span>
                      {p.availableUnits && p.availableUnits.length > 1 && (
                        <span className="block text-[10px] text-emerald-700 font-semibold">
                          +{p.availableUnits.length - 1} extra sizes
                        </span>
                      )}
                    </td>
                    <td className="p-4 tabular-nums">
                      <div className="font-bold text-stone-950">
                        {storeSettings.currencySymbol}
                        {(p.discountPrice || p.price).toLocaleString()}
                      </div>
                      {p.discountPrice && (
                        <span className="text-[10px] text-stone-400 line-through">
                          {storeSettings.currencySymbol}
                          {p.price.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => toggleProductFlag(p, 'isFeatured')}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                            p.isFeatured
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-100'
                          }`}
                          title="Toggle Featured Priority"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Featured</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProductFlag(p, 'isBestSeller')}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                            p.isBestSeller
                              ? 'bg-amber-400 text-stone-950 border-amber-400'
                              : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-100'
                          }`}
                          title="Toggle Best Seller Tag"
                        >
                          <Award className="w-3 h-3" />
                          <span>Best</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProductFlag(p, 'isDailyDeal')}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                            p.isDailyDeal
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-100'
                          }`}
                          title="Toggle Flash Deal"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Deal</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => duplicateProduct(p)}
                          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {isConfirming ? (
                          <div className="inline-flex items-center gap-1 ml-1">
                            <button
                              onClick={() => {
                                deleteProduct(p.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-display font-bold text-base text-stone-950">
                {editingProduct ? 'Customize Product Details' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Honey Beans Oloyin (25kg Bag)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Primary Packaging Unit *
                  </label>
                  <input
                    list="unit-presets-list"
                    required
                    value={formData.unit || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value as UnitType })
                    }
                    placeholder="Pick or type custom unit (e.g. 2kg Pouch)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                  />
                  <datalist id="unit-presets-list">
                    {UNIT_PRESETS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Regular Price ({storeSettings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Discount Price ({storeSettings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock ?? 0}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Origin / Source
                  </label>
                  <input
                    type="text"
                    value={formData.origin || ''}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g. West Africa"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Weight Label</label>
                  <input
                    type="text"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 5kg pack"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. rice, export, staple"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                  />
                </div>
              </div>

              {/* Multi-Unit Pack Size Pricing Builder */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-stone-900">
                      Multi-Size / Pack Variants (Optional)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Let shoppers switch pack sizes (e.g. 5kg, 10kg, 20kg) directly on the product card.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUnitVariant}
                    className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-semibold text-[11px] px-3 py-1.5 rounded-lg shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                {unitVariants.length > 0 && (
                  <div className="space-y-2">
                    {unitVariants.map((variant, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          list="unit-presets-list"
                          value={variant.unit}
                          onChange={(e) =>
                            handleUpdateVariant(idx, { unit: e.target.value as UnitType })
                          }
                          placeholder="Unit (e.g. 10kg Bag)"
                          className="col-span-5 bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-semibold"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price || ''}
                          onChange={(e) =>
                            handleUpdateVariant(idx, { price: Number(e.target.value) })
                          }
                          placeholder={`Price (${storeSettings.currencySymbol})`}
                          className="col-span-3 bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-semibold tabular-nums"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={variant.discountPrice || ''}
                          onChange={(e) =>
                            handleUpdateVariant(idx, {
                              discountPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="Sale (opt)"
                          className="col-span-3 bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="col-span-1 p-1.5 text-stone-400 hover:text-rose-600 flex justify-center"
                          title="Remove variant"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Image & Multi-Photo Gallery Manager */}
              <div className="space-y-3 bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Images className="w-4 h-4 text-emerald-700" />
                    <span>Product Images & Gallery</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPresets((v) => !v)}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline"
                  >
                    {showPresets ? 'Hide Stock Presets' : 'Choose Category Preset'}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0 relative">
                    <ResilientImage
                      src={formData.image}
                      alt="Primary preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition-colors">
                      <ImagePlus className="w-4 h-4" />
                      <span>
                        {isUploadingImage ? 'Optimizing...' : 'Upload Photo(s) from Device'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleDeviceImageUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Upload JPG, PNG, or WebP files (auto-compressed) or paste direct image URLs below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                      Primary Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white border border-stone-200 rounded-xl p-2 text-xs text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                      Add Extra Gallery URL
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="https://... (extra angle)"
                        className="flex-1 bg-white border border-stone-200 rounded-xl p-2 text-xs text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-3 rounded-xl flex items-center gap-1"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">
                      Gallery ({formData.images.length} photo{formData.images.length > 1 ? 's' : ''})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.images.map((imgUrl, idx) => {
                        const isPrimary = formData.image === imgUrl;
                        return (
                          <div
                            key={`${imgUrl.slice(0, 32)}-${idx}`}
                            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 group ${
                              isPrimary ? 'border-emerald-700' : 'border-stone-200'
                            }`}
                          >
                            <ResilientImage
                              src={imgUrl}
                              alt="Gallery item"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(imgUrl)}
                                  className="p-1 bg-white rounded-md text-amber-500 hover:text-amber-600"
                                  title="Set as Primary Image"
                                >
                                  <Star className="w-3 h-3 fill-amber-400" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(imgUrl)}
                                className="p-1 bg-white rounded-md text-rose-600 hover:text-rose-700"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showPresets && (
                  <div className="pt-2 border-t border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">
                      Click a preset photo to apply
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                      {presetImages.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => {
                              const existing = prev.images || [];
                              return {
                                ...prev,
                                image: preset.url,
                                images: Array.from(new Set([preset.url, ...existing])),
                              };
                            });
                          }}
                          className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-emerald-700"
                          title={preset.label}
                        >
                          <ResilientImage
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Product Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                />
              </div>

              <div className="flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>Featured Item</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller || false}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>Best Seller Tag</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDailyDeal || false}
                    onChange={(e) => setFormData({ ...formData, isDailyDeal: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>Include in Flash Deals</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkInventoryModal
        isOpen={isBulkModalOpen}
        mode="catalog"
        onClose={() => setIsBulkModalOpen(false)}
      />

      <BulkImageManagerModal
        isOpen={isBulkImageModalOpen}
        onClose={() => setIsBulkImageModalOpen(false)}
      />
    </div>
  );
};
