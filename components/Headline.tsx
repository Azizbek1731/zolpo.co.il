import { HEADLINE } from "@/lib/config";

/**
 * Requirement 1: the old slogan is replaced by a link to the real-videos page.
 * The struck-out line underneath exists only in this preview, so the client can
 * see at a glance which string the automation swapped.
 */
export default function Headline({ showDiff = false }: { showDiff?: boolean }) {
  return (
    <section className="mx-auto max-w-[1240px] px-4 pt-7 pb-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-zolpo-ink/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-zolpo-red" />
        <a
          href={HEADLINE.url}
          className="he px-2 text-center text-xl font-extrabold text-zolpo-red underline-offset-4 hover:underline md:text-3xl"
        >
          {HEADLINE.textHe}
        </a>
        <span className="h-1.5 w-1.5 rounded-full bg-zolpo-red" />
        <span className="h-px flex-1 bg-zolpo-ink/25" />
      </div>

      {showDiff && (
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 ring-1 ring-emerald-200">
          עודכן אוטומטית
        </span>
        <span className="he text-zolpo-ink/40 line-through">
          {HEADLINE.previousTextHe}
        </span>
        <span dir="ltr" className="font-latin text-zolpo-ink/40">
          → {HEADLINE.url}
        </span>
      </div>
      )}
    </section>
  );
}
