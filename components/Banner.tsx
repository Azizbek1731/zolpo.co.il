import BrandWordmark from "./BrandWordmark";
import type { Banner as BannerSpec } from "@/lib/types";

/**
 * Renders a `Banner` spec. Three looks, one contract — every variant shows the
 * brand wordmark, the Hebrew category title and the "קנה עכשיו" button that
 * links to the category URL (the client's requirement 6).
 */

interface Props {
  banner: BannerSpec;
  /** Small overlay chip proving the same model file is reused per segment. */
  showModelTag?: boolean;
}

function ModelPhoto({ banner, className }: { banner: BannerSpec; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={banner.modelImageUrl}
      alt={banner.modelLabelHe}
      // object-top keeps the face in frame when the mobile layout crops the photo
      // to a short strip above the copy.
      className={`h-full w-full object-cover object-top ${className ?? ""}`}
      loading="lazy"
    />
  );
}

function Cta({
  banner,
  tone,
}: {
  banner: BannerSpec;
  tone: "light" | "dark" | "red";
}) {
  const styles = {
    light: "bg-white text-zolpo-ink group-hover:bg-zolpo-sand",
    dark: "bg-zolpo-ink text-white group-hover:bg-zolpo-charcoal",
    // The live store's call to action is red; keep that on the daylight banners.
    red: "bg-zolpo-red text-white group-hover:bg-zolpo-red-dark",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-bold tracking-wide transition-all group-hover:translate-y-[-1px] md:px-5 md:py-2.5 ${styles}`}
    >
      {banner.ctaTextHe}
      <span aria-hidden="true" className="text-base leading-none">
        ›
      </span>
    </span>
  );
}

function ModelTag({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
      {label}
    </span>
  );
}

export default function Banner({ banner, showModelTag = false }: Props) {
  const shell =
    "group relative block h-full w-full overflow-hidden rounded-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg";

  if (banner.style === "photo") {
    return (
      <a href={banner.ctaUrl} className={shell} aria-label={banner.titleHe}>
        <div className="flex h-full flex-col md:flex-row">
          <div className="order-2 flex min-w-0 flex-1 flex-col justify-center gap-2.5 bg-zolpo-sand px-5 py-4 md:order-none md:flex-[1.15] md:gap-3 md:px-7 md:py-6">
            <BrandWordmark brand={banner.brand} logoUrl={banner.brandLogoUrl} size="md" />
            <div className="h-px w-full bg-zolpo-ink/15" />
            <h3 className="he text-2xl leading-tight font-extrabold text-zolpo-ink md:text-[28px]">
              {banner.titleHe}
            </h3>
            {banner.subtitleHe && (
              <p className="he text-sm text-zolpo-ink/70">{banner.subtitleHe}</p>
            )}
            {banner.promoLine && (
              <span className="he w-fit bg-zolpo-red px-2 py-0.5 text-xs font-black tracking-widest text-white">
                {banner.promoLine}
              </span>
            )}
            <div className="pt-1">
              <Cta banner={banner} tone="red" />
            </div>
          </div>
          <div className="relative order-1 h-28 w-full shrink-0 overflow-hidden bg-zolpo-sand-dark md:order-none md:h-auto md:w-[38%]">
            <ModelPhoto banner={banner} className="transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zolpo-sand to-transparent md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-10 md:bg-gradient-to-l" />
            {showModelTag && <ModelTag label={banner.modelLabelHe} />}
          </div>
        </div>
      </a>
    );
  }

  if (banner.style === "light") {
    return (
      <a href={banner.ctaUrl} className={`${shell} bg-white`} aria-label={banner.titleHe}>
        <div className="flex h-full flex-col md:flex-row">
          <div className="order-2 flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 bg-[#6e7278] px-5 py-4 text-center md:order-none md:gap-3 md:py-6">
            <BrandWordmark
              brand={banner.brand}
              logoUrl={banner.brandLogoUrl}
              tone="light"
              size="md"
              className="tracking-[0.3em]"
            />
            <div className="h-px w-24 bg-white/60" />
            <h3 className="he text-xl leading-tight font-bold text-white md:text-2xl">
              {banner.titleHe}
            </h3>
            {banner.subtitleHe && (
              <p className="he text-xs text-white/75">{banner.subtitleHe}</p>
            )}
            <div className="pt-1">
              <Cta banner={banner} tone="red" />
            </div>
          </div>
          <div className="relative order-1 h-28 w-full shrink-0 overflow-hidden md:order-none md:h-auto md:w-[42%]">
            <ModelPhoto banner={banner} className="transition-transform duration-500 group-hover:scale-105" />
            {showModelTag && <ModelTag label={banner.modelLabelHe} />}
          </div>
        </div>
      </a>
    );
  }

  // dark
  return (
    <a
      href={banner.ctaUrl}
      className={`${shell} bg-zolpo-ink`}
      aria-label={banner.titleHe}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,#3a3f4b_0%,#16181d_55%,#0b0c0f_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-zolpo-red/25 blur-3xl"
      />
      <div className="relative flex h-full flex-col md:flex-row">
        <div className="order-2 flex min-w-0 flex-1 flex-col justify-center gap-2 px-5 py-4 md:order-none md:gap-2.5 md:px-7 md:py-6">
          <BrandWordmark
            brand={banner.brand}
            logoUrl={banner.brandLogoUrl}
            tone="light"
            size="lg"
          />
          <h3 className="he text-xl leading-tight font-extrabold text-white md:text-2xl">
            {banner.titleHe}
          </h3>
          {banner.subtitleHe && (
            <p className="he text-xs text-white/60">{banner.subtitleHe}</p>
          )}
          {banner.promoLine && (
            <span className="he text-3xl leading-none font-black text-zolpo-red drop-shadow-[0_2px_10px_rgba(226,27,27,0.45)] md:text-4xl">
              {banner.promoLine}
            </span>
          )}
          <div className="pt-1.5">
            <Cta banner={banner} tone="light" />
          </div>
        </div>
        <div className="relative order-1 h-28 w-full shrink-0 overflow-hidden md:order-none md:h-auto md:w-[36%]">
          <ModelPhoto
            banner={banner}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          {/* The studio backdrop is light; bleed the charcoal panel across it so
              the model sits inside the banner instead of next to it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-zolpo-ink via-zolpo-ink/35 to-zolpo-ink/5 md:bg-gradient-to-l"
          />
          {showModelTag && <ModelTag label={banner.modelLabelHe} />}
        </div>
      </div>
    </a>
  );
}
