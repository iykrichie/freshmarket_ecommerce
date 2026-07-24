import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Store, Bell, AlertTriangle, LogOut, KeyRound } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { setViewMode, products, orders, storeSettings, setIsAdminAuthenticated, showToast } = useStore();

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setViewMode('storefront');
    showToast('Logged out from Business Owner Dashboard.', 'info');
  };

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-white block leading-none">
                {storeSettings.storeName}
              </span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mt-0.5">
                Authenticated Business Owner
              </span>
            </div>
          </div>

          {/* Center alerts pills */}
          <div className="hidden md:flex items-center gap-3">
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <Bell className="w-3.5 h-3.5" />
                <span>{pendingOrdersCount} Pending Orders</span>
              </span>
            )}

            {lowStockCount > 0 && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Low Stock Items</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('storefront')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Store View</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
              title="Log Out Admin Dashboard"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
