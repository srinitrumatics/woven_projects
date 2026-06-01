import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/salesforce/products?action=proposalProduct
 * Returns the Salesforce ID of the "Proposal Request" product from the local DB.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = (searchParams.get("action") || "").toLowerCase();

    if (action === "proposalproduct") {
      // Query the local salesforce.product2 table for the Proposal Request product
      const result = await db.execute(
        sql`SELECT sfid FROM salesforce.product2 WHERE name ILIKE 'Proposal Request' LIMIT 1`
      );

      const rows = result.rows as { sfid: string }[];

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { error: "Proposal Request product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ id: rows[0].sfid });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { error: "Server error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
