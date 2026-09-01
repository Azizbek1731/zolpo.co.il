import ProductArt from "./ProductArt";
import { shekel } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Product card in the live store's style: image, two-line Hebrew name,
 * Latin brand in caps, price in green shekels with the old price struck out.
 */

export default function ProductCard({ product }: { product: Product }) {
  const discounted =
    typeof product.regularPrice === "number" && product.regularPrice > product.price;

  return (
    <a
      href={product.url}
      className="group flex h-full flex-col rounded-sm border border-transparent p-2 transition-colors hover:border-zolpo-line"
    >
      <div className="relative overflow-hidden rounded-sm bg-[#f6f7f9]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ProductArt
            kind={product.kind}
            color={product.colorHex}
            className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {discounted && (
          <span
            dir="ltr"
            className="font-latin absolute top-2 right-2 bg-zolpo-red px-1.5 py-0.5 text-[10px] font-black text-white"
          >
            -
            {Math.round(
              ((product.regularPrice! - product.price) / product.regularPrice!) * 100,
            )}
            %
          </span>
        )}
      </div>

      <h4 className="he mt-2.5 line-clamp-2 text-center text-[13px] leading-snug font-medium text-zolpo-ink">
        {product.name}
      </h4>
      <p
        dir="ltr"
        className="font-latin mt-1 text-center text-[12px] font-semibold tracking-wide text-zolpo-ink/65 uppercase"
      >
        {product.brand}
      </p>

      <div className="mt-auto flex items-baseline justify-center gap-2 pt-2">
        <span dir="ltr" className="font-latin text-[15px] font-bold text-zolpo-price">
          {shekel(product.price)}
        </span>
        {discounted && (
          <span
            dir="ltr"
            className="font-latin text-[12px] text-zolpo-ink/40 line-through"
          >
            {shekel(product.regularPrice!)}
          </span>
        )}
      </div>
    </a>
  );
}
