import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function capture() {
  const dir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait 1s for any images/fonts
  await new Promise(r => setTimeout(r, 1500));

  console.log('Capturing Hero Storefront...');
  await page.screenshot({
    path: path.join(dir, 'hero_storefront.png'),
    clip: { x: 0, y: 0, width: 1280, height: 750 }
  });

  console.log('Capturing Product Catalog Grid...');
  await page.screenshot({
    path: path.join(dir, 'product_catalog.png'),
    clip: { x: 0, y: 650, width: 1280, height: 720 }
  });

  console.log('Capturing Full Storefront...');
  await page.screenshot({
    path: path.join(dir, 'full_storefront.png'),
    fullPage: false
  });

  await browser.close();
  console.log('Screenshots captured successfully in public/screenshots!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
