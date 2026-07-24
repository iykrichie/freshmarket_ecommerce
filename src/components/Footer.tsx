import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Truck,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    categories,
    setSelectedCategory,
    deliveryZones,
    setIsTrackingOpen,
    setViewMode,
    storeSettings,
    showToast,
  } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast('Subscribed to market discount alerts!', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pt-12 pb-8 mt-16 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Newsletter Bar */}
        <div className="bg-gradient-to-r from-green-900/80 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-green-800/50 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h3 className="text-lg font-black text-white tracking-tight">
              Get Weekly Foodstuff Price Updates & Discounts
            </h3>
            <p className="text-xs text-green-200">
              Subscribe to get market price drop alerts directly in your inbox.
            </p>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex w-full lg:w-auto max-w-md gap-2"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 bg-gray-900/90 border border-green-700/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-gray-950 font-black text-xs px-5 py-3 rounded-2xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                {storeSettings.storeName}
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed max-w-sm">
              Your premier marketplace for authentic West African & tropical foodstuffs. Fast same-day local doorstep delivery and worldwide air export parcels to family, friends & diaspora communities across Europe, USA & beyond.
            </p>

            <div className="space-y-2 text-gray-400 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                <span>{storeSettings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500 shrink-0" />
                <span>{storeSettings.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{storeSettings.operationalHours}</span>
              </div>
            </div>

            {/* Social Media Launchers */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Connect On Social Media</p>
              <div className="flex items-center gap-3">
                <a
                  href={storeSettings.facebookUrl || 'https://facebook.com/freshmarketglobal'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href={storeSettings.instagramUrl || 'https://instagram.com/freshmarketglobal'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-gray-400">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-green-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Delivery Zones */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Coverage Communities
            </h4>
            <ul className="space-y-2 text-gray-400">
              {deliveryZones.map((zone) => (
                <li key={zone.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>{zone.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Links & Admin */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Quick Customer Services
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="hover:text-green-400 transition-colors"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${storeSettings.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  WhatsApp Quick Order
                </a>
              </li>
              <li>
                <button
                  onClick={() => setViewMode('admin')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Business Owner Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & badges */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FreshMarket Foodstuff Ltd. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-[10px] font-bold">
              Card Payments
            </span>
            <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-[10px] font-bold">
              Apple & Google Pay
            </span>
            <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-[10px] font-bold">
              UK Bank Transfer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
