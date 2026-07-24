# ⚙️ FreshMarket Global — Technical Architecture Guide

This guide details the internal system architecture, data models, state management, checkout workflow, and API routes for developers working on or expanding **FreshMarket Global**.

---

## 📐 Architecture Overview

FreshMarket Global is structured as a client-side reactive Single Page Application (SPA) driven by React 18, Tailwind CSS, and a Node.js Express server.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                                                             │
│   React SPA (UI Components, Modals, Checkout, Drawer)       │
│                                 ▲                           │
│                                 │ React Context API         │
│                                 ▼                           │
│                 StoreContext (Global Application State)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Backend Runtime                  │
│                                                             │
│   server.ts  ───► API Routes (/api/health, /api/store-info) │
│              ───► Static Asset Serving (/dist in prod)      │
│              ───► Vite Middleware Mode (in dev)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Core Data Models & Schema (`src/types/index.ts`)

### 1. `Product`
Represents an item in the marketplace:
```typescript
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  unit: UnitType;
  availableUnits?: UnitOption[];
  weight: string;
  description: string;
  stock: number;
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isDailyDeal?: boolean;
  dealEndsAt?: string;
  origin?: string;
  tags?: string[];
}
```

### 2. `UnitType`
Flexible packaging units supported by the system:
```typescript
export type UnitType =
  | '50kg Bag'
  | '25kg Bag'
  | '20kg Bag'
  | '10kg Bag'
  | '5kg Bag'
  | 'Paint Rubber'
  | '5L Bottle'
  | '4L Bottle'
  | '1L Bottle'
  | 'Carton'
  | 'Crate'
  | '1kg Pack'
  | '1kg Box'
  | '500g Tub'
  | '5kg Box'
  | 'Case of 24'
  | 'Single Hen'
  | 'Tubers'
  | 'Basket'
  | 'Piece'
  | 'Bunch'
  | 'Diaspora Box'
  | 'Care Package'
  | 'Export Pack';
```

### 3. `Order` & `ShippingAddress`
Captures both local delivery and international diaspora care package recipients:
```typescript
export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  community: string;
  landmark?: string;
  notes?: string;
  isCarePackage?: boolean;
  recipientName?: string;
  giftMessage?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'paystack' | 'bank_transfer' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber: string;
  estimatedDelivery: string;
}
```

---

## 🔄 Global State Management (`src/context/StoreContext.tsx`)

The store application state is centralized via `StoreContext`, exposing reactive hooks across all views:

### Key State Objects:
- **`products`**: Array of catalog items (`Product[]`) with live stock counters.
- **`cart`**: Array of items added (`CartItem[]`), tracking selected unit option and quantity.
- **`orders`**: Active and historic customer orders (`Order[]`).
- **`deliveryZones`**: Local borough zones & international air export matrix (`DeliveryZone[]`).
- **`storeSettings`**: Store identity, phone, email, currency symbol, and bank transfer account details.

### Core Methods:
- `addToCart(product, quantity, selectedUnit)`
- `updateCartQuantity(productId, quantity, selectedUnit)`
- `removeFromCart(productId, selectedUnit)`
- `applyCoupon(code)`
- `createOrder(shippingAddress, paymentMethod)`
- `updateOrderStatus(orderId, status)`
- `toggleFavorite(productId)`

---

## ✈️ Checkout & Diaspora Care Package Logic

During checkout (`CheckoutModal.tsx`), customers can select from local express delivery zones or international air export destinations.

When the customer checks **"Send as Diaspora Care Package / Family Gift"**:
1. Extra state fields `recipientName` and `giftMessage` are captured.
2. The order payload stores these details in `shippingAddress`.
3. The invoice and admin order tracker display a dedicated **✈️ Diaspora Export Care Package** tag along with the recipient name and custom gift note card.

---

## 🔌 Express Backend Endpoints (`server.ts`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check probe returning API status, store name, and timestamp. |
| `/api/store-info` | `GET` | Returns store metadata, operational hours, currency symbols, and customer support channels. |

In production mode (`NODE_ENV=production`), the Express server serves static compiled HTML/JS assets directly from `dist/` and falls back to `index.html` for single-page client routing.
