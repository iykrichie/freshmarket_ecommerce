import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Wheat,
  Droplet,
  Carrot,
  Beef,
  Utensils,
  Flame,
  Coffee,
  ShoppingBag,
  Globe,
  LayoutGrid,
  Tag,
  Award,
  CheckCircle2,
  MapPin,
  RotateCcw,
} from 'lucide-react';

export type QuickFilter = 'all' | 'deals' | 'bestsellers' | 'in_stock';

interface CategorySidebarProps {
  quickFilter: QuickFilter;
  setQuickFilter: (filter: QuickFilter) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Wheat: <Wheat className="w-4 h-4" />,
  Droplet: <Droplet className="w-4 h-4" />,
  Carrot: <Carrot className="w-4 h-4" />,
  Beef: <Beef className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Coffee: <Coffee className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  quickFilter,
  setQuickFilter,
}) => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    products,
    selectedZone,
    storeSettings,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const dealsCount = products.filter(
    (p) => p.isDailyDeal || (p.discountPrice && p.discountPrice < p.price)
  ).length;
  const bestSellersCount = products.filter((p) => p.isBestSeller).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;

  const hasActiveFilter =
    selectedCategory !== null || quickFilter !== 'all' || searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setQuickFilter('all');
    setSearchQuery('');
  };

  return (
    <>
      {/* Mobile & Tablet Horizontal Category Rail (< lg) */}
      <div className="lg:hidden w-full space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold text-stone-900">
            Explore Categories
          </h2>
          {hasActiveFilter && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === null
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Items</span>
            <span
              className={`text-[11px] tabular-nums ${
                selectedCategory === null ? 'text-emerald-100' : 'text-stone-400'
              }`}
            >
              ({products.length})
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = products.filter((p) => p.category === cat.name).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                }`}
              >
                <span className={isSelected ? 'text-emerald-100' : 'text-emerald-700'}>
                  {ICON_MAP[cat.iconName] || <ShoppingBag className="w-4 h-4" />}
                </span>
                <span>{cat.name}</span>
                <span
                  className={`text-[11px] tabular-nums ${
                    isSelected ? 'text-emerald-100' : 'text-stone-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Quick Filter Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all' as QuickFilter, label: 'All Stock' },
            { id: 'deals' as QuickFilter, label: `Deals (${dealsCount})` },
            { id: 'bestsellers' as QuickFilter, label: `Best Sellers (${bestSellersCount})` },
            { id: 'in_stock' as QuickFilter, label: `In Stock (${inStockCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setQuickFilter(item.id)}
              className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                quickFilter === item.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sticky Left Sidebar (lg+) */}
      <aside
        aria-label="Explore foodstuff categories"
        className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start"
      >
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-5 shadow-2xs">
          {/* Categories Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-display text-sm font-bold text-stone-900">
                Explore Categories
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Browse by aisle & staple
              </p>
            </div>
            {hasActiveFilter && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Vertical Category Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                selectedCategory === null
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`shrink-0 ${
                    selectedCategory === null ? 'text-emerald-100' : 'text-emerald-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </span>
                <span className="leading-snug">All Items</span>
              </span>
              <span
                className={`text-[11px] font-mono tabular-nums shrink-0 ${
                  selectedCategory === null ? 'text-emerald-100' : 'text-stone-400'
                }`}
              >
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const count = products.filter((p) => p.category === cat.name).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 ${
                        isSelected ? 'text-emerald-100' : 'text-emerald-700'
                      }`}
                    >
                      {ICON_MAP[cat.iconName] || <ShoppingBag className="w-4 h-4" />}
                    </span>
                    <span className="leading-snug">{cat.name}</span>
                  </span>
                  <span
                    className={`text-[11px] font-mono tabular-nums shrink-0 ${
                      isSelected ? 'text-emerald-100' : 'text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Collection Filters */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
              Quick Filters
            </h3>
            <div className="space-y-1">
              {[
                {
                  id: 'all' as QuickFilter,
                  label: 'All Products',
                  count: products.length,
                  icon: <LayoutGrid className="w-3.5 h-3.5" />,
                },
                {
                  id: 'deals' as QuickFilter,
                  label: 'Deals & Discounts',
                  count: dealsCount,
                  icon: <Tag className="w-3.5 h-3.5" />,
                },
                {
                  id: 'bestsellers' as QuickFilter,
                  label: 'Best Sellers',
                  count: bestSellersCount,
                  icon: <Award className="w-3.5 h-3.5" />,
                },
                {
                  id: 'in_stock' as QuickFilter,
                  label: 'In Stock Ready',
                  count: inStockCount,
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                },
              ].map((filter) => {
                const active = quickFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setQuickFilter(filter.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={active ? 'text-amber-300' : 'text-stone-400'}>
                        {filter.icon}
                      </span>
                      <span>{filter.label}</span>
                    </span>
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        active ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Zone Summary */}
          {selectedZone && (
            <div className="pt-4 border-t border-stone-100">
              <div className="rounded-xl bg-stone-50 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{selectedZone.name}</span>
                </div>
                <p className="text-[11px] text-stone-500 tabular-nums">
                  Delivery: {storeSettings.currencySymbol}
                  {selectedZone.fee.toLocaleString()} · {selectedZone.minDeliveryTimeHours}–
                  {selectedZone.maxDeliveryTimeHours} hrs
                </p>
                <p className="text-[11px] font-medium text-emerald-700 tabular-nums">
                  Free shipping over {storeSettings.currencySymbol}
                  {(
                    selectedZone.freeAboveThreshold || storeSettings.freeDeliveryThreshold
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
