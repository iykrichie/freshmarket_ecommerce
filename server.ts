import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', store: 'FreshMarket Global API', timestamp: new Date().toISOString() });
  });

  // Example API endpoints for system integrity
  app.get('/api/store-info', (_req, res) => {
    res.json({
      name: 'FreshMarket Global',
      currency: 'GBP',
      currencySymbol: '£',
      supportPhone: '+44 20 7946 0912',
      whatsappNumber: '447911123456',
      email: 'orders@freshmarketglobal.com',
      freeDeliveryThreshold: 50,
      operationalHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FreshMarket Foodstuff Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
