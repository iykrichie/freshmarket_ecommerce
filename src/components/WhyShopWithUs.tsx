import React from 'react';
import { ShieldCheck, Truck, Globe, HeartHandshake, Award } from 'lucide-react';

export const WhyShopWithUs: React.FC = () => {
  const FEATURES = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      title: 'Direct Farm Fresh',
      desc: 'Sourced directly from West Africa. Hand-selected, stone-free, and packaged under strict hygiene standards.',
    },
    {
      icon: <Truck className="w-6 h-6 text-green-600" />,
      title: 'London Express Delivery',
      desc: 'Fast delivery within 2 to 4 hours across London community zones. Free delivery over £50.',
    },
    {
      icon: <Globe className="w-6 h-6 text-green-600" />,
      title: 'Diaspora & Worldwide Export',
      desc: 'Send custom food hampers & care packages to relatives in London, Europe, and worldwide with air export.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-green-600" />,
      title: 'Payment Flexibility',
      desc: 'Pay via Card, Apple Pay, UK Bank Transfer, or Pay on Delivery upon courier arrival.',
    },
  ];

  return (
    <section className="my-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-b from-green-50/80 to-white p-8 sm:p-10 rounded-3xl border border-green-100 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <span className="text-green-700 text-xs font-bold uppercase tracking-wider bg-green-100 px-3 py-1 rounded-full">
            Our Quality Promise
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Why Thousands Trust FreshMarket
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            We make local foodstuff shopping effortless, reliable, and affordable for every home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
