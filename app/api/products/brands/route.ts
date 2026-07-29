import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) return NextResponse.json({});

    const { getOrgConfig } = await import('@/lib/org-config');
    const orgConfig = await getOrgConfig().catch(() => null);
    const dbSchemaName = (orgConfig?.algoliaSchema || 'salesforce').replace(/"/g, '');

    const ids = idsParam.split(',').filter(Boolean);
    if (ids.length === 0) return NextResponse.json({});
    
    const idList = ids.map(id => `'${id}'`).join(',');

    const result = await db.execute(
      sql.raw(`SELECT sfid, gtherp__brand_name__c as brand FROM "${dbSchemaName}".product2 WHERE sfid IN (${idList})`)
    );

    // Every id with a product2 row is "synced" — include it even when brand is null,
    // as '' (synced, no brand). Omitting an id entirely means it has no product2 row
    // (not yet synced), which callers may retry; a present '' must not be retried.
    const mapping: Record<string, string> = {};
    (result.rows as any[]).forEach(row => {
      if (row.sfid) {
        mapping[row.sfid] = row.brand || '';
      }
    });

    return NextResponse.json(mapping);
  } catch (err) {
    console.error("Brands API error:", err);
    return NextResponse.json({}, { status: 500 });
  }
}
