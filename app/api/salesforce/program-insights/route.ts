import { NextResponse } from "next/server";
import { getProgramInsights } from '@/lib/program-service';
import { requireAccountAccess } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const contactId = searchParams.get("contactId");

    if (!accountId || !contactId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const auth = await requireAccountAccess(accountId);
    if (auth instanceof NextResponse) return auth;

    const result = await getProgramInsights(accountId, contactId);
    
    if (!result) {
      return NextResponse.json({ error: "Failed to fetch program insights" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Program insights API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
