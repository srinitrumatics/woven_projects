// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { salesforceLogin } from '@/lib/salesforce-auth';
import { createSFSession } from '@/lib/session';
import { getCategoryFromAccountType } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate via Salesforce
    const sfResult = await salesforceLogin(email, password);

    if (!sfResult.success) {
      return NextResponse.json(
        { error: sfResult.message || 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sfDataArray = sfResult.data;
    // Expected SF response shape: { data: [ { Account__c: [...], Contact__c: {...} } ] }
    const firstData = Array.isArray(sfDataArray) && sfDataArray.length > 0 ? sfDataArray[0] : null;

    const contact = firstData?.Contact__c ?? null;
    const accounts = firstData?.Account__c ?? [];

    // Identify the direct account if it exists
    const directAccount = accounts.find((a: any) => a.isdirect === true || a.isdirect === 'true');
    const defaultAccountId = directAccount?.Id || directAccount?.id || accounts?.[0]?.Id || accounts?.[0]?.id || '';

    // Determine initial role
    const defaultAccount = accounts.find((a: any) => (a.Id || a.id) === defaultAccountId);
    const initialRole = defaultAccount?.Account_Record_Type__c || 'Customer';

    // Store SF data in session cookie (no DB needed)
    await createSFSession({ 
      email, 
      contact, 
      accounts,
      accountId: defaultAccountId,
      Id: contact?.Id || '',
      role: initialRole
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: contact?.Id || '',
          name: contact?.Name || email,
          email,
          contact,
          accounts,
          accountId: defaultAccountId,
          Id: contact?.Id || '',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Login] Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}