import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, Globe, HeartHandshake } from 'lucide-react';

export const WhyShopWithUs: React.FC = () => {
  const { storeSettings } = useStore();

  const FEATURES = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      title: 'Direct Farm Fresh',
      desc: 'Sourced directly from trusted farms and suppliers, hand-selected and packaged under strict hygiene standards.',
    },
    {
      icon: <Truck className="w-5 h-5 text-emerald-700" />,
      title: 'Local Express Delivery',
      desc: `Fast doorstep delivery across active community zones. Free delivery over ${storeSettings.currencySymbol}${storeSettings.freeDeliveryThreshold.toLocaleString()}.`,
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-700" />,
      title: 'International Export',
      desc: 'Send custom care packages and vacuum-sealed parcels to family and businesses locally or worldwide.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-emerald-700" />,
      title: 'Payment Flexibility',
      desc: 'Pay via Card, Apple Pay, Direct Bank Transfer, or Pay on Delivery upon courier arrival.',
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 border-t border-stone-200/80">
      <div className="mb-8 max-w-xl space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          Our Quality Promise
        </p>
        <h2 className="font-display text-2xl font-bold text-stone-950 tracking-tight text-balance">
          Why Thousands Trust {storeSettings.storeName}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Effortless, reliable, and fairly priced foodstuff shopping for every home.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              {item.icon}
            </div>
            <h3 className="font-display font-semibold text-sm text-stone-950">{item.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
