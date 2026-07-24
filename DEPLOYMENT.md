# 🚀 FreshMarket Global — Local Testing, Architecture & Deployment Guide

This comprehensive guide provides step-by-step instructions for **locally running & testing** FreshMarket Global, detailed breakdown of the **Frontend, Backend, and Data Storage Architecture**, and hosting deployment guides across **Google Cloud Run**, **Docker Containers**, **Render/Railway**, and **Linux VPS (Ubuntu/Nginx)**.

---

## 📋 Table of Contents
1. [Architecture & Technical Stack](#1-architecture--technical-stack)
   - [Frontend Architecture](#frontend-architecture)
   - [Backend Architecture](#backend-architecture)
   - [Data Storage & State Persistence](#data-storage--state-persistence)
2. [Local Development & Testing Guide](#2-local-development--testing-guide)
   - [Prerequisites](#prerequisites)
   - [Installation & Environment Setup](#installation--environment-setup)
   - [Running in Development Mode](#running-in-development-mode)
   - [Testing Production Build Locally](#testing-production-build-locally)
   - [Running Type & Linting Verification](#running-type--linting-verification)
   - [Running Visual Screenshot & Smoke Tests](#running-visual-screenshot--smoke-tests)
3. [Production Build Architecture](#3-production-build-architecture)
4. [Option 1: Google Cloud Run (Recommended Container Deployment)](#option-1-google-cloud-run-recommended-container-deployment)
5. [Option 2: Docker Container Deployment](#option-2-docker-container-deployment)
6. [Option 3: Render / Railway / Fly.io](#option-3-render--railway--flyio)
7. [Option 4: Linux VPS Setup (Ubuntu + PM2 + Nginx)](#option-4-linux-vps-setup-ubuntu--pm2--nginx)
8. [Environment Variables Reference](#environment-variables-reference)
9. [SSL & Custom Domain Configuration](#ssl--custom-domain-configuration)

---

## 1. Architecture & Technical Stack

FreshMarket Global is built as a full-stack Node.js web application engineered for optimal performance, instant client reactivity, and robust server-side security.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT (REACT 18)                       │
│  - Reactive UI & Unit Selectors  - Slide-Over Shopping Cart           │
│  - Multi-Step Checkout           - Order Tracker & PDF Receipt Generator│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / Vite Middleware
┌───────────────────────────────────▼────────────────────────────────────┐
│                        NODE.JS EXPRESS BACKEND                         │
│  - Development: Express + Vite Middleware (tsx server.ts)              │
│  - Production: Standalone Bundled CommonJS (node dist/server.cjs)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       DATA STORAGE & PERSISTENCE                       │
│  - LocalStorage Engine (freshmarket_store_data_v1)                      │
│  - Hydrated React Context State (Products, Cart, Orders, Admin Settings)│
│  - Express API Proxy Endpoints for Future Firestore / Cloud SQL DBs    │
└────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture
- **Core Library:** React 18.3 with TypeScript (strict type compliance).
- **Styling:** Tailwind CSS with Lucide React Icons for vector iconography and Motion (`motion/react`) for smooth route transitions and modal dialogs.
- **Client Utilities:** Custom PDF/HTML print and download engine (`receiptGenerator.ts`) enabling printable receipts without external dynamic dependencies.
- **Modular Components:** Divided into clean functional domains (`CartDrawer`, `CheckoutModal`, `OrderTrackingModal`, `AdminDashboard`, `ProductCard`, etc.).

### Backend Architecture
- **Runtime:** Node.js Express server (`server.ts`).
- **Development Integration:** Express mounts Vite middleware (`createViteServer`) during development mode (`process.env.NODE_ENV !== "production"`) for hot module replacement (HMR) and SPA routing fallback.
- **Production Bundle:** Compiles backend TypeScript to CommonJS (`dist/server.cjs`) via `esbuild`, bundling relative paths and bypassing Node ESM runtime restrictions for fast cold starts in Cloud Run containers.

### Data Storage & State Persistence
- **Client-Side Storage Engine:** Application state (products, customer cart, live orders, discount codes, delivery zone rates, and owner admin credentials) is managed via `StoreContext.tsx`.
- **LocalStorage Persistence:** State automatically synchronizes with browser `localStorage` under the key `freshmarket_store_data_v1`. This ensures user cart items, order tracking numbers, and custom admin updates persist across browser restarts and offline reloads.
- **Extensible Database Integration:** The Express server (`server.ts`) is designed with proxy route structures (`/api/*`), making it seamlessly pluggable into cloud databases like **Firebase Firestore** or **Cloud SQL (PostgreSQL)** for multi-device sync without exposing secrets client-side.

---

## 2. Local Development & Testing Guide

Follow these steps to run, test, and verify the application on your local workstation.

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`) or **bun** (`bun -v`)

### Installation & Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/freshmarket-global.git
   cd freshmarket-global
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Note: Default configuration works out of the box on port 3000.*

---

### Running in Development Mode

To launch the full-stack application with Vite live reloading:

```bash
npm run dev
```

- **Application URL:** [http://localhost:3000](http://localhost:3000)
- **Health Check Endpoint:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

In development mode, `tsx server.ts` starts Express and hooks into Vite's middleware, allowing instant code changes on both client components and server code.

---

### Testing Production Build Locally

Before deploying to production (e.g. Cloud Run or Docker), test the bundled build on your machine:

1. **Compile the production assets:**
   ```bash
   npm run build
   ```
   *This generates static SPA files in `dist/` and the compiled server entry point at `dist/server.cjs`.*

2. **Launch the standalone production server:**
   ```bash
   npm start
   ```

3. **Verify local production server:**
   Open [http://localhost:3000](http://localhost:3000) in your browser. Verify that page routing, cart drawer interactions, checkout flow, order tracking, and receipt downloads work seamlessly.

---

### Running Type & Linting Verification

Run TypeScript type checks to ensure there are no compilation errors:

```bash
npm run lint
```

If the command completes cleanly without output, all TypeScript definitions, components, and backend route signatures are valid.

---

### Running Visual Screenshot & Smoke Tests

The project includes an automated Puppeteer script for capturing high-resolution UI screenshots:

```bash
node scripts/capture.js
```

Screenshots will be generated and saved in `public/screenshots/`:
- `hero_storefront.png`
- `product_catalog.png`
- `full_storefront.png`

---

## 3. Production Build Architecture

FreshMarket Global utilizes an integrated Express + Vite full-stack node runtime:

```
npm run build
  ├── 1. vite build ──> Bundles React SPA into /dist (static HTML, JS, CSS)
  └── 2. esbuild server.ts ──> Bundles Node server into /dist/server.cjs (CommonJS)

npm start
  └── Executes `node dist/server.cjs` listening on 0.0.0.0:3000
```

---

## Option 1: Google Cloud Run (Recommended Container Deployment)

Google Cloud Run provides serverless, auto-scaling container hosting that scales down to zero when idle.

### Step 1: Create a `Dockerfile`
Create a `Dockerfile` in the root of your workspace:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build application (Vite + esbuild server compilation)
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built dist directory and package specs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

USER node

CMD ["node", "dist/server.cjs"]
```

### Step 2: Deploy to Google Cloud Run using gcloud CLI

```bash
# Set Google Cloud Project ID
gcloud config set project YOUR_GCP_PROJECT_ID

# Build and submit image to Google Artifact Registry / Container Registry
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/freshmarket-global:latest

# Deploy to Cloud Run
gcloud run deploy freshmarket-global \
  --image gcr.io/YOUR_GCP_PROJECT_ID/freshmarket-global:latest \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1
```

---

## Option 2: Docker Container Deployment

If running on Docker Desktop or Docker Swarm:

```bash
# 1. Build Docker image
docker build -t freshmarket-global:latest .

# 2. Run container mapping port 3000
docker run -d \
  --name freshmarket-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart always \
  freshmarket-global:latest
```

---

## Option 3: Render / Railway / Fly.io

### Render
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Create a **Web Service**.
3. Set Environment to **Node**.
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`
6. Set Port environment variable `PORT=3000`.

### Railway
1. Import repository into [Railway.app](https://railway.app).
2. Railway auto-detects `package.json` scripts.
3. Configure `PORT=3000`.

---

## Option 4: Linux VPS Setup (Ubuntu + PM2 + Nginx)

For deployment on AWS EC2, DigitalOcean Droplet, or Linode:

### 1. Install Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
```

### 2. Clone & Build Application
```bash
git clone https://github.com/your-username/freshmarket-global.git /var/www/freshmarket
cd /var/www/freshmarket
npm install
npm run build
```

### 3. Start Process with PM2
```bash
pm2 start dist/server.cjs --name "freshmarket" --env production
pm2 save
pm2 startup
```

### 4. Configure Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name freshmarketglobal.com www.freshmarketglobal.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Environment Variables Reference

Define these environment variables in your server configuration or `.env`:

| Variable Name | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `3000` | Server listening port |
| `NODE_ENV` | Yes | `production` | Node environment (`development` or `production`) |
| `GEMINI_API_KEY` | Optional | - | API key for Gemini AI intelligent store features |

---

## SSL & Custom Domain Configuration

### Using Certbot (Let's Encrypt) for Nginx:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d freshmarketglobal.com -d www.freshmarketglobal.com
```

Your FreshMarket Global application will now be live with full HTTPS encryption!
