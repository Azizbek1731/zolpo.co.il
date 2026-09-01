# Zolpo Homepage Automation — working demo

A deployable Next.js demo of an automated WooCommerce homepage for **zolpo.co.il**
(Hebrew, RTL outlet store).

It answers the brief in the client's Excel: stop editing the homepage by hand, and
generate the banners and product rows from the **מותגים OUTLET** category tree
instead — best sellers first, season-aware, with a consistent model in every banner.

| Route | What it is |
| --- | --- |
| `/` | The generated homepage, exactly as the shop would look (Hebrew, RTL) |
| `/admin` | Automation console: live preview, season, rows, category picker, JSON export (English, LTR) |
| `/api/homepage` | The plan as JSON — the contract the WordPress side would consume |
| `/videos` | Placeholder for the "real videos" page the new headline links to |

```bash
npm install
npm run dev      # http://localhost:3000
```

No database, no API keys required — it ships with a realistic Hebrew mock catalog
(17 OUTLET categories, ~75 products) modelled on the live store.

---

## The client's requirements, and where each one lives

| # | Requirement | Implementation |
| --- | --- | --- |
| 1 | Replace `לקנות בחו"ל - להרגיש בארץ` with `לעמוד סרטונים אמיתיים - לחץ כאן`, linked to the videos page | [`lib/config.ts`](lib/config.ts) → [`components/Headline.tsx`](components/Headline.tsx). Target is the `VIDEOS_PAGE_URL` env var. |
| 2 | Delete the old banners and blocks, regenerate everything | Nothing on `/` is hand-written: every row comes from `generateHomepage()` |
| 3 | Banners built from the OUTLET brand categories | [`lib/automation.ts`](lib/automation.ts) `rankCategories()` — children of `מותגים OUTLET` |
| 4 | Keep the layout: 4 products + 1 banner per row, banner on the right, best sellers first | [`components/HomepageRow.tsx`](components/HomepageRow.tsx) — RTL grid, banner is the first child so it lands on the right; `pickRowProducts()` sorts by `totalSales` |
| 5 | Summer / winter, automatic with manual override | [`lib/season.ts`](lib/season.ts) — summer Apr–Oct, winter Nov–Mar (Israel). Override in `/admin` or `?season=`. |
| 6 | Every banner: brand logo + category name + `קנה עכשיו` linking to the category | [`lib/banner.ts`](lib/banner.ts) + [`components/Banner.tsx`](components/Banner.tsx) — all three banner styles render the same three elements |
| 7 | One banner for new products | The first row; CTA points at `https://zolpo.co.il/זולפה-מותגים-מוצרים-חדשים` |
| 8 | Always the same models (man / woman / kid) | [`lib/models.ts`](lib/models.ts) — a single file per segment, and the engine never picks a model any other way |

Two more things on the live homepage are generated from the same category tree:

| | What | Implementation |
| --- | --- | --- |
| Catalog drawer | The `מותגים OUTLET` menu that slides in from the right | `buildCategoryMenu()` in [`lib/automation.ts`](lib/automation.ts) → [`components/CategoryMenu.tsx`](components/CategoryMenu.tsx) |
| Brand strip | The full-width band of brand wordmarks above the rows | `buildBrandStrip()` in [`lib/automation.ts`](lib/automation.ts) → [`components/BrandStrip.tsx`](components/BrandStrip.tsx) |

The drawer is deliberately **not** season-filtered and **not** re-ordered per run: the homepage
rows rotate, navigation must not. A shopper has to be able to reach winter coats in July, so the
menu lists every OUTLET child in catalog order and only marks which of them the automation put on
the homepage today.

---

## How the automation works

`generateHomepage(catalog, { season, maxRows })` in
[`lib/automation.ts`](lib/automation.ts) is a **pure, deterministic** function —
same catalog and settings in, byte-identical plan out. That is what makes the JSON
export stable and a nightly cron job safe to re-run.

1. **Load the OUTLET categories** — children of `מותגים OUTLET`, from mock data or
   the live WooCommerce API.
2. **Resolve the season** — the calendar (Apr–Oct = summer) unless overridden.
3. **Rank the categories** — brand priority list first (Ralph Lauren, Nike/Jordan,
   Adidas, Tommy Hilfiger, HOKA, UGG, BOSS), then by total units sold.
