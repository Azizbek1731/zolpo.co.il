import { outlineFor, shade, strapFor } from "@/lib/color";
import type { ProductKind } from "@/lib/types";

/**
 * Generated product art.
 *
 * The demo must not depend on external image hosts, so every mock product is
 * drawn from its `kind` + `colorHex`. When the live WooCommerce adapter is on,
 * `ProductCard` renders the real `imageUrl` instead and this is never used.
 */

interface Props {
  kind: ProductKind;
  color: string;
  className?: string;
}

function Shapes({ kind }: { kind: ProductKind }) {
  switch (kind) {
    case "hoodie":
      return (
        <>
          <path className="fill" d="M68 46 40 62 28 108l22 10 10-26v80h80V92l10 26 22-10-12-46-28-16z" />
          <path className="fill" d="M74 46c0-22 12-32 26-32s26 10 26 32c-8 12-18 18-26 18s-18-6-26-18z" />
          <path className="line" d="M88 58 86 96M112 58l2 38" />
          <circle className="dot" cx="86" cy="99" r="4" />
          <circle className="dot" cx="114" cy="99" r="4" />
          <path className="line" d="M70 128h60v30H70z" />
        </>
      );
    case "polo":
      return (
        <>
          <path className="fill" d="M70 40 34 62l14 26 16-10v88h72V78l16 10 14-26-36-22-30 24z" />
          <path className="line" d="M100 64v46" />
          <circle className="dot" cx="100" cy="76" r="3.5" />
          <circle className="dot" cx="100" cy="96" r="3.5" />
          <path className="line" d="M84 40l16 22 16-22" />
        </>
      );
    case "tshirt":
      return (
        <>
          <path className="fill" d="M70 40 34 62l14 26 16-10v88h72V78l16 10 14-26-36-22c-4 14-16 20-30 20s-26-6-30-20z" />
          <path className="line" d="M74 44c6 14 16 20 26 20s20-6 26-20" />
        </>
      );
    case "shirt":
      return (
        <>
          <path className="fill" d="M72 38 44 50 34 150l24 6 6-60v72h72V96l6 60 24-6-10-100-28-12-28 28z" />
          <path className="line" d="M100 66v100" />
          <path className="fill2" d="M72 38l28 28 28-28-12-6-16 18-16-18z" />
          <circle className="dot" cx="100" cy="90" r="3.5" />
          <circle className="dot" cx="100" cy="118" r="3.5" />
          <circle className="dot" cx="100" cy="146" r="3.5" />
        </>
      );
    case "sweater":
      return (
        <>
          <path className="fill" d="M70 42 42 56 30 140l24 8 8-40v56h76v-56l8 40 24-8-12-84-28-14c-4 14-16 20-30 20s-26-6-30-20z" />
          <path className="fill2" d="M62 152h76v14H62z" />
          <path className="line" d="M74 44c6 14 16 20 26 20s20-6 26-20" />
          <path className="line" d="M84 78l16 20 16-20" />
        </>
      );
    case "pants":
      return (
        <>
          <path className="fill" d="M62 40h76l6 60-6 76h-28l-10-70-10 70H62l-6-76z" />
          <path className="fill2" d="M60 38h80v16H60z" />
          <path className="line" d="M100 58v48M74 62l-6 40M126 62l6 40" />
        </>
      );
    case "coat":
      return (
        <>
          <path className="fill" d="M72 36 42 50 32 142l24 8 6-44v76h76v-76l6 44 24-8-10-92-30-14-28 30z" />
          <path className="fill2" d="M72 36l28 30 28-30-14-6-14 16-14-16z" />
          <path className="fill2" d="M62 116h76v14H62z" />
          <path className="line" d="M100 70v98" />
          <circle className="dot" cx="100" cy="94" r="3.5" />
          <circle className="dot" cx="100" cy="146" r="3.5" />
        </>
      );
    case "tracksuit":
      return (
        <>
          <path className="fill" d="M52 30 30 42l-8 50 16 6 6-26v60h56V72l6 26 16-6-8-50-22-12-16 18z" />
          <path className="line" d="M72 48v84" />
          <path className="fill" d="M118 108h60l4 34-4 44h-22l-8-40-8 40h-22l-4-44z" />
          <path className="line" d="M148 122v30" />
        </>
      );
    case "sneaker":
      return (
        <>
          <path className="fill" d="M20 142c-2-20 12-32 34-38l42-14 16-18c6-7 16-5 19 4l7 20 8-16c5-10 17-8 20 3l8 59z" />
          <path className="fill2" d="M12 142h178c3 13-7 23-20 23H32c-13 0-23-10-20-23z" />
          <path className="line" d="M38 134c26-6 50-19 68-36" />
          <path className="line" d="M96 90l14 11M104 76l14 11" />
          <path className="line" d="M158 80l6 42" />
        </>
      );
    case "sandal":
      return (
        <>
          <path className="band" d="M48 132C48 94 71 76 100 76s52 18 52 56" />
          <path className="fill2" d="M20 122h160c4 0 7 3 7 7v9H13v-9c0-4 3-7 7-7z" />
          <path className="fill2" d="M14 138h172c3 13-6 23-19 23H33c-13 0-22-10-19-23z" />
          <path className="line" d="M30 149h140" />
        </>
      );
    case "boot":
      return (
        <>
          <path className="fill" d="M70 32h58v96c0 20 12 30 28 34 10 3 10 14 0 14H76c-4 0-6-3-6-7z" />
          <path className="fill2" d="M64 20h70v22H64z" />
          <path className="fill2" d="M70 156h96c3 9-3 18-14 18H78c-8 0-10-9-8-18z" />
          <path className="line" d="M70 108h58M84 46v66" />
        </>
      );
    case "bag":
      return (
        <>
          <path className="strap" d="M74 92V72c0-17 12-28 26-28s26 11 26 28v20" />
          <path className="fill" d="M46 88h108c8 0 14 6 15 14l8 60c1 10-6 18-16 18H39c-10 0-17-8-16-18l8-60c1-8 7-14 15-14z" />
          <path className="fill2" d="M25 112h150l-2-16H27z" />
          <path className="fill2" d="M90 122h20v20H90z" />
        </>
      );
    default:
      return null;
  }
}

export default function ProductArt({ kind, color, className }: Props) {
  const gradientId = `art-bg-${kind}-${color.replace("#", "")}`;
  const vars = {
    "--art-fill": color,
    "--art-stroke": outlineFor(color),
    "--art-accent": shade(color, -0.18),
    "--art-strap": strapFor(color),
  } as React.CSSProperties;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`product-art ${className ?? ""}`}
      style={vars}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef0f3" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradientId})`} />
      <ellipse cx="100" cy="176" rx="62" ry="9" fill="#0f172a" opacity="0.06" />
      <Shapes kind={kind} />
    </svg>
  );
}
