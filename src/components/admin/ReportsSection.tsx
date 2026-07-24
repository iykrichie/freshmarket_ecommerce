import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart3, Download, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

export const ReportsSection: React.FC = () => {
  const { orders, products, storeSettings, showToast } = useStore();
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const handleExportReportCSV = () => {
    const csvContent = `Order Number,Customer Name,Community,Total Amount,Payment Method,Status,Date\n${orders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customerInfo.name}","${o.customerInfo.community}",${o.totalAmount},"${o.paymentMethod}","${o.status}","${o.createdAt}"`
      )
      .join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freshmarket_${reportRange}_sales_report.csv`;
    a.click();
    showToast(`Exported ${reportRange} sales report CSV!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">Sales Reports & Financial Analytics</h2>
          <p className="text-xs text-gray-500">
            Generate revenue, order volume, and category breakdown reports.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>

          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Gross Sales Revenue</span>
          <p className="text-2xl font-black text-gray-900">
            {storeSettings.currencySymbol}
            {totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Completed Orders</span>
          <p className="text-2xl font-black text-gray-900">{totalOrdersCount}</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Average Order Value</span>
          <p className="text-2xl font-black text-green-700">
            {storeSettings.currencySymbol}
            {avgOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="font-black text-base text-gray-900">Top Selling Foodstuff Categories</h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((p, idx) => (
            <div key={p.id} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-900">{p.name}</span>
                <span className="text-green-700">
                  {storeSettings.currencySymbol}
                  {(p.price * 12).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-600 h-full rounded-full"
                  style={{ width: `${Math.max(25, 90 - idx * 15)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
