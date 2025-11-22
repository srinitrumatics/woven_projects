// app/api/auth/session/route.ts
import { NextRequest } from 'next/server';
import { getUserPermissions } from '@/lib/auth-service';

// This endpoint validates if the user is authenticated and returns their permissions
export async function GET(request: NextRequest) {
  try {
    // We'll validate the session by checking if a valid userId is provided
    // In a real app, you'd validate an actual session token here
    const userIdHeader = request.headers.get('user-id');

    if (!userIdHeader) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'No user ID provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Invalid user ID' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user permissions from database
    const userPermissions = await getUserPermissions(userId);

    return new Response(
      JSON.stringify({
        authenticated: true,
        permissions: userPermissions
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Session validation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}