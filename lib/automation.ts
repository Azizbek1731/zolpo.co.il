import {
  buildCategoryBanner,
  buildNewProductsBanner,
  buildSeasonBanner,
} from "./banner";
import { brandLogoUrl, isStoreBrand } from "./brands";
import {
  BRAND_PRIORITY,
  BRAND_STRIP,
  DEFAULT_MAX_ROWS,
  HEADLINE,
  MAX_ROWS,
  MENU_LINKS_HE,
  MIN_ROWS,
  NEW_PRODUCTS_SEGMENT,
} from "./config";
import { NEW_PRODUCTS_URL } from "./mock-data";
import { SEASON_BANNER, matchesSeason, resolveSeason } from "./season";
import type {
  BrandStrip,
  Catalog,
  Category,
  CategoryMenu,
  CategorySkip,
  GenerateOptions,
  HomepagePlan,
  HomepageRow,
  Product,
  Season,
  Segment,
} from "./types";

/**
 * The automation engine.
 *
 * Pure and deterministic: the same catalog + the same options always produce the
 * same plan, which is what makes the JSON export stable and the nightly cron job
 * safe to re-run.
 */

export const PRODUCTS_PER_ROW = 4;

/** The two special rows are not real WooCommerce categories. */
export const SYNTHETIC_NEW_PRODUCTS_ID = -1;
export const SYNTHETIC_SEASON_ID = -2;

const priorityIndex = (brand: string) => {
  const i = BRAND_PRIORITY.indexOf(brand.toUpperCase());
  return i === -1 ? BRAND_PRIORITY.length : i;
};

const bySalesDesc = (a: Product, b: Product) =>
  b.totalSales - a.totalSales || a.id - b.id;

const byNewestFirst = (a: Product, b: Product) =>
  b.createdAt.localeCompare(a.createdAt) || b.totalSales - a.totalSales || a.id - b.id;

const sellable = (p: Product) => p.inStock;

/** Total units sold across a category — used to rank categories after the brand list. */
function categorySales(category: Category, products: Product[]): number {
  return products
    .filter((p) => p.categoryIds.includes(category.id))
    .reduce((sum, p) => sum + p.totalSales, 0);
}

/**
 * Step 4: top best sellers of the category for the active season, backfilled
 * with the newest items from the same category when the season is too thin.
 */
export function pickRowProducts(
  category: Category,
  products: Product[],
  season: Season,
  limit = PRODUCTS_PER_ROW,
  /** Ids already placed elsewhere on the page — no product is shown twice. */
  exclude: ReadonlySet<number> = new Set(),
): Product[] {
  const inCategory = products.filter(
    (p) =>
      p.categoryIds.includes(category.id) && sellable(p) && !exclude.has(p.id),
  );

  const seasonal = inCategory
    .filter((p) => matchesSeason(p.season, season))
    .sort(bySalesDesc);

  if (seasonal.length >= limit) return seasonal.slice(0, limit);

  const chosen = new Set(seasonal.map((p) => p.id));
  const backfill = inCategory
    .filter((p) => !chosen.has(p.id))
    .sort(byNewestFirst)
    .slice(0, limit - seasonal.length);

  return [...seasonal, ...backfill];
}

/**
 * Steps 1 + 3: OUTLET children, season-filtered, brand-priority ordered.
 *
 * When the operator supplies an explicit allow-list from the admin console it wins
 * outright — both the membership and the order. Picking `מעילי פוך` in July is a
 * deliberate act, so the category-level season filter is skipped; products inside
 * the row are still season-preferred and backfilled as usual.
 */
