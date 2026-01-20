import { NextResponse } from "next/server";
import algoliasearch from "algoliasearch";
import { mockProducts } from "../../products/mockData";

export async function POST() {
  try {
    // Verify environment variables
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products";

    if (!appId || !adminKey) {
      return NextResponse.json(
        { error: "Algolia credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Algolia client with admin key for write operations
    const client = algoliasearch(appId, adminKey);

    // Initialize the index
    const index = client.initIndex(indexName);

    // Map mockProducts to Algolia format
    const productsToSeed = mockProducts.map(product => ({
      objectID: product.id,
      title: product.name,
      ...product,
      category: product.productFamily,
      genre: product.manufacturer, // Mapping manufacturer to genre to match "Type" filter in search page
      price: product.unitPrice,
      image_url: "", // Placeholder for compatibility with search UI logic
    }));

    // Clear the index and add mock data
    await index.clearObjects();

    // Configure index settings for faceting
    await index.setSettings({
      attributesForFaceting: [
        'searchable(category)',
        'searchable(productFamily)',
        'searchable(brand)',
        'searchable(manufacturer)',
        'price'
      ],
      searchableAttributes: [
        'name',
        'title',
        'description',
        'sku',
        'brand',
        'manufacturer',
        'productFamily',
        'category'
      ],
      customRanking: ['desc(listPrice)'] // Sorting by listPrice as a proxy for relevance if needed, or remove customRanking
    });

    const result = await index.saveObjects(productsToSeed);

    // Wait for the indexing task to complete
    if (result.taskIDs && result.taskIDs.length > 0) {
      await index.waitTask(result.taskIDs[0]);
    }

    return NextResponse.json({
      message: "Algolia index seeded successfully with mock products",
      count: productsToSeed.length,
      taskIDs: result.taskIDs
    });
  } catch (error) {
    console.error("Error seeding Algolia:", error);
    return NextResponse.json(
      { error: "Failed to seed Algolia index", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "dev_woven_products";

    if (!appId || !searchKey) {
      return NextResponse.json(
        { error: "Algolia credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Algolia client with search key for read operations
    const client = algoliasearch(appId, searchKey);
    const index = client.initIndex(indexName);

    // Get index information
    const indexInfo = await index.search("", {
      hitsPerPage: 0, // We don't need the actual hits, just stats
    });

    return NextResponse.json({
      indexName,
      recordCount: indexInfo.nbHits,
      status: "available"
    });
  } catch (error) {
    console.error("Error checking Algolia index:", error);
    return NextResponse.json(
      { error: "Failed to access Algolia index", details: (error as Error).message },
      { status: 500 }
    );
  }
}