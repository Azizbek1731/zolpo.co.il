/** Israel-local formatting shared by the preview and the admin console. */

const HE_DATE = new Intl.DateTimeFormat("he-IL", {
  timeZone: "Asia/Jerusalem",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const EN_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jerusalem",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatHe = (iso: string) => HE_DATE.format(new Date(iso));
export const formatEn = (iso: string) => EN_DATE.format(new Date(iso));
export const shekel = (value: number) => `₪${value.toFixed(2)}`;
