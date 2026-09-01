# zolpo.co.il — homepage automation proposal

**What you asked for (from the Excel):** stop rebuilding the homepage by hand.
Change the headline, delete the old banners and blocks, and let the site generate
banners and product rows automatically from the **מותגים OUTLET** categories —
best sellers first, summer/winter aware, always the same models.

**What this repo is:** a working demo of exactly that, so we can agree on the
behaviour and the look before any code touches the live store.

- `/` — the homepage as the automation would build it today
- `/admin` — the control panel: switch season, change row count, regenerate, export
- `/api/homepage` — the plan as JSON, which is what the WordPress plugin would consume

Nothing on the homepage is hand-written. Change the season in `/admin`, press
Regenerate, and every banner, every product and every link is rebuilt from the
catalog.

---

## The rules the automation follows

1. **Categories** — the children of `מותגים OUTLET`, ordered by brand priority
   (Ralph Lauren, Nike/Jordan, Adidas, Tommy Hilfiger, HOKA, UGG, BOSS), then by
   units sold.
2. **Products** — the top 4 best sellers of the category that are published and in
   stock. If the season leaves fewer than four, the newest items from the same
   category fill the gap. A category that still can't fill a row is skipped, so the
   homepage never shows a half-empty row.
3. **Season** — summer April–October, winter November–March, with a manual override
   in the admin panel.
4. **Layout** — unchanged from today: 4 product cards with the promo banner on the
   right, mobile stacks the banner first.
5. **Banners** — brand wordmark + Hebrew category name + `קנה עכשיו` linking to the
   category. The discount flash (`40% OFF`) is calculated from the actual regular
   vs. sale prices in that row, so it can never be wrong.
6. **New products** — always the first row, linking to
   `https://zolpo.co.il/זולפה-מותגים-מוצרים-חדשים`.
7. **Models** — one fixed image per segment (man / woman / kid), reused in every
   banner of that segment. The whole homepage looks like one campaign.

8. **Catalog menu and brand strip** — the `מותגים OUTLET` drawer and the wide brand
   band above the rows are generated from the same category tree. Add a category in
   WooCommerce and it appears in the navigation, in the brand strip and (if it earns
   a slot) on the homepage, without anyone touching a theme file.

**One deliberate asymmetry, worth agreeing on now:** the homepage rows are
season-filtered, the navigation is not. If the drawer followed the season, a shopper
could not reach winter coats in July. So the menu always lists every OUTLET category
in catalog order and simply marks which ones are on the homepage today.

Two rules were added because they make the result visibly better, and both can be
switched off:

- **Brand diversity** — you have four Ralph Lauren categories; without a cap the
  homepage becomes a Ralph Lauren catalogue. One row per brand first, then top up.
- **No repeats** — a product shown in one row is never shown again further down.

---

## How it would run on the live store

A small WordPress plugin, no external service:

1. **Daily cron job** (plus a "Regenerate now" button) reads the OUTLET categories
   and their best sellers straight from WooCommerce.
2. The season rule filters categories and products.
3. Banners are regenerated with the brand wordmark, the Hebrew category name, the
   `קנה עכשיו` button and the fixed model image for that segment.
4. The old homepage blocks are removed and the new rows are written in
   (Elementor / Gutenberg blocks or a single shortcode — whichever your theme
   handles most cleanly; I'd check that in the first session).
5. An admin screen controls category order, row count, season and manual
   regeneration, and keeps the previous version so a bad run can be rolled back in
   one click.

**Model images.** Generated once with a fixed reference so the same man, the same
woman and the same child appear in every banner. They live as three files; replacing
them replaces every banner at once. This is the piece that makes the homepage look
designed rather than assembled.

---

## Effort estimate

| Phase | Work | Hours |
| --- | --- | --- |
| 1 | Catalog audit — confirm the OUTLET tree, brand taxonomy, how season is identifiable per category | 3–4 |
| 2 | Plugin scaffold + settings screen (categories, order, row count, season, videos URL) | 6–8 |
| 3 | Selection engine in PHP — best sellers, season rules, brand diversity, de-duplication | 8–10 |
| 4 | Banner rendering — three styles, Hebrew RTL typography, wordmarks, CTA | 8–10 |
| 5 | Consistent model images — reference set, three finals, integration | 5–6 |
| 6 | Homepage writer — remove old blocks, write new rows, keep a rollback copy | 7–9 |
| 7 | Cron + manual regenerate + preview before publish | 4–5 |
| 8 | QA on staging (RTL, mobile, slow catalog), handover doc and a short walkthrough | 5–6 |
| | **Total** | **46–58 hours** |

Realistically **2–3 weeks** at a normal part-time pace, with a reviewable staging
version after phase 4 (roughly the halfway point).

Phase 1 is worth doing first on its own: if the OUTLET categories don't carry a
reliable season signal today, the cheapest fix is adding one tag per category, and
that changes the estimate for phases 3 and 4.

---

## What I'd want from you before starting

- Admin access to a **staging copy** of the store (never the live site first).
- Read-only WooCommerce REST keys, so the engine can be tested against the real
  catalog.
- The URL of the real "סרטונים אמיתיים" page for the new headline link.
- Confirmation of the brand priority order — the demo uses Ralph Lauren, Nike/Jordan,
  Adidas, Tommy Hilfiger, HOKA, UGG, BOSS.
- Whether the store has licensed brand logo files, or the banners should keep using
  styled wordmarks as in this demo.

---

## Open questions worth deciding early

- **Where do banners live?** Rendering them as HTML blocks (as in this demo) keeps
  text sharp, translatable and fast. Rendering them as flat images looks closer to
  today's homepage but needs an image pipeline. HTML is my recommendation.
- **How often should it run?** Daily is enough for best sellers. New products could
  justify hourly during a big drop.
- **Manual pinning.** In practice you will sometimes want to force a category to the
  top for a week. Worth a checkbox in the settings screen; it is small to build now
  and awkward to retrofit later.
