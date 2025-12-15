import { NextRequest, NextResponse } from "next/server";
import { getProposalsFromSalesforce } from "@/lib/proposal-service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId") || '001QL00001Kbvt3YAB';
        const contactId = searchParams.get("contactId") || '003QL00001KkXyqYAF'; // Default placeholder
        const proposalId = searchParams.get("proposalId") || undefined;

        const data = await getProposalsFromSalesforce(accountId, contactId, proposalId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in proposals API:", error);
        return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }
}
