import { getSalesforceSession } from './salesforce-service';

export interface SalesforceAuthResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Trigger forgot password flow (sends verification email)
 * @param email User email
 */
export async function salesforceForgotPassword(email: string): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  const url = `${session.instanceUrl}/services/apexrest/gtherp/auth`;
  const payload = {
    username: email,
    isReset: true
  };

  console.log('[SF Auth Service] Forgot Password Payload:', JSON.stringify(payload, null, 2));

  const sfResponse = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!sfResponse.ok) {
    let errorMessage = 'Failed to initiate password reset.';
    try {
      const sfErrData = await sfResponse.json();
      if (sfErrData.message) errorMessage = sfErrData.message;
    } catch (e) { /* ignore */ }
    throw new Error(errorMessage);
  }

  let sfData;
  try {
    sfData = await sfResponse.json();
    console.log('[SF Auth Service] Forgot Password Output:', JSON.stringify(sfData, null, 2));
  } catch (e) { }

  return {
    success: true,
    message: sfData?.message || 'A verification code has been sent to your email',
    data: sfData?.data
  };
}

/**
 * Complete reset password flow with verification code and new password
 * @param email User email
 * @param code Verification code
 * @param newPassword New password
 */
export async function salesforceResetPassword(email: string, code: string | number, newPassword: string): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  const url = `${session.instanceUrl}/services/apexrest/gtherp/auth`;
  const payload = {
    username: email,
    password: newPassword,
    verificationCode: typeof code === 'string' ? code : code || ""
  };

  console.log('[SF Auth Service] Reset Password Payload:', JSON.stringify(payload, null, 2));

  const sfResponse = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!sfResponse.ok) {
    let errorMessage = 'Invalid code or reset failed. Please try again.';
    try {
      const sfErrData = await sfResponse.json();
      if (sfErrData.message) errorMessage = sfErrData.message;
    } catch (e) { /* ignore */ }
    throw new Error(errorMessage);
  }

  let sfData;
  try {
    sfData = await sfResponse.json();
    console.log('[SF Auth Service] Reset Password Output:', JSON.stringify(sfData, null, 2));
  } catch (e) { }

  return {
    success: true,
    message: sfData?.message || 'Password is updated successfully',
    data: sfData?.data
  };
}

/**
 * Salesforce Login
 * Note: Requires exact endpoint configuration for logging in through apexrest API
 */
export async function salesforceLogin(email: string, password: string): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  // Assuming POST is used to login, but endpoint needs to be verified
  const url = `${session.instanceUrl}/services/apexrest/gtherp/auth`;
  const payload = {
    username: email,
    password: password
  };

  const sfResponse = await fetch(url, {
    method: 'POST', // Typical for login, switch to GET or PATCH if instructed otherwise
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!sfResponse.ok) {
    throw new Error('Invalid email or password');
  }

  const sfData = await sfResponse.json();
  return {
    success: true,
    message: sfData?.message || 'Logged in successfully',
    data: sfData?.data
  };
}

/**
 * Salesforce Profile Update
 * Note: Requires exact endpoint configuration detailing required profile fields
 */
export async function salesforceUpdateProfile(userId: string, profileData: any): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  // Assuming a PUT/PATCH to a specific target endpoint
  const url = `${session.instanceUrl}/services/apexrest/gtherp/profile`;

  const sfResponse = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      ...profileData
    }),
  });

  if (!sfResponse.ok) {
    throw new Error('Failed to update profile');
  }

  const sfData = await sfResponse.json();
  return {
    success: true,
    message: sfData?.message || 'Profile updated successfully',
    data: sfData?.data
  };
}
