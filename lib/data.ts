import { generateHomepage } from "./automation";
import { getMockCatalog } from "./mock-data";
import { getWooCommerceCatalog, isLiveConfigured } from "./woocommerce";
import type { Catalog, GenerateOptions, HomepagePlan } from "./types";

/**
 * Single entry point used by both the homepage preview and the API route:
 * try the live store, fall back to the mock catalog, never throw.
 */
export async function getCatalog(): Promise<{ catalog: Catalog; note?: string }> {
  if (!isLiveConfigured()) return { catalog: getMockCatalog() };

  try {
    return { catalog: await getWooCommerceCatalog() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      catalog: getMockCatalog(),
      note: `WooCommerce unavailable, using mock data (${message})`,
    };
  }
}

export async function buildPlan(options: GenerateOptions = {}): Promise<HomepagePlan> {
  const { catalog, note } = await getCatalog();
  const plan = generateHomepage(catalog, options);
  return note ? { ...plan, sourceNote: note } : plan;
}
