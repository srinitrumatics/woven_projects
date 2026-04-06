// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSFSession } from '@/lib/session';

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

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: sfSession.contact?.Id || '',
          name: sfSession.contact?.Name || sfSession.email,
          email: sfSession.email,
          contact: sfSession.contact ?? null,
          accounts: sfSession.accounts ?? [],
          accountId: sfSession.accounts?.[0]?.Id || sfSession.accounts?.[0]?.id || '',
          Id: sfSession.contact?.Id || '',
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