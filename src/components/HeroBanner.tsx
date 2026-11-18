import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ResilientImage } from './ResilientImage';
import heroBasketImg from '../assets/images/hero_foodstuff_basket_1794991042933.jpg';

export const HeroBanner: React.FC = () => {
  const { setSearchQuery, storeSettings } = useStore();

  const QUICK_TAGS = [
    { label: 'Care Packages', query: 'diaspora' },
    { label: 'Parboiled Rice', query: 'rice' },
    { label: 'White Garri', query: 'garri' },
    { label: 'Red Palm Oil', query: 'palm oil' },
    { label: 'Smoked Fish', query: 'smoked fish' },
    { label: 'Scotch Bonnet', query: 'pepper' },
    { label: 'Yam Tubers', query: 'yam' },
  ];

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-5">
      <div className="relative overflow-hidden bg-emerald-950 text-white rounded-2xl border border-emerald-900/60 shadow-sm">
        {/* Subtle atmospheric illumination */}
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Editorial Headline, Search Tags & Service Strip */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between gap-7">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
                {storeSettings.heroBadge || 'Local Doorstep Express · International Air Export'}
              </p>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight leading-[1.12] text-white text-balance max-w-2xl">
                {storeSettings.heroTitle || 'Authentic Foodstuff — Local Delivery & Global Export'}
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/85 max-w-xl leading-relaxed">
                {storeSettings.heroSubtitle ||
                  'Order premium fresh groceries for same-day local delivery or ship vacuum-sealed International Export Parcels & Care Packages worldwide.'}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToCatalog}
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Browse All Items</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex flex-wrap items-center gap-1.5">
                  {QUICK_TAGS.slice(0, 5).map((tag) => (
                    <button
                      key={tag.query}
                      onClick={() => {
                        setSearchQuery(tag.query);
                        scrollToCatalog();
                      }}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-emerald-50 transition-colors whitespace-nowrap shrink-0"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-300 shrink-0" />
                <div>
                  <span className="text-xs font-semibold block text-white">Express Delivery</span>
                  <span className="text-[11px] text-emerald-200/80">2–4 Hours local</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <div>
                  <span className="text-xs font-semibold block text-white">Quality Certified</span>
                  <span className="text-[11px] text-emerald-200/80">Sieved & stone-free</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block text-white">Order On Demand</span>
                  <span className="text-[11px] text-emerald-200/80 block truncate">
                    {storeSettings.operationalHours}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full-height Studio Foodstuff Showcase */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-emerald-900/40">
            <ResilientImage
              src={heroBasketImg}
              alt="Fresh curated foodstuff hamper"
              loading="eager"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/20 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-emerald-950/50" />

            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs text-stone-900 p-3.5 rounded-xl shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    Zero Stones Guarantee
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    Hand-picked & export-sealed daily
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono tabular-nums text-emerald-800 whitespace-nowrap shrink-0">
                From {storeSettings.currencySymbol}4.99
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
