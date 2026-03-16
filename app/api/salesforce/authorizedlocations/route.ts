import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedLocationsFromSalesforce } from "@/lib/salesforce-service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");

        console.log("=== Authorized Locations API Route ===");
        console.log("Method: GET");
        console.log("URL:", req.url);
        console.log("accountId:", accountId);
        console.log("contactId:", contactId);

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        const data = await getAuthorizedLocationsFromSalesforce(accountId, contactId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in authorizedlocations API:", error);
        return NextResponse.json({ error: "Failed to fetch authorized locations" }, { status: 500 });
    }
}
