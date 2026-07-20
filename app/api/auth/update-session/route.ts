import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt, encrypt } from '@/lib/session';
import { getCategoryFromAccountType } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    const { accountId, contactId } = await request.json();

    if (!accountId) {
      return new Response(
        JSON.stringify({ error: 'Account ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the current session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('wovn_main_session')?.value;

    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'No existing session found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt the current session
    const currentSession = await decrypt(sessionCookie);
    if (!currentSession || !currentSession.email) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the user has access to the requested account
    const accounts = currentSession.accounts || [];
    const hasAccess = accounts.some((acc: any) => (acc.Id || acc.id) === accountId);

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'User does not have access to the requested account' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the session with the new account ID and potentially contact ID
    const newAccount = accounts.find((acc: any) => (acc.Id || acc.id) === accountId);
    const newRole = newAccount?.Account_Record_Type__c || 'Customer';

    const updatedSession = {
      ...currentSession,
      accountId: accountId,
      Id: contactId || currentSession.Id || currentSession.userId,
      role: newRole
    };

    const encryptedSession = await encrypt(updatedSession);

    // Update the session cookie
    let expiresDate: Date;
    if (typeof currentSession.expires === 'string') {
      expiresDate = new Date(currentSession.expires);
    } else {
      expiresDate = currentSession.expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    cookieStore.set('wovn_main_session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresDate,
      path: '/',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Session updated with new account',
        accountId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Session update error:', error);
    return new Response(
      JSON.stringify({ error: 'Session update failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}