// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth-service';

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

    // Create response with user data and set auth session cookie
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

    // For server-side redirect capability, we would set a cookie
    // response.cookies.set('auth-session', userWithPermissions.id.toString(), {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 60 * 60 * 24, // 24 hours
    //   path: '/',
    // });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during login' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}