import { NextResponse } from "next/server";
import algoliasearch from "algoliasearch";
import { getOrgConfig } from "@/lib/org-config";

// Default Algolia index settings (applied when no algolia_schema is set in the org table)
const DEFAULT_SETTINGS = {
  attributesForFaceting: [
    "searchable(category)",
    "searchable(manufacturer)",
    "product_availability",
    "filterOnly(stock_quantity)",
    "searchable(brand)",
    "searchable(productFamily)",
    "price",
  ],
  searchableAttributes: [
    "name",
    "description",
    "sku",
    "brand",
    "manufacturer",
    "category",
    "family",
    "sub_category",
  ],
};

// PATCH /api/algolia/settings
// Reads algolia_schema from the organizations table.
// If it is a valid JSON object, it is merged with (and overrides) the defaults.
// If it is a plain string label, it is logged and defaults are applied.
export async function PATCH() {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !adminKey) {
      return NextResponse.json(
        { error: "Algolia admin credentials not configured" },
        { status: 500 }
      );
    }

    // ── Fetch org config (index name + schema) from organizations table ───────
    const orgConfig = await getOrgConfig().catch(() => null);
    const indexName =
      orgConfig?.algoliaIndexName ||
      process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ||
      "wovn_products_local";
    const algoliaSchema = orgConfig?.algoliaSchema ?? null;

    // ── Parse algolia_schema ─────────────────────────────────────────────────
    let schemaOverride: Record<string, any> = {};
    let schemaSource = "default";

    if (algoliaSchema) {
      try {
        schemaOverride = JSON.parse(algoliaSchema);
        schemaSource = "organizations.algolia_schema (JSON)";
      } catch {
        // Not JSON — treat as a schema label/name for reference only
        schemaSource = `organizations.algolia_schema (label: '${algoliaSchema}')`;
      }
    } else { }

    // ── Merge: schema JSON overrides take priority over defaults ──────────────
    const finalSettings = { ...DEFAULT_SETTINGS, ...schemaOverride };

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);
    await index.setSettings(finalSettings);

    return NextResponse.json({
      success: true,
      orgName: orgConfig?.name ?? null,
      indexName,
      algoliaSchema,
      schemaSource,
      appliedSettings: finalSettings,
    });
  } catch (error) {
    console.error("[Algolia Settings] ❌ Failed to apply settings:", error);
    return NextResponse.json(
      { error: "Failed to apply Algolia settings", details: (error as Error).message },
      { status: 500 }
    );
  }
}
