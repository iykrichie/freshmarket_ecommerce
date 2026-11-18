import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Download } from 'lucide-react';

function sanitizeCsvField(val: string | number): string {
  const str = String(val ?? '');
  const escaped = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${escaped.replace(/"/g, '""')}"`;
}

export const ReportsSection: React.FC = () => {
  const { orders, products, categories, storeSettings, showToast } = useStore();
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.totalAmount, 0),
    [orders]
  );
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Real category breakdown from live catalog + orders
  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const ord of orders) {
      for (const item of ord.items) {
        const cat = item.product.category || 'Other';
        totals.set(cat, (totals.get(cat) || 0) + item.unitPrice * item.quantity);
      }
    }
    const entries = categories.map((c) => ({
      name: c.name,
      revenue: totals.get(c.name) || 0,
      productCount: products.filter((p) => p.category === c.name).length,
    }));
    entries.sort((a, b) => b.revenue - a.revenue || b.productCount - a.productCount);
    const maxRev = Math.max(1, ...entries.map((e) => e.revenue));
    return { entries: entries.slice(0, 6), maxRev };
  }, [orders, categories, products]);

  const handleExportReportCSV = () => {
    const header = 'Order Number,Customer Name,Community,Total Amount,Payment Method,Status,Date';
    const rows = orders.map((o) =>
      [
        sanitizeCsvField(o.orderNumber),
        sanitizeCsvField(o.customerInfo.name),
        sanitizeCsvField(o.customerInfo.community),
        Number(o.totalAmount || 0),
        sanitizeCsvField(o.paymentMethod),
        sanitizeCsvField(o.status),
        sanitizeCsvField(o.createdAt),
      ].join(',')
    );
    const csvContent = [header, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const storeSlug =
      storeSettings.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || 'store';
    a.download = `${storeSlug}_${reportRange}_sales_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${reportRange} sales report CSV!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-950">
            Sales Reports & Financial Analytics
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track gross revenue, average order value, and category sales performance.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>

          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-stone-200/80 space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">Gross Sales Revenue</span>
          <p className="font-display text-2xl font-bold text-stone-950 tabular-nums">
            {storeSettings.currencySymbol}
            {totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200/80 space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">Total Orders</span>
          <p className="font-display text-2xl font-bold text-stone-950 tabular-nums">
            {totalOrdersCount}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200/80 space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">Average Order Value</span>
          <p className="font-display text-2xl font-bold text-emerald-800 tabular-nums">
            {storeSettings.currencySymbol}
            {avgOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
        <h3 className="font-display font-bold text-base text-stone-950">
          Category Sales Breakdown
        </h3>
        <div className="space-y-3">
          {categoryBreakdown.entries.map((cat) => {
            const pct =
              cat.revenue > 0
                ? Math.max(8, Math.round((cat.revenue / categoryBreakdown.maxRev) * 100))
                : 0;
            return (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-900">
                    {cat.name}{' '}
                    <span className="text-stone-400 font-normal tabular-nums">
                      ({cat.productCount} SKUs)
                    </span>
                  </span>
                  <span className="text-emerald-800 font-mono tabular-nums">
                    {storeSettings.currencySymbol}
                    {cat.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-700 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
