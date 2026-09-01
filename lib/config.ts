import { BRAND_PRIORITY as BRANDS_PRIORITY } from "./brands";
import type { Segment } from "./types";

/**
 * Everything the client can change without touching the engine.
 * In the production WordPress plugin these become settings fields.
 */

export const HEADLINE = {
  /** Requirement 1 — replaces `לקנות בחו"ל - להרגיש בארץ`. */
  textHe: 'לעמוד סרטונים אמיתיים - לחץ כאן',
  previousTextHe: 'לקנות בחו"ל - להרגיש בארץ',
  url: process.env.VIDEOS_PAGE_URL ?? "/videos",
};

export const STORE = {
  nameHe: "זולפה",
  taglineHe: "קניות אונליין",
  promoStripHe: 'מינימום הזמנה 99.99 ש"ח – משלוח חינם ברכישה מעל 249.99 ש"ח',
  searchPlaceholderHe: "מה לחפש?",
  navHe: [
    { label: "עמוד הבית", href: "https://zolpo.co.il" },
    { label: "משלוחים והחזרות", href: "https://zolpo.co.il/משלוחים-והחזרות" },
    { label: "מוצרים חדשים", href: "https://zolpo.co.il/זולפה-מותגים-מוצרים-חדשים" },
    { label: "צור קשר", href: "https://zolpo.co.il/צור-קשר" },
    { label: "מעקב הזמנה", href: "https://zolpo.co.il/מעקב-הזמנה" },
  ],
};

export const CTA_TEXT_HE = "קנה עכשיו";

/** Fixed links the live site shows above the OUTLET group in its side drawer. */
export const MENU_LINKS_HE = [
  { label: "שאלות ותשובות", url: "https://zolpo.co.il/שאלות-ותשובות" },
  { label: "החשבון שלי", url: "https://zolpo.co.il/החשבון-שלי" },
  { label: "המועדפים שלי", url: "https://zolpo.co.il/המועדפים-שלי" },
  { label: "סרטוני מוצרים והמלצות", url: "/videos" },
  { label: "מוצרים חדשים", url: "https://zolpo.co.il/זולפה-מותגים-מוצרים-חדשים" },
  { label: 'הכל עד 9.99 ש"ח', url: "https://zolpo.co.il/הכל-עד-9-99" },
];

/** Copy for the full-width brand wordmark strip above the rows. */
export const BRAND_STRIP = {
  titleHe: "לחצו והגיעו לעמוד קטגוריות המותגים",
  subtitleHe: "המחירים ללא תחרות",
  ctaText: "SHOP NOW!",
  /** How many wordmarks the strip shows before it stops. */
  maxBrands: 12,
};

/** Brands that get pushed to the top of the homepage, in order. */
export const BRAND_PRIORITY = BRANDS_PRIORITY;

/**
 * The new-products row mixes segments, so the model cannot be derived from its
 * contents without flipping between the man and the woman as stock changes —
 * the exact opposite of requirement 8. Pin it instead.
 */
export const NEW_PRODUCTS_SEGMENT: Segment = "women";

export const DEFAULT_MAX_ROWS = 6;
export const MIN_ROWS = 3;
export const MAX_ROWS = 8;
