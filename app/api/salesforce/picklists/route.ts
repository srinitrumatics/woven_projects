import { NextRequest, NextResponse } from "next/server";
import { salesforceGetPicklists } from "@/lib/salesforce-auth";
import { requireAccountAccess } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");

        if (!accountId || !contactId) {
            return NextResponse.json({ error: "AccountId and ContactId are required" }, { status: 400 });
        }

        const auth = await requireAccountAccess(accountId);
        if (auth instanceof NextResponse) return auth;

        const result = await salesforceGetPicklists(accountId, contactId);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.message || "Failed to fetch picklists" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Picklists fetch error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}
