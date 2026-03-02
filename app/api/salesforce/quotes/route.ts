import { NextRequest, NextResponse } from "next/server";
import { getQuotesFromSalesforce, getQuoteFilesFromSalesforce } from "@/lib/quote-service";
import { getFileUrl, uploadFilesToSalesforce } from "@/lib/salesforce-service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const quoteId = searchParams.get("quoteId") || undefined;
        const action = searchParams.get("action") || "";
        const contentVersionId = searchParams.get("contentVersionId");

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        if (action === "files") {
            const files = await getQuoteFilesFromSalesforce(accountId, contactId, quoteId!);
            return NextResponse.json(files);
        }

        if (action === "download" || action === "preview") {
            if (!contentVersionId) {
                return NextResponse.json({ error: "Missing contentVersionId" }, { status: 400 });
            }
            const result = await getFileUrl(contentVersionId);
            if (!result) {
                return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 });
            }
            return NextResponse.json(result);
        }

        let tabName = "Customer_Quote";
        let defaultObjectName = "Customer_Quote__c";
        const objectName = searchParams.get("objectName") || defaultObjectName;

        if (action === "quotelines") tabName = "Products";
        else if (action === "taxes") tabName = "Customer_Quote";
        else if (action === "fulfillment") tabName = "Fulfillment";
        else if (action === "purchases") tabName = "Purchases";
        else if (action === "returns") tabName = "Returns";

        const data = await getQuotesFromSalesforce(
            accountId,
            contactId,
            quoteId,
            tabName,
            objectName
        );
        // console.log("Quotes data:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in quotes API:", error);
        return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action");

        if (action === "uploadFiles") {
            const uploadData = await req.json();
            const result = await uploadFilesToSalesforce({
                ...uploadData,
                objectName: "Customer_Quote__c"
            });

            if (!result) {
                return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
            }
            return NextResponse.json(result, { status: 201 });
        }

        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    } catch (error) {
        console.error("Error in quotes API POST:", error);
        return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
    }
}
