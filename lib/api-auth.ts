// lib/api-auth.ts
// Session-cookie-based auth guards for API routes.
// Usage:
//   const auth = await requireApiAuth();
//   if (auth instanceof NextResponse) return auth;   // 401
//   const { user } = auth;

import { NextResponse } from 'next/server';
import { getCurrentUser, CurrentUser } from './session';

type AuthResult = { user: CurrentUser } | NextResponse;

/** Require a valid Salesforce session. Returns the user or a 401 NextResponse. */
export async function requireApiAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { user };
}

/** Require a Super Admin or Admin session. Returns the user or a 401/403 NextResponse. */
export async function requireAdminAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const isAdmin =
    user.permissions.includes('ALL_ACCESS') ||
    user.role === 'Super Admin' ||
    user.role === 'Admin';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { user };
}

/**
 * Require a valid session AND verify that `accountId` belongs to the current user's
 * organizations (admins bypass the ownership check).
 */
export async function requireAccountAccess(accountId: string | null): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (accountId) {
    const isAdmin = user.permissions.includes('ALL_ACCESS');
    if (!isAdmin) {
      const allowedIds = user.organizations.map((o: any) => o.id);
      if (!allowedIds.includes(accountId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }
  return { user };
}
