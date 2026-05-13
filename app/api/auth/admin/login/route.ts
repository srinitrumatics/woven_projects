// app/api/auth/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminLoginWithPostgres } from '@/lib/admin-auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log(`[API] Admin Postgres Login request received for email: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate via Postgres
    const result = await adminLoginWithPostgres(email, password);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    console.log('[API] Admin Postgres Login success - user:', result.user?.id);

    return NextResponse.json(
      {
        success: true,
        user: result.user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during admin login' },
      { status: 500 }
    );
  }
}
