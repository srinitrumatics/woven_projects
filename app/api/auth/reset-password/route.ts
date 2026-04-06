import { NextRequest, NextResponse } from 'next/server';
import { salesforceResetPassword } from '@/lib/salesforce-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    try {
      const result = await salesforceResetPassword(email, Number(code), newPassword);
      return NextResponse.json({
        success: result.success,
        message: result.message
      }, { status: result.success ? 200 : 400 });
    } catch (apiError: any) {
      console.error('[Reset Password] Salesforce API error:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Invalid code or reset failed. Please try again.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Reset Password] Internal error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
