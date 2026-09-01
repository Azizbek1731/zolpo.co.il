/** Tiny hex helpers so the generated product art always has readable contrast. */

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

const toHex = (rgb: number[]) =>
  "#" + rgb.map((v) => clamp(v).toString(16).padStart(2, "0")).join("");

export function shade(hex: string, amount: number): string {
  const rgb = parse(hex);
  return toHex(
    amount < 0
      ? rgb.map((v) => v * (1 + amount))
      : rgb.map((v) => v + (255 - v) * amount),
  );
}

export function luminance(hex: string): number {
  const [r, g, b] = parse(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** A stroke that stays visible on both cream and near-black garments. */
export function outlineFor(hex: string): string {
  const l = luminance(hex);
  if (l < 0.22) return shade(hex, 0.42); // near-black: lighten the edge instead
  return l > 0.75 ? shade(hex, -0.45) : shade(hex, -0.35);
}

/** Straps sit on top of the garment body, so they need the opposite tone. */
export function strapFor(hex: string): string {
  return luminance(hex) < 0.4 ? shade(hex, 0.55) : shade(hex, -0.4);
}
