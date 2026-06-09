import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import algoliasearch from 'algoliasearch';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, organization: org });
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { 
      name, 
      orgId, 
      salesforceUrl, 
      salesforceAuthUrl, 
      clientId, 
      clientSecret,
      siteUrl,
      algoliaIndexName,
      algoliaSchema
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const [updatedOrg] = await db.update(organizations).set({
      name,
      orgId,
      salesforceUrl,
      salesforceAuthUrl,
      clientId,
      clientSecret,
      siteUrl,
      algoliaIndexName,
      algoliaSchema,
      updatedAt: new Date().toISOString()
    }).where(eq(organizations.id, id)).returning();

    return NextResponse.json({ success: true, organization: updatedOrg });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const cleanupLog: string[] = [];

  try {
    const { id } = await context.params;

    // 1. Fetch the org record first so we know the schema and index names
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const schemaName = org.algoliaSchema;
    const indexName  = org.algoliaIndexName;

    // 2. Delete the row from the organizations table
    await db.delete(organizations).where(eq(organizations.id, id));
    cleanupLog.push(`✅ Deleted organization record (id=${id})`);

    // 3. Drop the Postgres schema (CASCADE drops all tables, functions, triggers, views inside it)
    if (schemaName) {
      // Safety guard: never drop the shared schemas
      const protectedSchemas = ['public', 'salesforce', 'drizzle', '_heroku', 'pg_catalog', 'information_schema'];
      if (protectedSchemas.includes(schemaName.toLowerCase())) {
        cleanupLog.push(`⚠️  Skipped dropping protected schema: ${schemaName}`);
      } else {
        const sanitized = schemaName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        await db.execute(sql.raw(`DROP SCHEMA IF EXISTS "${sanitized}" CASCADE;`));
        cleanupLog.push(`✅ Dropped database schema: ${sanitized} (CASCADE)`);
      }
    } else {
      cleanupLog.push('⚠️  No schema name on org record — skipped schema drop.');
    }

    // 4. Delete the Algolia index
    if (indexName) {
      const algoliaAppId   = process.env.ALGOLIA_APP_ID   || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
      const algoliaAdminKey = process.env.ALGOLIA_ADMIN_KEY;

      if (algoliaAppId && algoliaAdminKey) {
        try {
          const client = algoliasearch(algoliaAppId, algoliaAdminKey);
          const index = client.initIndex(indexName);
          await index.delete();
          cleanupLog.push(`✅ Deleted Algolia index: ${indexName}`);
        } catch (algoliaErr: any) {
          // Non-fatal: log but don't fail the whole request
          cleanupLog.push(`⚠️  Algolia index deletion failed: ${algoliaErr.message}`);
          console.warn('Algolia index deletion failed:', algoliaErr.message);
        }
      } else {
        cleanupLog.push('⚠️  Algolia credentials missing — index not deleted.');
      }
    } else {
      cleanupLog.push('⚠️  No Algolia index name on org record — skipped index deletion.');
    }

    return NextResponse.json({
      success: true,
      message: `Organization "${org.name}" deleted successfully.`,
      cleanup: cleanupLog,
    });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: error.message, cleanup: cleanupLog }, { status: 500 });
  }
}
