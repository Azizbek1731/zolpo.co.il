import type { Segment } from "./types";

/**
 * Requirement 8: every banner for a given segment must use the *same* model.
 *
 * The engine never picks a model per-product or per-category — it only ever
 * reads this map, so the whole homepage stays visually coherent. To use real
 * AI-generated photos, drop the files into `public/models/` and change the
 * three paths below; nothing else in the codebase needs to change.
 */
export const MODEL_IMAGES: Record<Segment, string> = {
  men: "/models/men.jpg",
  women: "/models/women.jpg",
  kids: "/models/kids.jpg",
};

export const MODEL_LABELS_HE: Record<Segment, string> = {
  men: "מודל קבוע · גברים",
  women: "מודל קבוע · נשים",
  kids: "מודל קבוע · ילדים",
};

export const SEGMENT_LABEL_HE: Record<Segment, string> = {
  men: "גברים",
  women: "נשים",
  kids: "ילדים",
};
