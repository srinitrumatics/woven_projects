import { NextRequest, NextResponse } from "next/server";
import { getQuotesFromSalesforce, getQuoteFilesFromSalesforce } from "@/lib/quote-service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const quoteId = searchParams.get("quoteId") || undefined;
        const action = searchParams.get("action") || "";

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

        let tabName = "Customer_Quote";
        let objectName = "Customer_Quote__c";

        if (action === "products") tabName = "Products";
        else if (action === "taxes") tabName = "Customer_Quote"; // Taxes are usually on the main record
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
