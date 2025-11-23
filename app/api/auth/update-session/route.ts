// app/api/auth/update-session/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt, encrypt } from '@/lib/session';
import { db } from '@/db';
import { userOrganizations, organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the current session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'No existing session found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if session cookie exists
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'Session cookie not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt the current session to get user ID
    const currentSession = await decrypt(sessionCookie);
    if (!currentSession || !currentSession.userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid session or missing user ID' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the user has access to the requested organization
    // We can't use getCurrentUser() here because it relies on organization from session
    // Instead, get the user's organizations directly using the user ID from the session
    const userOrgs = await db
      .select({
        id: organizations.id,
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, currentSession.userId));

    const hasAccess = userOrgs.some(org => org.id === organizationId);

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'User does not have access to the requested organization' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the session with the new organization ID
    const updatedSession = {
      ...currentSession,
      organizationId: organizationId
    };

    const encryptedSession = await encrypt(updatedSession);

    // Update the session cookie
    // Convert the expires string back to a Date object if it's a string
    let expiresDate: Date;
    if (typeof currentSession.expires === 'string') {
      expiresDate = new Date(currentSession.expires);
    } else {
      expiresDate = currentSession.expires;
    }

    // Debug: Check what we're about to store
    console.log('Updating session with:', {
      userId: updatedSession.userId,
      organizationId: updatedSession.organizationId,
      expires: expiresDate
    });

    cookieStore.set('session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresDate,
      path: '/',
    });

    // Debug: Check the cookie that was set
    console.log('Session cookie updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Session updated with new organization',
        organizationId: organizationId
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