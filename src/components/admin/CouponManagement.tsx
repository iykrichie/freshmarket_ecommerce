import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';

export const CouponManagement: React.FC = () => {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
    storeSettings,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(30);
  const [expiry, setExpiry] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<string>('500');

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setValue(10);
    setMinOrder(30);
    setExpiry('2026-12-31');
    setUsageLimit('500');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setValue(c.value);
    setMinOrder(c.minOrderAmount);
    setExpiry(c.expiryDate);
    setUsageLimit(c.usageLimit ? String(c.usageLimit) : '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      value: Math.max(0, Number(value)),
      minOrderAmount: Math.max(0, Number(minOrder)),
      expiryDate: expiry,
      usageLimit: usageLimit ? Math.max(1, Number(usageLimit)) : undefined,
      isActive: editingCoupon ? editingCoupon.isActive : true,
    };

    if (editingCoupon) {
      updateCoupon({
        ...editingCoupon,
        ...payload,
      });
    } else {
      addCoupon(payload);
    }

    setIsModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-950">
            Promotions & Coupon Codes
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create, edit, pause, or remove percentage and fixed discount codes for campaigns.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => {
          const isConfirming = confirmDeleteId === c.id;
          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-stone-950 bg-stone-100 px-3 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <button
                    onClick={() => toggleCouponActive(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <div className="text-xs text-stone-600 space-y-1 tabular-nums">
                  <p className="font-bold text-sm text-emerald-800">
                    {c.discountType === 'percentage'
                      ? `${c.value}% OFF`
                      : `${storeSettings.currencySymbol}${c.value.toLocaleString()} OFF`}
                  </p>
                  <p>
                    Min Order: {storeSettings.currencySymbol}
                    {c.minOrderAmount.toLocaleString()}
                  </p>
                  <p>Expires: {c.expiryDate}</p>
                  <p className="text-[11px] text-stone-400">
                    Used {c.usageCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''} times
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {isConfirming ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => {
                        deleteCoupon(c.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-display font-bold text-base text-stone-950">
                {editingCoupon ? 'Edit Promo Code' : 'Create Promo Code'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FESTIVE20"
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ({storeSettings.currencySymbol})</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Min Order ({storeSettings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Usage Limit (Opt)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2 rounded-xl"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
