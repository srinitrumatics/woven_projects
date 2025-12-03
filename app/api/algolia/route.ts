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
        title: "Wireless Bluetooth Headphones",
        name: "Wireless Bluetooth Headphones",
        original_title: "Premium Audio Headphones",
        genre: ["Electronics"],
        category: "Electronics",
        year: 2024,
        release_date: "2024-01-15",
        price: 79.99,
        image: "https://via.placeholder.com/400x400?text=Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life."
      },
      {
        objectID: "2",
        title: "Smart Fitness Watch",
        name: "Smart Fitness Watch",
        original_title: "Advanced Fitness Tracker",
        genre: ["Wearables"],
        category: "Wearables",
        year: 2024,
        release_date: "2024-03-20",
        price: 199.99,
        image: "https://via.placeholder.com/400x400?text=Smart+Watch",
        description: "Track your fitness goals with heart rate monitoring, GPS, and sleep tracking."
      },
      {
        objectID: "3",
        title: "Ergonomic Office Chair",
        name: "Ergonomic Office Chair",
        original_title: "Premium Comfort Chair",
        genre: ["Furniture"],
        category: "Furniture",
        year: 2023,
        release_date: "2023-11-10",
        price: 349.99,
        image: "https://via.placeholder.com/400x400?text=Office+Chair",
        description: "Comfortable ergonomic chair with lumbar support and adjustable armrests."
      },
      {
        objectID: "4",
        title: "Stainless Steel Water Bottle",
        name: "Stainless Steel Water Bottle",
        original_title: "Insulated Water Bottle",
        genre: ["Home & Kitchen"],
        category: "Home & Kitchen",
        year: 2024,
        release_date: "2024-02-05",
        price: 24.99,
        image: "https://via.placeholder.com/400x400?text=Water+Bottle",
        description: "Keep drinks cold for 24 hours or hot for 12 hours with double-wall insulation."
      },
      {
        objectID: "5",
        title: "Mechanical Gaming Keyboard",
        name: "Mechanical Gaming Keyboard",
        original_title: "RGB Gaming Keyboard",
        genre: ["Gaming"],
        category: "Gaming",
        year: 2024,
        release_date: "2024-04-12",
        price: 129.99,
        image: "https://via.placeholder.com/400x400?text=Gaming+Keyboard",
        description: "Mechanical switches with customizable RGB lighting and programmable keys."
      }
    ];

    // Clear the index and add sample data
    await index.clearObjects();

    // Configure index settings for faceting
    await index.setSettings({
      attributesForFaceting: [
        'searchable(category)',
        'searchable(genre)',
        'price'
      ],
      searchableAttributes: [
        'title',
        'name',
        'description',
        'category',
        'genre'
      ],
      customRanking: ['desc(price)']
    });

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