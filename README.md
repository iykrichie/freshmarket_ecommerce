# FreshMarket Global — White-Label E-Commerce & Subscription Storefront Platform

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)

**FreshMarket Global** is a self-contained, white-label full-stack e-commerce web application engineered for foodstuff, specialty grocery, and local/international delivery businesses. Built to be shipped as a turnkey subscription product, it includes an interactive **6-Step Store Initialization Wizard**, a **CLI provisioning script (`npm run init`)**, an **Admin Management Console**, and a **fluid customer storefront**.

---

## 🎨 Visual Impression & Storefront Preview

<div align="center">

### 1. Authentic Foodstuff Storefront & Global Export Hero Banner
*Top announcement strip, delivery region switcher, live product search, customer account OTP sign-in, order tracker, and conversion hero banner.*

![FreshMarket Global Storefront Hero Banner](./public/screenshots/hero_storefront.png)

<br/>

### 2. Fluid Product Catalog, Multi-Unit Selector & Category Workspace
*Responsive catalog cards featuring live stock indicators, multi-size packaging selectors, origin badges, flash deal banners, and one-click cart controls.*

![FreshMarket Product Catalog & Pricing Grid](./public/screenshots/product_catalog.png)

<br/>

### 3. Complete Storefront Experience
*Clean, mobile-responsive layout engineered for high-converting local doorstep delivery and international diaspora export orders.*

![FreshMarket Full Storefront Interface](./public/screenshots/full_storefront.png)

</div>

---

## 🌟 Key Platform Capabilities

### 🛍️ Customer Storefront Experience
- **Left Sticky Category Sidebar & Quick Filters**: Instant filtering by department, **All Items**, **Flash Deals**, **Best Sellers**, and **In-Stock Ready**, with a mobile horizontal category drawer.
- **Multi-Size / Pack Variant Pricing**: Shoppers can toggle packaging options (e.g., `50kg Bag`, `20kg Bag`, `10kg Bag`, `Paint Rubber`, `Export Pack`, or custom units) directly on product cards and detail modals with automatic price updates.
- **Slide-Over Cart Drawer & Promo Engine**: Live free-delivery progress meter, promo coupon validation (expiry + usage limit enforcement), quantity stock clamping, and direct WhatsApp order dispatch.
- **Local & Diaspora Care Package Checkout**:
  - Region-aware shipping fee calculations with neighborhood/borough coverage.
  - Optional **Diaspora Care Package / Family Gift** card capturing recipient name and custom gift note.
  - Configurable payment methods (Card, Direct Bank Transfer with one-click account copy, Express Wallet, Pay on Delivery).
- **Live Order Tracking & Official PDF Receipts**: 5-stage visual progress stepper backed by client cache and `/api/orders/track` server lookup, plus printable/downloadable HTML receipts.

### 🛠️ Owner Admin Console & White-Label Customization
- **Subscription & One-Time Setup (`Admin → Subscription & Setup`)**:
  - Interactive **6-Step Setup Wizard** for first-time buyer onboarding (Plan & License, Brand & Logo, Currency & Contacts, Payments & Bank, Delivery Zones & Catalog Seeding, Owner Security).
  - Live SKU and Delivery Zone quota meters, billing cycle switches (`Monthly` / `Annual`), license key activation, and server config synchronization.
- **Product Catalog & Bulk Operations**:
  - Create, edit, duplicate, and inline-toggle **Featured**, **Best Seller**, and **Daily Deal** items, plus build multi-size pricing variants and search tags.
  - **Bulk Inventory Import/Export (`.xlsx` / `.csv`)**: Powered by SheetJS (`xlsx`) for updating stock/prices or adding new SKUs in bulk.
  - **Bulk Image Manager**: Upload multiple photos with automatic canvas compression (`WebP`/`JPEG`) and smart filename-to-product auto-matching.
- **Category, Zone & Coupon Managers**: Full CRUD for categories (auto-syncing renamed categories across products), delivery zones with neighborhood tag builders and presets, and coupon expiry/usage controls.
- **Analytics & Full Store Cloning**: Revenue reports with formula-injection-safe CSV export, plus 1-click **Full Store Snapshot (`.json`)** export/restore to clone or back up an entire white-label store.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, TypeScript 5.8, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, Motion
- **Spreadsheet Engine**: SheetJS (`xlsx`) for `.xlsx`/`.csv` template export & bulk import parsing
- **Backend Server**: Node.js + Express (`server.ts`) with Vite dev middleware & `esbuild` production bundle (`dist/server.cjs`)
- **Data Layer**: `StoreRepository` (`src/data/repository.ts`) combining schema-versioned `localStorage` caching with atomic server JSON persistence (`data/tenant-config.json` & `data/orders.json`) and salted `crypto.scryptSync` admin password hashing.

---

## 📁 Directory Structure

