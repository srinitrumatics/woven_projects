import { NextResponse } from "next/server";
import { getInventoryFromSalesforce } from "@/lib/inventory-service";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const productId = searchParams.get("productId");
        const isInventory = searchParams.get("isInventory") === "true";

        if (!accountId || !contactId) {
            return NextResponse.json({ error: "Missing required parameters (accountId, contactId)" }, { status: 400 });
        }

        const result = await getInventoryFromSalesforce(
            accountId, 
            contactId, 
            productId || undefined, 
            isInventory
        );

        if (result && result.success === false) {
            return NextResponse.json({ error: result.message || "Failed to fetch inventory" }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (err) {
        console.error("Inventory API route error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
