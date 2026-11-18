import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const DATA_DIR = path.join(process.cwd(), 'data');
const TENANT_CONFIG_PATH = path.join(DATA_DIR, 'tenant-config.json');
const ORDERS_PATH = path.join(DATA_DIR, 'orders.json');

interface TenantConfig {
  version: number;
  initialized: boolean;
  initializedAt?: string;
  updatedAt?: string;
  subscription?: Record<string, unknown>;
  storeSettings?: {
    storeName?: string;
    adminCredentials?: {
      email?: string;
      passwordHash?: string;
    };
    [key: string]: unknown;
  };
  categories?: unknown[];
  products?: Array<{ id: string; stock: number; [key: string]: unknown }>;
  deliveryZones?: unknown[];
  coupons?: Array<{ code: string; usageCount: number; [key: string]: unknown }>;
}

interface StoredOrder {
  id: string;
  orderNumber: string;
  trackingCode: string;
  status: string;
  paymentStatus: string;
  items: Array<{ product: { id: string; name: string }; quantity: number; [key: string]: unknown }>;
  couponCode?: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    deliveryAddress?: string;
    community?: string;
    [key: string]: unknown;
  };
  driverInfo?: { name: string; phone: string };
  [key: string]: unknown;
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath: string, data: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
    return true;
  } catch (err) {
    console.warn(`Unable to atomically persist ${path.basename(filePath)}:`, err);
    return false;
  }
}

