"use client";

import { useEffect, useState } from "react";
import { SEGMENT_LABEL_HE } from "@/lib/models";
import { SEASON_LABEL_HE } from "@/lib/season";
import type { CategoryMenu as Menu } from "@/lib/types";

/**
 * The OUTLET catalog drawer — the panel the live zolpo.co.il homepage opens from
 * the right edge. Every entry under `מותגים OUTLET` is generated from the same
 * category tree that feeds the banners, so adding a category in WooCommerce puts
 * it in the menu without anyone editing a theme file.
 */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  const [groupOpen, setGroupOpen] = useState(true);

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
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
        כל הקטגוריות
        <span className="rounded-full bg-white/20 px-1.5 text-[11px] tabular-nums">
          {menu.items.length}
        </span>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="zolpo-category-drawer"
        aria-label={menu.titleHe}
        aria-hidden={!open}
        // `aria-hidden` alone leaves 26 off-screen links in the tab order; `inert`
        // removes them from both.
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[60] flex w-[86vw] max-w-[330px] flex-col bg-zolpo-ink text-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="text-sm font-bold">התפריט של זולפה</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/10 transition-colors hover:bg-white/20"
            aria-label="סגירה"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain">
          <ul className="border-b border-white/10 py-1">
            {menu.linksHe.map((link) => (
              <li key={link.label}>
                <a
                  href={link.url}
                  className="block px-4 py-2.5 text-[13px] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-stretch bg-zolpo-red">
            <a
              href={menu.url}
              className="he flex-1 px-4 py-3 text-sm font-extrabold transition-colors hover:bg-zolpo-red-dark"
            >
              {menu.titleHe}
            </a>
            <button
              type="button"
              onClick={() => setGroupOpen((v) => !v)}
              aria-expanded={groupOpen}
              aria-label={groupOpen ? "כיווץ" : "הרחבה"}
              className="flex w-11 items-center justify-center transition-colors hover:bg-zolpo-red-dark"
            >
              <Chevron open={groupOpen} />
            </button>
          </div>

          {groupOpen && (
            <ul className="pb-4">
              {menu.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5 transition-colors hover:bg-white/10"
                  >
                    <span className="min-w-0">
                      <span className="he block truncate text-[13px] text-white/90">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-white/35">
                        {SEGMENT_LABEL_HE[item.segment]} ·{" "}
                        {item.season === "all" ? "כל השנה" : SEASON_LABEL_HE[item.season]} ·{" "}
                        <span dir="ltr" className="tabular-nums">
                          {item.productCount}
                        </span>{" "}
                        פריטים
                      </span>
                    </span>
                    {item.featured && (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                        בעמוד הבית
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <p className="border-t border-white/10 px-4 py-3 text-[11px] text-white/40">
          נוצר אוטומטית מקטגוריות{" "}
          <span className="he text-white/60">{menu.titleHe}</span> ·{" "}
          <span dir="ltr" className="tabular-nums">
            {featuredCount}
          </span>{" "}
          מתוכן מוצגות היום בעמוד הבית
        </p>
      </aside>
    </>
  );
}
