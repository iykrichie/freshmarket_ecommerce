import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Flame, Clock } from 'lucide-react';

export const DailyDealsSection: React.FC = () => {
  const { products } = useStore();

  // Find products tagged as daily deals or best sellers
  const dealProducts = products.filter((p) => p.isDailyDeal || p.discountPrice).slice(0, 4);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (dealProducts.length === 0) return null;

  return (
    <section className="my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-amber-500/10 border border-amber-200 p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Flash Deals & Market Discounts
              </h2>
              <p className="text-xs text-amber-900 font-medium">
                Limited-time price drops on staple foodstuff items
              </p>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span className="text-xs font-bold text-gray-700">Ends in:</span>
            <div className="flex items-center gap-1 font-black text-sm text-amber-600 font-mono">
              <span className="bg-amber-100 px-2 py-0.5 rounded-lg">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="bg-amber-100 px-2 py-0.5 rounded-lg">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="bg-amber-100 px-2 py-0.5 rounded-lg">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
};
