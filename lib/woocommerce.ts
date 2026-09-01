import { CATEGORY_SEASON_OVERRIDES, STORE_BRAND, matchBrand } from "./brands";
import type { Catalog, Category, Product, ProductKind, Season, Segment } from "./types";

/**
 * Live WooCommerce REST v3 adapter.
 *
 * Enabled only when WC_BASE_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET are set.
 * It returns the exact same `Catalog` shape as `mock-data.ts`, so the engine is
 * unchanged between demo mode and the real store.
 */

const TIMEOUT_MS = 8000;

export function isLiveConfigured(): boolean {
  return Boolean(
    process.env.WC_BASE_URL &&
      process.env.WC_CONSUMER_KEY &&
      process.env.WC_CONSUMER_SECRET,
  );
}

function authHeader(): string {
  const token = Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`,
  ).toString("base64");
  return `Basic ${token}`;
}

async function wcFetch<T>(path: string, attempt = 0): Promise<T> {
  const base = (process.env.WC_BASE_URL ?? "").replace(/\/$/, "");
  const url = `${base}/wp-json/wc/v3/${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Authorization: authHeader(), Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`WooCommerce ${res.status} on ${path}`);
    return (await res.json()) as T;
  } catch (error) {
    if (attempt === 0) return wcFetch<T>(path, 1); // one retry, then give up
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// --- Inference helpers -----------------------------------------------------
// WooCommerce has no season/segment fields, so we read them off the Hebrew name.

const SUMMER_WORDS = ["קיץ", "סנדל", "כפכף", "בגד ים", "summer", "טי שירט"];
const WINTER_WORDS = ["חורף", "מעיל", "פוך", "סריג", "מגפ", "winter", "טרנינג"];

export function inferSeason(text: string): Season {
  const lower = text.toLowerCase();
  if (SUMMER_WORDS.some((w) => lower.includes(w.toLowerCase()))) return "summer";
  if (WINTER_WORDS.some((w) => lower.includes(w.toLowerCase()))) return "winter";
  return "all";
}

export function inferSegment(text: string): Segment {
  if (/ילד|לילדים|בנים|בנות|kids|junior/i.test(text)) return "kids";
  if (/נשים|לנשים|women/i.test(text)) return "women";
  return "men";
}

const KIND_RULES: Array<[RegExp, ProductKind]> = [
  [/קפוצון|סווטשירט|hoodie/i, "hoodie"],
  [/פולו|polo/i, "polo"],
  [/מכופתרת|חולצה מכופתרת|shirt/i, "shirt"],
  [/סריג|צמר|sweater/i, "sweater"],
  [/טי שירט|חולצה קצרה|t-?shirt/i, "tshirt"],
  [/מכנס|ג'ינס|ג׳ינס|jeans|pants/i, "pants"],
  [/מעיל|coat|jacket/i, "coat"],
  [/חליפת טרנינג|tracksuit/i, "tracksuit"],
  [/סנדל|כפכף|sandal/i, "sandal"],
  [/מגפ|boot/i, "boot"],
  [/נעל|סניקרס|sneaker|shoe/i, "sneaker"],
  [/תיק|ארנק|bag|wallet/i, "bag"],
];

export function inferKind(text: string): ProductKind {
  for (const [pattern, kind] of KIND_RULES) if (pattern.test(text)) return kind;
  return "tshirt";
}

/** Brand comes from the WooCommerce brand taxonomy when present, else the name. */
function inferBrand(name: string, fallback: string): string {
  return matchBrand(name)?.key ?? fallback;
}

/**
 * The season words are a heuristic and they get a few real categories wrong —
 * `חליפות טרנינג` sells all year, `טי שירט` would vanish for five months. An
 * override keyed by name or id wins.
 */
function categorySeason(name: string, id: number): Season {
  return (
    CATEGORY_SEASON_OVERRIDES[name] ??
    CATEGORY_SEASON_OVERRIDES[String(id)] ??
    inferSeason(name)
  );
}

/**
 * WooCommerce REST v3 does not return a `link` for product categories, so the URL
 * has to be built. zolpo.co.il serves bare Hebrew slugs; `WC_CATEGORY_BASE` covers
 * stores that keep the default `/product-category` prefix.
 */
function categoryUrl(slug: string): string {
  const base = (process.env.WC_BASE_URL ?? "").replace(/\/$/, "");
  const prefix = (process.env.WC_CATEGORY_BASE ?? "").replace(/^\/|\/$/g, "");
  return prefix ? `${base}/${prefix}/${slug}` : `${base}/${slug}`;
}

// --- Raw REST shapes (only the fields we use) ------------------------------

interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  link?: string;
}

interface WcProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  permalink: string;
  total_sales: number;
  date_created: string;
  stock_status: string;
  images?: Array<{ src: string }>;
  categories?: Array<{ id: number; name: string }>;
  brands?: Array<{ name: string }>;
}

