import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ShieldCheck, Truck, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setSearchQuery, storeSettings } = useStore();

  const QUICK_TAGS = [
    { label: '📦 Diaspora Care Packages', query: 'diaspora' },
    { label: '🌾 Parboiled Rice', query: 'rice' },
    { label: '🥥 White Garri Ijebu', query: 'garri' },
    { label: '🔴 Red Palm Oil', query: 'palm oil' },
    { label: '🐟 Vacuum Smoked Fish', query: 'smoked fish' },
    { label: '🌶️ Fresh Rodo Pepper', query: 'pepper' },
    { label: '🍠 African Yam Tubers', query: 'yam' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 text-white rounded-3xl my-4 mx-4 sm:mx-6 lg:mx-8 shadow-xl">
      {/* Background Graphic Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Call to Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Local Doorstep Express & ✈️ International Air Export</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
            Authentic Foodstuff — Local Delivery & Global Export
          </h1>

          <p className="text-sm sm:text-base text-green-100 max-w-xl leading-relaxed">
            Order premium African groceries for <strong>same-day local delivery</strong> or ship vacuum-sealed ✈️ <strong>International Export Parcels & Diaspora Care Packages</strong> directly to family, friends & businesses across the UK, Europe, USA, Canada & Worldwide!
          </p>

          {/* Quick Search Tag Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-green-300 uppercase tracking-wider block">
              Popular Searches:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag.query}
                  onClick={() => setSearchQuery(tag.query)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-green-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-700/80 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-green-300" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Express Delivery</span>
                <span className="text-[10px] text-green-200">2-4 Hours max</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-700/80 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-green-300" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Hygiene Certified</span>
                <span className="text-[10px] text-green-200">100% Clean</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-700/80 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Order On Demand</span>
                <span className="text-[10px] text-green-200">Mon - Sat 7am-8pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Product Showcase Collage */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-sm">
            {/* Main Featured Food Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
                alt="Fresh Foodstuff Basket"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="bg-amber-500 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Daily Fresh Supply
                </span>
                <p className="text-sm font-bold mt-1">Royal Parboiled Rice 20kg</p>
                <p className="text-xs text-amber-200 font-bold">
                  {storeSettings.currencySymbol}34.99{' '}
                  <span className="line-through text-gray-300 text-[10px]">{storeSettings.currencySymbol}38.50</span>
                </p>
              </div>
            </div>

            {/* Overlapping Badge */}
            <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-900">Zero Stones Guarantee</p>
                <p className="text-[10px] text-gray-500">Hand-picked & sieved foodstuff</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
