import { NextRequest, NextResponse } from 'next/server';
import { salesforceForgotPassword } from '@/lib/salesforce-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      const result = await salesforceForgotPassword(email);
      return NextResponse.json({ 
        success: true,
        message: result.message
      }, { status: 200 });
    } catch (apiError: any) {
      console.error('[Forgot Password] Salesforce API error:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Failed to initiate password reset, please check the email provided or try again' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Forgot Password] Internal error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