export function rankCategories(
  catalog: Catalog,
  season: Season,
  categoryIds?: number[],
  skipped: CategorySkip[] = [],
): Category[] {
  if (categoryIds?.length) {
    const byId = new Map(catalog.categories.map((c) => [c.id, c]));
    const seen = new Set<number>();
    const resolved: Category[] = [];

    for (const id of categoryIds) {
      if (seen.has(id)) continue; // a repeated id would produce two rows with one key
      seen.add(id);
      const category = byId.get(id);
      if (category) resolved.push(category);
      // A WooCommerce re-import renumbers ids, so a saved order goes stale. Say so
      // rather than quietly shrinking the homepage.
      else skipped.push({ categoryId: id, reason: "unknown-id", available: 0 });
    }

    // If *nothing* resolved, fall through to the automatic ranking: a stale
    // allow-list must never leave the shop with a single row.
    if (resolved.length) return resolved;
  }

  const eligible: Category[] = [];
  for (const category of catalog.categories) {
    if (matchesSeason(category.season, season)) eligible.push(category);
    else
      skipped.push({
        categoryId: category.id,
        name: category.name,
        reason: "off-season",
        available: 0,
      });
  }

  return eligible
    .map((c) => ({ category: c, sales: categorySales(c, catalog.products) }))
    .sort(
      (a, b) =>
        priorityIndex(a.category.brand) - priorityIndex(b.category.brand) ||
        b.sales - a.sales ||
        a.category.id - b.category.id,
    )
    .map((entry) => entry.category);
}

/**
 * The OUTLET catalog drawer.
 *
 * Deliberately NOT season-filtered and NOT re-ordered per run: navigation has to
 * stay stable and complete, or a shopper could not reach winter coats in July.
 * It follows the catalog's own order and only annotates which categories the
 * automation put on the homepage today.
 */
export function buildCategoryMenu(
  catalog: Catalog,
  featuredIds: ReadonlySet<number>,
): CategoryMenu {
  return {
    titleHe: catalog.parentCategoryName,
    url: catalog.parentCategoryUrl,
    linksHe: MENU_LINKS_HE,
    items: catalog.categories.map((category) => ({
      id: category.id,
      label: category.name,
      url: category.url,
      brand: category.brand,
      segment: category.segment,
      season: category.season,
      // The live adapter only fetches the top few products per category, so its
      // own `count` is the only honest number to show in the navigation.
      productCount:
        category.productCount ??
        catalog.products.filter((p) => p.categoryIds.includes(category.id)).length,
      featured: featuredIds.has(category.id),
    })),
  };
}

/**
 * The full-width brand strip above the rows.
 *
 * Brands are harvested from the OUTLET categories *and* their products — the live
 * strip shows names that never appear in a category title — then ordered by the
 * priority list, then by units sold, so the strip reflects what actually moves.
 */
export function buildBrandStrip(catalog: Catalog): BrandStrip {
  const normalise = (brand: string) => brand.trim().toUpperCase();

  // First appearance in source order is the final tiebreak: it is stable across
  // nightly runs, unlike `localeCompare`, whose result depends on host ICU data
  // and would reorder Hebrew brand names unpredictably.
  const order = new Map<string, number>();
  const remember = (brand: string) => {
    const key = normalise(brand);
    if (key && !order.has(key)) order.set(key, order.size);
    return key;
  };

  // Tier 1: brands that own an OUTLET category. Tier 2: brands that only appear on
  // products. A brand owning a whole category must never sink below an incidental
  // one just because `total_sales` ticked overnight.
  const owned = new Map<string, number>();
  const productSales = new Map<string, number>();

  for (const category of catalog.categories) {
    const key = remember(category.brand);
    if (key) owned.set(key, (owned.get(key) ?? 0) + 1);
  }
  for (const product of catalog.products) {
    const key = remember(product.brand);
    if (key) productSales.set(key, (productSales.get(key) ?? 0) + product.totalSales);
  }

  const rank = (key: string) => order.get(key) ?? Number.MAX_SAFE_INTEGER;

  const tier1 = [...owned.keys()]
    .filter((key) => !isStoreBrand(key))
    .sort(
      (a, b) =>
        priorityIndex(a) - priorityIndex(b) ||
        (owned.get(b) ?? 0) - (owned.get(a) ?? 0) ||
        rank(a) - rank(b),
    );

  const tier2 = [...productSales.keys()]
    .filter((key) => !isStoreBrand(key) && !owned.has(key))
    .sort(
      (a, b) =>
        priorityIndex(a) - priorityIndex(b) ||
        (productSales.get(b) ?? 0) - (productSales.get(a) ?? 0) ||
        rank(a) - rank(b),
    );

  return {
    brands: [...tier1, ...tier2]
      .slice(0, BRAND_STRIP.maxBrands)
      .map((name) => ({ name, logoUrl: brandLogoUrl(name) })),
    titleHe: BRAND_STRIP.titleHe,
    subtitleHe: BRAND_STRIP.subtitleHe,
    ctaText: BRAND_STRIP.ctaText,
    ctaUrl: catalog.parentCategoryUrl,
  };
}

