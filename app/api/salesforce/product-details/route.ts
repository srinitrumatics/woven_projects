import { NextResponse } from "next/server";
import { getProductDetailsFromSalesforce, createProductInSalesforce, updateProductTabInSalesforce, patchProductTabInSalesforce } from '@/lib/product-salesforce-service';
import { syncNewProductToPostgresAndAlgolia } from '@/lib/product-sync-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const contactId = searchParams.get("contactId");
    const productId = searchParams.get("productId");
    const tabName = searchParams.get("tabName") || "product";

    if (!accountId || !contactId || !productId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await getProductDetailsFromSalesforce(accountId, contactId, productId, tabName);
    
    if (!result) {
      return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Product details API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.tabName && body.tabName !== "product") {
      const result = await updateProductTabInSalesforce(body);
      return NextResponse.json(result);
    }

    const { accountId, contactId, productData } = body;

    if (!accountId || !contactId || !productData) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await createProductInSalesforce(accountId, contactId, productData);

    // After successful Salesforce creation, sync to PostgreSQL and Algolia.
    // This is non-blocking: a failure here does NOT roll back the Salesforce record.
    if (result?.success) {
      const sfProductId = result?.data?.Id || result?.Id || result?.data?.[0]?.Id || productData?.Id;
      if (sfProductId) {
        console.log(`[ProductSync] 🟢 GETTING DATA FROM SALESFORCE: Creation successful, sfid: ${sfProductId}`);
        console.log(`[ProductSync] Triggering sync for ${sfProductId} (POST)`);
        syncNewProductToPostgresAndAlgolia(sfProductId, productData, accountId).catch((syncErr) =>
          console.error('[ProductSync] Background sync error:', syncErr)
        );
      } else {
        console.warn('[ProductSync] Salesforce creation succeeded but no product ID found in response or payload:', JSON.stringify(result));
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Product creation API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const result = await patchProductTabInSalesforce(body);

    // Sync to PostgreSQL and Algolia on successful update
    if (result?.success) {
      const { accountId, product, tabName } = body;
      // Only sync if this is the main product tab update
      if (tabName === "product" && product?.[0]) {
        const productData = product[0];
        const sfProductId = productData.Id;
        if (sfProductId && accountId) {
          console.log(`[ProductSync] 🟢 GETTING DATA FROM SALESFORCE: Update successful, sfid: ${sfProductId}`);
          console.log(`[ProductSync] Triggering sync for ${sfProductId} (PATCH)`);
          syncNewProductToPostgresAndAlgolia(sfProductId, productData, accountId).catch((syncErr) =>
            console.error('[ProductSync] Background PATCH sync error:', syncErr)
          );
        }
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Product details PATCH API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
