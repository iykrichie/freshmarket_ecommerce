import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  MapPin,
  Tag,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { activeAdminTab, setActiveAdminTab, orders, products } = useStore();

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Product Catalog', icon: <Package className="w-4 h-4" /> },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500 text-gray-950',
    },
    { id: 'zones', label: 'Delivery Zones', icon: <MapPin className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons & Promos', icon: <Tag className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Store Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 p-4 shrink-0">
      <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = activeAdminTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveAdminTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 lg:w-full ${
                isActive
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.badgeColor || 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
