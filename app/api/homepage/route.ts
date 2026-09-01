import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/data";
import { parsePlanOptions } from "@/lib/params";

export const dynamic = "force-dynamic";

/**
 * GET /api/homepage?season=auto|summer|winter&rows=3..8&cats=100,109&diversity=0|1
 *                  &now=YYYY-MM-DD[&download=1]
 *
 * This is the contract the WordPress side consumes: one JSON document that fully
 * describes the homepage. Everything else in the app is a renderer. Parsing lives
 * in `lib/params.ts` so the console, the preview and this route cannot disagree.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = await buildPlan(parsePlanOptions(searchParams));

  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (searchParams.get("download") === "1") {
    const stamp = plan.generatedAt.slice(0, 10);
    headers["Content-Disposition"] =
      `attachment; filename="zolpo-homepage-plan-${plan.season}-${stamp}.json"`;
  }

  return NextResponse.json(plan, { headers });
}
