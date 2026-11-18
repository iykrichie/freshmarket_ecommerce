# 🚀 Deployment, Local Testing & Subscription Provisioning Guide

This guide covers **local development and verification**, the **hybrid client/server data layer**, **one-time subscriber provisioning** (`npm run init` & Browser Setup Wizard), and production deployments across **Docker**, **Google Cloud Run**, **Render/Railway**, and **Ubuntu VPS (PM2 + Nginx)**.

---

## 1. Architecture Overview (Frontend, Backend & Data Layer)

FreshMarket Global is packaged as a **self-contained full-stack Node.js application** with zero external database dependencies required to boot:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     BROWSER CLIENT (REACT 19 + VITE)                    │
│  - Reactive Storefront + 6-Step First-Run Setup Wizard                  │
│  - StoreContext  ──►  StoreRepository (src/data/repository.ts)          │
│      • Schema-versioned localStorage cache (fm_schema_version = 2)      │
│      • Runtime input sanitization, cart stock clamping & snapshot checks│
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTP JSON API (/api/*)
┌───────────────────────────────────▼─────────────────────────────────────┐
│                    NODE.JS EXPRESS SERVER (server.ts)                   │
│  - Dev:  tsx server.ts (Express + Vite middleware on port 3000)         │
│  - Prod: node dist/server.cjs (esbuild CJS bundle + /dist static cache) │
│  - Security: x-powered-by disabled, nosniff, no-referrer, scrypt auth   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Atomic Temp-File + Rename Writes
┌───────────────────────────────────▼─────────────────────────────────────┐
│                 SELF-CONTAINED SERVER STORAGE (/data)                   │
│  - data/tenant-config.json : Brand settings, scrypt hash, catalog,      │
│                              categories, zones, coupons & subscription  │
│  - data/orders.json        : Server-persisted order ledger & tracking   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Layer Best Practices Built In
1. **Repository Abstraction (`src/data/repository.ts`)**: Isolates storage serialization, schema migrations, runtime validation, and `fetch` calls away from UI components.
2. **Atomic Disk Persistence (`server.ts` & `scripts/init-store.mjs`)**: Writes JSON to a process-scoped temporary file before calling `fs.renameSync`, preventing truncated config or order files on crash/restart.
3. **Salted `scrypt` Password Hashing**: Owner passwords saved to `data/tenant-config.json` are hashed using `crypto.scryptSync` with a 16-byte random salt and verified via `crypto.timingSafeEqual`. Public `/api/bootstrap` responses strip password hashes completely.
4. **Offline-Resilient Dual Persistence**: Customers get zero-latency cart/catalog interaction via `localStorage` while orders, stock deductions, and store initialization sync cleanly to the Express backend when running in full-stack mode.

---

## 2. Local Development & Verification

### Prerequisites
- **Node.js**: v18.0+ (v20 LTS recommended)
- **npm**: v9.0+

### Setup & Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Create local environment file
cp .env.example .env

# 3. Start full-stack dev server (Express + Vite on port 3000)
npm run dev
```
Open:
- **Storefront**: `http://localhost:3000`
- **Health Probe**: `http://localhost:3000/api/health`
- **Bootstrap State**: `http://localhost:3000/api/bootstrap`
- **Force Browser Setup Wizard**: `http://localhost:3000/?setup=1`

### Local Verification Commands
```bash
# TypeScript static type validation (must exit with 0 errors)
npm run lint

# Full production build (Vite SPA -> dist/ + Express -> dist/server.cjs)
npm run build

# Run the production bundle locally on http://localhost:3000
npm start
```

### Visual Screenshot Capture
```bash
node scripts/capture.js
```
Outputs updated storefront captures into `public/screenshots/`.

---

## 3. Provisioning the Package for Subscription Buyers

When shipping this package to a paying subscriber, choose either **Self-Service Onboarding** (buyer configures in browser) or **Zero-Touch CLI Provisioning** (you pre-configure before handoff).

### Option A: Buyer Self-Service Browser Wizard
Prepare the instance so the 6-step **Setup Wizard** opens automatically on the buyer's first visit:

```bash
npm run init -- --web-wizard
npm run build
npm start
```
This sets `SETUP_REQUIRED="true"` in `.env` and clears any prior `data/tenant-config.json`. Once the buyer completes the 6 steps, the store writes `data/tenant-config.json` and locks the wizard (`initialized: true`) so shoppers never see it.

### Option B: Interactive Terminal Provisioning
```bash
npm run init
```
Walks through Plan Tier (`starter` / `growth` / `enterprise`), Billing Cycle, License Key generation, Brand Name, Currency, WhatsApp/Phone, Payout Bank Details, and Owner Admin Login.

### Option C: Automated / CI Non-Interactive Provisioning
```bash
npm run init -- --non-interactive \
  --store "Kola Foods UK" \
  --plan growth \
  --cycle annual \
  --currency GBP \
  --symbol "£" \
  --email "orders@kolafoods.co.uk" \
  --adminEmail "owner@kolafoods.co.uk" \
  --password "StrongBuyerPassword123!" \
  --phone "+44 7700 900123" \
  --whatsapp "447700900123"
```
Then build and start:
```bash
npm run build && npm start
```

---

## 4. Docker Deployment (with Persistent `/app/data` Volume)

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME ["/app/data"]

EXPOSE 3000
USER node
CMD ["node", "dist/server.cjs"]
```

Build and run with persistent tenant data mounted:
```bash
docker build -t freshmarket-storefront:latest .

docker run -d \
  --name buyer-store-01 \
  -p 3000:3000 \
  -v $(pwd)/tenant-data:/app/data \
  -e SETUP_REQUIRED=true \
  --restart unless-stopped \
  freshmarket-storefront:latest
```

---

## 5. Google Cloud Run Deployment

```bash
gcloud config set project YOUR_GCP_PROJECT_ID

gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/freshmarket-storefront:latest

gcloud run deploy freshmarket-storefront \
  --image gcr.io/YOUR_GCP_PROJECT_ID/freshmarket-storefront:latest \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "NODE_ENV=production,SETUP_REQUIRED=true"
```

> **Note on Serverless Containers**: Because Cloud Run container filesystems are ephemeral across revisions/scale-to-zero, mount a Cloud Storage FUSE volume to `/app/data` or attach a managed database (Firestore / Cloud SQL) for long-lived multi-revision persistence.

---

## 6. Render / Railway Deployment

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Persistent Disk (Recommended)**: Mount a disk at `/app/data` so `tenant-config.json` and `orders.json` survive redeploys.
- **Port**: `PORT=3000`

---

## 7. Ubuntu VPS (PM2 + Nginx + Let's Encrypt SSL)

```bash
# Install Node 20, Nginx, and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# Deploy & initialize store
cd /var/www/buyer-store
npm install
npm run init          # Provision brand, subscription & owner password
npm run build
pm2 start dist/server.cjs --name "buyer-store" --env production
pm2 save && pm2 startup
```

Configure Nginx reverse proxy (`/etc/nginx/sites-available/buyer-store`):
```nginx
server {
    listen 80;
    server_name shop.buyerdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Enable HTTPS:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.buyerdomain.com
```

---

## 8. Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `3000` | Express server listening port |
| `NODE_ENV` | Prod | `production` | `development` mounts Vite HMR; `production` serves `dist/` |
| `SETUP_REQUIRED` | Optional | `false` | Set `true` to auto-launch the 1-time Setup Wizard on first visit |
| `SUBSCRIPTION_PLAN` | Optional | `growth` | Initial tier (`starter`, `growth`, `enterprise`) |
| `SUBSCRIPTION_LICENSE_KEY` | Optional | `FM-GRW-TRIAL-2026` | Pre-assigned license key |
| `STORE_NAME` | Optional | `FreshMarket Global` | Fallback brand name prior to `tenant-config.json` initialization |
| `STORE_CURRENCY` | Optional | `GBP` | ISO currency code (`GBP`, `USD`, `NGN`, `EUR`, etc.) |
| `STORE_CURRENCY_SYMBOL` | Optional | `£` | Display symbol (`£`, `$`, `₦`, `€`) |
| `STORE_PHONE` | Optional | `+44 20 7946 0912` | Store support telephone |
| `STORE_WHATSAPP` | Optional | `447911123456` | WhatsApp digits without `+` |
| `STORE_EMAIL` | Optional | `orders@freshmarketglobal.com` | Customer support email |
| `FREE_DELIVERY_THRESHOLD` | Optional | `50` | Minimum subtotal for free shipping |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional | - | Optional env override when `tenant-config.json` is absent |
