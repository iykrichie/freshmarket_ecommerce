import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { downloadReceiptFile, printReceiptDocument } from '../../utils/receiptGenerator';
import { ShoppingBag, Printer, Download, Search, Phone, MapPin, Truck, CheckCircle2 } from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, storeSettings, showToast } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">Order Fulfillment & Management</h2>
          <p className="text-xs text-gray-500">
            Process incoming orders, assign driver contact numbers, update status, and print packing invoices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer name or Phone..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-900"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900"
          >
            <option value="all">All Order Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs text-gray-400 italic">
            No orders match the current filter criteria.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 hover:border-green-200 transition-colors"
            >
              {/* Top Row: Order Number, Customer, Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-gray-900">
                    Order #{ord.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      ord.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : ord.status === 'out_for_delivery'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Placed: {new Date(ord.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer Info */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Customer Details
                  </span>
                  <p className="font-bold text-gray-900">{ord.customerInfo.name}</p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{ord.customerInfo.phone}</span>
                  </p>
                  <p className="text-gray-500 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {ord.customerInfo.deliveryAddress} ({ord.customerInfo.community})
                    </span>
                  </p>
                </div>

                {/* Items Summary */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Items ({ord.items.length})
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {ord.items.map((i, idx) => (
                      <p key={idx} className="text-gray-800 font-medium truncate">
                        • {i.product.name} ({i.selectedUnit}) x{i.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Payment & Driver Actions */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">
                      Total & Payment
                    </span>
                    <p className="font-black text-sm text-green-700">
                      {storeSettings.currencySymbol}
                      {ord.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      Method: {ord.paymentMethod.replace('_', ' ')} ({ord.paymentStatus})
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-900"
                    >
                      <option value="pending">Mark Pending</option>
                      <option value="confirmed">Mark Confirmed</option>
                      <option value="packed">Mark Packed</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Mark Delivered</option>
                      <option value="cancelled">Cancel Order</option>
                    </select>

                    <button
                      onClick={() => setSelectedOrderForInvoice(ord)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold"
                      title="Print Packing Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full space-y-4 print:p-0">
            <div className="flex justify-between items-center print:hidden">
              <h3 className="font-black text-base text-gray-900">Packing Invoice</h3>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <h4 className="font-black text-sm text-gray-900">{storeSettings.storeName}</h4>
                  <p className="text-[10px] text-gray-500">{storeSettings.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Invoice #{selectedOrderForInvoice.orderNumber}</p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold">Deliver To:</p>
                <p>{selectedOrderForInvoice.customerInfo.name}</p>
                <p>{selectedOrderForInvoice.customerInfo.phone}</p>
                <p>{selectedOrderForInvoice.customerInfo.deliveryAddress}</p>
              </div>

              <div className="border-t pt-2 space-y-1">
                <p className="font-bold">Items:</p>
                {selectedOrderForInvoice.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {i.product.name} ({i.selectedUnit}) x{i.quantity}
                    </span>
                    <span>₦{(i.unitPrice * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 font-black text-sm flex justify-between text-green-700">
                <span>Total Amount:</span>
                <span>₦{selectedOrderForInvoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => downloadReceiptFile(selectedOrderForInvoice, storeSettings)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                onClick={() => printReceiptDocument(selectedOrderForInvoice, storeSettings)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
