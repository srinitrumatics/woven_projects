import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedLocationsFromSalesforce } from "@/lib/salesforce-service";
import { createAuthorizedLocationInSalesforce, updateAuthorizedLocationInSalesforce } from "@/lib/authorized-location-service";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        const data = await updateAuthorizedLocationInSalesforce(body);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error in authorizedlocations PATCH API:", error);
        return NextResponse.json({ error: error.message || "Failed to update authorized location" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const data = await createAuthorizedLocationInSalesforce(body);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error in authorizedlocations POST API:", error);
        return NextResponse.json({ error: error.message || "Failed to create authorized location" }, { status: 500 });
    }
}
