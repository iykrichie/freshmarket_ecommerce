import * as XLSX from 'xlsx';
import { Category, Product, UnitType } from '../types';

export type StockUpdateMode = 'set' | 'add';

export interface ParsedInventoryRow {
  rowNumber: number;
  rawId?: string;
  name: string;
  category?: string;
  unit?: UnitType;
  price?: number;
  discountPrice?: number;
  stock?: number;
  origin?: string;
  weight?: string;
  description?: string;
  image?: string;
  galleryImages?: string[];
}

export interface BulkImportRowResult {
  rowNumber: number;
  action: 'update' | 'create' | 'unchanged' | 'error';
  matchedProduct?: Product;
  parsed: ParsedInventoryRow;
  computedNewStock?: number;
  computedPrice?: number;
  computedDiscountPrice?: number;
  changes: string[];
  errorMessage?: string;
}

const VALID_UNITS: UnitType[] = [
  '50kg Bag',
  '25kg Bag',
  '20kg Bag',
  '10kg Bag',
  '5kg Bag',
  'Paint Rubber',
  '5L Bottle',
  '4L Bottle',
  '1L Bottle',
  'Carton',
  'Crate',
  '1kg Pack',
  '1kg Box',
  '500g Tub',
  '5kg Box',
  'Case of 24',
  'Single Hen',
  'Tubers',
  'Basket',
  'Piece',
  'Bunch',
  'Diaspora Box',
  'Care Package',
  'Export Pack',
];

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';

const normalizeHeader = (header: string): string =>
  header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