```text
├── .env.example                     # Environment & subscription provisioning variables
├── metadata.json                    # App title and metadata
├── package.json                     # NPM scripts (dev, init, build, start, lint)
├── server.ts                        # Express backend, security headers & tenant/order APIs
├── vite.config.ts                   # Vite + Tailwind v4 bundler config
├── README.md                        # Project overview & quick start
├── PRODUCT_PITCH.md                 # Buyer-ready product intro, sales pitch & pricing tiers
├── DEPLOYMENT.md                    # Local testing, CLI provisioning & cloud hosting guide
├── TECHNICAL_GUIDE.md               # Architecture, data layer & reseller technical requirements
├── WALKTHROUGH.md                   # Step-by-step user, owner & reseller walkthroughs
├── scripts/
│   ├── init-store.mjs               # Interactive & CI one-time store initialization CLI
│   └── capture.js                   # Puppeteer UI screenshot capture utility
└── src/
    ├── App.tsx                      # Storefront workspace, deal banner & global modals
    ├── main.tsx                     # React entry point
    ├── index.css                    # Tailwind CSS v4 imports & @media print receipt rules
    ├── types/index.ts               # All TypeScript domain, store & subscription types
    ├── data/
    │   ├── mockData.ts              # Curated starter categories, products, zones & defaults
    │   ├── subscriptionPlans.ts     # Plan tiers, license helpers & regional presets
    │   └── repository.ts            # StoreRepository: schema migration, sanitization & APIs
    ├── context/StoreContext.tsx     # Global reactive state & business logic orchestration
    ├── utils/
    │   ├── imageProcessor.ts        # HTML5 Canvas WebP/JPEG compression & filename matching
    │   ├── inventorySpreadsheet.ts  # CSV/XLSX parser, validator & template generator
    │   └── receiptGenerator.ts      # Official customer invoice HTML/print compiler
    └── components/
        ├── Header.tsx               # Top bar, zone selector, search & account controls
        ├── HeroBanner.tsx           # Customizable conversion banner & quick tags
        ├── CategorySidebar.tsx      # Sticky department & quick-filter sidebar
        ├── ProductCard.tsx          # Product card with unit selector & quick cart actions
        ├── ProductDetailModal.tsx   # Gallery viewer, pack pricing & verified reviews
        ├── CartDrawer.tsx           # Slide-over cart, promo codes & WhatsApp dispatch
        ├── CheckoutModal.tsx        # Address, care package gift card & payment selector
        ├── OrderTrackingModal.tsx   # Cross-device live order stepper & receipt exporter
        ├── UserAuthModal.tsx        # Customer registration & phone OTP verification
        ├── AdminLoginModal.tsx      # Protected owner login (server scrypt + local fallback)
        ├── SetupWizard.tsx          # Guided 6-step first-time store initialization modal
        ├── ResilientImage.tsx       # Graceful fallback image component
        ├── WhyShopWithUs.tsx        # Trust & quality assurance pillars
        ├── Footer.tsx               # Dynamic brand footer, hours & social links
        ├── WhatsAppOrderButton.tsx  # Floating WhatsApp concierge widget
        ├── ToastContainer.tsx       # Accessible toast notifications
        └── admin/                   # Owner Admin Console suite
            ├── AdminLayout.tsx
            ├── AdminHeader.tsx
            ├── AdminSidebar.tsx
            ├── DashboardOverview.tsx
            ├── ProductManagement.tsx
            ├── CategoryManagement.tsx
            ├── InventoryManagement.tsx
            ├── BulkInventoryModal.tsx
            ├── BulkImageManagerModal.tsx
            ├── OrderManagement.tsx
            ├── DeliveryZoneManagement.tsx
            ├── CouponManagement.tsx
            ├── CustomerManagement.tsx
            ├── ReportsSection.tsx
            ├── SubscriptionSection.tsx
            └── SettingsSection.tsx
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Provision brand, license, currency & owner password via CLI
npm run init

# 3. Start development server on http://localhost:3000
npm run dev
```

For production build & launch:
```bash
npm run lint
npm run build
npm start
```

---

## 📄 Documentation Suite
- **[Product Introduction & Sales Pitch (`./PRODUCT_PITCH.md`)](./PRODUCT_PITCH.md)** — Buyer-ready marketing overview, ROI highlights, plan comparison & use cases to share with prospects.
- **[Walkthrough Guide (`./WALKTHROUGH.md`)](./WALKTHROUGH.md)** — Step-by-step visual/functional guides for Store Owners, Customers, and Resellers.
- **[Deployment & Provisioning Guide (`./DEPLOYMENT.md`)](./DEPLOYMENT.md)** — Local testing, `npm run init` flags, Docker, Cloud Run, Render/Railway & VPS hosting.
- **[Technical & Data Layer Guide (`./TECHNICAL_GUIDE.md`)](./TECHNICAL_GUIDE.md)** — Repository architecture, security practices, reseller technical requirements & API schemas.
