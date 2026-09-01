"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Banner from "./Banner";
import { Badge, Button, Card, Dot, Field, Segmented, Toggle } from "./admin/ui";
import { DEFAULT_MAX_ROWS, HEADLINE, MAX_ROWS, MIN_ROWS } from "@/lib/config";
import { formatEn } from "@/lib/format";
import type { HomepagePlan, SeasonSetting } from "@/lib/types";

/**
 * The automation console.
 *
 * Every control writes into one query string, that query string is the only input
 * to `/api/homepage`, and the live preview iframe reads the very same URL — so what
 * the operator configures, what the API returns and what the shop renders can never
 * drift apart.
 */

const ROW_KIND_LABEL: Record<string, string> = {
  "new-products": "New products row",
  category: "Brand category row",
  season: "Seasonal row",
};

const BANNER_STYLE_LABEL: Record<string, string> = {
  dark: "Dark banner",
  photo: "Photo banner",
  light: "Light banner",
};

const SKIP_LABEL: Record<string, string> = {
  "unknown-id": "id not in the catalog",
  "off-season": "wrong season for this run",
  "brand-used": "brand already has a row",
  "insufficient-products": "fewer than 4 sellable products",
  "row-budget": "past the row budget",
};

type Tab = "preview" | "rows" | "catalog" | "json" | "production";
type Device = "desktop" | "mobile";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "preview", label: "Live preview" },
  { id: "rows", label: "Generated rows" },
  { id: "catalog", label: "Catalog menu & brands" },
  { id: "json", label: "Plan JSON" },
  { id: "production", label: "Production" },
];

interface Settings {
  season: SeasonSetting;
  maxRows: number;
  brandDiversity: boolean;
  /** null = automatic ranking; an array = the operator's explicit order. */
  categoryIds: number[] | null;
  /** YYYY-MM-DD, or "" for today — proves the season rule in one click. */
  simulatedDate: string;
}

function buildQuery(s: Settings): string {
  const params = new URLSearchParams({
    season: s.season,
    rows: String(s.maxRows),
  });
  if (!s.brandDiversity) params.set("diversity", "0");
  if (s.categoryIds) params.set("cats", s.categoryIds.join(","));
  if (s.simulatedDate) params.set("now", s.simulatedDate);
  return params.toString();
}

