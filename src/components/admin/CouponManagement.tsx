import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { Tag, Plus, Check, X } from 'lucide-react';

export const CouponManagement: React.FC = () => {
  const { coupons, addCoupon, toggleCouponActive, storeSettings, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(15000);
  const [expiry, setExpiry] = useState('2026-12-31');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      value: Number(value),
      minOrderAmount: Number(minOrder),
      expiryDate: expiry,
      isActive: true,
    });

    setIsModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">Promotions & Coupon Codes</h2>
          <p className="text-xs text-gray-500">
            Create percentage or fixed price discount codes for marketing campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base text-gray-900 bg-gray-100 px-3 py-1 rounded-xl">
                {c.code}
              </span>
              <button
                onClick={() => toggleCouponActive(c.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {c.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-black text-sm text-green-700">
                Discount:{' '}
                {c.discountType === 'percentage'
                  ? `${c.value}% OFF`
                  : `₦${c.value.toLocaleString()} OFF`}
              </p>
              <p>Min Order: ₦{c.minOrderAmount.toLocaleString()}</p>
              <p>Expires: {c.expiryDate}</p>
              <p className="text-[10px] text-gray-400">Used {c.usageCount} times</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-base text-gray-900">Create New Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FESTIVE20"
                  className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Min Order Amount (₦)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