const getField = (row: Record<string, unknown>, aliases: string[]): string | undefined => {
  for (const key of Object.keys(row)) {
    const normalized = normalizeHeader(key);
    if (aliases.includes(normalized)) {
      const val = row[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
  }
  return undefined;
};

const parseNumericField = (val: string | undefined): { value?: number; invalid: boolean } => {
  if (val === undefined) return { value: undefined, invalid: false };
  const cleaned = val.replace(/[₦$£€,\s]/g, '');
  if (cleaned === '') return { value: undefined, invalid: false };
  const num = Number(cleaned);
  if (Number.isNaN(num)) return { value: undefined, invalid: true };
  return { value: num, invalid: false };
};

const resolveUnit = (unitStr?: string): UnitType | undefined => {
  if (!unitStr) return undefined;
  const exact = VALID_UNITS.find((u) => u.toLowerCase() === unitStr.toLowerCase());
  return exact || (unitStr as UnitType);
};

const resolveCategory = (catStr: string | undefined, categories: Category[]): string | undefined => {
  if (!catStr) return undefined;
  const match = categories.find(
    (c) =>
      c.name.toLowerCase() === catStr.toLowerCase() ||
      c.slug.toLowerCase() === catStr.toLowerCase()
  );
  return match ? match.name : catStr;
};

export async function parseInventoryFile(
  file: File,
  existingProducts: Product[],
  categories: Category[],
  stockMode: StockUpdateMode,
  allowCreateNew: boolean
): Promise<BulkImportRowResult[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('The uploaded file does not contain any readable sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (rawRows.length === 0) {
    throw new Error('The uploaded spreadsheet is empty. Please add at least one product row.');
  }

  return rawRows.map((raw, idx) => {
    const rowNumber = idx + 2; // 1-indexed header + 1
    const rawId = getField(raw, ['id', 'productid', 'sku', 'itemcode']);
    const name = getField(raw, ['name', 'productname', 'itemname', 'title', 'product', 'item']) || '';
    const categoryRaw = getField(raw, ['category', 'cat', 'department']);
    const unitRaw = getField(raw, ['unit', 'packagingunit', 'packsize', 'uom']);
    const priceRaw = getField(raw, ['price', 'regularprice', 'unitprice', 'sellingprice']);
    const discountRaw = getField(raw, ['discountprice', 'saleprice', 'promo', 'promoprice']);
    const stockRaw = getField(raw, ['stock', 'quantity', 'qty', 'newstock', 'stockqty', 'inventory']);
    const origin = getField(raw, ['origin', 'source', 'supplier']);
    const weight = getField(raw, ['weight', 'netweight']);
    const description = getField(raw, ['description', 'desc', 'details']);
    const rawImage = getField(raw, ['image', 'imageurl', 'photo', 'photourl', 'primaryimage']);
    const rawGallery = getField(raw, ['galleryimages', 'images', 'gallery', 'additionalimages']);

    const image =
      rawImage && rawImage !== '[Embedded Local Image]' ? rawImage : undefined;

    const galleryImages = rawGallery
      ? rawGallery
          .split(/[|,]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s !== '[Embedded Local Image]')
      : undefined;

    const parsedPrice = parseNumericField(priceRaw);
    const parsedDiscount = parseNumericField(discountRaw);
    const parsedStock = parseNumericField(stockRaw);

    const parsed: ParsedInventoryRow = {
      rowNumber,
      rawId,
      name,
      category: resolveCategory(categoryRaw, categories),
      unit: resolveUnit(unitRaw),
      price: parsedPrice.value,
      discountPrice: parsedDiscount.value,
      stock: parsedStock.value,
      origin,
      weight,
      description,
      image,
      galleryImages,
    };

    if (parsedPrice.invalid) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: `Invalid price value "${priceRaw}". Must be a number.`,
      };
    }

    if (parsedDiscount.invalid) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: `Invalid discount price "${discountRaw}". Must be a number.`,
      };
    }

    if (parsedStock.invalid) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: `Invalid stock quantity "${stockRaw}". Must be a whole number.`,
      };
    }

    // Match existing product by ID first, then exact case-insensitive Name
    const matchedProduct = existingProducts.find(
      (p) =>
        (rawId && p.id.toLowerCase() === rawId.toLowerCase()) ||
        (name && p.name.toLowerCase() === name.toLowerCase())
    );

    if (matchedProduct) {
      const changes: string[] = [];
      let computedNewStock = matchedProduct.stock;

      if (parsed.stock !== undefined) {
        if (parsed.stock < 0 && stockMode === 'set') {
          return {
            rowNumber,
            action: 'error',
            matchedProduct,
            parsed,
            changes: [],
            errorMessage: 'Stock quantity cannot be negative.',
          };
        }
        computedNewStock =
          stockMode === 'add'
            ? Math.max(0, matchedProduct.stock + Math.round(parsed.stock))
            : Math.max(0, Math.round(parsed.stock));
        if (computedNewStock !== matchedProduct.stock) {
          changes.push(`Stock: ${matchedProduct.stock} → ${computedNewStock}`);
        }
      }

      const computedPrice =
        parsed.price !== undefined ? Math.max(0, parsed.price) : matchedProduct.price;
      if (parsed.price !== undefined && computedPrice !== matchedProduct.price) {
        changes.push(`Price: ${matchedProduct.price} → ${computedPrice}`);
      }

      const computedDiscountPrice =
        parsed.discountPrice !== undefined
          ? Math.max(0, parsed.discountPrice)
          : matchedProduct.discountPrice;
      if (
        parsed.discountPrice !== undefined &&
        computedDiscountPrice !== matchedProduct.discountPrice
      ) {
        changes.push(
          `Discount: ${matchedProduct.discountPrice ?? 'None'} → ${computedDiscountPrice}`
        );
      }

      if (parsed.name && parsed.name !== matchedProduct.name) {
        changes.push(`Name updated`);
      }
      if (parsed.category && parsed.category !== matchedProduct.category) {
        changes.push(`Category: ${parsed.category}`);
      }
      if (parsed.unit && parsed.unit !== matchedProduct.unit) {
        changes.push(`Unit: ${parsed.unit}`);
      }
      if (parsed.origin && parsed.origin !== matchedProduct.origin) {
        changes.push(`Origin updated`);
      }
      if (parsed.image && parsed.image !== matchedProduct.image) {
        changes.push(`Image updated`);
      }
      if (parsed.galleryImages && parsed.galleryImages.length > 0) {
        changes.push(`Gallery (${parsed.galleryImages.length} photos)`);
      }

      return {
        rowNumber,
        action: changes.length > 0 ? 'update' : 'unchanged',
        matchedProduct,
        parsed,
        computedNewStock,
        computedPrice,
        computedDiscountPrice,
        changes,
      };
    }

    // New item handling
    if (!allowCreateNew) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: `Product "${name || rawId || 'Unknown'}" not found in current inventory.`,
      };
    }

    if (!name) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: 'Product Name is required to add a new inventory item.',
      };
    }

    if (parsed.price === undefined || parsed.price <= 0) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: `Valid positive Price is required for new product "${name}".`,
      };
    }

    if (parsed.stock !== undefined && parsed.stock < 0) {
      return {
        rowNumber,
        action: 'error',
        parsed,
        changes: [],
        errorMessage: 'Initial stock cannot be negative.',
      };
    }

    const initialStock = parsed.stock !== undefined ? Math.max(0, Math.round(parsed.stock)) : 0;

    return {
      rowNumber,
      action: 'create',
      parsed,
      computedNewStock: initialStock,
      computedPrice: parsed.price,
      computedDiscountPrice: parsed.discountPrice,
      changes: [
        `New product in ${parsed.category || categories[0]?.name || 'Grains & Flour'}`,
        `Initial stock: ${initialStock}`,
      ],
    };
  });
}

