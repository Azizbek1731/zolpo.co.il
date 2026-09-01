"use client";

import { useEffect, useMemo, useState } from "react";
import BrandWordmark from "./BrandWordmark";
import ProductArt from "./ProductArt";
import { SEGMENT_LABEL_HE } from "@/lib/models";
import type { CategoryMenu as Menu, CategoryMenuItem, Segment } from "@/lib/types";

/**
 * The OUTLET catalog panel — the drawer the live zolpo.co.il homepage opens from
 * the right edge, rebuilt as something a shopper can actually navigate.
 *
 * Everything in it is generated: the entries come from the same category tree that
 * feeds the banners, and each thumbnail is that category's current best seller, so
 * the picture always matches what the shopper lands on.
 */

type Filter = "all" | Segment;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "הכל" },
  { id: "men", label: SEGMENT_LABEL_HE.men },
  { id: "women", label: SEGMENT_LABEL_HE.women },
  { id: "kids", label: SEGMENT_LABEL_HE.kids },
];

function Icon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function Thumb({ item }: { item: CategoryMenuItem }) {
  return (
    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/95 ring-1 ring-white/10">
      {item.preview?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.preview.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain"
        />
      ) : item.preview ? (
        <ProductArt
          kind={item.preview.kind}
          color={item.preview.colorHex}
          className="h-full w-full scale-90"
        />
      ) : null}
    </span>
  );
}

function Row({ item }: { item: CategoryMenuItem }) {
  return (
    <li>
      <a
        href={item.url}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
      >
        <Thumb item={item} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            {item.featured && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                title="מוצג היום בעמוד הבית"
              />
            )}
            <span className="he block truncate text-[13.5px] leading-snug font-semibold text-white">
              {item.label}
            </span>
          </span>
          <span className="mt-1 block">
            <BrandWordmark
              brand={item.brand}
              tone="light"
              size="sm"
              className="truncate text-right opacity-45"
            />
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          <span
            dir="ltr"
            className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-white/40"
            title={`${item.productCount} פריטים`}
          >
            {item.productCount}
          </span>
          <span className="text-white/25 transition-all group-hover:-translate-x-0.5 group-hover:text-white/70">
            <Icon path="m15 18-6-6 6-6" className="h-4 w-4" />
          </span>
        </span>
      </a>
    </li>
  );
}

export default function CategoryMenu({
  menu,
  defaultOpen = false,
}: {
  menu: Menu;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Escape closes the drawer, and the page must not scroll behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const counts = useMemo(() => {
    const tally: Record<Filter, number> = {
      all: menu.items.length,
      men: 0,
      women: 0,
      kids: 0,
    };
    for (const item of menu.items) tally[item.segment] += 1;
    return tally;
  }, [menu.items]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return menu.items.filter((item) => {
      if (filter !== "all" && item.segment !== filter) return false;
      if (!needle) return true;
      return (
        item.label.toLowerCase().includes(needle) ||
        item.brand.toLowerCase().includes(needle)
      );
    });
  }, [menu.items, filter, query]);

  const featuredCount = menu.items.filter((i) => i.featured).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="zolpo-category-drawer"
        className="flex h-10 items-center gap-2 rounded-sm bg-zolpo-ink px-3 text-[13px] font-bold text-white transition-colors hover:bg-zolpo-charcoal"
      >
        <Icon path="M4 6h16M4 12h16M4 18h16" />
        כל הקטגוריות
        <span className="rounded-full bg-white/20 px-1.5 text-[11px] tabular-nums">
          {menu.items.length}
        </span>
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="zolpo-category-drawer"
        aria-label={menu.titleHe}
        aria-hidden={!open}
        // `aria-hidden` alone leaves the off-screen links in the tab order; `inert`
        // removes them from both.
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[60] flex w-[92vw] max-w-[380px] flex-col bg-[#101216] text-white shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* -------------------------------------------------------- header */}
        <div className="shrink-0 border-b border-white/10 bg-gradient-to-b from-[#181b21] to-[#101216] px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-lg leading-none font-black text-zolpo-red">
                זולפה
              </span>
              <span className="mt-1 block text-[11px] text-white/45">
                {menu.items.length} קטגוריות במותגי OUTLET
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
              aria-label="סגירה"
            >
              <Icon path="m6 6 12 12M18 6 6 18" />
            </button>
          </div>

          <div className="relative mt-3">
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/35">
              <Icon path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש קטגוריה או מותג"
              aria-label="חיפוש קטגוריה או מותג"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pr-10 pl-3 text-[13px] text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="mt-3 flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors ${
                  filter === f.id
                    ? "bg-zolpo-red text-white"
                    : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{f.label}</span>
                <span
                  dir="ltr"
                  className={`rounded px-1 text-[10px] tabular-nums ${
                    filter === f.id ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  {counts[f.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------- category list */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <a
            href={menu.url}
            className="mx-1 mb-1 flex items-center justify-between rounded-lg bg-zolpo-red px-3 py-2.5 transition-colors hover:bg-zolpo-red-dark"
          >
            <span className="he text-sm font-extrabold">{menu.titleHe}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-white/80">
              לכל המותגים
              <Icon path="m15 18-6-6 6-6" className="h-3.5 w-3.5" />
            </span>
          </a>

          {visible.length > 0 ? (
            <ul>
              {visible.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-[13px] text-white/40">
              לא נמצאו קטגוריות עבור
              <span className="he mx-1 font-semibold text-white/70">{query}</span>
            </p>
          )}

          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
              שירות ומידע
            </p>
            <ul>
              {menu.linksHe.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.url}
                    className="block rounded-lg px-3 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* -------------------------------------------------------- footer */}
        <p className="shrink-0 border-t border-white/10 bg-[#0c0e11] px-4 py-3 text-[11px] leading-relaxed text-white/35">
          התפריט נוצר אוטומטית מקטגוריות{" "}
          <span className="he text-white/55">{menu.titleHe}</span> ·{" "}
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span dir="ltr" className="tabular-nums">
              {featuredCount}
            </span>{" "}
            מוצגות היום בעמוד הבית
          </span>
        </p>
      </aside>
    </>
  );
}
