import { NextRequest, NextResponse } from "next/server";
import { getPurchaseOrdersFromSalesforce, getPurchaseOrderFilesFromSalesforce, patchPurchaseOrderLineInSalesforce } from "@/lib/purchase-order-service";
import { uploadFilesToSalesforce, getFileUrl } from "@/lib/salesforce-service";

const EDITABLE_LINE_STATUSES = ["Draft", "Approved"];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const objectId = searchParams.get("objectId") || "";
        const action = searchParams.get("action") || "";
        const objectName = searchParams.get("objectName") || "Purchase_Order__c";

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        let data;

        if (action === "files") {
            data = await getPurchaseOrderFilesFromSalesforce(accountId, contactId, objectId, objectName);
        } else if (action === "download" || action === "preview") {
            const contentVersionId = searchParams.get("contentVersionId");
            if (!contentVersionId) {
                return NextResponse.json({ error: "Missing contentVersionId for file action" }, { status: 400 });
            }
            data = await getFileUrl(contentVersionId);
            if (!data) {
                return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 });
            }
        } else {
            let tabName = searchParams.get("tabName");
            if (!tabName) {
                if (action === "lines") tabName = "Lines";
                else if (action === "fulfillment") tabName = "Fulfillment";
                else if (action === "returns") tabName = "Returns";
                else tabName = "Purchase_Order";
            }

            data = await getPurchaseOrdersFromSalesforce(accountId, contactId, objectId, tabName, objectName);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in purchase orders API:", error);
        return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accountId, contactId, objectId, files, objectName } = body;

        if (!accountId || !contactId || !objectId || !files || !Array.isArray(files)) {
            return NextResponse.json(
                { error: "Missing required parameters or invalid format" },
                { status: 400 }
            );
        }

        const uploadData = {
            accountId,
            contactId,
            objectId,
            objectName: objectName || "Purchase_Order__c",
            files
        };

        const result = await uploadFilesToSalesforce(uploadData);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Error in purchase order file upload API:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lineId = searchParams.get("lineId");
        const purchaseOrderId = searchParams.get("purchaseOrderId");
        const body = await req.json();
        const { accountId, contactId, trackingNumber, promiseDate } = body;

        if (!lineId || !purchaseOrderId || !accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: lineId, purchaseOrderId, accountId, contactId" },
                { status: 400 }
            );
        }

        if (trackingNumber === undefined && promiseDate === undefined) {
            return NextResponse.json(
                { error: "Nothing to update: provide trackingNumber and/or promiseDate" },
                { status: 400 }
            );
        }

        // Look up the line's current status the same way the detail page does
        // (via the parent Purchase Order) — no Apex resource supports fetching
        // a single line's own fields by the line id alone.
        const poData = await getPurchaseOrdersFromSalesforce(accountId, contactId, purchaseOrderId, "Products", "Purchase_Order__c");
        const lines = poData?.Purchase_Order_Line__c || [];
        const targetLine = lines.find((l: any) => l.Id === lineId);

        if (!targetLine) {
            return NextResponse.json({ error: "Purchase Order Line not found" }, { status: 404 });
        }

        if (!EDITABLE_LINE_STATUSES.includes(targetLine.Status__c)) {
            return NextResponse.json({ error: "Purchase Order Line is not editable" }, { status: 403 });
        }

        const lineUpdate: { Id: string; Tracking_Number__c?: string; Promise_Date__c?: string } = { Id: lineId };
        if (trackingNumber !== undefined) lineUpdate.Tracking_Number__c = trackingNumber;
        if (promiseDate !== undefined) {
            lineUpdate.Promise_Date__c = promiseDate;
        } else if (targetLine.Promise_Date__c) {
            // Workaround: gtherp.PurchaseOrderLineHandler.buildPOLIs (Apex) throws a
            // NullPointerException whenever Promise_Date__c is omitted/null, even when only
            // Tracking Number is being updated. Re-send the line's existing value so it's a
            // no-op update rather than a missing field.
            lineUpdate.Promise_Date__c = targetLine.Promise_Date__c;
        }

        const result = await patchPurchaseOrderLineInSalesforce({
            purchaseOrderLines: [lineUpdate],
            accountId,
            contactId,
        });

        const updatedLine = result?.data?.[0]?.Purchase_Order_Line__c?.[0];

        if (!result?.success || !updatedLine) {
            return NextResponse.json(
                { error: "Purchase Order Line was not updated" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            trackingNumber: updatedLine.Tracking_Number__c,
            promiseDate: updatedLine.Promise_Date__c,
        });
    } catch (error) {
        console.error("Error updating purchase order line:", error);
        return NextResponse.json({ error: "Failed to update purchase order line" }, { status: 500 });
    }
}
