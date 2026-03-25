import { NextRequest, NextResponse } from "next/server";
import { getPurchaseOrdersFromSalesforce, getPurchaseOrderFilesFromSalesforce } from "@/lib/purchase-order-service";
import { uploadFilesToSalesforce, getFileUrl } from "@/lib/salesforce-service";

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
