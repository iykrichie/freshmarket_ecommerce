import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Users, Phone, Mail, MapPin, MessageCircle, Search } from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, storeSettings } = useStore();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.community.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">Customer Directory</h2>
          <p className="text-xs text-gray-500">
            View profiles, total order history, and reach out to frequent foodstuff buyers.
          </p>
        </div>

        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or phone..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <th className="p-4">Customer</th>
                <th className="p-4">Community / Address</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Frequent Tag</th>
                <th className="p-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.phone}</p>
                  </td>
                  <td className="p-4 text-gray-600">
                    <p className="font-bold text-gray-800">{c.community}</p>
                    <p className="text-[10px] text-gray-400">{c.address}</p>
                  </td>
                  <td className="p-4 font-bold text-gray-900">{c.totalOrders} orders</td>
                  <td className="p-4 font-black text-green-700">
                    {storeSettings.currencySymbol}
                    {c.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-4">
                    {c.isFrequent ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        VIP Buyer
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] px-3 py-1.5 rounded-xl border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
