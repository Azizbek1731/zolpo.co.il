import Link from "next/link";

import BrandStrip from "@/components/BrandStrip";
import Header from "@/components/Header";
import Headline from "@/components/Headline";
import HomepageRow from "@/components/HomepageRow";
import { buildPlan } from "@/lib/data";
import { parsePlanOptions, parseViewParams } from "@/lib/params";
import { formatHe } from "@/lib/format";
import { SEASON_LABEL_HE } from "@/lib/season";
// The plan carries a timestamp and reads live WooCommerce data when configured,
// so it must never be baked in at build time.
export const dynamic = "force-dynamic";

export default async function HomePreview({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const view = parseViewParams(params);
  const plan = await buildPlan(parsePlanOptions(params));

  return (
    <main className="bg-white">
      <Header menu={plan.categoryMenu} menuOpen={view.menu} />
      <Headline showDiff={view.demo} />

      <div className="pb-8">
        <BrandStrip strip={plan.brandStrip} />
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pb-14 md:gap-10">
        {plan.rows.map((row) => (
          <HomepageRow key={row.banner.id} row={row} showModelTag={view.models} />
        ))}
      </div>

      <footer className="border-t border-zolpo-line bg-[#fafbfc]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-5 text-[12px] text-zolpo-ink/55">
          <span>נוצר אוטומטית</span>
          <span aria-hidden="true">·</span>
          <span>
            עודכן <span dir="ltr">{formatHe(plan.generatedAt)}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>עונה: {SEASON_LABEL_HE[plan.season]}</span>
          <span aria-hidden="true">·</span>
          <span>
            מקור נתונים:{" "}
            <span dir="ltr" className="font-latin">
              {plan.source === "woocommerce" ? "WooCommerce API" : "mock catalog"}
            </span>
          </span>
        </div>
      </footer>

      {!view.embed && (
      <Link
        href="/admin"
        className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-zolpo-ink px-4 py-2 text-[13px] font-semibold text-white shadow-lg transition-colors hover:bg-zolpo-charcoal"
      >
        <span dir="ltr" className="font-latin">
          Admin
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </Link>
      )}
    </main>
  );
}
