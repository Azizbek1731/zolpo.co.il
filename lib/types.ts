/**
 * Domain model for the Zolpo homepage automation.
 *
 * The whole demo revolves around a `HomepagePlan`: a deterministic, JSON-serialisable
 * description of what the homepage should look like right now. The WordPress side
 * (plugin / cron job) would take exactly this object and write it into the theme.
 */

export type Season = "summer" | "winter" | "all";
export type SeasonSetting = "auto" | "summer" | "winter";
export type Segment = "men" | "women" | "kids";
export type DataSource = "mock" | "woocommerce";

/** Visual family used to draw the product placeholder art (no external images needed). */
export type ProductKind =
  | "hoodie"
  | "polo"
  | "shirt"
  | "sweater"
  | "tshirt"
  | "pants"
  | "coat"
  | "tracksuit"
  | "sneaker"
  | "sandal"
  | "boot"
  | "bag";

export interface Category {
  id: number;
  /** Hebrew name exactly as it appears in WooCommerce. */
  name: string;
  slug: string;
  url: string;
  /** Latin brand wordmark rendered on the banner, e.g. "RALPH LAUREN". */
  brand: string;
  segment: Segment;
  season: Season;
  parentId?: number;
  /** Published products as the *source* counts them, not what we happened to fetch. */
  productCount?: number;
  /** Optional Hebrew promo line shown under the banner title. */
  subtitleHe?: string;
  /** Optional promo flash, e.g. "40% OFF". */
  promoLine?: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  regularPrice?: number;
  imageUrl?: string;
  kind: ProductKind;
  /** Base colour for the generated placeholder art. */
  colorHex: string;
  categoryIds: number[];
  totalSales: number;
  /** ISO date — used for "new products" ordering and for best-seller backfill. */
  createdAt: string;
  season: Season;
  url: string;
  inStock: boolean;
}

export interface Banner {
  id: string;
  kind: "category" | "new-products" | "season";
  brand: string;
  /** Optional slot for a real logo file the client can drop in later. */
  brandLogoUrl?: string;
  titleHe: string;
  subtitleHe?: string;
  promoLine?: string;
  ctaTextHe: string;
  ctaUrl: string;
  segment: Segment;
  style: "dark" | "photo" | "light";
  /** Requirement 8: always the same file per segment. */
  modelImageUrl: string;
  modelLabelHe: string;
}

/** One entry of the automated OUTLET catalog menu (the drawer on the live site). */
export interface CategoryMenuItem {
  id: number;
  label: string;
  url: string;
  brand: string;
  segment: Segment;
  season: Season;
  productCount: number;
  /** True when this category also earned a homepage row in the current plan. */
  featured: boolean;
  /**
   * The category's best seller, so the menu can show a thumbnail instead of a
   * wall of text. `imageUrl` is present in live mode; otherwise the drawer draws
   * the same generated art the product cards use.
   */
  preview?: {
    kind: ProductKind;
    colorHex: string;
    imageUrl?: string;
  };
}

export interface CategoryMenu {
  /** The parent category, e.g. `מותגים OUTLET`. */
  titleHe: string;
  url: string;
  items: CategoryMenuItem[];
  /** Fixed store links the drawer shows above the OUTLET group. */
  linksHe: Array<{ label: string; url: string }>;
}

/** One wordmark on the brand strip; `logoUrl` is the client's licensed-logo slot. */
export interface BrandMark {
  name: string;
  logoUrl?: string;
}

/** The full-width brand wordmark strip that sits above the rows. */
export interface BrandStrip {
  brands: BrandMark[];
  titleHe: string;
  subtitleHe: string;
  ctaText: string;
  ctaUrl: string;
}

/** Why a category the operator might expect did not become a row. */
export type SkipReason =
  | "unknown-id"
  | "off-season"
  | "brand-used"
  | "insufficient-products"
  | "row-budget";

export interface CategorySkip {
  categoryId: number;
  /** Hebrew name when we could resolve the id, so the console can label it. */
  name?: string;
  reason: SkipReason;
  /** Sellable products the category could actually offer this run. */
  available: number;
}

export interface HomepageRow {
  category: Category;
  products: Product[];
  banner: Banner;
}

export interface HomepagePlan {
  generatedAt: string;
  /** Resolved season — never "all"; the calendar or the manual override wins. */
  season: Exclude<Season, "all">;
  seasonSetting: SeasonSetting;
  /** The row budget the plan was generated with (see GenerateOptions.maxRows). */
  maxRows: number;
  /** Whether the one-row-per-brand cap was applied. */
  brandDiversity: boolean;
  /** The operator's explicit category order, when one was supplied. */
  categoryIds?: number[];
  /** The category ids that actually became rows, in render order. */
  appliedCategoryOrder: number[];
  /** Everything that was considered and dropped, with the reason. */
  skipped: CategorySkip[];
  headline: { textHe: string; url: string };
  brandStrip: BrandStrip;
  categoryMenu: CategoryMenu;
  rows: HomepageRow[];
  source: DataSource;
  /** Present when the live WooCommerce adapter was tried and failed. */
  sourceNote?: string;
}

export interface GenerateOptions {
  season?: SeasonSetting;
  maxRows?: number;
  /** Reference date, so the engine stays pure and testable. */
  now?: Date;
  /**
   * Explicit category allow-list, in the operator's own priority order.
   * Empty or omitted = use every OUTLET category, ranked automatically.
   */
  categoryIds?: number[];
  /** Cap the homepage at one row per brand. Default true. */
  brandDiversity?: boolean;
}

/** What `mock-data.ts` and `woocommerce.ts` both return. */
export interface Catalog {
  parentCategoryName: string;
  parentCategoryUrl: string;
  categories: Category[];
  products: Product[];
  source: DataSource;
}
