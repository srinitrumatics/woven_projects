import { NextResponse } from "next/server";
import algoliasearch from "algoliasearch";

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

    // Sample data to seed - this would typically come from your database
    const sampleData = [
      {
        objectID: "1",
        title: "Sample Product 1",
        name: "Sample Product 1",
        original_title: "Sample Product 1",
        genre: ["Electronics"],
        year: 2023,
        release_date: "2023-01-15",
        vote_average: 8.5,
        image: "https://via.placeholder.com/300x450?text=Product+1",
        description: "This is a sample product for demonstration purposes."
      },
      {
        objectID: "2",
        title: "Sample Product 2",
        name: "Sample Product 2", 
        original_title: "Sample Product 2",
        genre: ["Clothing"],
        year: 2024,
        release_date: "2024-03-20",
        vote_average: 7.8,
        image: "https://via.placeholder.com/300x450?text=Product+2",
        description: "This is another sample product for demonstration purposes."
      },
      {
        objectID: "3",
        title: "Sample Product 3",
        name: "Sample Product 3",
        original_title: "Sample Product 3", 
        genre: ["Home & Kitchen"],
        year: 2022,
        release_date: "2022-11-10",
        vote_average: 9.2,
        image: "https://via.placeholder.com/300x450?text=Product+3",
        description: "Yet another sample product for demonstration purposes."
      }
    ];

    // Clear the index and add sample data
    await index.clearObjects();
    const result = await index.saveObjects(sampleData);

    // Wait for the indexing task to complete
    await client.waitTask(result.taskID);

    return NextResponse.json({
      message: "Algolia index seeded successfully",
      count: sampleData.length,
      taskID: result.taskID
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