import { NextResponse } from "next/server";
import { getProductDetailsFromSalesforce } from '@/lib/salesforce-service';

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