function hashPassword(password: string): string {
  if (!password) return '';
  if (password.startsWith('scrypt:')) return password;
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(plain: string, stored?: string): boolean {
  if (!plain || !stored) return false;
  if (stored.startsWith('scrypt:')) {
    const [, salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const derived = crypto.scryptSync(plain, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  }
  return plain === stored;
}

function hashSettingsCredentials(
  storeSettings: TenantConfig['storeSettings'],
  existing?: TenantConfig['storeSettings']
): TenantConfig['storeSettings'] {
  if (!storeSettings) return existing;
  const incomingPass = storeSettings.adminCredentials?.passwordHash;
  const resolvedHash = incomingPass
    ? hashPassword(incomingPass)
    : existing?.adminCredentials?.passwordHash;

  return {
    ...storeSettings,
    adminCredentials: {
      email:
        storeSettings.adminCredentials?.email ||
        existing?.adminCredentials?.email ||
        'admin@freshmarketglobal.com',
      ...(resolvedHash ? { passwordHash: resolvedHash } : {}),
    },
  };
}

function stripSensitiveCredentials(config: TenantConfig) {
  if (!config.storeSettings) return config;
  const { adminCredentials, ...safeSettings } = config.storeSettings;
  return {
    ...config,
    storeSettings: {
      ...safeSettings,
      adminCredentials: adminCredentials?.email
        ? { email: adminCredentials.email }
        : undefined,
    },
  };
}

function verifyOwnerCredentials(
  existing: TenantConfig | null,
  email?: string,
  password?: string
): boolean {
  const expectedEmail =
    existing?.storeSettings?.adminCredentials?.email ||
    process.env.ADMIN_EMAIL ||
    'admin@freshmarketglobal.com';
  const expectedPassword =
    existing?.storeSettings?.adminCredentials?.passwordHash ||
    process.env.ADMIN_PASSWORD ||
    'admin12345';

  if (!email || !password) return false;
  return (
    email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
    verifyPassword(password.trim(), expectedPassword)
  );
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // HTTP security hardening headers
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const config = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    res.json({
      status: 'ok',
      initialized: Boolean(config?.initialized),
      timestamp: new Date().toISOString(),
    });
  });

  // Bootstrap endpoint: supplies server-persisted store config without exposing password hashes
  app.get('/api/bootstrap', (_req, res) => {
    const config = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    if (config && config.initialized) {
      res.json({
        initialized: true,
        setupRequired: false,
        config: stripSensitiveCredentials(config),
      });
      return;
    }

    res.json({
      initialized: false,
      setupRequired: process.env.SETUP_REQUIRED === 'true',
      envDefaults: {
        storeName: process.env.STORE_NAME || undefined,
        currency: process.env.STORE_CURRENCY || undefined,
        currencySymbol: process.env.STORE_CURRENCY_SYMBOL || undefined,
        supportPhone: process.env.STORE_PHONE || undefined,
        whatsappNumber: process.env.STORE_WHATSAPP || undefined,
        email: process.env.STORE_EMAIL || undefined,
        licenseKey: process.env.SUBSCRIPTION_LICENSE_KEY || undefined,
        planId: process.env.SUBSCRIPTION_PLAN || undefined,
      },
    });
  });

  // One-time store initialization endpoint (atomic disk write + scrypt password hashing)
  app.post('/api/initialize', (req, res) => {
    const existing = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    const {
      storeSettings,
      categories,
      products,
      deliveryZones,
      coupons,
      subscription,
      auth,
    } = req.body || {};

    if (!storeSettings || !storeSettings.storeName) {
      res.status(400).json({ ok: false, error: 'Store name and settings are required.' });
      return;
    }

    if (existing?.initialized) {
      const authorized = verifyOwnerCredentials(existing, auth?.email, auth?.password);
      if (!authorized) {
        res.status(403).json({
          ok: false,
          error: 'Store is already initialized. Owner authentication required to overwrite.',
        });
        return;
      }
    }

    const now = new Date().toISOString();
    const nextConfig: TenantConfig = {
      version: 2,
      initialized: true,
      initializedAt: existing?.initializedAt || now,
      updatedAt: now,
      subscription: {
        ...(subscription || {}),
        setupCompleted: true,
        setupCompletedAt: now,
      },
      storeSettings: hashSettingsCredentials(storeSettings, existing?.storeSettings),
      categories: Array.isArray(categories) ? categories : existing?.categories,
      products: Array.isArray(products) ? products : existing?.products,
      deliveryZones: Array.isArray(deliveryZones) ? deliveryZones : existing?.deliveryZones,
      coupons: Array.isArray(coupons) ? coupons : existing?.coupons,
    };

    const persisted = writeJsonAtomic(TENANT_CONFIG_PATH, nextConfig);
    res.json({
      ok: true,
      persistedToDisk: persisted,
      initializedAt: nextConfig.initializedAt,
    });
  });

  // Verify owner admin login against server-persisted scrypt credentials
  app.post('/api/admin/login', (req, res) => {
    const existing = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    const { email, password } = req.body || {};
    if (!existing?.initialized) {
      res.json({ ok: false, serverManaged: false });
      return;
    }
    const valid = verifyOwnerCredentials(existing, email, password);
    res.json({ ok: valid, serverManaged: true });
  });

  // Authenticated sync endpoint for ongoing admin updates
  app.post('/api/tenant/sync', (req, res) => {
    const existing = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    const { auth, storeSettings, categories, products, deliveryZones, coupons, subscription } =
      req.body || {};

    if (!verifyOwnerCredentials(existing, auth?.email, auth?.password)) {
      res.status(403).json({ ok: false, error: 'Invalid owner credentials for server sync.' });
      return;
    }

    const nextConfig: TenantConfig = {
      version: 2,
      initialized: true,
      initializedAt: existing?.initializedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: subscription ?? existing?.subscription,
      storeSettings: storeSettings
        ? hashSettingsCredentials(storeSettings, existing?.storeSettings)
        : existing?.storeSettings,
      categories: Array.isArray(categories) ? categories : existing?.categories,
      products: Array.isArray(products) ? products : existing?.products,
      deliveryZones: Array.isArray(deliveryZones) ? deliveryZones : existing?.deliveryZones,
      coupons: Array.isArray(coupons) ? coupons : existing?.coupons,
    };

    const persisted = writeJsonAtomic(TENANT_CONFIG_PATH, nextConfig);
    res.json({ ok: true, persistedToDisk: persisted, updatedAt: nextConfig.updatedAt });
  });

  // Server-side Order Ledger endpoints
  app.post('/api/orders', (req, res) => {
    const { order } = (req.body || {}) as { order?: StoredOrder };
    if (!order || !order.orderNumber || !Array.isArray(order.items)) {
      res.status(400).json({ ok: false, error: 'Invalid order payload.' });
      return;
    }

    const existingOrders = readJsonFile<StoredOrder[]>(ORDERS_PATH, []);
    const deduplicated = existingOrders.filter((o) => o.id !== order.id);
    const persistedOrders = writeJsonAtomic(ORDERS_PATH, [order, ...deduplicated].slice(0, 500));

    // Also deduct stock and increment coupon usage in tenant-config.json if initialized
    const tenant = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    if (tenant?.initialized && Array.isArray(tenant.products)) {
      const qtyByProductId = new Map<string, number>();
      for (const item of order.items) {
        const pid = item.product?.id;
        if (pid) {
          qtyByProductId.set(pid, (qtyByProductId.get(pid) || 0) + (Number(item.quantity) || 0));
        }
      }
      tenant.products = tenant.products.map((p) => {
        const used = qtyByProductId.get(p.id) || 0;
        return used > 0 ? { ...p, stock: Math.max(0, Number(p.stock) - used) } : p;
      });
      if (order.couponCode && Array.isArray(tenant.coupons)) {
        tenant.coupons = tenant.coupons.map((c) =>
          c.code === order.couponCode ? { ...c, usageCount: Number(c.usageCount || 0) + 1 } : c
        );
      }
      tenant.updatedAt = new Date().toISOString();
      writeJsonAtomic(TENANT_CONFIG_PATH, tenant);
    }

    res.json({ ok: true, persistedToDisk: persistedOrders, orderNumber: order.orderNumber });
  });

  // Public single-order lookup by orderNumber or trackingCode
  app.get('/api/orders/track', (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q || q.length < 3) {
      res.status(400).json({ ok: false, error: 'Order number or tracking code required.' });
      return;
    }
    const orders = readJsonFile<StoredOrder[]>(ORDERS_PATH, []);
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === q ||
        o.trackingCode.toLowerCase() === q
    );
    if (!found) {
      res.status(404).json({ ok: false, error: 'Order not found.' });
      return;
    }
    res.json({ ok: true, order: found });
  });

  // Owner-authenticated order status update
  app.patch('/api/orders/:id/status', (req, res) => {
    const existingTenant = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    const { status, driverInfo, auth } = req.body || {};
    if (existingTenant?.initialized && !verifyOwnerCredentials(existingTenant, auth?.email, auth?.password)) {
      res.status(403).json({ ok: false, error: 'Unauthorized order status update.' });
      return;
    }
    const orders = readJsonFile<StoredOrder[]>(ORDERS_PATH, []);
    const targetId = req.params.id;
    let updated = false;
    const nextOrders = orders.map((o) => {
      if (o.id !== targetId) return o;
      updated = true;
      return {
        ...o,
        status: status || o.status,
        ...(driverInfo ? { driverInfo } : {}),
        ...(status === 'delivered' ? { paymentStatus: 'paid' } : {}),
      };
    });
    if (updated) {
      writeJsonAtomic(ORDERS_PATH, nextOrders);
    }
    res.json({ ok: true, updated });
  });

  // Store metadata endpoint (prefers initialized tenant config, falls back to env vars)
  app.get('/api/store-info', (_req, res) => {
    const config = readJsonFile<TenantConfig | null>(TENANT_CONFIG_PATH, null);
    const s = config?.storeSettings as Record<string, unknown> | undefined;

    res.json({
      name: (s?.storeName as string) || process.env.STORE_NAME || 'FreshMarket Global',
      currency: (s?.currency as string) || process.env.STORE_CURRENCY || 'GBP',
      currencySymbol: (s?.currencySymbol as string) || process.env.STORE_CURRENCY_SYMBOL || '£',
      supportPhone: (s?.supportPhone as string) || process.env.STORE_PHONE || '+44 20 7946 0912',
      whatsappNumber: (s?.whatsappNumber as string) || process.env.STORE_WHATSAPP || '447911123456',
      email: (s?.email as string) || process.env.STORE_EMAIL || 'orders@freshmarketglobal.com',
      freeDeliveryThreshold:
        Number(s?.freeDeliveryThreshold) || Number(process.env.FREE_DELIVERY_THRESHOLD) || 50,
      operationalHours:
        (s?.operationalHours as string) ||
        process.env.OPERATIONAL_HOURS ||
        'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
      initialized: Boolean(config?.initialized),
    });
  });

  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Storefront server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
