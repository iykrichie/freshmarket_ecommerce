# FreshMarket Global — E-Commerce & Diaspora Export Platform

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)

**FreshMarket Global** is a full-stack e-commerce web application engineered for selling authentic West African foodstuff, fresh tropical produce, and specialty dry goods both **locally (express doorstep delivery)** and **internationally (vacuum-sealed diaspora care packages)** across the UK, Europe, North America (USA & Canada), and Worldwide.

---

## 🎨 Visual Impression & App Screenshots

<div align="center">

### 🛒 1. Modern Customer Storefront & Product Showcase
*Interactive catalog with unit switching (Bags, Export Boxes), category filters, live search, and deal timers.*

![FreshMarket Customer Storefront Showcase](https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80)

<br/>

### 📦 2. Export-Grade Diaspora Care Package Packaging
*Vacuum-sealed packaging for smoked fish, garri, yams, and palm oil with personalized gift notes for loved ones overseas.*

![Vacuum Sealed Diaspora Export Packages](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80)

<br/>

### 🧾 3. Live Order Tracking & PDF Receipt Generation
*Real-time order status tracking with custom printable & downloadable PDF/HTML official receipts.*

![Order Tracking and Printable PDF Receipts](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80)

<br/>

### 🔒 4. Secured Business Owner Admin Dashboard
*Password-authenticated owner portal to manage live orders, stock inventory, delivery zones, and credentials.*

![Business Owner Admin Dashboard](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80)

</div>

---

## 🌟 Core Features & Functional Highlights

### 🛒 Dual-Scope Retail & Export Model
- **Local Doorstep Delivery:** Zone-based instant/same-day local deliveries (London borough zones, UK nationwide express).
- **International Air Export & Diaspora Care Packages:**
  - Export-grade vacuum packaging for smoked fish, stockfish, garri, yams, and palm oil.
  - Custom recipient delivery options with personal gift notes & care package cards.
  - Worldwide shipping matrix (Europe, USA & Canada Air Freight, Middle East & Asia).

### 🛍️ Customer Experience
- **Interactive Product Catalog:** Category filtering, unit selector (e.g., 50kg Bags, 20kg Bags, Diaspora Boxes, Export Packs), live search, tag filtering, and real-time stock counters.
- **Dynamic Price & Currency Support:** Real-time discount calculations, daily deal countdown timers, and unit price adjustments.
- **Smart Shopping Cart & Slide-Over Drawer:** Quantity adjustments, coupon promo codes, free delivery progress bar, and instant unit switching.
- **Multi-Step Checkout Flow:**
  - Address entry with local borough/international destination selector.
  - Special Diaspora Gift/Care Package options (Recipient Name & Custom Personal Message).
  - Multiple payment channels: Credit/Debit Card (Paystack/Stripe integration proxy), Instant Bank Transfer with Sort Code/Account numbers, and Cash on Delivery.
- **Live Order Tracking & PDF Receipts:** Real-time visual progress stepper (Order Placed ➔ Processing ➔ Packed & Vacuum Sealed ➔ In Transit ➔ Delivered) with one-click **PDF Receipt Generation** for printing and downloading.

### 🛠️ Admin Store Management Panel (Secured)
- **Owner Authentication:** Password-protected modal login safeguarding store management functions.
- **Real-time Order Dashboard:** Filter orders by status (Pending, Processing, Shipped, Delivered, Cancelled) and delivery zone type.
- **Inventory & Product Manager:** Add, edit, or delete items, update stock levels, toggle daily deals, and adjust pricing.
- **Delivery Zone Configurator:** Customize local borough delivery fees, minimum delivery times, and international air export rates.
- **Social Media & Credentials Settings:** Update Facebook/Instagram URLs and change admin credentials dynamically.

---

## 🏗️ Technology Stack

- **Frontend Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with Lucide React Icons & Motion animations
- **Backend Runtime:** Node.js Express server (`server.ts`) with custom API endpoints
- **Receipt Engine:** Pure client-side PDF/HTML receipt compiler & print document renderer (`receiptGenerator.ts`)
- **Build System:** Vite frontend builder + `esbuild` bundled CommonJS server compilation (`dist/server.cjs`)
- **Port & Ingress:** Port `3000` (Cloud Run container ingress compatible)

---

## 📁 Directory Structure

```
├── .env.example             # Required environment variable definitions
├── metadata.json            # AI Studio applet name and metadata
├── package.json             # App scripts and npm dependencies
├── server.ts                # Express backend server with Vite dev middleware
├── vite.config.ts           # Vite bundler configuration
├── DEPLOYMENT.md            # Detailed deployment & cloud hosting instructions
├── TECHNICAL_GUIDE.md       # Architecture, state management & API reference
├── src/
│   ├── App.tsx              # Main React Application & view router
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global CSS, Tailwind imports & print styles
│   ├── types/               # Global TypeScript definitions (`index.ts`)
│   ├── data/                # Mock data & default store configuration (`mockData.ts`)
│   ├── context/             # Store State Context Provider (`StoreContext.tsx`)
│   ├── utils/               # Helper utilities (`receiptGenerator.ts`)
│   └── components/          # Reusable UI components
│       ├── Header.tsx       # Store header, navigation & social launchers
│       ├── Footer.tsx       # Site footer with links, hours & social icons
│       ├── HeroBanner.tsx   # Promotional hero banner & quick tag search
│       ├── ProductCard.tsx  # Product display grid item with export badges
│       ├── ProductDetailModal.tsx # Full product modal with unit selector
│       ├── CartDrawer.tsx   # Slide-over cart drawer with promo codes
│       ├── CheckoutModal.tsx# Multi-step checkout & care package gift notes
│       ├── OrderTrackerModal.tsx # Visual order status tracking modal & receipt generator
│       ├── UserAuthModal.tsx# Customer account sign-in & OTP modal
│       ├── AdminLoginModal.tsx# Owner security login portal
│       ├── AdminDashboard.tsx# Admin store management suite
│       └── WhatsAppOrderButton.tsx # Floating instant WhatsApp ordering button
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18.0 or higher)
- `npm` or `bun` package manager

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Installation
Install dependencies:
```bash
npm install
```

### 4. Running Dev Server
Start the full-stack development server on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Execution

### 1. Build the Application
```bash
npm run build
```
This executes:
1. `vite build` to compile static assets into `dist/`
2. `esbuild server.ts` to bundle the backend server into `dist/server.cjs`

### 2. Launch Production Server
```bash
npm start
```
Starts Node.js running `dist/server.cjs` listening on `0.0.0.0:3000`.

---

## 📄 Documentation Links
- [Deployment & Cloud Hosting Guide](./DEPLOYMENT.md)
- [Technical Architecture Guide](./TECHNICAL_GUIDE.md)
