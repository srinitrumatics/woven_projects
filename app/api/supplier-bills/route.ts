import { NextRequest, NextResponse } from "next/server";
import { getSupplierBillsFromSalesforce, getSupplierBillFilesFromSalesforce } from "@/lib/supplier-bills";
import { uploadFilesToSalesforce, getFileUrl } from "@/lib/salesforce-service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const objectId = searchParams.get("objectId") || "";
        const action = searchParams.get("action") || "";
        const tabName = searchParams.get("tabName") || "Supplier_Bill";
        const objectName = searchParams.get("objectName") || "Supplier_Bill__c";

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        let data;

        if (action === "files") {
            data = await getSupplierBillFilesFromSalesforce(accountId, contactId, objectId, objectName);
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
            data = await getSupplierBillsFromSalesforce(accountId, contactId, objectId, tabName, objectName);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in supplier bills API:", error);
        return NextResponse.json({ error: "Failed to fetch supplier bills" }, { status: 500 });
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
            objectName: objectName || "Supplier_Bill__c",
            files
        };

        const result = await uploadFilesToSalesforce(uploadData);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Error in supplier bill file upload API:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}
