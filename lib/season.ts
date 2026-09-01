import type { Season, SeasonSetting } from "./types";

/**
 * Israeli retail season split used by the automation.
 *   summer = April .. October
 *   winter = November .. March
 */
export function detectSeason(now: Date = new Date()): Exclude<Season, "all"> {
  const month = now.getMonth() + 1; // 1..12
  return month >= 4 && month <= 10 ? "summer" : "winter";
}

/** Manual override always wins over the calendar. */
export function resolveSeason(
  setting: SeasonSetting,
  now: Date = new Date(),
): Exclude<Season, "all"> {
  return setting === "auto" ? detectSeason(now) : setting;
}

/** A category/product is eligible when it matches the season or is year-round. */
export function matchesSeason(itemSeason: Season, active: Season): boolean {
  return itemSeason === "all" || itemSeason === active;
}

export const SEASON_LABEL_HE: Record<Exclude<Season, "all">, string> = {
  summer: "קיץ",
  winter: "חורף",
};

export const SEASON_BANNER: Record<
  Exclude<Season, "all">,
  { latin: string; titleHe: string; subtitleHe: string }
> = {
  summer: {
    latin: "SUMMER STYLES",
    titleHe: "סטיילים לקיץ",
    subtitleHe: 'סנדלים, טי שירט ובגדי ים – מבצעי סוף עונה',
  },
  winter: {
    latin: "WINTER ESSENTIALS",
    titleHe: "מעילים ונעליים לחורף",
    subtitleHe: 'מעילי פוך, סריגים ומגפיים – המותגים המובילים',
  },
};
