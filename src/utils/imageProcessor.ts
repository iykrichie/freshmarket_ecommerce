import { Category, Product } from '../types';

/**
 * Compresses an uploaded image file (PNG/JPG/WebP) via HTML5 Canvas into a
 * lightweight data URL so multiple product photos stay fast and fit cleanly
 * within browser persistence limits.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 900,
  quality = 0.82
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not a supported image file.`);
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not decode image "${file.name}".`));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return dataUrl;
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Prefer WebP when supported, fallback to JPEG
  const webpUrl = canvas.toDataURL('image/webp', quality);
  if (webpUrl.startsWith('data:image/webp')) {
    return webpUrl;
  }
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Normalizes a string or filename (strip extension, lowercase, alphanumeric only)
 * for automatic product matching during bulk photo uploads.
 */
export function normalizeMatchToken(input: string): string {
  const withoutExt = input.replace(/\.[^/.]+$/, '');
  return withoutExt.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Attempts to automatically match an uploaded image filename to a product
 * by Product ID, exact normalized name, or partial word overlap.
 */
export function matchFilenameToProduct(
  filename: string,
  products: Product[]
): Product | undefined {
  const baseName = filename.replace(/\.[^/.]+$/, '').toLowerCase();
  const normalizedFile = normalizeMatchToken(filename);
  if (!normalizedFile) return undefined;

  // 1. Exact ID match (e.g. "prod-1.jpg" or "prod-1_front.png")
  const idMatch = products.find((p) => {
    const normId = normalizeMatchToken(p.id);
    return normalizedFile === normId || normalizedFile.startsWith(normId);
  });
  if (idMatch) return idMatch;

  // 2. Exact normalized product name match
  const exactNameMatch = products.find((p) => normalizeMatchToken(p.name) === normalizedFile);
  if (exactNameMatch) return exactNameMatch;

  // 3. Token overlap scoring (e.g. "white-garri.jpg" -> "Fine White Ijebu Garri (5kg Bag)")
  const fileWords = baseName
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);

  if (fileWords.length === 0) return undefined;

  let bestProduct: Product | undefined;
  let bestScore = 0;

  for (const p of products) {
    const prodText = p.name.toLowerCase();
    let score = 0;
    for (const word of fileWords) {
      if (prodText.includes(word)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestProduct = p;
    }
  }

  return bestScore > 0 ? bestProduct : undefined;
}

export function getPresetImagesFromCategories(
  categories: Category[],
  products: Product[]
): { label: string; url: string }[] {
  const seen = new Set<string>();
  const presets: { label: string; url: string }[] = [];

  for (const cat of categories) {
    if (cat.image && !seen.has(cat.image)) {
      seen.add(cat.image);
      presets.push({ label: cat.name, url: cat.image });
    }
  }

  for (const prod of products) {
    if (prod.image && !seen.has(prod.image) && presets.length < 16) {
      seen.add(prod.image);
      presets.push({ label: prod.name, url: prod.image });
    }
  }

  return presets;
}
