# 🚀 FreshMarket Global — Deployment & Hosting Guide

This guide provides step-by-step instructions for hosting and deploying **FreshMarket Global** across various cloud infrastructure platforms including **Google Cloud Run**, **Docker Containers**, **Render/Railway**, **Vercel/Netlify**, and **Linux VPS (Ubuntu/Nginx)**.

---

## 📋 Table of Contents
1. [Production Build Architecture](#1-production-build-architecture)
2. [Option 1: Google Cloud Run (Recommended Container Deployment)](#option-1-google-cloud-run-recommended-container-deployment)
3. [Option 2: Docker Container Deployment](#option-2-docker-container-deployment)
4. [Option 3: Render / Railway / Fly.io](#option-3-render--railway--flyio)
5. [Option 4: Linux VPS Setup (Ubuntu + PM2 + Nginx)](#option-4-linux-vps-setup-ubuntu--pm2--nginx)
6. [Environment Variables Reference](#environment-variables-reference)
7. [SSL & Custom Domain Configuration](#ssl--custom-domain-configuration)

---

## 1. Production Build Architecture

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
