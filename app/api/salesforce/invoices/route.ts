import { NextRequest, NextResponse } from "next/server";
import { getInvoicesFromSalesforce, getInvoiceFilesFromSalesforce } from "@/lib/invoice-service";
import { getFileUrl } from "@/lib/salesforce-service";
import { requireAccountAccess } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const invoiceId = searchParams.get("invoiceId") || "";
        const action = searchParams.get("action") || "list";

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        const auth = await requireAccountAccess(accountId);
        if (auth instanceof NextResponse) return auth;

        let data;

        if (action === "files") {
            const objectNameParam = searchParams.get("objectName");
            const objectName = objectNameParam || "Invoice__c";
            data = await getInvoiceFilesFromSalesforce(accountId, contactId, invoiceId, objectName);
        } else if (action === "download" || action === "preview") {
            const contentVersionId = searchParams.get("contentVersionId");
            if (!contentVersionId) {
                return NextResponse.json({ error: "Missing contentVersionId" }, { status: 400 });
            }
            data = await getFileUrl(contentVersionId);
            if (!data) {
                return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 });
            }
        } else {
            let tabName = "Invoice";
            let objectName = "Invoice__c";

            // Allow overriding objectName via query param (e.g. for Invoice_Line__c related records)
            const overrideObjectName = searchParams.get("objectName");
            // Map actions to tab names as specified
            if (action === "payments") {
                tabName = "Payments";
                objectName = "Invoice__c";
            } else if (action === "lines") {
                tabName = "Products";
                objectName = "Invoice__c";
            } else if (action === "credits") {
                tabName = "Credits";
                objectName = "Invoice__c";
            } else if (action === "creditmemolines") {
                tabName = "Credits";
                objectName = "Invoice_Line__c";
            } else if (action === "fulfillment") {
                tabName = "Fulfillment";
                objectName = overrideObjectName || "Invoice_Line__c";
            } else if (action === "purchases") {
                tabName = "Purchases";
                objectName = overrideObjectName || "Invoice_Line__c";
            } else if (action === "returns") {
                tabName = "Returns";
                objectName = overrideObjectName || "Invoice_Line__c";
            }

            // Allow explicit objectName override from query param
            objectName = overrideObjectName || objectName;

            data = await getInvoicesFromSalesforce(accountId, contactId, invoiceId, tabName, objectName);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in invoices API:", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
}
