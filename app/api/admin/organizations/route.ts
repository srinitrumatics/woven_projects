import { NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  try {
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

    const [newOrg] = await db.insert(organizations).values({
      name,
      orgId,
      salesforceUrl,
      salesforceAuthUrl,
      clientId,
      clientSecret,
      siteUrl,
      algoliaIndexName,
      algoliaSchema
    }).returning();

    return NextResponse.json({ success: true, organization: newOrg });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const orgs = await db.select().from(organizations).orderBy(organizations.createdAt);
    return NextResponse.json({ success: true, organizations: orgs });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
