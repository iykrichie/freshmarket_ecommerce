# ⚙️ Technical & Data Layer Architecture Guide

This reference documents the system architecture, data layer best practices, TypeScript schemas, state lifecycle, spreadsheet/image pipelines, and Express REST endpoints.

---

## 1. System Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        React 19 SPA Components                       │
│  Storefront (Header, CategorySidebar, ProductCard, CartDrawer, ...)   │
│  Onboarding (SetupWizard)  |  Admin Console (src/components/admin/*) │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ useStore()
┌──────────────────────────────────▼───────────────────────────────────┐
│                    StoreContext (src/context/StoreContext.tsx)       │
│  - Memoized callbacks & cart computations                            │
│  - Cart stock validation & price/availability reconciliation         │
│  - Skips redundant initial-mount localStorage writes                 │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│                  StoreRepository (src/data/repository.ts)            │
│  - Schema migration (STORAGE_SCHEMA_VERSION = 2)                     │
│  - Runtime shape sanitizers (products, zones, settings, snapshots)   │
│  - Optimistic localStorage cache + async Express API sync            │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTP JSON (/api/*)
┌──────────────────────────────────▼───────────────────────────────────┐
│                   Express Runtime (server.ts)                        │
│  - Atomic JSON writes (temp file + rename)                           │
│  - Salted scrypt password hashing & timing-safe verification         │
│  - data/tenant-config.json  |  data/orders.json                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Layer Best Practices Implemented

### A. Repository Isolation & Schema Versioning (`src/data/repository.ts`)
- All `localStorage` keys are centralized in `STORAGE_KEYS` and versioned with `STORAGE_SCHEMA_VERSION = 2`.
- `ensureStorageSchemaMigration()` automatically upgrades legacy caches cleanly without throwing JSON parse errors.
- `StoreContext` initializes state once via `StoreRepository.loadLocalState()` and uses a `hasMountedRef` guard so initial hydration does not trigger unnecessary synchronous `localStorage.setItem` writes.

### B. Runtime Validation & Sanitization
- Every persisted or imported entity passes through dedicated sanitizers:
  - `sanitizeProduct`: Clamps negative prices/stock, validates `availableUnits`, normalizes gallery arrays.
  - `sanitizeDeliveryZones`: Ensures positive delivery fees and valid min/max hour bounds.
  - `sanitizeStoreSettings` & `sanitizeSubscription`: Merges nested objects (`bankDetails`, `adminCredentials`) safely against defaults so partial configs never break components.
  - `sanitizeSnapshot`: Validates `.json` store bundle uploads before updating state.

### C. Cart Integrity & Stock Reconciliation
- `addToCart` and `updateCartQuantity` validate against live `product.stock`, reject out-of-stock additions, and clamp quantities to available inventory.
- A reconciliation effect in `StoreContext` automatically updates cart unit prices or removes discontinued/out-of-stock items whenever the admin modifies the catalog.

### D. Atomic Server Persistence & Credential Hardening (`server.ts`)
- **`writeJsonAtomic(filePath, data)`**: Writes serialized JSON to `${filePath}.${pid}.${timestamp}.tmp` and atomically renames it into place via `fs.renameSync`.
- **Credential Security**: Passwords submitted to `POST /api/initialize`, `POST /api/tenant/sync`, or `npm run init` are hashed with `crypto.scryptSync(password, randomSalt16Bytes, 64)` (`scrypt:<salt>:<hash>`) and verified using `crypto.timingSafeEqual`. Public `/api/bootstrap` payloads strip `passwordHash`.
- **HTTP Hardening**: `x-powered-by` is disabled, and responses include `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`.

### E. Spreadsheet & Export Security
- `ReportsSection.tsx` escapes leading formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) in CSV cells to prevent spreadsheet formula injection.
- Blob object URLs created for JSON/CSV/Receipt downloads are explicitly revoked with `URL.revokeObjectURL`.

---

## 3. Core Domain Schemas (`src/types/index.ts`)

### `Product` & `ProductUnitOption`
```typescript
export type UnitType = PresetUnitType | (string & {});

export interface ProductUnitOption {
  unit: UnitType;
  price: number;
  discountPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  unit: UnitType;
  availableUnits?: ProductUnitOption[];
  weight?: string;
  description: string;
  stock: number;
  image: string;
  images: string[];
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

### `Order` & `OrderCustomerInfo`
```typescript
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'paystack' | 'flutterwave';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    community: string;
    landmark?: string;
    notes?: string;
    isCarePackage?: boolean;
    recipientName?: string;
    giftMessage?: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  trackingCode: string;
  driverInfo?: { name: string; phone: string };
}
```

### `SubscriptionInfo` & `StoreSnapshot`
```typescript
export interface SubscriptionInfo {
  planId: 'starter' | 'growth' | 'enterprise';
  planName: string;
  status: 'active' | 'trial' | 'past_due' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  licenseKey: string;
  subscriberName: string;
  subscriberEmail: string;
  customDomain?: string;
  startedAt: string;
  renewsAt: string;
  monthlyPrice: number;
  maxProducts: number;
  maxZones: number;
  setupCompleted: boolean;
  setupCompletedAt?: string;
}

export interface StoreSnapshot {
  version: number;
  exportedAt: string;
  storeSettings: StoreSettings;
  categories: Category[];
  products: Product[];
  deliveryZones: DeliveryZone[];
  coupons: Coupon[];
  subscription?: SubscriptionInfo;
}
```

---

## 4. Utility Pipelines

| Module | Purpose | Key Functions |
| :--- | :--- | :--- |
| `src/utils/inventorySpreadsheet.ts` | Bulk `.xlsx`/`.csv` import & export | `parseInventoryFile`, `buildUpdatedAndNewProducts`, `exportInventorySpreadsheet`, `downloadInventoryTemplate` |
| `src/utils/imageProcessor.ts` | Client-side canvas compression & auto-matching | `compressImageFile` (`WebP`/`JPEG`), `matchFilenameToProduct`, `getPresetImagesFromCategories` |
| `src/utils/receiptGenerator.ts` | Customer invoice compiler & print formatter | `generateReceiptHTML`, `downloadReceiptFile`, `printReceiptDocument` |

---

## 5. Express Backend API Reference (`server.ts`)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Returns `{ status: 'ok', initialized, timestamp }` |
| `/api/bootstrap` | `GET` | Public | Returns `{ initialized, setupRequired, config }` (credential hashes stripped) |
| `/api/initialize` | `POST` | Uninit or Owner | Persists 1-time setup into `data/tenant-config.json` with salted `scrypt` hash |
| `/api/admin/login` | `POST` | Credentials | Verifies owner login against `data/tenant-config.json` |
| `/api/tenant/sync` | `POST` | Owner | Syncs updated settings, catalog, zones, coupons & subscription to disk |
| `/api/orders` | `POST` | Public | Persists new customer order to `data/orders.json` and deducts server stock/coupon usage |
| `/api/orders/track` | `GET` | Public | Looks up an order by `?q=<orderNumber\|trackingCode>` across devices |
| `/api/orders/:id/status` | `PATCH` | Owner | Updates order status and optional courier driver details on disk |
| `/api/store-info` | `GET` | Public | Returns live store name, currency, contact channels & initialization flag |