export function buildUpdatedAndNewProducts(
  results: BulkImportRowResult[],
  categories: Category[]
): {
  updatedProducts: Product[];
  newProducts: Omit<Product, 'id'>[];
} {
  const updatedProducts: Product[] = [];
  const newProducts: Omit<Product, 'id'>[] = [];

  for (const row of results) {
    if (row.action === 'update' && row.matchedProduct) {
      const m = row.matchedProduct;
      const p = row.parsed;
      const primaryImg = p.image || m.image;
      const mergedGallery =
        p.galleryImages && p.galleryImages.length > 0
          ? Array.from(new Set([primaryImg, ...p.galleryImages]))
          : p.image
          ? Array.from(new Set([p.image, ...(m.images || []).filter((img) => img !== m.image)]))
          : m.images;

      updatedProducts.push({
        ...m,
        name: p.name || m.name,
        category: p.category || m.category,
        unit: p.unit || m.unit,
        price: row.computedPrice ?? m.price,
        discountPrice: row.computedDiscountPrice,
        stock: row.computedNewStock ?? m.stock,
        origin: p.origin !== undefined ? p.origin : m.origin,
        weight: p.weight !== undefined ? p.weight : m.weight,
        description: p.description !== undefined ? p.description : m.description,
        image: primaryImg,
        images: mergedGallery,
      });
    } else if (row.action === 'create') {
      const p = row.parsed;
      const categoryFallback =
        categories.find((c) => c.name === (p.category || categories[0]?.name))?.image ||
        DEFAULT_FALLBACK_IMAGE;
      const img = p.image || p.galleryImages?.[0] || categoryFallback;
      const gallery =
        p.galleryImages && p.galleryImages.length > 0
          ? Array.from(new Set([img, ...p.galleryImages]))
          : [img];

      newProducts.push({
        name: p.name,
        category: p.category || categories[0]?.name || 'Grains & Flour',
        unit: p.unit || 'Paint Rubber',
        price: row.computedPrice ?? 0,
        discountPrice: row.computedDiscountPrice,
        stock: row.computedNewStock ?? 0,
        origin: p.origin || 'Local Supplier',
        weight: p.weight,
        description: p.description || `Fresh ${p.name} added via bulk inventory import.`,
        image: img,
        images: gallery,
        rating: 5.0,
        reviewsCount: 0,
        isFeatured: false,
        isBestSeller: false,
        isDailyDeal: false,
      });
    }
  }

  return { updatedProducts, newProducts };
}

const serializeImageCell = (url?: string): string => {
  if (!url) return '';
  return url.startsWith('data:') ? '[Embedded Local Image]' : url;
};

export function exportInventorySpreadsheet(
  products: Product[],
  format: 'xlsx' | 'csv',
  filenamePrefix = 'store_inventory'
): void {
  const rows = products.map((p) => ({
    ID: p.id,
    Name: p.name,
    Category: p.category,
    Unit: p.unit,
    Price: p.price,
    DiscountPrice: p.discountPrice ?? '',
    Stock: p.stock,
    Origin: p.origin ?? '',
    Weight: p.weight ?? '',
    Image: serializeImageCell(p.image),
    GalleryImages: (p.images || [])
      .map((img) => serializeImageCell(img))
      .filter(Boolean)
      .join(' | '),
    Description: p.description ?? '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

  const dateTag = new Date().toISOString().split('T')[0];
  if (format === 'xlsx') {
    XLSX.writeFile(workbook, `${filenamePrefix}_${dateTag}.xlsx`);
  } else {
    XLSX.writeFile(workbook, `${filenamePrefix}_${dateTag}.csv`, { bookType: 'csv' });
  }
}

export function downloadInventoryTemplate(format: 'xlsx' | 'csv', sampleProduct?: Product): void {
  const sampleRows = [
    {
      ID: sampleProduct?.id || 'prod-1',
      Name: sampleProduct?.name || 'Royal Parboiled Rice (20kg Bag)',
      Category: sampleProduct?.category || 'Grains & Flour',
      Unit: sampleProduct?.unit || '20kg Bag',
      Price: sampleProduct?.price || 38.5,
      DiscountPrice: sampleProduct?.discountPrice ?? 34.99,
      Stock: 45,
      Origin: sampleProduct?.origin || 'West Africa',
      Weight: sampleProduct?.weight || '20kg',
      Image: sampleProduct?.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      GalleryImages: (sampleProduct?.images || []).join(' | '),
      Description: sampleProduct?.description || 'Update existing product stock or price by keeping its ID.',
    },
    {
      ID: '',
      Name: 'Fresh Poundo Yam Flour (5kg Pack)',
      Category: 'Grains & Flour',
      Unit: '5kg Bag',
      Price: 18.0,
      DiscountPrice: '',
      Stock: 30,
      Origin: 'Benue State',
      Weight: '5kg',
      Image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
      GalleryImages: '',
      Description: 'Leave ID blank (or use a new name) to add a brand-new inventory item.',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Template');

  if (format === 'xlsx') {
    XLSX.writeFile(workbook, 'store_inventory_template.xlsx');
  } else {
    XLSX.writeFile(workbook, 'store_inventory_template.csv', { bookType: 'csv' });
  }
}
