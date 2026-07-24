import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppOrderButton: React.FC = () => {
  const { storeSettings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=Hello%20FreshMarket!%20I%20want%20to%20place%20a%20foodstuff%20order.`;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 print:hidden">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl border border-gray-800 animate-bounce">
          <span>Need quick help? Chat on WhatsApp!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all group"
        title="Order via WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500" />
      </a>
    </div>
  );
};
