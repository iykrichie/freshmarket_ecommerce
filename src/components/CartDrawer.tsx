import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  ArrowRight,
  MessageCircle,
  Truck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    cartSubtotal,
    cartDeliveryFee,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    selectedZone,
    setIsCheckoutOpen,
    storeSettings,
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const freeThreshold = selectedZone?.freeAboveThreshold || storeSettings.freeDeliveryThreshold;
  const progressToFree = Math.min(100, (cartSubtotal / freeThreshold) * 100);
  const remainingForFree = Math.max(0, freeThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCodeInput('');
    }
  };

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let itemsText = cart
      .map(
        (i) =>
          `• ${i.product.name} (${i.selectedUnit}) x${i.quantity} = ₦${(
            i.unitPrice * i.quantity
          ).toLocaleString()}`
      )
      .join('\n');

    const message = `Hello FreshMarket! I want to order:\n\n${itemsText}\n\n*Subtotal:* ₦${cartSubtotal.toLocaleString()}\n*Delivery Fee (${
      selectedZone?.name || 'Default'
    }):* ₦${cartDeliveryFee.toLocaleString()}\n*Total:* ₦${cartTotal.toLocaleString()}\n\nPlease confirm availability and payment details.`;

    window.open(
      `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-base leading-none">Your Foodstuff Basket</h2>
              <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
                {cart.length} unique item types selected
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-amber-600" />
              {remainingForFree === 0 ? (
                <span className="text-green-700">You qualify for FREE Delivery!</span>
              ) : (
                <span>
                  Add {storeSettings.currencySymbol}
                  {remainingForFree.toLocaleString()} for FREE Delivery
                </span>
              )}
            </span>
            <span className="text-[10px] text-amber-700">{Math.round(progressToFree)}%</span>
          </div>

          <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressToFree}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">Your basket is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Browse our categories to add rice, garri, fresh veggies, palm oil and more!
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-green-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedUnit}`}
                className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Unit: <span className="font-bold text-gray-800">{item.selectedUnit}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-xs text-gray-900">
                      {storeSettings.currencySymbol}
                      {(item.unitPrice * item.quantity).toLocaleString()}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 bg-white rounded-lg p-0.5">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.selectedUnit, item.quantity - 1)
                        }
                        className="p-1 text-gray-500 hover:text-gray-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.selectedUnit, item.quantity + 1)
                        }
                        className="p-1 text-gray-500 hover:text-gray-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id, item.selectedUnit)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Box */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white space-y-3">
            {/* Coupon Box */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl border border-green-200 text-xs font-bold text-green-900">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span>
                    Coupon "{appliedCoupon.code}" Applied (-
                    {appliedCoupon.discountType === 'percentage'
                      ? `${appliedCoupon.value}%`
                      : `₦${appliedCoupon.value.toLocaleString()}`}
                    )
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-500 text-[10px] uppercase hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="Coupon Code (e.g. FRESH10)"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
              </form>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-gray-900">
                  {storeSettings.currencySymbol}
                  {cartSubtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee ({selectedZone?.name || 'Standard'}):</span>
                <span className="font-bold text-gray-900">
                  {cartDeliveryFee === 0 ? (
                    <strong className="text-green-700">FREE</strong>
                  ) : (
                    `${storeSettings.currencySymbol}${cartDeliveryFee.toLocaleString()}`
                  )}
                </span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Discount:</span>
                  <span>
                    -{storeSettings.currencySymbol}
                    {cartDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-green-700">
                  {storeSettings.currencySymbol}
                  {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-3.5 rounded-xl text-sm shadow-md shadow-green-600/20 transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold py-2.5 rounded-xl text-xs border border-emerald-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Instant Order via WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
