import Banner from "./Banner";
import ProductCard from "./ProductCard";
import type { HomepageRow as Row } from "@/lib/types";

/**
 * One automated homepage row.
 *
 * The page is RTL, so the first grid child lands on the right — which is exactly
 * where the current zolpo.co.il homepage keeps its banners. On mobile the banner
 * comes first and the products fall into a 2×2 grid underneath.
 */
export default function HomepageRow({
  row,
  showModelTag = false,
}: {
  row: Row;
  showModelTag?: boolean;
}) {
  return (
    <section
      className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,1.75fr)_repeat(4,minmax(0,1fr))] md:gap-4"
      aria-label={row.category.name}
    >
      <div className="col-span-2 min-h-[210px] md:col-span-1 md:min-h-[318px]">
        <Banner banner={row.banner} showModelTag={showModelTag} />
      </div>
      {row.products.map((product) => (
        <ProductCard key={`${row.banner.id}-${product.id}`} product={product} />
      ))}
    </section>
  );
}
