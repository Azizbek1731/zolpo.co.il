import type { Catalog, Category, Product } from "./types";

/**
 * Mock catalog modelled on the real zolpo.co.il OUTLET tree.
 *
 * This is what the automation runs against when no WooCommerce credentials are
 * configured. Field names and value shapes match what `lib/woocommerce.ts`
 * produces, so the engine cannot tell the two apart.
 */

export const PARENT_CATEGORY_NAME = 'מותגים OUTLET';
export const PARENT_CATEGORY_ID = 99;

const STORE = "https://zolpo.co.il";

/** The real store uses Hebrew slugs in the URL path. */
const url = (slug: string) => `${STORE}/${slug}`;

export const NEW_PRODUCTS_URL = url("זולפה-מותגים-מוצרים-חדשים");
export const PARENT_CATEGORY_URL = url("מותגים-outlet");

const cat = (
  id: number,
  name: string,
  slug: string,
  brand: string,
  segment: Category["segment"],
  season: Category["season"],
  extra: Partial<Category> = {},
): Category => ({
  id,
  name,
  slug,
  url: url(slug),
  brand,
  segment,
  season,
  parentId: PARENT_CATEGORY_ID,
  ...extra,
});

/**
 * Order, spelling and punctuation follow the OUTLET group in the client's own
 * side menu, because the drawer now renders this list verbatim. The last two
 * entries sat below the fold in their screenshot and are reconstructed from the
 * product rows on their homepage — confirm them against the live store.
 */
export const MOCK_CATEGORIES: Category[] = [
  cat(103, 'טי שירט ראלף לורן', "טי-שירט-ראלף-לורן", "RALPH LAUREN", "men", "summer", {
    subtitleHe: '100% כותנה',
    promoLine: 'שניים ב-119 ₪',
  }),
  cat(101, 'חולצות מכופתרות פולו ראלף לורן', "חולצות-מכופתרות-ראלף-לורן", "RALPH LAUREN", "men", "all", {
    subtitleHe: 'יש גם לנשים',
  }),
  cat(116, 'חולצות פולו לגברים', "חולצות-פולו-לגברים", "ZOLPO OUTLET", "men", "all", {
    subtitleHe: 'כל המותגים, מידות S עד XXL',
  }),
  cat(104, 'מכנסי גינס מותגים לגברים', "מכנסי-גינס-מותגים-לגברים", "ZOLPO OUTLET", "men", "all", {
    subtitleHe: 'כל המותגים במקום אחד',
  }),
  cat(100, 'פולו ראלף לורן Ralph Lauren', "פולו-ראלף-לורן", "RALPH LAUREN", "men", "all", {
    subtitleHe: 'הקולקציה המלאה לגברים',
    promoLine: 'עד 40% הנחה',
  }),
  cat(102, 'פולו ראלף לורן לנשים', "פולו-ראלף-לורן-לנשים", "RALPH LAUREN", "women", "all", {
    subtitleHe: 'מידות XS עד XL',
  }),
  cat(105, 'תיקים טומי הילפיגר', "תיקים-טומי-הילפיגר", "TOMMY HILFIGER", "women", "all", {
    subtitleHe: 'תיקים וארנקים מקוריים',
    promoLine: 'עד 50% הנחה',
  }),
  cat(106, 'נעלי HOKA – הוקה', "נעלי-הוקה", "HOKA", "men", "all", {
    subtitleHe: 'נעלי ריצה מקצועיות',
  }),
  cat(107, 'ALO YOGA תיקים אלו יוגה', "תיקים-אלו-יוגה", "ALO YOGA", "women", "all", {
    subtitleHe: 'ספורט ולייף סטייל',
  }),
  cat(108, 'UGG נעלי האג', "נעלי-האג-UGG", "UGG", "women", "winter", {
    subtitleHe: 'מגפיים מקוריים מפרווה',
    promoLine: 'עד 50% הנחה',
  }),
  cat(109, "Jordan מוצרי אייר ג'ורדן", "מוצרי-אייר-גורדן", "AIR JORDAN", "kids", "all", {
    subtitleHe: 'לילדים ולנוער',
  }),
  cat(110, 'סניקרס אדידס קמפוס', "סניקרס-אדידס-קמפוס", "ADIDAS", "men", "all", {
    subtitleHe: 'הדגמים הכי מבוקשים',
  }),
  cat(111, 'BOSS הוגו בוס', "הוגו-בוס-BOSS", "BOSS", "men", "all", {
    subtitleHe: 'אלגנט יומיומי',
  }),
  cat(112, 'מעילי פוך מעילים לחורף', "מעילי-פוך-לחורף", "ZOLPO OUTLET", "women", "winter", {
    subtitleHe: 'חם, קל ואטום לרוח',
    promoLine: 'עד 40% הנחה',
  }),
  cat(113, 'חליפות טרנינג', "חליפות-טרנינג", "FILA", "kids", "all", {
    subtitleHe: 'בנים ובנות, מידות 2-14',
  }),
  cat(114, 'סנדלים לנשים', "סנדלים-לנשים", "ZARA", "women", "summer", {
    subtitleHe: 'זארה ובירקנשטוק',
    promoLine: 'מבצעי סוף עונה',
  }),
  cat(115, 'בגדי ילדים מותגים', "בגדי-ילדים-מותגים", "ZOLPO KIDS", "kids", "all", {
    subtitleHe: 'בגדי ילדים קונים בחו"ל',
  }),
];

