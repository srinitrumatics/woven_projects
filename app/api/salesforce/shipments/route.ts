import { NextResponse } from "next/server";
import { getShipmentsFromSalesforce, getShipmentFilesFromSalesforce } from "../../../../lib/shipment-service";
import { getFileUrl } from "@/lib/salesforce-service";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const objectId = searchParams.get("objectId") || undefined;
        const tabName = searchParams.get("tabName") || "Shipping_Manifest";
        const action = searchParams.get("action");

        if (!accountId) {
            return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
        }
        if (!contactId) {
            return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
        }

        if (action === "files") {
            if (!objectId) {
                return NextResponse.json({ error: "Missing objectId for files action" }, { status: 400 });
            }
            const objectName = searchParams.get("objectName") || "Shipping_Manifest__c";
            const files = await getShipmentFilesFromSalesforce(accountId, contactId, objectId, objectName);
            return NextResponse.json(files);
        }

        if (action === "download" || action === "preview") {
            const contentVersionId = searchParams.get("contentVersionId");
            if (!contentVersionId) {
                return NextResponse.json({ error: `Missing contentVersionId for ${action} action` }, { status: 400 });
            }
            const result = await getFileUrl(contentVersionId);
            if (!result) {
                return NextResponse.json({ error: `Failed to ${action} file` }, { status: 500 });
            }
            return NextResponse.json(result);
        }

        const objectName = searchParams.get("objectName") || "Shipping_Manifest__c";

        const result = await getShipmentsFromSalesforce(accountId, contactId, objectName, tabName, objectId);

        if (result && result.success === false) {
            if (result.message === "No Data Found") {
                return NextResponse.json({ data: [], success: true, message: "No Data Found" });
            }
            return NextResponse.json({ error: result.message || "Failed to fetch shipments" }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (err) {
        console.error("Shipments API route error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
