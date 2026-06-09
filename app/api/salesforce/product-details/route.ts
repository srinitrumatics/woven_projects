import { NextResponse } from "next/server";
import { getProductDetailsFromSalesforce, createProductInSalesforce, updateProductTabInSalesforce, patchProductTabInSalesforce } from '@/lib/product-salesforce-service';
import { syncNewProductToPostgresAndAlgolia } from '@/lib/product-sync-service';

/**
 * Aggressively searches for a Salesforce ID (starting with '01t' for Products) 
 * in any object or array.
 */
function findSfId(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj === 'string' && (obj.startsWith('01t') && (obj.length === 15 || obj.length === 18))) {
    return obj;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findSfId(item);
      if (found) return found;
    }
  }
  if (typeof obj === 'object') {
    // Check common ID keys first
    const commonKeys = ['Id', 'id', 'sfid', 'sfProductId', 'productId', 'recordId'];
    for (const key of commonKeys) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('01t')) {
        return obj[key];
      }
    }
    // Recursive search
    for (const key in obj) {
      const found = findSfId(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

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
      console.warn('[ProductSync] ⚠️ Missing required parameters in POST body');
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await createProductInSalesforce(accountId, contactId, productData);

    // After successful Salesforce creation, sync to PostgreSQL and Algolia.
    // We check for .success OR a success message to match frontend logic
    if (result?.success || result?.message === "Product created successfully") {
      // Use the aggressive search helper to find the Salesforce ID in the response
      const sfProductId = findSfId(result) || findSfId(productData);

      if (sfProductId) {
        // Await the sync to ensure it completes before the API response returns
        try {
          await syncNewProductToPostgresAndAlgolia(sfProductId, productData, accountId, contactId);
        } catch (syncErr) {
          console.error('[ProductSync] ❌ Sync error:', syncErr);
        }
      } else {
        console.warn('[ProductSync] ⚠️ Salesforce success but no product ID found. Result:', JSON.stringify(result));
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
    if (result?.success || result?.message?.includes("successfully")) {
      const { accountId, contactId, product, tabName } = body;
      // Only sync if this is the main product tab update
      if (tabName === "product" && product?.[0]) {
        const productData = product[0];
        const sfProductId = findSfId(productData) || findSfId(result);
        
        if (sfProductId && accountId) {
          try {
            await syncNewProductToPostgresAndAlgolia(sfProductId, productData, accountId, contactId);
          } catch (syncErr) {
            console.error('[ProductSync] ❌ Update sync error:', syncErr);
          }
        }
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Product details PATCH API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