/** The segment shared by most of a product set — keeps the model choice sensible. */
function dominantSegment(products: Product[], categories: Category[]): Segment {
  const tally: Record<Segment, number> = { men: 0, women: 0, kids: 0 };
  for (const product of products) {
    for (const category of categories) {
      if (product.categoryIds.includes(category.id)) tally[category.segment] += 1;
    }
  }
  const ranked = (Object.keys(tally) as Segment[]).sort(
    (a, b) => tally[b] - tally[a] || a.localeCompare(b),
  );
  return ranked[0];
}

/** Synthetic categories so the two special rows share the `HomepageRow` shape. */
function newProductsCategory(segment: Segment): Category {
  return {
    id: SYNTHETIC_NEW_PRODUCTS_ID,
    name: "מוצרים חדשים בזולפה",
    slug: "מוצרים-חדשים",
    url: NEW_PRODUCTS_URL,
    brand: "ZOLPO OUTLET",
    segment,
    season: "all",
  };
}

function seasonCategory(
  season: Exclude<Season, "all">,
  segment: Segment,
  url: string,
  name: string,
): Category {
  return {
    id: SYNTHETIC_SEASON_ID,
    name,
    slug: `season-${season}`,
    url,
    brand: "ZOLPO OUTLET",
    segment,
    season,
  };
}

