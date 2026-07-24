import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { downloadReceiptFile, printReceiptDocument } from '../utils/receiptGenerator';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  MapPin,
  Phone,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Received', desc: 'Received & awaiting confirmation' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Items checked & stock reserved' },
  { key: 'packed', label: 'Freshly Packed', desc: 'Packed in food hygiene bags' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Driver en route to your address' },
  { key: 'delivered', label: 'Delivered', desc: 'Successfully handed over' },
];

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingOpen,
    setIsTrackingOpen,
    activeTrackingId,
    setActiveTrackingId,
    orders,
    addToCart,
    storeSettings,
    setIsCartOpen,
    showToast,
  } = useStore();

  const [searchInput, setSearchInput] = useState(activeTrackingId || '');

  if (!isTrackingOpen) return null;

  // Find matching order by ID or phone
  const matchedOrder = orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === searchInput.trim().toLowerCase() ||
      o.trackingCode.toLowerCase() === searchInput.trim().toLowerCase() ||
      o.customerInfo.phone.includes(searchInput.trim())
  ) || orders[0];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'packed':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = matchedOrder ? getStepIndex(matchedOrder.status) : 0;

  const handleReorder = () => {
    if (!matchedOrder) return;
    matchedOrder.items.forEach((item) => {
      addToCart(item.product, item.quantity, item.selectedUnit);
    });
    setIsTrackingOpen(false);
    setIsCartOpen(true);
    showToast('Reordered all items into your cart!', 'success');
  };

  const handlePrintReceipt = () => {
    if (!matchedOrder) return;
    printReceiptDocument(matchedOrder, storeSettings);
  };

  const handleDownloadReceipt = () => {
    if (!matchedOrder) return;
    downloadReceiptFile(matchedOrder, storeSettings);
    showToast('Downloading order receipt...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-green-50/60 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">Live Foodstuff Order Tracker</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Track delivery status in real-time
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackingOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Search Box */}
          <div className="flex gap-2 print:hidden">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Order # (e.g. FM-9842) or Phone Number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => {
                if (searchInput.trim()) {
                  showToast('Found matching order!', 'info');
                }
              }}
              className="bg-green-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-green-700"
            >
              Search
            </button>
          </div>

          {matchedOrder ? (
            <div className="space-y-6">
              {/* Order Info Bar */}
              <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gray-900">
                      Order #{matchedOrder.orderNumber}
                    </span>
                    <span className="bg-green-100 text-green-800 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                      {matchedOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Placed on: {new Date(matchedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray-400 block font-semibold">
                    Tracking Code
                  </span>
                  <span className="font-mono font-bold text-xs text-green-700">
                    {matchedOrder.trackingCode}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-3 print:hidden">
                <h4 className="font-bold text-xs text-gray-900 uppercase">Delivery Progress</h4>

                <div className="relative pl-6 border-l-2 border-green-200 space-y-6 py-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={step.key} className="relative flex items-start gap-3">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-400 border border-gray-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div>
                          <p
                            className={`font-bold text-xs ${
                              isCurrent
                                ? 'text-green-700'
                                : isCompleted
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-gray-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Driver Details if out for delivery */}
              {matchedOrder.driverInfo && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Dispatch Courier
                    </span>
                    <span className="font-bold text-xs text-gray-900">
                      {matchedOrder.driverInfo.name}
                    </span>
                  </div>
                  <a
                    href={`tel:${matchedOrder.driverInfo.phone}`}
                    className="flex items-center gap-1.5 bg-amber-400 text-gray-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                </div>
              )}

              {/* Itemized Receipt Breakdown */}
              <div className="printable-receipt-area border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-bold text-xs text-gray-900 uppercase">Itemized Foodstuff</h4>

                <div className="space-y-2">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900">{item.product.name}</span>
                        <span className="text-gray-500 block text-[11px]">
                          {item.selectedUnit} x {item.quantity}
                        </span>
                      </div>
                      <span className="font-black text-gray-900">
                        {storeSettings.currencySymbol}{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">{storeSettings.currencySymbol}{matchedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-bold">
                      {matchedOrder.deliveryFee === 0 ? 'FREE' : `${storeSettings.currencySymbol}${matchedOrder.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {matchedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Discount:</span>
                      <span>-{storeSettings.currencySymbol}{matchedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                    <span>Total Paid:</span>
                    <span className="text-green-700">
                      {storeSettings.currencySymbol}{matchedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-2 print:hidden">
                <button
                  onClick={handleReorder}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-3 rounded-xl text-xs hover:bg-green-700 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reorder Items</span>
                </button>

                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-3.5 rounded-xl text-xs transition-colors shadow-xs"
                  title="Download PDF/HTML Receipt"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>

                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black text-white font-bold py-3 px-3.5 rounded-xl text-xs transition-colors shadow-xs"
                  title="Print Official Receipt"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-8">
              No order found matching "{searchInput}". Please double check your order number.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
