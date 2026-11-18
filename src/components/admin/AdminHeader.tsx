import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Store, Bell, AlertTriangle, LogOut } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const {
    setViewMode,
    setActiveAdminTab,
    products,
    orders,
    storeSettings,
    setIsAdminAuthenticated,
    showToast,
  } = useStore();

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setViewMode('storefront');
    showToast('Logged out from Business Owner Dashboard.', 'info');
  };

  return (
    <header className="bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold text-base tracking-tight text-white block leading-none truncate">
                {storeSettings.storeName}
              </span>
              <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block mt-0.5">
                Store Owner Console
              </span>
            </div>
          </div>

          {/* Actionable Alerts */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => setActiveAdminTab('orders')}
                className="bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors tabular-nums"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{pendingOrdersCount} Pending Orders</span>
              </button>
            )}

            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveAdminTab('inventory')}
                className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors tabular-nums"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Low Stock</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode('storefront')}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
              title="Log Out Admin Dashboard"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
