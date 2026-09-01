import { isSerifBrand } from "@/lib/brands";

/**
 * Brand wordmarks are rendered as styled text, never as third-party logo files.
 * `brandLogoUrl` is the slot the client fills with their own approved logo
 * assets — when it is set the image wins and the text becomes the alt copy.
 */

interface Props {
  brand: string;
  logoUrl?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "text-[11px]",
  md: "text-sm md:text-base",
  lg: "text-lg md:text-2xl",
};

export default function BrandWordmark({
  brand,
  logoUrl,
  tone = "dark",
  size = "md",
  className = "",
}: Props) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={brand}
        className={`h-8 w-auto object-contain ${className}`}
      />
    );
  }

  const serif = isSerifBrand(brand);
  const color = tone === "light" ? "text-white" : "text-zolpo-ink";

  return (
    <span
      dir="ltr"
      className={`font-latin block uppercase leading-none ${color} ${SIZES[size]} ${
        serif ? "font-medium tracking-[0.28em]" : "font-black tracking-[0.1em]"
      } ${className}`}
      style={serif ? { fontFamily: "Georgia, 'Times New Roman', serif" } : undefined}
    >
      {brand}
    </span>
  );
}
