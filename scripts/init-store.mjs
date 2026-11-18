#!/usr/bin/env node
/**
 * Self-Contained White-Label Store Initialization Script
 *
 * Usage:
 *   npm run init                   -> Interactive 6-step provisioning wizard
 *   npm run init -- --web-wizard   -> Marks server for first-run browser Setup Wizard (SETUP_REQUIRED=true)
 *   npm run init -- --help         -> Show CLI flags for automated subscription provisioning
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TENANT_CONFIG_PATH = path.join(DATA_DIR, 'tenant-config.json');
const ENV_PATH = path.join(ROOT_DIR, '.env');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function writeJsonAtomic(filePath, data) {
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

const PLANS = {
  starter: { id: 'starter', name: 'Starter Store', monthlyPrice: 29, maxProducts: 75, maxZones: 6, prefix: 'STR' },
  growth: { id: 'growth', name: 'Growth Pro', monthlyPrice: 79, maxProducts: 500, maxZones: 30, prefix: 'GRW' },
  enterprise: { id: 'enterprise', name: 'Enterprise Multi-Hub', monthlyPrice: 199, maxProducts: 10000, maxZones: 500, prefix: 'ENT' },
};

function generateKey(prefix) {
  const s1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const s2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FM-${prefix}-${s1}-${s2}`;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
White-Label Store Initialization Script
---------------------------------------
Interactive wizard:
  npm run init

Enable one-time browser Setup Wizard for buyer's first visit:
  npm run init -- --web-wizard

Non-interactive provisioning (for SaaS / subscription automation):
  npm run init -- --non-interactive \\
    --store "Kola Foods UK" \\
    --plan growth \\
    --cycle monthly \\
    --currency GBP \\
    --symbol "£" \\
    --email "owner@kolafoods.co.uk" \\
    --password "StrongPassword123" \\
    --phone "+44 7700 900123" \\
    --whatsapp "447700900123"
`);
    process.exit(0);
  }

  if (args['web-wizard']) {
    if (fs.existsSync(TENANT_CONFIG_PATH)) {
      fs.unlinkSync(TENANT_CONFIG_PATH);
    }
    const envContent = [
      'PORT=3000',
      'SETUP_REQUIRED="true"',
      `SUBSCRIPTION_PLAN="${args.plan || 'growth'}"`,
      `SUBSCRIPTION_LICENSE_KEY="${args.license || generateKey('GRW')}"`,
    ].join('\n');
    fs.writeFileSync(ENV_PATH, envContent + '\n', 'utf-8');
    console.log('\n[OK] Configured package for First-Run Browser Setup Wizard (SETUP_REQUIRED=true).');
    console.log('     Run `npm run build && npm start` — the buyer will complete setup on first visit.\n');
    process.exit(0);
  }

  let rl = null;
  const ask = async (label, fallback = '') => {
    if (args['non-interactive']) return fallback;
    if (!rl) rl = readline.createInterface({ input, output });
    const suffix = fallback ? ` [${fallback}]` : '';
    const answer = (await rl.question(`${label}${suffix}: `)).trim();
    return answer || fallback;
  };

  try {
    if (!args['non-interactive']) {
      console.log('\n============================================================');
      console.log('  WHITE-LABEL STOREFRONT — ONE-TIME SUBSCRIPTION SETUP');
      console.log('============================================================\n');
    }

    // Step 1: Subscription & License
    const planKey = (await ask('1. Subscription Plan (starter / growth / enterprise)', args.plan || 'growth')).toLowerCase();
    const plan = PLANS[planKey] || PLANS.growth;
    const billingCycle = (await ask('   Billing Cycle (monthly / annual)', args.cycle || 'monthly')).toLowerCase() === 'annual' ? 'annual' : 'monthly';
    const licenseKey = await ask('   Subscription License Key', args.license || generateKey(plan.prefix));
    const subscriberName = await ask('   Subscriber / Buyer Business Name', args.subscriber || 'FreshMarket Partner');
    const customDomain = await ask('   Subscriber Custom Domain (optional)', args.domain || '');

    // Step 2: Store Identity
    const storeName = await ask('\n2. Storefront Brand Name', args.store || subscriberName);
    const tagline = await ask('   Store Tagline', args.tagline || 'Foodstuff & Groceries');
    const currency = (await ask('   Currency Code (GBP, USD, NGN, EUR)', args.currency || 'GBP')).toUpperCase();
    const currencySymbol = await ask('   Currency Symbol (£, $, ₦, €)', args.symbol || (currency === 'USD' ? '$' : currency === 'NGN' ? '₦' : currency === 'EUR' ? '€' : '£'));
    const heroTitle = await ask('   Hero Main Headline', args.hero || `Authentic Foodstuff — Delivered Fresh by ${storeName}`);

    // Step 3: Contact & Location
    const supportPhone = await ask('\n3. Support Phone Number', args.phone || '+44 20 7946 0912');
    const whatsappNumber = await ask('   WhatsApp Number (country code, digits only)', args.whatsapp || '447911123456');
    const email = await ask('   Customer Support Email', args.email || 'orders@example.com');
    const address = await ask('   Store / Fulfillment Hub Address', args.address || 'Unit 4, Central Market Hub');
    const freeDeliveryThreshold = Number(await ask('   Free Delivery Threshold Amount', args.threshold || '50')) || 50;

    // Step 4: Payout Bank
    const bankName = await ask('\n4. Bank Name (for Transfer Checkout)', args.bank || 'Barclays Bank');
    const accountNumber = await ask('   Bank Account Number', args.account || '00000000');
    const sortCode = await ask('   Sort / Routing Code (optional)', args.sort || '');
    const accountName = await ask('   Bank Account Name', args.accountName || storeName);

    // Step 5: Owner Security
    const adminEmail = await ask('\n5. Owner Admin Login Email', args.adminEmail || email);
    const adminPassword = await ask('   Owner Admin Password', args.password || 'ChangeMe123!');

    const now = new Date();
    const renewsAt = new Date(now.getTime());
    if (billingCycle === 'annual') {
      renewsAt.setFullYear(renewsAt.getFullYear() + 1);
    } else {
      renewsAt.setMonth(renewsAt.getMonth() + 1);
    }

    const tenantConfig = {
      version: 2,
      initialized: true,
      initializedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      subscription: {
        planId: plan.id,
        planName: plan.name,
        status: 'active',
        billingCycle,
        licenseKey: licenseKey.toUpperCase(),
        subscriberName,
        subscriberEmail: adminEmail,
        customDomain,
        startedAt: now.toISOString(),
        renewsAt: renewsAt.toISOString(),
        monthlyPrice: plan.monthlyPrice,
        maxProducts: plan.maxProducts,
        maxZones: plan.maxZones,
        setupCompleted: true,
        setupCompletedAt: now.toISOString(),
      },
      storeSettings: {
        storeName,
        tagline,
        logoUrl: '',
        announcementText: `Same-day local delivery & express shipping from ${storeName}!`,
        heroBadge: 'Local Doorstep Express & Global Shipping',
        heroTitle,
        heroSubtitle: `Order fresh staples, groceries & care packages directly from ${storeName} with fast local dispatch and tracked delivery.`,
        footerDescription: `${storeName} — your trusted marketplace for fresh foodstuffs, pantry staples, and curated hampers.`,
        copyrightName: storeName,
        currency,
        currencySymbol,
        supportPhone,
        whatsappNumber: whatsappNumber.replace(/\D/g, ''),
        email,
        freeDeliveryThreshold,
        address,
        operationalHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
        acceptedPaymentMethods: ['paystack', 'bank_transfer', 'flutterwave', 'cod'],
        bankDetails: {
          bankName,
          accountNumber,
          sortCode,
          accountName,
        },
        adminCredentials: {
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
        },
      },
    };

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    writeJsonAtomic(TENANT_CONFIG_PATH, tenantConfig);

    const envLines = [
      'PORT=3000',
      'SETUP_REQUIRED="false"',
      `SUBSCRIPTION_PLAN="${plan.id}"`,
      `SUBSCRIPTION_LICENSE_KEY="${licenseKey.toUpperCase()}"`,
      `STORE_NAME="${storeName.replace(/"/g, '\\"')}"`,
      `STORE_CURRENCY="${currency}"`,
      `STORE_CURRENCY_SYMBOL="${currencySymbol}"`,
      `STORE_PHONE="${supportPhone}"`,
      `STORE_WHATSAPP="${whatsappNumber.replace(/\D/g, '')}"`,
      `STORE_EMAIL="${email}"`,
      `FREE_DELIVERY_THRESHOLD=${freeDeliveryThreshold}`,
      `ADMIN_EMAIL="${adminEmail}"`,
    ];
    fs.writeFileSync(ENV_PATH, envLines.join('\n') + '\n', 'utf-8');

    console.log('\n[OK] Store package initialized successfully!');
    console.log(`     Brand:        ${storeName} (${currency} ${currencySymbol})`);
    console.log(`     Plan:         ${plan.name} (${billingCycle}) — Key: ${licenseKey.toUpperCase()}`);
    console.log(`     Admin Login:  ${adminEmail}`);
    console.log('     Config saved: data/tenant-config.json & .env');
    console.log('\nNext step: Run `npm run build && npm start` (or `npm run dev` to test locally).\n');
  } finally {
    if (rl) rl.close();
  }
}

main().catch((err) => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