4. **New-products row goes first** — newest arrivals, still filtered by season so a
   summer homepage doesn't open with puffer coats.
5. **One row per category** — top 4 best sellers in stock, backfilled with the newest
   items when the season leaves fewer than four. A category that still cannot fill
   four slots is skipped rather than rendered short.
6. **Brand diversity** — the store has four Ralph Lauren categories; a first pass
   allows one row per brand, a second pass tops up any remaining slots.
7. **No repeats** — a product placed in one row is never shown again lower down.
8. **Seasonal row last** — best sellers tagged for the active season, under a
   `SUMMER STYLES` / `WINTER ESSENTIALS` banner.
9. **Banner spec per row** — brand wordmark, Hebrew category title, `קנה עכשיו` →
   category URL, the fixed model image for the segment, and a promo flash. The
   discount line (`עד 40% הנחה`) is computed from the real price vs. regular price of
   the products in that row, not typed in by hand. Multi-brand categories such as
   `מכנסי גינס מותגים לגברים` take the wordmark of the brand that dominates the row,
   so no banner is ever left without one.
10. **Catalog drawer and brand strip** — rebuilt from the same categories, alongside
   `appliedCategoryOrder` and `skipped`, which record what became a row and exactly
   why everything else did not.

Banner styles alternate `dark` → `photo` between rows so consecutive rows never look
identical; the seasonal row uses `light`.

---

## Connecting a live WooCommerce store

Copy `.env.example` to `.env` and fill in read-only REST keys
(WordPress → WooCommerce → Settings → Advanced → REST API):

```bash
WC_BASE_URL=https://zolpo.co.il
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
```

With those set, [`lib/woocommerce.ts`](lib/woocommerce.ts) takes over:

- `GET /wp-json/wc/v3/products/categories?per_page=100` → the category whose name
  contains `OUTLET`, then its children.
- `GET /wp-json/wc/v3/products?category={id}&orderby=popularity&order=desc&status=publish&stock_status=instock`
  → best sellers per category.
- `GET /wp-json/wc/v3/products?orderby=date&order=desc` → new arrivals.
- Season and segment are inferred from the Hebrew names (`קיץ`/`סנדל` → summer,
  `חורף`/`מעיל`/`פוך` → winter; `לנשים` → women, `לילדים` → kids).
- 8 s timeout, one retry. **On any failure the app falls back to the mock catalog**
  and `/admin` shows the reason in an amber banner — the demo can never break in
  front of the client.

Keys are only ever read from the environment; nothing is hardcoded.

---

## Swapping in real model images

Requirement 8 is enforced in one place — [`lib/models.ts`](lib/models.ts):

```ts
export const MODEL_IMAGES: Record<Segment, string> = {
  men: "/models/men.jpg",
  women: "/models/women.jpg",
  kids: "/models/kids.jpg",
};
```

The repo ships three AI-generated studio photos — one man, one woman, one child, shot
against the same backdrop with the same lighting so the homepage reads as one campaign.
To swap in the store's own models:

1. Produce one image per segment (fix the reference so the same face comes back every
   time — that is the whole point of requirement 8), or shoot them.
2. Drop the files in `public/models/` as `men.jpg`, `women.jpg`, `kids.jpg`.
3. Nothing else in the codebase needs to change, and every banner for that segment picks
   the new file up at once.

Brand logos work the same way: wordmarks are rendered as styled text
([`components/BrandWordmark.tsx`](components/BrandWordmark.tsx)); set
`banner.brandLogoUrl` to a file the store is licensed to use and the image replaces
the text. No third-party logo files are fetched or bundled.

Product images are drawn from each product's `kind` + colour
([`components/ProductArt.tsx`](components/ProductArt.tsx)) so the demo has no external
image dependencies. In live mode the real `imageUrl` from WooCommerce is used instead.

---

## Project layout

