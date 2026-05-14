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
        success: result.success,
        message: result.message
      }, { status: result.success ? 200 : 400 });
    } catch (apiError: any) {
      console.error('[Forgot Password] Salesforce API error:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Email Address is not found' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Forgot Password] Internal error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}
