import { getSalesforceSession, fetchWithLogging } from './salesforce-service';

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

  const sfResponse = await fetchWithLogging(url, {
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
      if (sfErrData.message) {
        errorMessage = sfErrData.message;
      }
    } catch (e) { /* ignore */ }
    throw new Error(errorMessage);
  }

  let sfData;
  try {
    sfData = await sfResponse.json();
  } catch (e) { }

  let message = sfData?.message;

  return {
    success: sfData?.success === true,
    message: message || (sfData?.success ? 'A verification code has been sent to your email' : 'Failed to send verification code'),
    data: sfData?.data
  };
}

/**
 * Complete reset password flow with verification code and new password
 * @param email User email
 * @param code Verification code
 * @param newPassword New password
 */
export async function salesforceResetPassword(email: string, code: number, newPassword: string): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  const url = `${session.instanceUrl}/services/apexrest/gtherp/auth`;
  const payload = {
    username: email,
    password: newPassword,
    verificationCode: code
  };

  const sfResponse = await fetchWithLogging(url, {
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
  } catch (e) { }

  return {
    success: sfData?.success === true,
    message: sfData?.message || (sfData?.success ? 'Password is updated successfully' : 'Failed to update password'),
    data: sfData?.data
  };
}

import * as https from 'https';
import { URL } from 'url';

/**
 * Salesforce Login
 * Uses native Node https to support GET requests with JSON bodies
 */
export async function salesforceLogin(email: string, password: string): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  const payloadString = JSON.stringify({
    username: email,
    password: password
  });

  const requestUrl = new URL(`${session.instanceUrl}/services/apexrest/gtherp/auth`);

  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: requestUrl.hostname,
      path: requestUrl.pathname + requestUrl.search,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      const correlationId = Math.random().toString(36).substring(7);
      const start = Date.now();

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - start;

        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          console.error(`[SF API Response Error][${correlationId}]:`, data);
          reject(new Error('Invalid email or password'));
          return;
        }

        try {
          const sfData = JSON.parse(data);
          resolve({
            success: sfData?.success === true,
            message: sfData?.message || 'Logged in successfully',
            data: sfData?.data
          });
        } catch (e) {
          reject(new Error('Failed to parse Salesforce response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error('Network error during Salesforce login'));
    });

    // Write the JSON body
    req.write(payloadString);
    req.end();
  });
}

/**
 * Salesforce Profile Update
 * Note: Requires exact endpoint configuration detailing required profile fields
 */
export async function salesforceUpdateProfile(contactId: string, profileData: any): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  const url = `${session.instanceUrl}/services/apexrest/gtherp/contacts`;

  const sfResponse = await fetchWithLogging(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Id: contactId,
      ...profileData
    }),
  });

  if (!sfResponse.ok) {
    throw new Error('Failed to update profile');
  }

  const sfData = await sfResponse.json();
  return {
    success: sfData?.success === true,
    message: sfData?.message || (sfData?.success ? 'Profile updated successfully' : 'Failed to update profile'),
    data: sfData?.data
  };
}

export async function salesforceGetPicklists(accountId: string, contactId: string): Promise<SalesforceAuthResponse> {
  const session = await getSalesforceSession();
  if (!session || !session.accessToken) {
    throw new Error('No Salesforce session available');
  }

  const url = `${session.instanceUrl}/services/apexrest/gtherp/picklists?accountId=${accountId}&contactId=${contactId}`;

  const sfResponse = await fetchWithLogging(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!sfResponse.ok) {
    throw new Error('Failed to fetch picklists');
  }

  const sfData = await sfResponse.json();
  return {
    success: sfData?.success === true,
    message: sfData?.message || 'Picklists fetched successfully',
    data: sfData?.data
  };
}
