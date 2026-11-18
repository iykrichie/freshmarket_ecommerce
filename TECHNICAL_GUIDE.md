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

---

## 6. Seller / Reseller Technical Requirements & Multi-Client Operations

This section outlines the infrastructure, security, provisioning, and scaling requirements needed for you (the vendor/reseller) to reliably package, host, license, and support multiple subscription clients.

### A. Minimum Hosting & Infrastructure Requirements (Per Client Instance)
- **Node.js Runtime**: `Node.js 20 LTS` (minimum `v18.0+`) with `npm` v9+.
- **Compute Footprint**: `1 vCPU` / `512 MB RAM` minimum per subscriber container (`1 GB RAM` recommended for high-traffic stores using bulk spreadsheet parsing).
- **Persistent Disk Volume (`/app/data`)**:
  - Must be backed by persistent block/volume storage (Docker bind/named volume, Railway/Render persistent disk, VPS SSD, or Cloud Storage FUSE) mapped to `/app/data`.
  - Stores `data/tenant-config.json` (store branding, subscription metadata, scrypt admin hash, catalog, zones, coupons) and `data/orders.json` (server-side order ledger).
  - **Critical**: Never deploy on stateless/ephemeral container filesystems without a mounted `/app/data` volume, or client customizations will reset upon container restarts.
- **Network & TLS Termination**:
  - App listens on `0.0.0.0:3000` (configurable via `PORT`).
  - Place behind **Nginx**, **Cloudflare**, **Cloud Run Ingress**, or **Traefik** for automatic HTTPS (`Let's Encrypt`), custom buyer domain routing (`shop.clientdomain.com`), and HTTP/2 compression.

### B. Multi-Client Tenant Isolation Architecture
Because each subscriber store maintains independent credentials, inventory, bank payout details, and order records, isolate clients using one of two proven topologies:
1. **Container-Per-Tenant (Recommended for SaaS / Docker / Cloud Run)**:
   - Run one container per subscriber (`buyer-store-01`, `buyer-store-02`) with its own mounted `./tenants/<client-slug>/data:/app/data` directory and custom domain mapped via reverse proxy.
   - Guarantees blast-radius isolation, independent upgrades, and zero cross-tenant data leakage.
2. **Process-Per-Tenant on Single VPS (PM2 + Nginx)**:
   - Clone or deploy into `/var/www/tenants/<client-slug>` running on unique internal ports (`PORT=3001`, `3002`, ...) managed by PM2, with Nginx server blocks routing each buyer's domain to their assigned port.

### C. Fast Subscriber Provisioning & Golden Templates
To onboard new paying clients in under 2 minutes:
- **Zero-Touch CLI Provisioning**: Trigger `npm run init -- --non-interactive ...` from your billing/provisioning webhook or setup script to generate `.env` and `data/tenant-config.json` with a tier-coded license key (`FM-STR-...`, `FM-GRW-...`, `FM-ENT-...`).
- **Self-Service Onboarding Mode**: Run `npm run init -- --web-wizard` (`SETUP_REQUIRED=true`) before handing over the URL so the buyer completes their own 6-step Setup Wizard on first visit.
- **Niche Starter Bundles (`.json`)**: Maintain curated `StoreSnapshot` files (e.g., `uk-african-grocer-template.json`, `us-wholesale-food-template.json`, `ng-express-mart-template.json`) exported from **Admin → Store Settings → Export Full Store (.json)**. Import a matching bundle for instant catalog + category + zone setup per client vertical.

### D. Buyer Go-Live Readiness Checklist
Before transferring a live subscription URL to a client, verify:
1. **DNS & SSL**: Buyer's custom domain `CNAME`/`A` record resolves to your reverse proxy with a valid TLS certificate.
2. **Owner Credentials Locked**: Confirm `subscription.setupCompleted === true` and that factory default credentials (`admin@freshmarketglobal.com` / `admin12345`) have been replaced via the Setup Wizard or `npm run init` (verified by absence of the factory demo box on `AdminLoginModal`).
3. **Bank & WhatsApp Verification**: Test a checkout order to verify the buyer's bank transfer account details, WhatsApp checkout link (`https://wa.me/<digits>`), and PDF receipt branding render accurately.
4. **Live Card Payment Note**: Built-in card/wallet options (`paystack`, `flutterwave`) currently record customer payment intent for immediate order confirmation; if a buyer requires real-time online card settlement with webhooks, connect their Paystack/Stripe/Flutterwave secret key via a dedicated server route in `server.ts` (`/api/payments/*`)—never expose secret API keys in client `VITE_*` variables.

### E. Scaling Path (Single-Node JSON → Managed Database)
The current `StoreRepository` (`src/data/repository.ts`) + Express JSON storage handles single-store catalogs (up to ~1,000 SKUs and hundreds of daily orders) with zero external infrastructure cost. When an Enterprise subscriber needs multi-region autoscaling or >5,000 monthly orders:
1. Keep the React UI and `StoreContext` unchanged.
2. Replace `readJsonFile` / `writeJsonAtomic` inside `server.ts` routes (`/api/bootstrap`, `/api/initialize`, `/api/tenant/sync`, `/api/orders*`) with **PostgreSQL (Cloud SQL + Drizzle)** or **Firebase Firestore** queries.
3. Update `StoreRepository` fetch methods to hydrate directly from the database-backed endpoints.

### F. Seller Security, Backup & Upgrade SLA
- **Automated Daily Backups**: Schedule a daily cron job (or cloud volume snapshot) backing up `/tenants/*/data/tenant-config.json` and `orders.json` to encrypted object storage (S3 / GCS / Backblaze B2).
- **Secrets Hygiene**: Keep `.gitignore` excluding `.env*` (except `.env.example`) and `data/`. Never embed buyer credentials or `.json` tenant backups inside your base Git image.
- **Safe Rolling Upgrades**: Before pushing codebase updates to subscriber instances, run `npm run lint && npm run build` in CI; when restarting containers, `/app/data` preserves all buyer branding, inventory, and orders intact.

