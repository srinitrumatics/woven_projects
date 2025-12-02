// app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Delete the session cookie
    await deleteSession();

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during logout' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}