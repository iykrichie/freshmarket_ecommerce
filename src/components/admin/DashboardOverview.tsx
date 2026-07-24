import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Package,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { orders, products, updateOrderStatus, storeSettings, setActiveAdminTab } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const bestSellers = products.filter((p) => p.isBestSeller || p.rating >= 4.8).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">
              {storeSettings.currencySymbol}
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Lifetime store sales volume</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{totalOrdersCount}</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {deliveredOrders.length} Delivered
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Total customer checkout requests</p>
        </div>

        {/* Pending Orders */}
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{pendingOrders.length}</span>
            {pendingOrders.length > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                Needs Action
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">Orders awaiting processing</p>
        </div>

        {/* Low Stock Warning */}
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{lowStockProducts.length}</span>
            <button
              onClick={() => setActiveAdminTab('inventory')}
              className="text-[10px] font-bold text-red-600 hover:underline"
            >
              Restock Now
            </button>
          </div>
          <p className="text-[11px] text-gray-400">Items below 5 stock threshold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900">Recent Customer Orders</h3>
              <p className="text-xs text-gray-500">Manage order statuses and dispatch drivers</p>
            </div>

            <button
              onClick={() => setActiveAdminTab('orders')}
              className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Community</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                    <td className="py-3">
                      <span className="font-bold text-gray-900 block">{ord.customerInfo.name}</span>
                      <span className="text-[10px] text-gray-400">{ord.customerInfo.phone}</span>
                    </td>
                    <td className="py-3 font-semibold text-gray-600">{ord.customerInfo.community}</td>
                    <td className="py-3 font-black text-gray-900">
                      {storeSettings.currencySymbol}
                      {ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : ord.status === 'out_for_delivery'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                        className="bg-gray-100 border border-gray-200 rounded-lg p-1 text-[11px] font-bold focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Low Stock Warning Box */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Low Stock Restock Alerts</span>
          </h3>

          <div className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">
                All inventory levels look healthy! No items currently low in stock.
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500">{p.unit}</p>
                  </div>
                  <span className="font-black text-red-600 bg-red-100 px-2 py-1 rounded-lg shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
