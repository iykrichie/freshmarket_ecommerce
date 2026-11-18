# 📖 FreshMarket Global — End-to-End Walkthrough Guides

This guide walks **Store Owners (Buyers)**, **Customers**, and **Resellers/Operators** through every core workflow in the platform.

---

## Guide 1: Store Owner One-Time Setup Walkthrough

When launching a freshly shipped store instance (`SETUP_REQUIRED=true`, `?setup=1`, or clicking **Launch Setup Wizard** from the top notice / **Admin → Subscription & Setup**), follow the 6-step wizard:

1. **Step 1 — Subscription & License**
   - Pick your plan tier (**Starter Store**, **Growth Pro**, or **Enterprise Multi-Hub**) and toggle **Monthly** or **Annual (-18%)**.
   - Enter your license key (`FM-GRW-...`) or click **Generate** for a local activation key, then enter subscriber company name, billing email, and optional custom domain.
2. **Step 2 — Brand & Storefront**
   - Enter your **Store / Brand Name**, **Tagline**, upload a custom logo (compressed automatically) or paste an image URL, and customize your top announcement bar and hero headline.
3. **Step 3 — Contact, Currency & Socials**
   - Pick a quick currency preset (**GBP £**, **USD $**, **NGN ₦**, **EUR €**, **CAD C$**) or enter any custom code/symbol.
   - Set your **Free Delivery Threshold**, **Support Phone**, **WhatsApp Number** (digits only, with country code), **Hub Address**, **Operational Hours**, and social media URLs.
4. **Step 4 — Payments & Payout Bank**
   - Toggle which checkout methods customers see (`Credit / Debit Card`, `Direct Bank Transfer`, `Apple Pay / Google Pay`, `Pay on Delivery`).
   - Enter your bank name, account name, account number, and optional sort/routing code.
5. **Step 5 — Delivery Zones & Catalog Seeding**
   - Choose a regional template (**UK Local & Global Export**, **West Africa City Express**, **North America Grocery**, or **Keep Current Zones**).
   - Select **Keep Curated Starter Catalog** to launch immediately, or **Start with Clean Product Slate** if importing your own spreadsheet right away.
6. **Step 6 — Owner Security & Launch**
   - Replace the factory password with your private **Owner Admin Email** and **Password** (minimum 6 characters).
   - Optionally check **Also download backup store bundle (.json)**, review the readiness summary, and click **Launch Storefront** or **Launch & Open Admin**.

Once completed, the setup notice disappears permanently for shoppers, and your configuration is persisted both in browser state and on the server (`data/tenant-config.json`).

---

## Guide 2: Daily Store Management Walkthrough (Owner Admin Console)

Click **Admin** in the top navigation bar and sign in with your owner credentials:

### 1. Managing Categories (`Categories`)
- Create, edit, or delete storefront departments with a 9-icon picker and descriptions.
- Renaming a category automatically updates all linked products and active storefront filters.

### 2. Managing Products & Multi-Size Variants (`Product Catalog`)
- Click **+ Add New Product** (or **Duplicate** any row to create variations fast).
- Set primary packaging unit (`50kg Bag`, `Paint Rubber`, `5L Bottle`, or type any custom unit), and use the **Multi-Size / Pack Variants** builder to add multiple purchasable sizes with per-size regular and sale prices.
- Use 1-click inline row badges to toggle **Featured**, **Best Seller**, or **Daily Deal**.

### 3. Bulk CSV / Excel Inventory Sync (`Inventory & Stock`)
1. Click **Bulk Upload CSV / Excel**.
2. Click **Download Template (.xlsx / .csv)** or **Export Current Inventory** to edit existing items offline.
3. Choose **Overwrite Stock** or **Add to Existing Stock**, optionally check **Allow Creating New Products**, and upload your `.xlsx`, `.xls`, or `.csv` file.
4. Review the row-by-row diff preview (`Update`, `New`, `Unchanged`, `Error`) and click **Apply Changes**.

### 4. Bulk Image Management (`Inventory & Stock` → `Bulk Manage Photos` or `Product Catalog`)
- Drag-and-drop multiple product photos at once.
- Files named with a Product ID (`prod-1.jpg`) or product keywords (`white-garri.jpg`) auto-match to their SKU; adjust any match manually via dropdown, choose **Replace Primary Image** or **Add to Gallery**, and apply in one click.

### 5. Delivery Zones & Promo Coupons (`Delivery Zones` / `Coupons & Promos`)
- **Delivery Zones**: Configure fee, **Min/Max Delivery Hours**, free-delivery threshold override, and neighborhood tags (type a neighborhood and press `Enter` or `,`), or use **+ Local Preset** / **+ Export Preset**.
- **Coupons**: Create percentage or fixed-amount promo codes with minimum order spend, expiration date, and usage limit; usage counts increment automatically when customers complete checkout.

### 6. Cloning or Moving a Store (`Store Settings` & `Subscription & Setup`)
- Click **Export Full Store (.json)** in **Store Settings** (or **Export Package** in **Subscription & Setup**) to save a complete white-label snapshot (branding, categories, catalog, zones, coupons, subscription).
- Upload that `.json` file via **Restore Store Bundle** on any other instance to replicate the store in seconds.

---

## Guide 3: Customer Shopping & Care Package Walkthrough

1. **Browse & Filter**: Select your delivery region in the top header, click departments in the left **Category Sidebar** (or use quick filters like **Flash Deals**), or search by product name/tag.
2. **Choose Pack Size & Add to Cart**: Switch pack sizes directly on any product card or inside the product detail modal and click **Add to Cart**.
3. **Cart & Checkout**: Open the cart drawer, apply a promo code (or tap **Order via WhatsApp**), then click **Proceed to Checkout**.
   - Optional: Check **Send as Diaspora Care Package / Family Gift** to add a recipient name and personal gift note.
4. **Track Order & Download Receipt**: Immediately after checkout—or anytime via **Track Order** in the header—search by Order # (`FM-...`), Tracking Code (`TRK-...`), or phone number to view live dispatch status and download/print an official receipt.

---

## Guide 4: Reseller / Operator Provisioning Walkthrough

To spin up a dedicated instance for a new paying subscriber:

```bash
# Option A: Pre-configure completely from terminal / CI
npm run init -- --non-interactive \
  --store "Subscriber Store Name" \
  --plan growth \
  --cycle monthly \
  --currency USD \
  --symbol "$" \
  --email "support@subscriber.com" \
  --adminEmail "owner@subscriber.com" \
  --password "InitialOwnerPassword!" \
  --phone "+1 555 010 9900" \
  --whatsapp "15550109900"

# Option B: Ship blank and auto-open the 6-step Setup Wizard on buyer's first visit
npm run init -- --web-wizard

# Build and start production server
npm run build && npm start
```
