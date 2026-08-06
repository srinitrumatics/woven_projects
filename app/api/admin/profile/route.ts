import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';
import { requireAdminAuth } from '@/lib/api-auth';

// Admin profile is backed by the local Postgres `users` table — Super Admin/Admin
// accounts are not Salesforce Contacts, so this must never touch Salesforce.

export async function GET() {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const [row] = await db.select().from(users).where(eq(users.id, auth.user.id));
  if (!row) {
    return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    profile: { name: row.name, email: row.email },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, currentPassword, newPassword } = await request.json();

    const [row] = await db.select().from(users).where(eq(users.id, auth.user.id));
    if (!row) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const updates: Partial<typeof users.$inferInsert> = {};

    if (typeof name === 'string' && name.trim() && name.trim() !== row.name) {
      updates.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }
      const isValid = await compare(currentPassword, row.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }
      updates.password = await hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No changes to save' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const [updated] = await db.update(users).set(updates).where(eq(users.id, row.id)).returning();

    return NextResponse.json({
      success: true,
      profile: { name: updated.name, email: updated.email },
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
