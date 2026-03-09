import { NextResponse } from "next/server";
import { getShipmentsFromSalesforce } from "@/lib/shipment-service";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const objectId = searchParams.get("objectId") || undefined;
        const tabName = searchParams.get("tabName") || "Shipping_Manifest";

        if (!accountId) {
            return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
        }
        if (!contactId) {
            return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
        }

        const objectName = "Shipping_Manifest__c";

        const result = await getShipmentsFromSalesforce(accountId, contactId, objectName, tabName, objectId);

        if (result && result.success === false) {
            return NextResponse.json({ error: result.message || "Failed to fetch shipments" }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (err) {
        console.error("Shipments API route error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