export function generateHomepage(
  catalog: Catalog,
  options: GenerateOptions = {},
): HomepagePlan {
  const {
    season: setting = "auto",
    now = new Date(),
    categoryIds,
    brandDiversity = true,
  } = options;
  const maxRows = Math.min(
    MAX_ROWS,
    Math.max(MIN_ROWS, options.maxRows ?? DEFAULT_MAX_ROWS),
  );
  const season = resolveSeason(setting, now);

  // Everything considered and dropped, so the console can answer "why isn't UGG
  // on the homepage?" instead of leaving the operator to guess.
  const skipped: CategorySkip[] = [];

  const ranked = rankCategories(catalog, season, categoryIds, skipped);
  const inStock = catalog.products.filter(sellable);
  // Nothing is allowed to appear twice on the page.
  const placed = new Set<number>();

  // ---- New products row (always first) -------------------------------------
  // Newest arrivals, still season-aware: a summer homepage should not open with
  // puffer coats just because they were uploaded yesterday.
  const bySeasonThenDate = [
    ...inStock.filter((p) => matchesSeason(p.season, season)).sort(byNewestFirst),
    ...inStock.filter((p) => !matchesSeason(p.season, season)).sort(byNewestFirst),
  ];
  const newest = bySeasonThenDate.slice(0, PRODUCTS_PER_ROW);
  newest.forEach((p) => placed.add(p.id));

  // Pinned, not derived: deriving it from the mix would flip the banner between
  // the man and the woman as stock changes, which is what requirement 8 forbids.
  const newRow: HomepageRow = {
    category: newProductsCategory(NEW_PRODUCTS_SEGMENT),
    products: newest,
    banner: buildNewProductsBanner(newest, NEW_PRODUCTS_SEGMENT),
  };

  // ---- Category rows -------------------------------------------------------
  const categoryRows: HomepageRow[] = [];
  // Two of the slots are reserved for the new-products and seasonal rows.
  const categorySlots = Math.max(1, maxRows - 2);

  // The store keeps several categories per brand (four for Ralph Lauren alone).
  // Taking them in raw rank order would fill the homepage with a single brand, so
  // the first pass allows one row per brand and a second pass tops up the rest.
  const usedBrands = new Set<string>();
  const deferred: Category[] = [];

  const addRow = (category: Category, firstPass: boolean): boolean => {
    const products = pickRowProducts(
      category,
      catalog.products,
      season,
      PRODUCTS_PER_ROW,
      placed,
    );
    if (products.length < PRODUCTS_PER_ROW) {
      // Never render a short row — a gap-toothed row looks broken, not automated.
      skipped.push({
        categoryId: category.id,
        name: category.name,
        reason: "insufficient-products",
        available: products.length,
      });
      return false;
    }

    const banner = buildCategoryBanner(category, products, categoryRows.length);

    // The cap has to guard the wordmark the shopper actually sees. Multi-brand
    // categories all carry the store as `category.brand` but render the brand that
    // dominates their own row, so keying the cap on the category would let two
    // rows print the same wordmark while the engine believed they differed.
    if (firstPass && brandDiversity && usedBrands.has(banner.brand)) {
      deferred.push(category);
      return false;
    }

    products.forEach((p) => placed.add(p.id));
    usedBrands.add(banner.brand);
    categoryRows.push({ category, products, banner });
    return true;
  };

  const outOfBudget: Category[] = [];

  for (const category of ranked) {
    if (categoryRows.length >= categorySlots) {
      outOfBudget.push(category);
      continue;
    }
    addRow(category, true);
  }

  // Second pass exists only to relax the one-row-per-brand cap; with the cap off
  // `deferred` is always empty.
  if (brandDiversity) {
    for (const category of deferred) {
      if (categoryRows.length >= categorySlots) {
        skipped.push({
          categoryId: category.id,
          name: category.name,
          reason: "brand-used",
          available: 0,
        });
        continue;
      }
      addRow(category, false);
    }
  }

  for (const category of outOfBudget) {
    if (!categoryRows.some((row) => row.category.id === category.id)) {
      skipped.push({
        categoryId: category.id,
        name: category.name,
        reason: "row-budget",
        available: 0,
      });
    }
  }

  // ---- Seasonal row (always last) ------------------------------------------
  const seasonal = inStock
    .filter((p) => p.season === season && !placed.has(p.id))
    .sort(bySalesDesc)
    .slice(0, PRODUCTS_PER_ROW);
  const seasonSegment = dominantSegment(seasonal, catalog.categories);
  // The anchor must never contradict the banner: linking a "winter essentials"
  // banner at women's summer sandals is worse than linking at the OUTLET parent.
  // ...and must not repeat a destination the page already links to, or two visually
  // distinct banners send the shopper to the same category page.
  const rendered = new Set(categoryRows.map((row) => row.category.id));
  const seasonAnchor =
    ranked.find(
      (c) => c.season === season && c.segment === seasonSegment && !rendered.has(c.id),
    ) ?? ranked.find((c) => c.season === season && !rendered.has(c.id));
  const seasonUrl = seasonAnchor?.url ?? catalog.parentCategoryUrl;
  const seasonRow: HomepageRow | null =
    seasonal.length === PRODUCTS_PER_ROW
      ? {
          category: seasonCategory(
            season,
            seasonSegment,
            seasonUrl,
            SEASON_BANNER[season].titleHe,
          ),
          products: seasonal,
          banner: buildSeasonBanner(season, seasonSegment, seasonUrl),
        }
      : null;

  const rows = [newRow, ...categoryRows, ...(seasonRow ? [seasonRow] : [])].slice(
    0,
    maxRows,
  );

  // Derived from the row kind, not from a magic id sign.
  const categoryRowsRendered = rows.filter((row) => row.banner.kind === "category");
  const appliedCategoryOrder = categoryRowsRendered.map((row) => row.category.id);
  const featuredIds = new Set(appliedCategoryOrder);

  // De-duplicate: a category can be reported once, by the first reason that hit.
  const seenSkips = new Set<number>();
  const uniqueSkips = skipped.filter((skip) => {
    if (featuredIds.has(skip.categoryId) || seenSkips.has(skip.categoryId)) return false;
    seenSkips.add(skip.categoryId);
    return true;
  });

  return {
    generatedAt: now.toISOString(),
    season,
    seasonSetting: setting,
    maxRows,
    brandDiversity,
    categoryIds: categoryIds?.length ? [...categoryIds] : undefined,
    appliedCategoryOrder,
    skipped: uniqueSkips,
    headline: { textHe: HEADLINE.textHe, url: HEADLINE.url },
    brandStrip: buildBrandStrip(catalog),
    categoryMenu: buildCategoryMenu(catalog, featuredIds),
    rows,
    source: catalog.source,
  };
}
