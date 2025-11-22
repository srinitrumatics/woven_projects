// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth-service';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userWithPermissions = await authenticateUser(email, password);

    if (!userWithPermissions) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session cookies
    await createSession(userWithPermissions.id);

    // Create response with user data
    const response = new Response(
      JSON.stringify({
        user: {
          id: userWithPermissions.id,
          name: userWithPermissions.name,
          email: userWithPermissions.email,
        },
        permissions: userWithPermissions.permissions
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during login' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}