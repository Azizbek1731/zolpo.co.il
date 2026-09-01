import type { Season } from "./types";

/**
 * One brand registry.
 *
 * Before this file the same brand list existed three times — the WooCommerce name
 * matcher, the homepage priority order and the serif/sans wordmark rule — and they
 * disagreed. Anything brand-shaped now starts here.
 */

export interface BrandDef {
  /** Canonical wordmark, uppercase, exactly as it should be rendered. */
  key: string;
  /** Serif brands get the fashion-house treatment, the rest a bold sans. */
  serif: boolean;
  /** Extra strings that resolve to this brand (Hebrew spellings included). */
  aliases?: string[];
  /** Slot for a logo file the store is licensed to use. */
  logoUrl?: string;
}

export const BRANDS: BrandDef[] = [
  { key: "RALPH LAUREN", serif: true, aliases: ["POLO RALPH LAUREN", "ראלף לורן", "פולו ראלף לורן"] },
  { key: "AIR JORDAN", serif: false, aliases: ["JORDAN", "אייר ג'ורדן", "אייר גורדן"] },
  { key: "NIKE", serif: false, aliases: ["נייק"] },
  { key: "ADIDAS", serif: false, aliases: ["אדידס"] },
  { key: "TOMMY HILFIGER", serif: false, aliases: ["טומי הילפיגר"] },
  { key: "HOKA", serif: false, aliases: ["הוקה"] },
  { key: "UGG", serif: true, aliases: ["האג"] },
  { key: "BOSS", serif: true, aliases: ["HUGO BOSS", "הוגו בוס"] },
  { key: "CALVIN KLEIN", serif: true, aliases: ["קלווין קליין"] },
  { key: "UNDER ARMOUR", serif: false, aliases: ["אנדר ארמור"] },
  { key: "NEW BALANCE", serif: false, aliases: ["ניו באלאנס"] },
  { key: "PUMA", serif: false, aliases: ["פומה"] },
  { key: "CONVERSE", serif: false, aliases: ["קונברס"] },
  { key: "VANS", serif: false, aliases: ["ואנס"] },
  { key: "KIPLING", serif: false, aliases: ["קיפלינג"] },
  { key: "COLUMBIA", serif: false, aliases: ["קולומביה"] },
  { key: "LACOSTE", serif: true, aliases: ["לקוסט"] },
  { key: "TIMBERLAND", serif: false, aliases: ["טימברלנד"] },
  { key: "BIRKENSTOCK", serif: true, aliases: ["בירקנשטוק"] },
  { key: "ALO YOGA", serif: true, aliases: ["אלו יוגה"] },
  { key: "ZARA", serif: true, aliases: ["זארה"] },
  { key: "MANGO", serif: true, aliases: ["מנגו"] },
  { key: "GUESS", serif: true, aliases: ["גס"] },
  { key: "FILA", serif: false, aliases: ["פילה"] },
  { key: "MARVEL", serif: false, aliases: ["מארבל"] },
];

/** The store's own wordmark — never advertised as a brand on the strip. */
export const STORE_BRAND = "ZOLPO OUTLET";

export const isStoreBrand = (brand: string) =>
  brand.trim().toUpperCase().startsWith("ZOLPO");

/** Homepage ordering. Brands not listed here sort after the ones that are. */
export const BRAND_PRIORITY = [
  "RALPH LAUREN",
  "NIKE",
  "AIR JORDAN",
  "ADIDAS",
  "TOMMY HILFIGER",
  "HOKA",
  "UGG",
  "BOSS",
];

// Longest key/alias first: "AIR JORDAN" must win over "JORDAN", and both over "NIKE"
// in a string that happens to contain each.
const NEEDLES: Array<{ needle: string; def: BrandDef }> = BRANDS.flatMap((def) =>
  [def.key, ...(def.aliases ?? [])].map((needle) => ({
    needle: needle.toUpperCase(),
    def,
  })),
).sort((a, b) => b.needle.length - a.needle.length);

export function matchBrand(text: string): BrandDef | undefined {
  const haystack = text.toUpperCase();
  return NEEDLES.find((n) => haystack.includes(n.needle))?.def;
}

export function brandDef(key: string): BrandDef | undefined {
  const upper = key.trim().toUpperCase();
  return BRANDS.find((b) => b.key === upper);
}

export const isSerifBrand = (key: string) => brandDef(key)?.serif ?? false;

export const brandLogoUrl = (key: string) => brandDef(key)?.logoUrl;

/**
 * Season is inferred from Hebrew category names, which gets a few of the client's
 * real categories wrong — `חליפות טרנינג` is sold all year, and `טי שירט` would
 * disappear for five months. Overrides win over inference; keyed by category id or
 * by exact name so it works before and after a WooCommerce id renumber.
 */
export const CATEGORY_SEASON_OVERRIDES: Record<string, Season> = {
  "חליפות טרנינג": "all",
  "טי שירט ראלף לורן": "summer",
};
