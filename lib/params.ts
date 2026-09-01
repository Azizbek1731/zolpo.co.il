import { MAX_ROWS, MIN_ROWS } from "./config";
import type { GenerateOptions, SeasonSetting } from "./types";

/**
 * One parser for the homepage query string.
 *
 * The console, the server-rendered preview and the API all read the same params
 * through this module — otherwise "Open shop" renders a different homepage than
 * the table beside it.
 */

export type ParamInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function read(input: ParamInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const raw = input[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

const MAX_CATS = 40;
const MAX_CATS_CHARS = 256;

export function parseSeason(value: string | undefined): SeasonSetting {
  return value === "summer" || value === "winter" || value === "auto"
    ? value
    : "auto";
}

export function parseRows(value: string | undefined): number | undefined {
  if (!/^\d{1,3}$/.test(value ?? "")) return undefined;
  const n = Number.parseInt(value as string, 10);
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, n));
}

/**
 * `cats=100,109,110` — the operator's explicit allow-list *and* order.
 * Junk is dropped rather than coerced: `100abc` is not 100, and a negative id
 * would collide with the synthetic ids the engine uses for its two special rows.
 */
export function parseCategoryOrder(value: string | undefined): number[] | undefined {
  if (!value || value.length > MAX_CATS_CHARS) return undefined;
  const seen = new Set<number>();
  for (const part of value.split(",")) {
    const token = part.trim();
    if (!/^\d{1,9}$/.test(token)) continue;
    seen.add(Number.parseInt(token, 10));
    if (seen.size >= MAX_CATS) break;
  }
  // An empty result must mean "no allow-list", never "allow nothing".
  return seen.size ? [...seen] : undefined;
}

export function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "0" || value === "false") return false;
  if (value === "1" || value === "true") return true;
  return undefined;
}

/** `now=YYYY-MM-DD` lets the console demonstrate the season rule in one click. */
export function parseNow(value: string | undefined): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return undefined;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parsePlanOptions(input: ParamInput): GenerateOptions {
  return {
    season: parseSeason(read(input, "season")),
    maxRows: parseRows(read(input, "rows")),
    categoryIds: parseCategoryOrder(read(input, "cats")),
    brandDiversity: parseBoolean(read(input, "diversity")),
    now: parseNow(read(input, "now")),
  };
}

export interface ViewParams {
  /** Show the "same model per segment" overlay chips. */
  models: boolean;
  /** Show the headline before/after annotation. */
  demo: boolean;
  /** Open the catalog drawer on load. */
  menu: boolean;
  /** Rendered inside the console iframe — hides the floating Admin chip. */
  embed: boolean;
}

export function parseViewParams(input: ParamInput): ViewParams {
  return {
    models: read(input, "models") === "1",
    demo: read(input, "demo") === "1",
    menu: read(input, "menu") === "1",
    embed: read(input, "embed") === "1",
  };
}

/** Build the canonical query string. Never string-interpolate these by hand. */
export function planQuery(
  options: GenerateOptions,
  view: Partial<ViewParams> & { download?: boolean } = {},
): string {
  const params = new URLSearchParams();
  params.set("season", options.season ?? "auto");
  if (options.maxRows) params.set("rows", String(options.maxRows));
  if (options.categoryIds?.length) params.set("cats", options.categoryIds.join(","));
  if (options.brandDiversity === false) params.set("diversity", "0");
  if (view.models) params.set("models", "1");
  if (view.demo) params.set("demo", "1");
  if (view.menu) params.set("menu", "1");
  if (view.embed) params.set("embed", "1");
  if (view.download) params.set("download", "1");
  return params.toString();
}
