import { Order, StoreSettings } from '../types';

export function generateReceiptHTML(order: Order, storeSettings: StoreSettings): string {
  const itemsList = order.items
    .map(
      (i) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${i.product.name} (${i.selectedUnit})</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${storeSettings.currencySymbol}${(i.unitPrice).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${storeSettings.currencySymbol}${(i.unitPrice * i.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Official Order Receipt #${order.orderNumber} - ${storeSettings.storeName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    .receipt-container {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #166534;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #166534;
      margin: 0 0 4px 0;
    }
    .store-address {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      max-width: 280px;
      line-height: 1.4;
    }
    .receipt-badge {
      text-align: right;
    }
    .receipt-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .order-num {
      font-size: 14px;
      font-weight: 800;
      color: #15803d;
      font-family: monospace;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
      font-size: 13px;
    }
    .details-box h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .details-box p {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: 0.5px;
    }
    .totals {
      width: 280px;
      margin-left: auto;
      font-size: 13px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #475569;
    }
    .totals-row.final {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 16px;
      font-weight: 900;
      color: #166534;
    }
    .footer-note {
      text-align: center;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      font-size: 12px;
      color: #64748b;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt-container { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div>
        <h1 class="brand-title">${storeSettings.storeName}</h1>
        <p class="store-address">${storeSettings.address}</p>
        <p class="store-address">Support: ${storeSettings.supportPhone} | ${storeSettings.email}</p>
      </div>
      <div class="receipt-badge">
        <h2 class="receipt-title">OFFICIAL RECEIPT</h2>
        <div class="order-num">Order #${order.orderNumber}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>

    <div class="details-grid">
      <div class="details-box">
        <h4>Customer Details</h4>
        <p><strong>Name:</strong> ${order.customerInfo.name}</p>
        <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
        ${order.customerInfo.email ? `<p><strong>Email:</strong> ${order.customerInfo.email}</p>` : ''}
      </div>
      <div class="details-box">
        <h4>Delivery & Payment</h4>
        <p><strong>Destination:</strong> ${order.customerInfo.deliveryAddress}</p>
        <p><strong>Zone:</strong> ${order.customerInfo.community}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()} (${order.paymentStatus.toUpperCase()})</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${storeSettings.currencySymbol}${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>Delivery Fee:</span>
        <span>${order.deliveryFee === 0 ? 'FREE' : storeSettings.currencySymbol + order.deliveryFee.toFixed(2)}</span>
      </div>
      ${
        order.discountAmount > 0
          ? `<div class="totals-row" style="color: #166534; font-weight: bold;">
              <span>Discount (${order.couponCode || 'Promo'}):</span>
              <span>-${storeSettings.currencySymbol}${order.discountAmount.toFixed(2)}</span>
            </div>`
          : ''
      }
      <div class="totals-row final">
        <span>Total Amount:</span>
        <span>${storeSettings.currencySymbol}${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer-note">
      <p style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Thank you for shopping with ${storeSettings.storeName}!</p>
      <p style="margin: 0;">Tracking Code: <strong>${order.trackingCode}</strong></p>
    </div>
  </div>
</body>
</html>`;
}

export function downloadReceiptFile(order: Order, storeSettings: StoreSettings) {
  const htmlContent = generateReceiptHTML(order, storeSettings);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Receipt_${order.orderNumber}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReceiptDocument(order: Order, storeSettings: StoreSettings) {
  const htmlContent = generateReceiptHTML(order, storeSettings);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    // Fallback if popup is blocked
    window.print();
  }
}
