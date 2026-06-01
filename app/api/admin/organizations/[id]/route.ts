import { NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
  try {
    const { id } = await context.params;
    await db.delete(organizations).where(eq(organizations.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
