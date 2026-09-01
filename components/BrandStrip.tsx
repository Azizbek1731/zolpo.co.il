import BrandWordmark from "./BrandWordmark";
import type { BrandStrip as Strip } from "@/lib/types";

/**
 * The full-width brand banner that sits between the headline and the product rows
 * on the live homepage. The wordmarks are not a hand-kept list: they are harvested
 * from the OUTLET categories and their products, ordered by the brand priority list
 * and then by units sold.
 */
export default function BrandStrip({ strip }: { strip: Strip }) {
  const half = Math.ceil(strip.brands.length / 2);
  const groups = [strip.brands.slice(0, half), strip.brands.slice(half)];

  return (
    <a
      href={strip.ctaUrl}
      aria-label={strip.titleHe}
      className="group relative block overflow-hidden border-y border-black/5 bg-[#f4f2ef] transition-shadow hover:shadow-md"
    >
      {/* Painterly wash, echoing the brush strokes on the current banner. */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -top-10 right-[12%] h-40 w-64 -rotate-12 rounded-full bg-rose-200/45 blur-2xl" />
        <div className="absolute -bottom-12 left-[18%] h-40 w-72 rotate-6 rounded-full bg-slate-300/40 blur-2xl" />
        <div className="absolute top-1/3 left-[45%] h-24 w-40 -rotate-6 rounded-full bg-amber-100/60 blur-2xl" />
      </div>

      <div className="relative mx-auto flex max-w-[1240px] flex-col items-center gap-4 px-5 py-5 md:flex-row md:justify-between md:gap-6 md:px-8 md:py-6">
        <ul className="hidden shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 md:flex md:max-w-[26%]">
          {groups[0].map((brand) => (
            <li key={brand.name}>
              <BrandWordmark
                brand={brand.name}
                logoUrl={brand.logoUrl}
                size="sm"
                className="opacity-70"
              />
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="he text-lg leading-tight font-extrabold text-zolpo-ink md:text-2xl">
            {strip.titleHe}
          </p>
          <p className="he text-sm font-semibold text-zolpo-ink/65 md:text-base">
            {strip.subtitleHe}
          </p>
          <span
            dir="ltr"
            className="font-latin mt-1 inline-flex items-center gap-1 text-base font-black tracking-wide text-zolpo-red transition-transform group-hover:translate-x-0.5 md:text-lg"
          >
            {strip.ctaText}
            <span aria-hidden="true">›</span>
          </span>
        </div>

        <ul className="hidden shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 md:flex md:max-w-[26%]">
          {groups[1].map((brand) => (
            <li key={brand.name}>
              <BrandWordmark
                brand={brand.name}
                logoUrl={brand.logoUrl}
                size="sm"
                className="opacity-70"
              />
            </li>
          ))}
        </ul>

        {/* Mobile: one wrapped row under the copy. */}
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 md:hidden">
          {strip.brands.slice(0, 8).map((brand) => (
            <li key={brand.name}>
              <BrandWordmark
                brand={brand.name}
                logoUrl={brand.logoUrl}
                size="sm"
                className="opacity-60"
              />
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
}
