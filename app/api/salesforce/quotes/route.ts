import { NextRequest, NextResponse } from "next/server";
import { getQuotesFromSalesforce } from "@/lib/quote-service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const quoteId = searchParams.get("quoteId") || undefined;

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        const data = await getQuotesFromSalesforce(
            accountId,
            contactId,
            quoteId
        );
        console.log("Quotes data:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in quotes API:", error);
        return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
    }
}