```
app/
  page.tsx                 Homepage preview (Hebrew, RTL)
  admin/page.tsx           Automation console (English, LTR)
  api/homepage/route.ts    GET the plan as JSON
  videos/page.tsx          Placeholder videos page
lib/
  types.ts                 Category, Product, Banner, HomepageRow, HomepagePlan
  automation.ts            The engine (rows, catalog menu, brand strip, skip reasons)
  banner.ts                Banner specs
  brands.ts                One brand registry: wordmarks, aliases, priority, season overrides
  params.ts                One query-string parser, shared by the page, the API and the console
  season.ts                Season detection + copy
  models.ts                The three fixed model images (requirement 8)
  config.ts                Headline, store chrome, drawer links, brand strip copy, row limits
  mock-data.ts             Hebrew mock catalog
  woocommerce.ts           Live REST adapter
  data.ts                  Live-with-fallback facade
  color.ts / format.ts     Small helpers
components/
  Header · Headline · BrandStrip · CategoryMenu · HomepageRow · ProductCard · Banner · …
  admin/ui.tsx             Console primitives (Card, Segmented, Toggle, Badge, …)
  AdminPanel.tsx           The console
public/models/             men.jpg · women.jpg · kids.jpg
```

## The JSON contract

```bash
curl 'http://localhost:3000/api/homepage?season=summer&rows=6' | jq
```

```jsonc
{
  "generatedAt": "2026-09-01T04:37:00.000Z",
  "season": "summer",
  "seasonSetting": "auto",
  "maxRows": 6,
  "brandDiversity": true,
  "headline": { "textHe": "לעמוד סרטונים אמיתיים - לחץ כאן", "url": "/videos" },
  "brandStrip": {
    "brands": [{ "name": "RALPH LAUREN" }, { "name": "AIR JORDAN" }],
    "titleHe": "לחצו והגיעו לעמוד קטגוריות המותגים",
    "ctaText": "SHOP NOW!",
    "ctaUrl": "https://zolpo.co.il/מותגים-outlet"
  },
  "categoryMenu": {
    "titleHe": "מותגים OUTLET",
    "linksHe": [{ "label": "מוצרים חדשים", "url": "…" }],
    "items": [{ "id": 103, "label": "טי שירט ראלף לורן", "productCount": 5, "featured": true }]
  },
  "appliedCategoryOrder": [103, 109, 110, 105],
  "skipped": [{ "categoryId": 108, "reason": "off-season", "available": 0 }],
  "source": "mock",
  "rows": [
    {
      "category": { "id": 100, "name": "פולו ראלף לורן Ralph Lauren", "url": "…" },
      "products": [ /* 4, best sellers first */ ],
      "banner": {
        "brand": "RALPH LAUREN",
        "titleHe": "פולו ראלף לורן Ralph Lauren",
        "ctaTextHe": "קנה עכשיו",
        "ctaUrl": "https://zolpo.co.il/פולו-ראלף-לורן",
        "style": "dark",
        "modelImageUrl": "/models/men.jpg"
      }
    }
  ]
}
```

A WordPress plugin consumes this document and writes the blocks — the renderer in
this repo and the renderer in the theme read the exact same fields.

---

## Deployment

### Vercel

```bash
npx vercel --prod
```

Default Next.js settings work. Add the environment variables in the project settings
if you want live WooCommerce data.

### Docker

```bash
docker compose up --build -d      # http://localhost:3000
```

The image uses Next.js standalone output and runs as a non-root user.

### Self-hosted (VPS + nginx)

```bash
npm ci && npm run build
pm2 start npm --name zolpo-demo -- start
pm2 save
```

nginx site for a subdomain:

```nginx
server {
    server_name demo.zolpo.co.il;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo certbot --nginx -d demo.zolpo.co.il
```

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `WC_BASE_URL` | — | WooCommerce store URL. Unset ⇒ mock data. |
| `WC_CONSUMER_KEY` | — | REST API key (read permission is enough) |
| `WC_CONSUMER_SECRET` | — | REST API secret |
| `VIDEOS_PAGE_URL` | `/videos` | Target of the new headline link |
| `DEFAULT_SEASON` | `auto` | `auto` \| `summer` \| `winter` |

---

## Checks

```bash
npm run lint      # zero errors
npm run build     # zero type errors
```

Both pass clean. The homepage and the API are `force-dynamic`, so the timestamp and
the plan are always current.
