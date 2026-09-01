import { isStoreBrand } from "./brands";
import { CTA_TEXT_HE } from "./config";
import { MODEL_IMAGES, MODEL_LABELS_HE } from "./models";
import { SEASON_BANNER } from "./season";
import { NEW_PRODUCTS_URL } from "./mock-data";
import type { Banner, Category, Product, Season, Segment } from "./types";

/**
 * Banner specs. A `Banner` is pure data — the React component in
 * `components/Banner.tsx` is the only thing that knows how to draw it, and the
 * WordPress plugin would render the same fields into a theme block.
 *
 * Every banner carries the three things the client asked for:
 *   brand wordmark  +  Hebrew category title  +  "קנה עכשיו" linking to the category.
 */

/**
 * Biggest real discount inside the row, used as the promo flash.
 *
 * Deliberately phrased as a ceiling ("up to 40% off") because it is floored to a
 * marketing-friendly step: a card in the same row showing -55% next to a banner
 * claiming a flat 50% would read as a bug.
 */
export function discountBadge(products: Product[]): string | undefined {
  let best = 0;
  for (const p of products) {
    if (!p.regularPrice || p.regularPrice <= p.price) continue;
    const pct = Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100);
    if (pct > best) best = pct;
  }
  // Round down to a marketing-friendly step so it reads like a real banner.
  const stepped = Math.floor(best / 10) * 10;
  return stepped >= 20 ? `עד ${stepped}% הנחה` : undefined;
}

/**
 * Multi-brand categories (`מכנסי ג'ינס מותגים לגברים`, `מעילי פוך`) carry the store
 * as their brand, which would leave the banner with no wordmark at all — a breach
 * of requirement 6. Fall back to the brand that dominates the row.
 */
export function dominantBrand(products: Product[], fallback: string): string {
  const tally = new Map<string, number>();
  for (const product of products) {
    const key = product.brand.trim().toUpperCase();
    if (!key || isStoreBrand(key)) continue;
    tally.set(key, (tally.get(key) ?? 0) + product.totalSales);
  }
  let best: string | undefined;
  let bestScore = -1;
  for (const [brand, score] of tally) {
    if (score > bestScore) {
      best = brand;
      bestScore = score;
    }
  }
  return best ?? fallback;
}

function base(segment: Segment) {
  return {
    modelImageUrl: MODEL_IMAGES[segment],
    modelLabelHe: MODEL_LABELS_HE[segment],
    ctaTextHe: CTA_TEXT_HE,
    segment,
  };
}

export function buildCategoryBanner(
  category: Category,
  products: Product[],
  index: number,
): Banner {
  return {
    id: `cat-${category.id}`,
    kind: "category",
    brand: isStoreBrand(category.brand)
      ? dominantBrand(products, category.brand)
      : category.brand,
    titleHe: category.name,
    subtitleHe: category.subtitleHe,
    promoLine: category.promoLine ?? discountBadge(products),
    ctaUrl: category.url,
    // Alternate dark / photo so consecutive rows never look identical.
    style: index % 2 === 0 ? "dark" : "photo",
    ...base(category.segment),
  };
}

export function buildNewProductsBanner(
  products: Product[],
  segment: Segment,
): Banner {
  return {
    id: "new-products",
    kind: "new-products",
    brand: "ZOLPO OUTLET",
    titleHe: "מוצרים חדשים בזולפה",
    subtitleHe: 'הגיעו החודש – מלאי מוגבל',
    promoLine: "NEW IN",
    ctaUrl: NEW_PRODUCTS_URL,
    style: "photo",
    ...base(segment),
  };
}

export function buildSeasonBanner(
  season: Exclude<Season, "all">,
  segment: Segment,
  categoryUrl: string,
): Banner {
  const copy = SEASON_BANNER[season];
  return {
    id: `season-${season}`,
    kind: "season",
    brand: copy.latin,
    titleHe: copy.titleHe,
    subtitleHe: copy.subtitleHe,
    ctaUrl: categoryUrl,
    style: "light",
    ...base(segment),
  };
}