export default function AdminPanel({ initialPlan }: { initialPlan: HomepagePlan }) {
  const [settings, setSettings] = useState<Settings>({
    season: initialPlan.seasonSetting,
    maxRows: initialPlan.maxRows,
    brandDiversity: initialPlan.brandDiversity,
    categoryIds: initialPlan.categoryIds ?? null,
    simulatedDate: "",
  });
  const [plan, setPlan] = useState(initialPlan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [previewNonce, setPreviewNonce] = useState(0);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingQuery = buildQuery(settings);
  /**
   * Links must describe what the operator is *looking at*. Building them from the
   * live control state means Export and Open shop hand over a different plan than
   * the one on screen for as long as a request is in flight.
   */
  const query = buildQuery({
    season: plan.seasonSetting,
    maxRows: plan.maxRows,
    brandDiversity: plan.brandDiversity,
    categoryIds: plan.categoryIds ?? null,
    simulatedDate: settings.simulatedDate,
  });

  const flash = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /** Fetch a plan for `next` and keep only the newest response. */
  const load = useCallback(async (next: Settings) => {
    const ticket = ++inFlight.current;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/homepage?${buildQuery(next)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json: HomepagePlan = await res.json();
      if (ticket !== inFlight.current) return; // a newer request already won
      setPlan(json);
    } catch (err) {
      if (ticket !== inFlight.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (ticket === inFlight.current) setBusy(false);
    }
  }, []);

  /**
   * Controls apply themselves. Regenerating is cheap and deterministic, so making
   * the operator press a button just to see their own change is friction — the
   * button stays for the "run it again right now" case.
   */
  const apply = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch };
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(() => void load(next), 220);
        return next;
      });
    },
    [load],
  );

  const regenerate = useCallback(() => {
    void load(settings);
    setPreviewNonce((n) => n + 1);
    flash("Homepage regenerated");
  }, [flash, load, settings]);

  const reset = useCallback(() => {
    const defaults: Settings = {
      season: "auto",
      maxRows: DEFAULT_MAX_ROWS,
      brandDiversity: true,
      categoryIds: null,
      simulatedDate: "",
    };
    setSettings(defaults);
    void load(defaults);
    flash("Settings reset to defaults");
  }, [flash, load]);

  // Every OUTLET category, in catalog order — the menu is never season-filtered,
  // so it doubles as the master list for the picker.
  const allCategories = plan.categoryMenu.items;
  const manual = settings.categoryIds !== null;

  const selection = useMemo(
    () => settings.categoryIds ?? allCategories.map((c) => c.id),
    [settings.categoryIds, allCategories],
  );

  const orderedCategories = useMemo(() => {
    if (!manual) return allCategories;
    const chosen = selection
      .map((id) => allCategories.find((c) => c.id === id))
      .filter((c): c is (typeof allCategories)[number] => Boolean(c));
    const rest = allCategories.filter((c) => !selection.includes(c.id));
    return [...chosen, ...rest];
  }, [manual, selection, allCategories]);

  const toggleCategory = (id: number) => {
    const base = settings.categoryIds ?? allCategories.map((c) => c.id);
    apply({
      categoryIds: base.includes(id) ? base.filter((v) => v !== id) : [...base, id],
    });
  };

  const move = (id: number, direction: -1 | 1) => {
    const base = [...(settings.categoryIds ?? allCategories.map((c) => c.id))];
    const index = base.indexOf(id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= base.length) return;
    [base[index], base[target]] = [base[target], base[index]];
    apply({ categoryIds: base });
  };

  const skipById = useMemo(
    () => new Map(plan.skipped.map((skip) => [skip.categoryId, skip])),
    [plan.skipped],
  );
  const rowPosition = useMemo(
    () => new Map(plan.appliedCategoryOrder.map((id, i) => [id, i + 1])),
    [plan.appliedCategoryOrder],
  );

  const live = plan.source === "woocommerce";
  const productCount = plan.rows.reduce((n, row) => n + row.products.length, 0);
  const json = useMemo(() => JSON.stringify(plan, null, 2), [plan]);
  const stale = pendingQuery !== query;

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      flash("Plan JSON copied to clipboard");
    } catch {
      flash("Clipboard blocked — use Download instead");
    }
  };

  return (
    // The root layout is lang="he" dir="rtl" for the shop; the console is English,
    // and `lang` inherits to descendants exactly as `dir` does.
    <div dir="ltr" lang="en" className="font-latin min-h-screen bg-slate-50 text-slate-900">
      {/* ---------------------------------------------------------------- top */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight">
              Zolpo Homepage Automation
              <span className="font-medium text-slate-400"> · Console</span>
            </h1>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              Generated from{" "}
              <span className="he font-semibold text-slate-700">
                {plan.categoryMenu.titleHe}
              </span>{" "}
              · {allCategories.length} categories · last run {formatEn(plan.generatedAt)}
            </p>
          </div>

          <Badge tone={live ? "green" : "amber"}>
            <Dot tone={live ? "green" : "amber"} />
            {live ? "WooCommerce live" : "Mock catalog"}
          </Badge>
          <Badge tone="blue">
            {plan.season}
            {plan.seasonSetting === "auto" ? " · auto" : " · manual"}
          </Badge>
          {busy && (
            <Badge tone="slate">
              <Dot tone="slate" />
              syncing…
            </Badge>
          )}

          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={regenerate} disabled={busy}>
              {busy ? "Regenerating…" : "Regenerate"}
            </Button>
            <Button href={`/api/homepage?${query}&download=1`} title="Download the plan as JSON">
              Export JSON
            </Button>
            <Button href={`/?${query}&models=1`} target="_blank" title="Open the shop preview in a new tab">
              Open shop ↗
            </Button>
          </div>
        </div>
      </header>

      {(error || plan.sourceNote || (stale && !busy)) && (
        <div className="mx-auto max-w-[1500px] space-y-2 px-5 pt-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              Could not regenerate: {error}. The plan below is the last one that loaded
              successfully.
            </p>
          )}
          {plan.sourceNote && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
              {plan.sourceNote}
            </p>
          )}
          {stale && !busy && !error && (
            <p className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500">
              Applying your latest change…
            </p>
          )}
        </div>
      )}

      <div className="mx-auto grid max-w-[1500px] gap-5 px-5 py-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ------------------------------------------------------------ side */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[73px] lg:self-start">
          <Card title="Automation settings">
            <div className="flex flex-col gap-4">
              <Field
                label="Season"
                hint={
                  settings.season === "auto" ? `calendar → ${plan.season}` : "manual override"
                }
              >
                <Segmented
                  label="Season"
                  value={settings.season}
                  onChange={(season) => apply({ season })}
                  options={[
                    { value: "auto", label: "Auto" },
                    { value: "summer", label: "Summer" },
                    { value: "winter", label: "Winter" },
                  ]}
                />
              </Field>

              <Field
                label="Simulate a date"
                hint={settings.simulatedDate ? "override" : "today"}
              >
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={settings.simulatedDate}
                    aria-label="Simulate a date"
                    onChange={(e) => apply({ simulatedDate: e.target.value })}
                    className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  />
                  {settings.simulatedDate && (
                    <Button variant="ghost" onClick={() => apply({ simulatedDate: "" })}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Set a January date with Season on Auto to watch the whole page switch
                  to winter.
                </p>
              </Field>

              <Field label="Rows on the homepage" hint={`${settings.maxRows} of ${MAX_ROWS}`}>
                <input
                  type="range"
                  min={MIN_ROWS}
                  max={MAX_ROWS}
                  step={1}
                  value={settings.maxRows}
                  aria-label="Rows on the homepage"
                  onChange={(e) => apply({ maxRows: Number(e.target.value) })}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{MIN_ROWS}</span>
                  <span>new products + categories + season</span>
                  <span>{MAX_ROWS}</span>
                </div>
              </Field>

              <Toggle
                checked={settings.brandDiversity}
                onChange={(brandDiversity) => apply({ brandDiversity })}
                label="One row per brand"
                hint="Off lets a single brand take several rows."
              />
            </div>
          </Card>

          <Card
            title="Categories"
            action={
              <button
                type="button"
                onClick={() =>
                  apply({ categoryIds: manual ? null : allCategories.map((c) => c.id) })
                }
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                {manual ? "Back to automatic" : "Pick manually"}
              </button>
            }
            bodyClassName="p-0"
          >
            <p className="border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500">
              {manual
                ? "Manual order — the homepage follows this list top to bottom."
                : "Automatic — ranked by brand priority, then by units sold."}
            </p>
            <ul className="max-h-[46vh] overflow-y-auto">
              {orderedCategories.map((category) => {
                const checked = selection.includes(category.id);
                return (
                  <li
                    key={category.id}
                    className="flex items-center gap-2 border-b border-slate-50 px-3 py-2 last:border-0 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category.id)}
                      aria-label={`Include ${category.brand} — ${category.label}`}
                      className="h-3.5 w-3.5 shrink-0 accent-slate-900"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`he block truncate text-[12px] ${checked ? "text-slate-800" : "text-slate-500"}`}
                      >
                        {category.label}
                      </span>
                      <span className="block truncate text-[10px] text-slate-500">
                        {category.brand} · {category.segment} · {category.productCount} items
                      </span>
                      {rowPosition.has(category.id) ? (
                        <span className="block text-[10px] font-semibold text-emerald-600">
                          On page · row {rowPosition.get(category.id)}
                        </span>
                      ) : (
                        skipById.has(category.id) && (
                          <span className="block truncate text-[10px] text-slate-400">
                            Skipped — {SKIP_LABEL[skipById.get(category.id)!.reason]}
                            {skipById.get(category.id)!.reason === "insufficient-products" &&
                              ` (${skipById.get(category.id)!.available} available)`}
                          </span>
                        )
                      )}
                    </span>
                    {manual && checked && (
                      <span className="flex shrink-0 flex-col">
                        <button
                          type="button"
                          onClick={() => move(category.id, -1)}
                          aria-label={`Move ${category.brand} up`}
                          className="px-1 text-[9px] leading-none text-slate-400 hover:text-slate-900"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => move(category.id, 1)}
                          aria-label={`Move ${category.brand} down`}
                          className="px-1 text-[9px] leading-none text-slate-400 hover:text-slate-900"
                        >
                          ▼
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Headline (requirement 1)">
            <p className="he text-sm font-semibold text-zolpo-red">{plan.headline.textHe}</p>
            <p className="he mt-1 text-[11px] text-slate-400 line-through">
              {HEADLINE.previousTextHe}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Links to{" "}
              <a
                href={plan.headline.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {plan.headline.url}
              </a>
            </p>
            {plan.headline.url === "/videos" && (
              <p className="mt-2 rounded-md bg-blue-50 p-2 text-[10px] leading-relaxed text-blue-800">
                <code>VIDEOS_PAGE_URL</code> is not set, so the link points at the
                built-in placeholder page.
              </p>
            )}
          </Card>

          <Card title="Data source">
            <dl className="space-y-1.5 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Source</dt>
                <dd className="font-semibold">
                  {live ? "WooCommerce REST v3" : "Built-in mock catalog"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Categories</dt>
                <dd className="font-semibold tabular-nums">{allCategories.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Products placed</dt>
                <dd className="font-semibold tabular-nums">{productCount}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Rows</dt>
                <dd className="font-semibold tabular-nums">{plan.rows.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Menu entries</dt>
                <dd className="font-semibold tabular-nums">
                  {plan.categoryMenu.items.length}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Strip brands</dt>
                <dd className="font-semibold tabular-nums">
                  {plan.brandStrip.brands.length}
                </dd>
              </div>
            </dl>
            {!live && (
              <p className="mt-3 rounded-md bg-slate-50 p-2 text-[10px] leading-relaxed text-slate-500">
                Set <code className="text-slate-700">WC_BASE_URL</code>,{" "}
                <code className="text-slate-700">WC_CONSUMER_KEY</code> and{" "}
                <code className="text-slate-700">WC_CONSUMER_SECRET</code> to run against
                the real store. On any error it falls back here.
              </p>
            )}
            <div className="mt-3">
              <Button variant="ghost" onClick={reset}>
                Reset to defaults
              </Button>
            </div>
          </Card>
        </aside>

        {/* ------------------------------------------------------- workspace */}
        <main className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                  tab === t.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "preview" && (
            <Card
              title="Live preview"
              action={
                <div className="flex items-center gap-2">
                  <Segmented
                    label="Preview device"
                    value={device}
                    onChange={setDevice}
                    options={[
                      { value: "desktop", label: "Desktop" },
                      { value: "mobile", label: "Mobile" },
                    ]}
                  />
                  <Button variant="ghost" onClick={() => setPreviewNonce((n) => n + 1)}>
                    Reload
                  </Button>
                </div>
              }
              bodyClassName="bg-slate-100 p-4"
            >
              <div className="mx-auto" style={{ maxWidth: device === "mobile" ? 390 : "100%" }}>
                <iframe
                  key={`${query}-${previewNonce}`}
                  src={`/?${query}&models=1&embed=1`}
                  title="Homepage preview"
                  className="h-[70vh] w-full rounded-lg border border-slate-300 bg-white shadow-sm"
                />
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Rendering <code className="text-slate-700">/?{query}&amp;models=1</code> — the
                same URL the Open shop button uses.
              </p>
            </Card>
          )}

          {tab === "rows" && plan.rows.length === 0 && (
            <Card>
              <p className="text-sm font-semibold text-slate-800">
                No rows could be generated.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Every OUTLET category was skipped — see the reason next to each one in
                the Categories panel. A category needs four sellable products before it
                can become a row.
              </p>
            </Card>
          )}

          {tab === "rows" && plan.rows.length > 0 && (
            <div className="flex flex-col gap-3" aria-busy={busy}>
              {plan.rows.map((row, i) => (
                <Card key={row.banner.id} bodyClassName="p-0">
                  <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="border-b border-slate-100 p-3 md:border-r md:border-b-0">
                      {/* The real banner, rendered at homepage size and scaled down,
                          so the thumbnail is the artwork rather than a crop of it. */}
                      <div className="pointer-events-none h-[126px] w-[236px] overflow-hidden rounded-md">
                        <div className="h-[330px] w-[620px] origin-top-left scale-[0.38]">
                          <Banner banner={row.banner} />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone={row.banner.kind === "category" ? "slate" : "blue"}>
                          {ROW_KIND_LABEL[row.banner.kind] ?? row.banner.kind}
                        </Badge>
                        <Badge tone="slate">
                          {BANNER_STYLE_LABEL[row.banner.style] ?? row.banner.style}
                        </Badge>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-0.5 pr-2 pl-0.5 text-[11px] font-semibold text-slate-600"
                          title={`Requirement 8: every ${row.banner.segment} banner reuses this one image`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.banner.modelImageUrl}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover object-top"
                          />
                          <span className="he">{row.banner.modelLabelHe}</span>
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="min-w-0">
                          <span className="text-[11px] text-slate-400">Row {i + 1}</span>
                          <span className="he block truncate text-sm font-semibold">
                            {row.category.name}
                          </span>
                        </p>
                        <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                          {row.banner.brand} · {row.banner.segment}
                        </span>
                      </div>

                      <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                        {row.products.map((p, index) => (
                          <li
                            key={p.id}
                            className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                          >
                            <span className="w-3 shrink-0 text-[10px] text-slate-400">
                              {index + 1}
                            </span>
                            <span className="he min-w-0 flex-1 truncate text-[11px] text-slate-700">
                              {p.name}
                            </span>
                            <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
                              {p.totalSales} sold
                            </span>
                          </li>
                        ))}
                      </ol>

                      <a
                        href={row.banner.ctaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block truncate text-[11px] text-blue-600 hover:underline"
                        title={row.banner.ctaUrl}
                      >
                        <bdi>{row.banner.ctaUrl}</bdi>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === "catalog" && (
            <div className="flex flex-col gap-4">
              <Card title="Brand strip (above the rows)">
                <p className="mb-3 text-[11px] text-slate-500">
                  Harvested from the OUTLET categories and their products, ordered by the
                  brand priority list then by units sold. Nothing here is typed by hand.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.brandStrip.brands.map((brand, i) => (
                    <span
                      key={brand.name}
                      className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700"
                    >
                      <span className="mr-1 tabular-nums text-slate-400">{i + 1}</span>
                      {brand.name}
                    </span>
                  ))}
                </div>
                <dl className="mt-3 space-y-1 text-[11px]">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-slate-500">Copy</dt>
                    <dd className="he font-medium">
                      {plan.brandStrip.titleHe} — {plan.brandStrip.subtitleHe}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-slate-500">CTA</dt>
                    <dd className="min-w-0 truncate">
                      {plan.brandStrip.ctaText} →{" "}
                      <a
                        href={plan.brandStrip.ctaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <bdi>{plan.brandStrip.ctaUrl}</bdi>
                      </a>
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card
                title={`Catalog menu — ${plan.categoryMenu.items.length} categories`}
                bodyClassName="p-0"
              >
                <p className="border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500">
                  The drawer the shopper opens from{" "}
                  <span className="font-semibold text-slate-700">כל הקטגוריות</span>. It is
                  deliberately never season-filtered — navigation must reach winter coats in
                  July — so it lists every OUTLET child and marks the ones the automation put
                  on the homepage today.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-[10px] tracking-wide text-slate-500 uppercase">
                        <th className="px-4 py-2 font-semibold">Category</th>
                        <th className="px-2 py-2 font-semibold">Brand</th>
                        <th className="px-2 py-2 font-semibold">Segment</th>
                        <th className="px-2 py-2 font-semibold">Season</th>
                        <th className="px-2 py-2 text-right font-semibold">Items</th>
                        <th className="px-4 py-2 font-semibold">Homepage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.categoryMenu.items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-4 py-2">
                            <span className="he block max-w-[240px] truncate font-medium">
                              {item.label}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-slate-600">{item.brand}</td>
                          <td className="px-2 py-2 capitalize text-slate-600">{item.segment}</td>
                          <td className="px-2 py-2 text-slate-600">{item.season}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-slate-600">
                            {item.productCount}
                          </td>
                          <td className="px-4 py-2">
                            {item.featured ? (
                              <Badge tone="green">
                                <Dot tone="green" />
                                featured
                              </Badge>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Fixed drawer links">
                <ul className="flex flex-wrap gap-1.5">
                  {plan.categoryMenu.linksHe.map((link) => (
                    <li
                      key={link.label}
                      className="he rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700"
                    >
                      {link.label}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {tab === "json" && (
            <Card
              title={`Plan JSON — ${(json.length / 1024).toFixed(1)} KB`}
              action={
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={copyJson}>
                    Copy
                  </Button>
                  <Button href={`/api/homepage?${query}&download=1`}>Download</Button>
                </div>
              }
              bodyClassName="p-0"
            >
              <p className="border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500">
                This document is the contract: the WordPress plugin consumes exactly these
                fields and writes the homepage blocks from them.
              </p>
              <pre className="max-h-[65vh] overflow-auto bg-slate-900 p-4 text-[11px] leading-relaxed text-slate-100">
                {json}
              </pre>
            </Card>
          )}

          {tab === "production" && (
            <div className="flex flex-col gap-4">
              <Card title="How this runs on the live store">
                <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-slate-700">
                  <li>
                    A small WordPress plugin runs on a daily WP-Cron job, plus a{" "}
                    <strong>Regenerate now</strong> button — the same two triggers this
                    console has.
                  </li>
                  <li>
                    It reads the{" "}
                    <span className="he font-semibold">מותגים OUTLET</span>{" "}
                    child categories and their best sellers straight from WooCommerce (
                    <code>orderby=popularity</code>), with no export step.
                  </li>
                  <li>
                    The season rule (summer Apr–Oct / winter Nov–Mar, manual override)
                    filters categories and products; one row per brand and no repeated
                    product are enforced by the engine, not by hand.
                  </li>
                  <li>
                    Banners are regenerated with the brand wordmark, the Hebrew category
                    name, a{" "}
                    <span className="he font-semibold">קנה עכשיו</span>{" "}
                    button, and the fixed model photo for that segment.
                  </li>
                  <li>
                    The catalog drawer and the brand strip are rebuilt from the same category
                    tree, so a new category appears in the navigation without anyone editing a
                    theme file.
                  </li>
                  <li>
                    Old homepage blocks are removed and the new rows written in (Elementor /
                    Gutenberg blocks or one shortcode), keeping the previous version so a bad
                    run can be rolled back in one click.
                  </li>
                </ol>
              </Card>

              <Card title="Endpoints">
                <ul className="space-y-1.5 text-[11px]">
                  <li>
                    <a
                      href={`/api/homepage?${query}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      GET /api/homepage?{query}
                    </a>{" "}
                    <span className="text-slate-400">— the plan for the current settings</span>
                  </li>
                  <li className="text-slate-500">
                    <code className="text-slate-700">season</code> auto | summer | winter ·{" "}
                    <code className="text-slate-700">rows</code> {MIN_ROWS}–{MAX_ROWS} ·{" "}
                    <code className="text-slate-700">diversity</code> 0 | 1 ·{" "}
                    <code className="text-slate-700">cats</code> comma-separated ids ·{" "}
                    <code className="text-slate-700">download</code> 1
                  </li>
                </ul>
              </Card>
            </div>
          )}
        </main>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {busy
          ? "Regenerating the homepage plan"
          : error
            ? `Regenerate failed: ${error}`
            : `Plan ready: ${plan.rows.length} rows, ${productCount} products, season ${plan.season}`}
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