type ProductSeed = Omit<Product, "url" | "inStock"> & { inStock?: boolean };

const P = (seed: ProductSeed): Product => ({
  inStock: true,
  url: `${STORE}/product/${seed.id}`,
  ...seed,
});

export const MOCK_PRODUCTS: Product[] = [
  // 100 — פולו ראלף לורן (men)
  P({ id: 1001, name: 'קפוצון פוטר רוכסן גברים ראלף לורן', brand: "RALPH LAUREN", price: 149.99, regularPrice: 299.99, kind: "hoodie", colorHex: "#1f2a44", totalSales: 412, season: "all", categoryIds: [100], createdAt: "2026-03-12" }),
  P({ id: 1002, name: 'חולצת פולו קצרה לגברים ראלף לורן', brand: "RALPH LAUREN", price: 99.99, regularPrice: 199.99, kind: "polo", colorHex: "#ded3b8", totalSales: 508, season: "summer", categoryIds: [100], createdAt: "2026-04-02" }),
  P({ id: 1003, name: 'סווטשירט קפוצון גברים פולו ראלף לורן', brand: "RALPH LAUREN", price: 139.99, regularPrice: 279.99, kind: "hoodie", colorHex: "#2b3245", totalSales: 366, season: "all", categoryIds: [100], createdAt: "2025-11-08" }),
  P({ id: 1004, name: 'סריג חצי רוכסן לגברים פולו ראלף לורן', brand: "RALPH LAUREN", price: 139.99, regularPrice: 269.99, kind: "sweater", colorHex: "#c9b394", totalSales: 291, season: "winter", categoryIds: [100], createdAt: "2025-10-21" }),
  P({ id: 1005, name: 'חולצת פולו ארוכה לגברים ראלף לורן', brand: "RALPH LAUREN", price: 119.99, regularPrice: 219.99, kind: "polo", colorHex: "#7a1f2b", totalSales: 244, season: "winter", categoryIds: [100], createdAt: "2026-01-19" }),

  // 101 — חולצות מכופתרות
  P({ id: 1011, name: 'חולצה מכופתרת פשתן לגברים ראלף לורן', brand: "RALPH LAUREN", price: 119.99, regularPrice: 249.99, kind: "shirt", colorHex: "#6d97cf", totalSales: 377, season: "summer", categoryIds: [101], createdAt: "2026-08-24" }),
  P({ id: 1012, name: 'חולצה מכופתרת אוקספורד לבנה ראלף לורן', brand: "RALPH LAUREN", price: 119.99, regularPrice: 239.99, kind: "shirt", colorHex: "#f2f2f0", totalSales: 331, season: "all", categoryIds: [101], createdAt: "2026-02-14" }),
  P({ id: 1013, name: 'חולצה מכופתרת פשתן שחורה ראלף לורן', brand: "RALPH LAUREN", price: 119.99, regularPrice: 239.99, kind: "shirt", colorHex: "#23252a", totalSales: 287, season: "all", categoryIds: [101], createdAt: "2026-05-30" }),
  P({ id: 1014, name: 'חולצה מכופתרת ירוק זית לגברים ראלף לורן', brand: "RALPH LAUREN", price: 119.99, regularPrice: 239.99, kind: "shirt", colorHex: "#5d6b3c", totalSales: 233, season: "all", categoryIds: [101], createdAt: "2026-06-11" }),
  P({ id: 1015, name: 'חולצה מכופתרת משבצות לגברים ראלף לורן', brand: "RALPH LAUREN", price: 129.99, regularPrice: 259.99, kind: "shirt", colorHex: "#3f5d8a", totalSales: 198, season: "winter", categoryIds: [101], createdAt: "2025-12-03" }),

  // 102 — פולו לנשים
  P({ id: 1021, name: 'חולצת פולו קצרה לנשים ראלף לורן', brand: "RALPH LAUREN", price: 94.99, regularPrice: 189.99, kind: "polo", colorHex: "#e8b9c4", totalSales: 402, season: "summer", categoryIds: [102], createdAt: "2026-04-18" }),
  P({ id: 1022, name: 'סריג צווארון וי לנשים ראלף לורן', brand: "RALPH LAUREN", price: 134.99, regularPrice: 259.99, kind: "sweater", colorHex: "#d8d2c6", totalSales: 268, season: "winter", categoryIds: [102], createdAt: "2025-11-27" }),
  P({ id: 1023, name: 'קפוצון רוכסן לנשים פולו ראלף לורן', brand: "RALPH LAUREN", price: 144.99, regularPrice: 289.99, kind: "hoodie", colorHex: "#8fa8c8", totalSales: 245, season: "all", categoryIds: [102], createdAt: "2026-03-05" }),
  P({ id: 1024, name: 'חולצת פולו ארוכה לנשים ראלף לורן', brand: "RALPH LAUREN", price: 109.99, regularPrice: 209.99, kind: "polo", colorHex: "#26304a", totalSales: 214, season: "all", categoryIds: [102], createdAt: "2026-01-08" }),
  P({ id: 1025, name: 'שמלת פולו קצרה לנשים ראלף לורן', brand: "RALPH LAUREN", price: 129.99, regularPrice: 249.99, kind: "polo", colorHex: "#1d3c34", totalSales: 181, season: "summer", categoryIds: [102], createdAt: "2026-05-16" }),

  // 103 — טי שירט (summer)
  P({ id: 1031, name: 'טי שירט לוגו גדול לגברים ראלף לורן', brand: "RALPH LAUREN", price: 69.99, regularPrice: 139.99, kind: "tshirt", colorHex: "#f4f4f2", totalSales: 521, season: "summer", categoryIds: [103], createdAt: "2026-05-02" }),
  P({ id: 1032, name: 'טי שירט כותנה שחורה לגברים ראלף לורן', brand: "RALPH LAUREN", price: 69.99, regularPrice: 139.99, kind: "tshirt", colorHex: "#1c1c1e", totalSales: 468, season: "summer", categoryIds: [103], createdAt: "2026-05-02" }),
  P({ id: 1033, name: 'טי שירט נייבי לוגו רקום ראלף לורן', brand: "RALPH LAUREN", price: 69.99, regularPrice: 139.99, kind: "tshirt", colorHex: "#23304f", totalSales: 399, season: "summer", categoryIds: [103], createdAt: "2026-06-21" }),
  P({ id: 1034, name: 'טי שירט אפור מלאנז לגברים ראלף לורן', brand: "RALPH LAUREN", price: 64.99, regularPrice: 129.99, kind: "tshirt", colorHex: "#9aa0a6", totalSales: 342, season: "summer", categoryIds: [103], createdAt: "2026-04-09" }),
  P({ id: 1035, name: 'מארז 2 טי שירט לגברים ראלף לורן', brand: "RALPH LAUREN", price: 119.99, regularPrice: 239.99, kind: "tshirt", colorHex: "#b9422f", totalSales: 300, season: "summer", categoryIds: [103], createdAt: "2026-08-19" }),

  // 104 — ג'ינס לגברים
  P({ id: 1041, name: "מכנסי ג'ינס סלים כחול כהה לגברים", brand: "CALVIN KLEIN", price: 159.99, regularPrice: 329.99, kind: "pants", colorHex: "#2b4468", totalSales: 356, season: "all", categoryIds: [104], createdAt: "2026-02-26" }),
  P({ id: 1042, name: "מכנסי ג'ינס ישרים שטיפה בהירה לגברים", brand: "TOMMY HILFIGER", price: 169.99, regularPrice: 349.99, kind: "pants", colorHex: "#6f8fb5", totalSales: 298, season: "all", categoryIds: [104], createdAt: "2026-03-30" }),
  P({ id: 1043, name: "מכנסי ג'ינס שחורים לגברים הוגו בוס", brand: "BOSS", price: 179.99, regularPrice: 359.99, kind: "pants", colorHex: "#1f1f22", totalSales: 275, season: "all", categoryIds: [104, 111], createdAt: "2026-01-23" }),
  P({ id: 1044, name: "מכנסי ג'ינס אפורים סטרץ לגברים", brand: "GUESS", price: 149.99, regularPrice: 299.99, kind: "pants", colorHex: "#55585e", totalSales: 232, season: "all", categoryIds: [104], createdAt: "2025-12-15" }),
  P({ id: 1045, name: "מכנסי ג'ינס קרעים לגברים זארה", brand: "ZARA", price: 139.99, regularPrice: 279.99, kind: "pants", colorHex: "#4a6a94", totalSales: 190, season: "summer", categoryIds: [104], createdAt: "2026-06-04" }),

  // 105 — תיקים טומי הילפיגר
  P({ id: 1051, name: 'תיק צד קטן לנשים טומי הילפיגר', brand: "TOMMY HILFIGER", price: 149.99, regularPrice: 299.99, kind: "bag", colorHex: "#12315e", totalSales: 388, season: "all", categoryIds: [105], createdAt: "2026-04-27" }),
  P({ id: 1052, name: 'תיק כתף עם לוגו לנשים טומי הילפיגר', brand: "TOMMY HILFIGER", price: 169.99, regularPrice: 339.99, kind: "bag", colorHex: "#8d1f2d", totalSales: 311, season: "all", categoryIds: [105], createdAt: "2026-02-09" }),
  P({ id: 1053, name: 'תיק גב טומי הילפיגר', brand: "TOMMY HILFIGER", price: 189.99, regularPrice: 379.99, kind: "bag", colorHex: "#1b2a3a", totalSales: 264, season: "all", categoryIds: [105], createdAt: "2025-10-30" }),
  P({ id: 1054, name: 'ארנק עור לנשים טומי הילפיגר', brand: "TOMMY HILFIGER", price: 89.99, regularPrice: 179.99, kind: "bag", colorHex: "#c8b9a6", totalSales: 240, season: "all", categoryIds: [105], createdAt: "2026-07-14" }),
  P({ id: 1055, name: 'תיק צד בז לנשים טומי הילפיגר', brand: "TOMMY HILFIGER", price: 149.99, regularPrice: 299.99, kind: "bag", colorHex: "#cbb693", totalSales: 205, season: "summer", categoryIds: [105], createdAt: "2026-05-22" }),

  // 106 — HOKA
  P({ id: 1061, name: 'נעלי ריצה הוקה קליפטון לגברים', brand: "HOKA", price: 349.99, regularPrice: 699.99, kind: "sneaker", colorHex: "#2f6fb0", totalSales: 421, season: "all", categoryIds: [106], createdAt: "2026-03-18" }),
  P({ id: 1062, name: 'נעלי הוקה בונדי לגברים', brand: "HOKA", price: 379.99, regularPrice: 749.99, kind: "sneaker", colorHex: "#1c1c1e", totalSales: 333, season: "all", categoryIds: [106], createdAt: "2026-01-31" }),
  P({ id: 1063, name: 'נעלי הוקה ארהי לגברים', brand: "HOKA", price: 329.99, regularPrice: 659.99, kind: "sneaker", colorHex: "#d9603a", totalSales: 289, season: "summer", categoryIds: [106], createdAt: "2026-06-27" }),
  P({ id: 1064, name: 'נעלי הוקה מאך לגברים', brand: "HOKA", price: 359.99, regularPrice: 719.99, kind: "sneaker", colorHex: "#7ac4b8", totalSales: 254, season: "all", categoryIds: [106], createdAt: "2026-08-27" }),
  P({ id: 1065, name: 'נעלי הוקה צאלנג׳ר שטח לגברים', brand: "HOKA", price: 369.99, regularPrice: 739.99, kind: "sneaker", colorHex: "#4b5a3c", totalSales: 212, season: "winter", categoryIds: [106], createdAt: "2025-11-14" }),

  // 107 — ALO YOGA
  P({ id: 1071, name: 'תיק ספורט אלו יוגה לנשים', brand: "ALO YOGA", price: 199.99, regularPrice: 399.99, kind: "bag", colorHex: "#1b1b1d", totalSales: 276, season: "all", categoryIds: [107], createdAt: "2026-04-06" }),
  P({ id: 1072, name: 'תיק גב אלו יוגה', brand: "ALO YOGA", price: 219.99, regularPrice: 439.99, kind: "bag", colorHex: "#6f7566", totalSales: 231, season: "all", categoryIds: [107], createdAt: "2026-02-20" }),
  P({ id: 1073, name: 'תיק חגור אלו יוגה', brand: "ALO YOGA", price: 119.99, regularPrice: 239.99, kind: "bag", colorHex: "#b9a89a", totalSales: 198, season: "summer", categoryIds: [107], createdAt: "2026-05-09" }),
  P({ id: 1074, name: 'תיק למזרן יוגה אלו', brand: "ALO YOGA", price: 149.99, regularPrice: 299.99, kind: "bag", colorHex: "#2f4a44", totalSales: 176, season: "all", categoryIds: [107], createdAt: "2026-07-02" }),

  // 108 — UGG (winter)
  P({ id: 1081, name: 'מגפי האג קלאסיק קצר לנשים', brand: "UGG", price: 399.99, regularPrice: 799.99, kind: "boot", colorHex: "#c7a17a", totalSales: 447, season: "winter", categoryIds: [108], createdAt: "2025-10-15" }),
  P({ id: 1082, name: 'מגפי האג קלאסיק גבוה לנשים', brand: "UGG", price: 449.99, regularPrice: 899.99, kind: "boot", colorHex: "#46372c", totalSales: 356, season: "winter", categoryIds: [108], createdAt: "2025-11-02" }),
  P({ id: 1083, name: 'נעלי בית האג טסמן לנשים', brand: "UGG", price: 299.99, regularPrice: 599.99, kind: "boot", colorHex: "#8c6a4a", totalSales: 322, season: "winter", categoryIds: [108], createdAt: "2025-12-20" }),
  P({ id: 1084, name: 'מגפוני האג מיני לנשים', brand: "UGG", price: 379.99, regularPrice: 749.99, kind: "boot", colorHex: "#d9d3c7", totalSales: 288, season: "winter", categoryIds: [108], createdAt: "2026-08-29" }),
  P({ id: 1085, name: 'כפכפי פרווה האג לנשים', brand: "UGG", price: 249.99, regularPrice: 499.99, kind: "sandal", colorHex: "#b08968", totalSales: 201, season: "winter", categoryIds: [108], createdAt: "2026-01-12" }),

  // 109 — Air Jordan (kids)
  P({ id: 1091, name: 'נעלי ספורט לילדים נייק אייר גורדן', brand: "AIR JORDAN", price: 139.99, regularPrice: 279.99, kind: "sneaker", colorHex: "#b3222c", totalSales: 512, season: "all", categoryIds: [109, 115], createdAt: "2026-03-24" }),
  P({ id: 1092, name: 'חליפת טרנינג לילדים אייר גורדן', brand: "AIR JORDAN", price: 159.99, regularPrice: 319.99, kind: "tracksuit", colorHex: "#1c1c1e", totalSales: 364, season: "winter", categoryIds: [109, 113, 115], createdAt: "2025-12-08" }),
  P({ id: 1093, name: 'טי שירט לילדים אייר גורדן', brand: "AIR JORDAN", price: 59.99, regularPrice: 119.99, kind: "tshirt", colorHex: "#e03a3e", totalSales: 341, season: "summer", categoryIds: [109, 115], createdAt: "2026-05-27" }),
  P({ id: 1094, name: 'מכנסי טרנינג לילדים אייר גורדן', brand: "AIR JORDAN", price: 79.99, regularPrice: 159.99, kind: "pants", colorHex: "#26262a", totalSales: 297, season: "all", categoryIds: [109, 115], createdAt: "2026-02-03" }),
  P({ id: 1095, name: 'קפוצון לילדים אייר גורדן', brand: "AIR JORDAN", price: 99.99, regularPrice: 199.99, kind: "hoodie", colorHex: "#3b3f4a", totalSales: 268, season: "winter", categoryIds: [109, 115], createdAt: "2025-11-19" }),

  // 110 — Adidas Campus
  P({ id: 1101, name: 'נעלי אדידס קמפוס 00s לגברים', brand: "ADIDAS", price: 279.99, regularPrice: 549.99, kind: "sneaker", colorHex: "#2f6b4f", totalSales: 468, season: "all", categoryIds: [110], createdAt: "2026-04-14" }),
  P({ id: 1102, name: 'נעלי אדידס קמפוס שחור לבן', brand: "ADIDAS", price: 279.99, regularPrice: 549.99, kind: "sneaker", colorHex: "#1c1c1e", totalSales: 402, season: "all", categoryIds: [110], createdAt: "2026-04-14" }),
  P({ id: 1103, name: 'נעלי אדידס סמבה קלאסיק', brand: "ADIDAS", price: 289.99, regularPrice: 579.99, kind: "sneaker", colorHex: "#f0ece1", totalSales: 377, season: "all", categoryIds: [110], createdAt: "2026-06-16" }),
  P({ id: 1104, name: 'נעלי אדידס גזל לגברים', brand: "ADIDAS", price: 269.99, regularPrice: 539.99, kind: "sneaker", colorHex: "#3f4fa0", totalSales: 311, season: "all", categoryIds: [110], createdAt: "2026-08-21" }),
  P({ id: 1105, name: 'נעלי אדידס קמפוס בורדו', brand: "ADIDAS", price: 279.99, regularPrice: 549.99, kind: "sneaker", colorHex: "#6d2230", totalSales: 254, season: "winter", categoryIds: [110], createdAt: "2025-12-27" }),

  // 111 — BOSS
  P({ id: 1111, name: 'חולצת פולו לגברים הוגו בוס', brand: "BOSS", price: 159.99, regularPrice: 319.99, kind: "polo", colorHex: "#1c2b3a", totalSales: 344, season: "all", categoryIds: [111], createdAt: "2026-03-08" }),
  P({ id: 1112, name: 'טי שירט עם לוגו לגברים הוגו בוס', brand: "BOSS", price: 109.99, regularPrice: 219.99, kind: "tshirt", colorHex: "#f2f2f0", totalSales: 298, season: "summer", categoryIds: [111], createdAt: "2026-05-11" }),
  P({ id: 1113, name: 'סווטשירט לגברים הוגו בוס', brand: "BOSS", price: 189.99, regularPrice: 379.99, kind: "hoodie", colorHex: "#23252a", totalSales: 265, season: "winter", categoryIds: [111], createdAt: "2025-11-23" }),
  P({ id: 1114, name: 'סריג צמר לגברים הוגו בוס', brand: "BOSS", price: 199.99, regularPrice: 399.99, kind: "sweater", colorHex: "#4a4f57", totalSales: 221, season: "winter", categoryIds: [111], createdAt: "2025-10-09" }),
  P({ id: 1115, name: 'מכנסי טרנינג לגברים הוגו בוס', brand: "BOSS", price: 149.99, regularPrice: 299.99, kind: "pants", colorHex: "#2b2f36", totalSales: 187, season: "all", categoryIds: [111], createdAt: "2026-01-27" }),

  // 112 — מעילי חורף
  P({ id: 1121, name: 'מעיל פוך ארוך לנשים טומי הילפיגר', brand: "TOMMY HILFIGER", price: 299.99, regularPrice: 599.99, kind: "coat", colorHex: "#1b2233", totalSales: 398, season: "winter", categoryIds: [112], createdAt: "2025-10-27" }),
  P({ id: 1122, name: 'מעיל פוך קצר מבריק לנשים', brand: "CALVIN KLEIN", price: 259.99, regularPrice: 519.99, kind: "coat", colorHex: "#111114", totalSales: 341, season: "winter", categoryIds: [112], createdAt: "2025-11-11" }),
  P({ id: 1123, name: 'מעיל פוך עם צווארון פרווה לנשים', brand: "ZARA", price: 279.99, regularPrice: 559.99, kind: "coat", colorHex: "#6d5b4a", totalSales: 289, season: "winter", categoryIds: [112], createdAt: "2025-12-01" }),
  P({ id: 1124, name: 'מעיל צמר ארוך לנשים', brand: "MANGO", price: 319.99, regularPrice: 639.99, kind: "coat", colorHex: "#b0a48f", totalSales: 246, season: "winter", categoryIds: [112], createdAt: "2026-01-05" }),
  P({ id: 1125, name: 'מעיל פוך בז לנשים', brand: "GUESS", price: 269.99, regularPrice: 539.99, kind: "coat", colorHex: "#cbbba4", totalSales: 208, season: "winter", categoryIds: [112], createdAt: "2026-08-30" }),

  // 113 — חליפות טרנינג (kids)
  P({ id: 1131, name: 'חליפת טרנינג פילה לילדים בנים ובנות', brand: "FILA", price: 119.99, regularPrice: 239.99, kind: "tracksuit", colorHex: "#1f3f7a", totalSales: 433, season: "winter", categoryIds: [113, 115], createdAt: "2025-11-06" }),
  P({ id: 1132, name: 'מכנסי טרנינג לילדים נייק', brand: "NIKE", price: 69.99, regularPrice: 139.99, kind: "pants", colorHex: "#1c1c1e", totalSales: 388, season: "all", categoryIds: [113, 115], createdAt: "2026-02-17" }),
  P({ id: 1133, name: 'חליפת טרנינג נייק לילדים', brand: "NIKE", price: 139.99, regularPrice: 279.99, kind: "tracksuit", colorHex: "#2b2f36", totalSales: 321, season: "winter", categoryIds: [113, 115], createdAt: "2025-12-11" }),
  P({ id: 1134, name: 'חליפת טרנינג אדידס לילדים', brand: "ADIDAS", price: 129.99, regularPrice: 259.99, kind: "tracksuit", colorHex: "#2f5fa0", totalSales: 287, season: "winter", categoryIds: [113, 115], createdAt: "2026-01-15" }),

  // 115 — בגדי ילדים מותגים
  P({ id: 1151, name: 'חולצה קצרה לילדים ספיידרמן מארבל', brand: "MARVEL", price: 29.99, regularPrice: 59.99, kind: "tshirt", colorHex: "#c62828", totalSales: 465, season: "summer", categoryIds: [115], createdAt: "2026-06-08" }),
  P({ id: 1152, name: 'מכנסי ג׳ינס לילדים זארה', brand: "ZARA", price: 79.99, regularPrice: 159.99, kind: "pants", colorHex: "#4a6a94", totalSales: 254, season: "all", categoryIds: [115], createdAt: "2026-04-21" }),
  P({ id: 1153, name: 'קפוצון לילדים פילה', brand: "FILA", price: 89.99, regularPrice: 179.99, kind: "hoodie", colorHex: "#c0392b", totalSales: 231, season: "winter", categoryIds: [115], createdAt: "2026-08-31" }),

  // 116 — חולצות פולו לגברים (multi-brand: the banner brand is derived from the row)
  P({ id: 1161, name: 'חולצת פולו לגברים לקוסט', brand: "LACOSTE", price: 129.99, regularPrice: 259.99, kind: "polo", colorHex: "#2f6b4f", totalSales: 356, season: "all", categoryIds: [116], createdAt: "2026-04-11" }),
  P({ id: 1162, name: 'חולצת פולו לגברים טומי הילפיגר', brand: "TOMMY HILFIGER", price: 119.99, regularPrice: 239.99, kind: "polo", colorHex: "#12315e", totalSales: 331, season: "all", categoryIds: [116], createdAt: "2026-02-28" }),
  P({ id: 1163, name: 'חולצת פולו לגברים קלווין קליין', brand: "CALVIN KLEIN", price: 109.99, regularPrice: 219.99, kind: "polo", colorHex: "#1c1c1e", totalSales: 298, season: "all", categoryIds: [116], createdAt: "2026-06-02" }),
  P({ id: 1164, name: 'חולצת פולו לגברים נייק', brand: "NIKE", price: 99.99, regularPrice: 199.99, kind: "polo", colorHex: "#b3222c", totalSales: 271, season: "summer", categoryIds: [116], createdAt: "2026-05-20" }),
  P({ id: 1165, name: 'חולצת פולו לגברים אדידס', brand: "ADIDAS", price: 99.99, regularPrice: 199.99, kind: "polo", colorHex: "#f0ece1", totalSales: 244, season: "all", categoryIds: [116], createdAt: "2026-01-30" }),

  // 114 — סנדלים לנשים (summer)
  P({ id: 1141, name: 'סנדלי אצבע בצבע זהב לנשים זארה', brand: "ZARA", price: 99.99, regularPrice: 199.99, kind: "sandal", colorHex: "#c9a227", totalSales: 391, season: "summer", categoryIds: [114], createdAt: "2026-04-30" }),
  P({ id: 1142, name: 'סנדלים עם עקבים גליטר זארה', brand: "ZARA", price: 109.99, regularPrice: 219.99, kind: "sandal", colorHex: "#b8b8bd", totalSales: 344, season: "summer", categoryIds: [114], createdAt: "2026-05-18" }),
  P({ id: 1143, name: 'סנדלי רצועות שטוחות לנשים סגירת אבזם', brand: "ZARA", price: 199.99, regularPrice: 399.99, kind: "sandal", colorHex: "#8b5a2b", totalSales: 302, season: "summer", categoryIds: [114], createdAt: "2026-06-25" }),
  P({ id: 1144, name: 'סנדל אצבע פתוח עם אבזם בירקנשטוק', brand: "BIRKENSTOCK", price: 139.99, regularPrice: 279.99, kind: "sandal", colorHex: "#2f2f33", totalSales: 468, season: "summer", categoryIds: [114], createdAt: "2026-03-16" }),
  P({ id: 1145, name: 'סנדלי פלטפורמה שחורים לנשים', brand: "ZARA", price: 129.99, regularPrice: 259.99, kind: "sandal", colorHex: "#1c1c1e", totalSales: 256, season: "summer", categoryIds: [114], createdAt: "2026-08-28" }),
];

const PRODUCT_COUNTS = MOCK_PRODUCTS.reduce<Record<number, number>>((acc, product) => {
  for (const id of product.categoryIds) acc[id] = (acc[id] ?? 0) + 1;
  return acc;
}, {});

const CATEGORIES_WITH_COUNTS: Category[] = MOCK_CATEGORIES.map((category) => ({
  ...category,
  productCount: PRODUCT_COUNTS[category.id] ?? 0,
}));

export function getMockCatalog(): Catalog {
  return {
    parentCategoryName: PARENT_CATEGORY_NAME,
    parentCategoryUrl: PARENT_CATEGORY_URL,
    categories: CATEGORIES_WITH_COUNTS,
    products: MOCK_PRODUCTS,
    source: "mock",
  };
}
