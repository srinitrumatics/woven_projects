import { NextResponse } from "next/server";
import algoliasearch from "algoliasearch";
import { getOrgConfig } from "@/lib/org-config";

/**
 * GET /api/algolia/browse
 * Server-side endpoint that uses the Admin key to browse ALL records in the
 * org's Algolia index without the per-page cap imposed on the Search key.
 * Returns a lightweight array of product objects the client needs to render
 * the Add Products catalog.
 */
export async function GET() {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !adminKey) {
      return NextResponse.json(
        { error: "Algolia credentials not configured" },
        { status: 500 }
      );
    }

    const orgConfig = await getOrgConfig().catch(() => null);
    const indexName = orgConfig?.algoliaIndexName || "";

    if (!indexName) {
      return NextResponse.json({ products: [], indexName: "" });
    }

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    const hits: any[] = [];
    await index.browseObjects({
      query: "",
      batch: (batch) => {
        hits.push(...batch);
      },
    });

    // Map to a slim shape — only what the catalog table needs
    const products = hits.map((h: any) => ({
      id: h.objectID,
      name: h.name || "-",
      description: h.description || "",
      productFamily: h.family || h.category || "General",
      productGrouping: h.groupingLabel || "",
      sku: h.sku || h.productcode || h.name || "",
      manufacturer: h.manufacturer || "-",
      brand: h.brand || h.brandName || "-",
      availableQty: Number(h.available_quantity ?? h.gtherp__available_quantity__c ?? h.stock_quantity ?? 0),
      moq: Number(h.moq) || 1,
      listPrice: Number(h.price) || 0,
      unitPrice: Number(h.price) || 0,
      orderQty: 0,
      subtotal: 0,
    }));

    return NextResponse.json({ products, indexName, total: products.length });
  } catch (error: any) {
    console.error("[algolia/browse] Error:", error);
    return NextResponse.json(
      { error: "Failed to browse Algolia index", details: error.message },
      { status: 500 }
    );
  }
}
