import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Wheat,
  Droplet,
  Carrot,
  Beef,
  Utensils,
  Flame,
  Coffee,
  ShoppingBag,
  Globe,
  FolderTree,
} from 'lucide-react';

const CATEGORY_ICONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'Wheat', label: 'Grains & Flour', icon: <Wheat className="w-4 h-4" /> },
  { id: 'Droplet', label: 'Oils & Liquids', icon: <Droplet className="w-4 h-4" /> },
  { id: 'Carrot', label: 'Fresh Produce', icon: <Carrot className="w-4 h-4" /> },
  { id: 'Beef', label: 'Meat & Poultry', icon: <Beef className="w-4 h-4" /> },
  { id: 'Utensils', label: 'Tubers & Prep', icon: <Utensils className="w-4 h-4" /> },
  { id: 'Flame', label: 'Spices & Peppers', icon: <Flame className="w-4 h-4" /> },
  { id: 'Coffee', label: 'Beverages', icon: <Coffee className="w-4 h-4" /> },
  { id: 'ShoppingBag', label: 'Packaged Goods', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'Globe', label: 'Export & Hampers', icon: <Globe className="w-4 h-4" /> },
];

const ICON_LOOKUP: Record<string, React.ReactNode> = Object.fromEntries(
  CATEGORY_ICONS.map((item) => [item.id, item.icon])
);

export const CategoryManagement: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, showToast } =
    useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('ShoppingBag');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIconName('ShoppingBag');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIconName(cat.iconName || 'ShoppingBag');
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    if (editingCategory) {
      updateCategory(
        {
          ...editingCategory,
          name: name.trim(),
          iconName,
          description: description.trim(),
        },
        editingCategory.name
      );
    } else {
      addCategory({
        name: name.trim(),
        iconName,
        description: description.trim() || `Browse products under ${name.trim()}.`,
        image: '',
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-950">
            Store Categories & Navigation Aisles
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Add, rename, or reorganize storefront sidebar categories. Renaming updates linked products automatically.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200/80 text-center space-y-3">
          <FolderTree className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700">No categories configured yet</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const productCount = products.filter((p) => p.category === cat.name).length;
            const isConfirming = confirmDeleteId === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-stone-200/80 flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        {ICON_LOOKUP[cat.iconName] || <ShoppingBag className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-sm text-stone-950 truncate">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] font-mono text-stone-500 tabular-nums">
                          {productCount} {productCount === 1 ? 'product' : 'products'} linked
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-stone-400 truncate">/{cat.slug}</span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteCategory(cat.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-display font-bold text-base text-stone-950">
                {editingCategory ? 'Edit Category' : 'Add Store Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Honey & Spreads"
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Sidebar Icon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIconName(item.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold transition-colors ${
                        iconName === item.id
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {item.icon}
                      <span className="truncate">{item.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Category Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief storefront description shown when customers select this aisle..."
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2 rounded-xl"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
