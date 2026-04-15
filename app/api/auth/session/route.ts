// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSFSession } from '@/lib/session';
import { getCategoryFromAccountType, PERMISSIONS_BY_CATEGORY } from '@/lib/permissions';

// Validates the session cookie and returns the Salesforce user data (contact + accounts)
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, error: 'No valid session found' },
        { status: 401 }
      );
    }

    const sfSession = await getSFSession(sessionCookie);

    if (!sfSession || !sfSession.email) {
      return NextResponse.json(
        { authenticated: false, error: 'Session invalid or expired' },
        { status: 401 }
      );
    }

    const accounts = sfSession.accounts || [];
    const currentAccount = accounts.find((a: any) => a.Id === sfSession.accountId) || accounts[0];
    const accountType = currentAccount?.Account_Record_Type__c || 'Customer';
    const category = getCategoryFromAccountType(accountType);
    const userPermissions = PERMISSIONS_BY_CATEGORY[category] || [];

    console.log('[API/Session] Returning session for:', sfSession.email, 'Role:', sfSession.role || category.toUpperCase());

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: sfSession.contact?.Id || sfSession.userId || 'sf-user',
          name: sfSession.contact?.Name || sfSession.email,
          email: sfSession.email,
          contact: sfSession.contact ?? null,
          accounts: sfSession.accounts ?? [],
          accountId: currentAccount?.Id || sfSession.accountId || '',
          Id: sfSession.contact?.Id || '',
          user_details: sfSession.user_details ?? null,
          role: sfSession.role || category.toUpperCase(),
          permissions: userPermissions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}