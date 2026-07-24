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
  Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Wheat: <Wheat className="w-5 h-5" />,
  Droplet: <Droplet className="w-5 h-5" />,
  Carrot: <Carrot className="w-5 h-5" />,
  Beef: <Beef className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
};

export const CategoryGrid: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products } = useStore();

  return (
    <section className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Explore Foodstuff Categories</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Browse our wide selection of regional staples and fresh food items
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-full transition-colors"
          >
            Show All Products
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* All Products Badge */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedCategory === null
              ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20 scale-102'
              : 'bg-white text-gray-700 border-gray-100 hover:border-green-300 hover:shadow-xs'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
              selectedCategory === null ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold truncate max-w-full">All Items</span>
          <span
            className={`text-[10px] font-medium mt-0.5 ${
              selectedCategory === null ? 'text-green-100' : 'text-gray-400'
            }`}
          >
            {products.length} Items
          </span>
        </button>

        {/* Category Cards */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const count = products.filter((p) => p.category === cat.name).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20 scale-102'
                  : 'bg-white text-gray-700 border-gray-100 hover:border-green-300 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'
                }`}
              >
                {ICON_MAP[cat.iconName] || <ShoppingBag className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold truncate max-w-full">{cat.name}</span>
              <span
                className={`text-[10px] font-medium mt-0.5 ${
                  isSelected ? 'text-green-100' : 'text-gray-400'
                }`}
              >
                {count > 0 ? `${count} items` : 'Stocked'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
