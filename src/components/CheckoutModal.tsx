import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Building,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Upload,
  Sparkles,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartDiscount,
    cartTotal,
    deliveryZones,
    selectedZone,
    setSelectedZone,
    appliedCoupon,
    createOrder,
    storeSettings,
    setIsTrackingOpen,
    setActiveTrackingId,
    showToast,
    currentUser,
    setIsUserAuthOpen,
  } = useStore();

  const [name, setName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [isCarePackage, setIsCarePackage] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(storeSettings.bankDetails.accountNumber);
    setCopiedAccount(true);
    showToast('Account number copied to clipboard!', 'info');
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !selectedZone) {
      showToast('Please fill in all required delivery details', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const created = createOrder({
        items: cart,
        subtotal: cartSubtotal,
        deliveryFee: cartDeliveryFee,
        discountAmount: cartDiscount,
        couponCode: appliedCoupon?.code,
        totalAmount: cartTotal,
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          deliveryAddress: address.trim(),
          community: selectedZone.name,
          landmark: landmark.trim() || undefined,
          notes: notes.trim() || undefined,
          isCarePackage,
          recipientName: isCarePackage ? recipientName.trim() : undefined,
          giftMessage: isCarePackage ? giftMessage.trim() : undefined,
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        estimatedDelivery: new Date(
          Date.now() + 3600000 * (selectedZone.minDeliveryTimeHours || 2)
        ).toISOString(),
      });

      setIsProcessing(false);
      setIsCheckoutOpen(false);
      setActiveTrackingId(created.orderNumber);
      setIsTrackingOpen(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-green-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold shadow-md shadow-green-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">Checkout & Delivery Details</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Complete your foodstuff order safely in less than 1 minute
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left 7 Columns: Delivery & Payment Details */}
            <div className="md:col-span-7 space-y-5">
              {/* Customer Contact */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-green-600" />
                  <span>1. Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mrs. Florence Campbell"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900123"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For order receipts and tracking updates"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Delivery Address & Zone */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>2. Local or International Shipping Address</span>
                </h3>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Select Delivery Zone (Local Express or International Export) *
                  </label>
                  <select
                    value={selectedZone?.id || ''}
                    onChange={(e) => {
                      const found = deliveryZones.find((z) => z.id === e.target.value);
                      if (found) setSelectedZone(found);
                    }}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                  >
                    {deliveryZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — Fee: {storeSettings.currencySymbol}
                        {z.fee.toFixed(2)} (Est: {z.minDeliveryTimeHours}-
                        {z.maxDeliveryTimeHours} hrs)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Street Address & Postcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 42 Rye Lane, Peckham, SE15 4ST"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Nearest Landmark / Station
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Peckham Rye Station"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Buzz Flat 3B, leave with concierge"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Diaspora Care Package Gift Toggle */}
                <div className="mt-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCarePackage}
                      onChange={(e) => setIsCarePackage(e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded border-amber-300 focus:ring-green-500"
                    />
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>✈️ Send as Diaspora Care Package / Family Gift</span>
                      <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full uppercase">Special</span>
                    </span>
                  </label>

                  {isCarePackage && (
                    <div className="space-y-2.5 pt-2 border-t border-amber-200/60 animate-fadeIn">
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 block mb-1">
                          Recipient Name in London/Overseas
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Aunty Mary / Uncle Tunde"
                          className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 block mb-1">
                          Personal Message for Care Package Note
                        </label>
                        <textarea
                          rows={2}
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="e.g. Wishing you a wonderful month filled with love and delicious food from home!"
                          className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span>3. Payment Method</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paystack')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'paystack'
                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-black text-xs">Credit / Debit Card</span>
                    <span
                      className={`text-[10px] ${
                        paymentMethod === 'paystack' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      Visa, Mastercard, Apple Pay
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-black text-xs">UK Bank Transfer</span>
                    <span
                      className={`text-[10px] ${
                        paymentMethod === 'bank_transfer' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      Faster Payments / Barclays
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('flutterwave')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'flutterwave'
                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-black text-xs">Apple Pay / Google Pay</span>
                    <span
                      className={`text-[10px] ${
                        paymentMethod === 'flutterwave' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      Instant express checkout
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-black text-xs">Pay on Delivery</span>
                    <span
                      className={`text-[10px] ${
                        paymentMethod === 'cod' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      Card / Cash with courier
                    </span>
                  </button>
                </div>

                {/* Bank Details Display Box if Bank Transfer selected */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-3.5 bg-green-50 rounded-2xl border border-green-200 space-y-2">
                    <p className="text-xs font-bold text-green-900">UK Business Bank Details:</p>
                    <div className="bg-white p-3 rounded-xl border border-green-100 flex items-center justify-between">
                      <div className="text-xs">
                        <p className="text-gray-500">{storeSettings.bankDetails.bankName}</p>
                        <p className="text-sm font-black text-gray-900">
                          Acc: {storeSettings.bankDetails.accountNumber}{' '}
                          {storeSettings.bankDetails.sortCode && `| Sort: ${storeSettings.bankDetails.sortCode}`}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {storeSettings.bankDetails.accountName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedAccount ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Order Summary Box */}
            <div className="md:col-span-5 bg-gray-50/80 p-4 rounded-3xl border border-gray-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="font-black text-sm text-gray-900">Order Summary ({cart.length})</h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedUnit}`}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="font-bold text-gray-500">{item.quantity}x</span>
                      <span className="truncate flex-1 font-medium text-gray-800">
                        {item.product.name} ({item.selectedUnit})
                      </span>
                      <span className="font-black text-gray-900">
                        {storeSettings.currencySymbol}{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">
                      {storeSettings.currencySymbol}{cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery ({selectedZone?.name || 'Selected'}):</span>
                    <span className="font-bold text-gray-900">
                      {cartDeliveryFee === 0 ? 'FREE' : `${storeSettings.currencySymbol}${cartDeliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Discount:</span>
                      <span>-{storeSettings.currencySymbol}{cartDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Amount:</span>
                    <span className="text-green-700">{storeSettings.currencySymbol}{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-green-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Order ({storeSettings.currencySymbol}{cartTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