function mapProduct(raw: WcProduct, fallbackBrand: string): Product {
  const brand = raw.brands?.[0]?.name ?? inferBrand(raw.name, fallbackBrand);
  const regular = Number.parseFloat(raw.regular_price);
  return {
    id: raw.id,
    name: raw.name,
    brand: brand.toUpperCase(),
    price: Number.parseFloat(raw.price) || 0,
    regularPrice: Number.isFinite(regular) && regular > 0 ? regular : undefined,
    imageUrl: raw.images?.[0]?.src,
    kind: inferKind(raw.name),
    colorHex: "#c8ccd4",
    categoryIds: (raw.categories ?? []).map((c) => c.id),
    totalSales: raw.total_sales ?? 0,
    createdAt: (raw.date_created ?? "").slice(0, 10),
    season: inferSeason(raw.name),
    url: raw.permalink,
    inStock: raw.stock_status !== "outofstock",
  };
}

export async function getWooCommerceCatalog(): Promise<Catalog> {
  if (!isLiveConfigured()) throw new Error("WooCommerce env vars are not set");

  const all = await wcFetch<WcCategory[]>(
    "products/categories?per_page=100&hide_empty=true",
  );

  const parent = all.find((c) => c.name.toUpperCase().includes("OUTLET"));
  if (!parent) throw new Error("No parent category containing 'OUTLET' was found");

  const categories: Category[] = all
    .filter((c) => c.parent === parent.id && c.count > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      url: c.link ?? categoryUrl(c.slug),
      brand: inferBrand(c.name, STORE_BRAND).toUpperCase(),
      segment: inferSegment(c.name),
      season: categorySeason(c.name, c.id),
      // The count the store itself reports — we only ever fetch the top few.
      productCount: c.count,
      parentId: parent.id,
    }));

  // Best sellers per category, plus the newest products across the whole store.
  const perCategory = await Promise.all(
    categories.map(async (category) => {
      const raw = await wcFetch<WcProduct[]>(
        `products?category=${category.id}&orderby=popularity&order=desc&per_page=8&status=publish&stock_status=instock`,
      );
      return raw.map((p) => mapProduct(p, category.brand));
    }),
  );

  const newest = await wcFetch<WcProduct[]>(
    "products?orderby=date&order=desc&per_page=8&status=publish",
  );

  const byId = new Map<number, Product>();
  for (const product of [...perCategory.flat(), ...newest.map((p) => mapProduct(p, STORE_BRAND))]) {
    const existing = byId.get(product.id);
    if (existing) {
      // Keep every category the product belongs to.
      existing.categoryIds = [
        ...new Set([...existing.categoryIds, ...product.categoryIds]),
      ];
    } else {
      byId.set(product.id, product);
    }
  }

  return {
    parentCategoryName: parent.name,
    parentCategoryUrl: parent.link ?? categoryUrl(parent.slug),
    categories,
    products: [...byId.values()],
    source: "woocommerce",
  };
}
