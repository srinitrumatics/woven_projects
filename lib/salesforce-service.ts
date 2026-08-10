// lib/salesforce-service.ts
import { getOrgConfig } from './org-config';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Interface for Salesforce order records
interface SalesforceOrder {
  Id: string;
  Name: string;
  Status__c?: string;
  Bill_To_Contact_Name?: string;
  Ship_To_Contact_Name?: string;
  Total_Lines__c?: number;
  Total_Price__c?: number;
  [key: string]: any; // Allow additional fields
}
// API Configuration
const SALESFORCE_CONFIG = {
  instanceUrl: process.env.SF_DATA_URL || '',
  clientId: process.env.SALESFORCE_CLIENT_ID || '',
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
  username: process.env.SALESFORCE_USERNAME || '',
  password: process.env.SALESFORCE_PASSWORD || '',
  securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
};
// Get Salesforce session info (this would normally come from your session management)

// Helper to perform fetch with logging
export async function fetchWithLogging(url: string | URL | Request, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  const urlStr = typeof url === 'string' ? url : url.toString();

  // Create a correlation ID for matching requests and responses
  const correlationId = Math.random().toString(36).substring(7);

  if (options.body) {
    try {
      if (typeof options.body === 'string') {} else if (Buffer.isBuffer(options.body)) {} else {}
    } catch (e) {}
  }

  const start = Date.now();
  const response = await fetch(url, options);
  const duration = Date.now() - start;

  try {
    const clone = response.clone();
    const text = await clone.text();
    try {
      const json = JSON.parse(text);
    } catch {
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {} else {}
    }
  } catch (error) {}

  return response;
}

interface CachedSFSession {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
}

// Thrown by getSalesforceSessionForOrg() when the requesting organization has no
// complete Salesforce connection config on its own record — callers MUST NOT fall
// back to shared/global credentials when this is thrown.
export class OrgSalesforceConfigError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'OrgSalesforceConfigError';
  }
}

// client_credentials tokens aren't returned with an expiry we can trust across orgs,
// so cache conservatively under the typical Salesforce session timeout.
const SF_TOKEN_TTL_MS = 15 * 60 * 1000;
const sfSessionCache = new Map<string, CachedSFSession>();

// Lets callers force a re-authentication if a cached token turns out to be stale
// (e.g. Salesforce revoked/rotated it before our TTL expired).
export function invalidateSalesforceSessionCache() {
  sfSessionCache.clear();
}

export async function getSalesforceSession() {
  const orgConfig = await getOrgConfig().catch(e => {
    console.warn("Could not load org config, falling back to env:", e.message);
    return null;
  });

  const cacheKey = orgConfig?.id || 'env-fallback';
  const cached = sfSessionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { accessToken: cached.accessToken, instanceUrl: cached.instanceUrl };
  }

  const tokenUrl = orgConfig?.salesforceAuthUrl || process.env.SF_AUTH_URL || "";
  const clientId = orgConfig?.clientId || process.env.SF_CLIENT_ID || "";
  const clientSecret = orgConfig?.clientSecret || process.env.SF_CLIENT_SECRET || "";

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetchWithLogging(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const rawText = await res.text();
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    console.error(
      `getSalesforceSession - Auth endpoint returned non-JSON response (HTTP ${res.status}).\n` +
      `URL: ${tokenUrl}\n` +
      `Content-Type: ${contentType}\n` +
      `Body preview: ${rawText.slice(0, 200)}`
    );
    throw new Error(
      `Salesforce auth endpoint returned HTML instead of JSON (HTTP ${res.status}). ` +
      `Check SF_AUTH_URL in your .env file.`
    );
  }

  const tokenData = JSON.parse(rawText);
  if (!tokenData.access_token) {
    console.error("getSalesforceSession - FAILED to get access token:", tokenData);
  }

  const session = {
    accessToken: tokenData.access_token,
    instanceUrl: orgConfig?.salesforceUrl || tokenData.instance_url || process.env.SF_DATA_URL || "",
  };

  if (session.accessToken) {
    sfSessionCache.set(cacheKey, { ...session, expiresAt: Date.now() + SF_TOKEN_TTL_MS });
  }

  return session;
}

// Strict variant of getSalesforceSession() for flows where authenticating against the
// wrong Salesforce org would be unsafe (e.g. forgot/reset-password). Requires the
// requesting organization to have a complete Salesforce connection config on its own
// record and NEVER falls back to shared/global env credentials for any field.
export async function getSalesforceSessionForOrg() {
  let orgConfig;
  try {
    orgConfig = await getOrgConfig();
  } catch (e: any) {
    throw new OrgSalesforceConfigError(e?.message || 'Could not resolve organization for this request');
  }

  const missingFields = (['salesforceUrl', 'salesforceAuthUrl', 'clientId', 'clientSecret'] as const)
    .filter(field => !orgConfig[field]);
  if (missingFields.length > 0) {
    throw new OrgSalesforceConfigError(
      `Organization ${orgConfig.id} is missing Salesforce config field(s): ${missingFields.join(', ')}`
    );
  }

  const cacheKey = orgConfig.id;
  const cached = sfSessionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { accessToken: cached.accessToken, instanceUrl: cached.instanceUrl };
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: orgConfig.clientId!,
    client_secret: orgConfig.clientSecret!,
  });

  const res = await fetchWithLogging(orgConfig.salesforceAuthUrl!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const rawText = await res.text();
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    console.error(
      `getSalesforceSessionForOrg - Auth endpoint returned non-JSON response (HTTP ${res.status}) for org ${orgConfig.id}.\n` +
      `URL: ${orgConfig.salesforceAuthUrl}\n` +
      `Content-Type: ${contentType}\n` +
      `Body preview: ${rawText.slice(0, 200)}`
    );
    throw new Error(`Salesforce auth endpoint returned HTML instead of JSON (HTTP ${res.status}).`);
  }

  const tokenData = JSON.parse(rawText);
  if (!tokenData.access_token) {
    console.error("getSalesforceSessionForOrg - FAILED to get access token for org", orgConfig.id, ":", tokenData);
  }

  const session = {
    accessToken: tokenData.access_token,
    instanceUrl: orgConfig.salesforceUrl!,
  };

  if (session.accessToken) {
    sfSessionCache.set(cacheKey, { ...session, expiresAt: Date.now() + SF_TOKEN_TTL_MS });
  }

  return session;
}

// Fetch orders from Salesforce
export async function getOrderslistFromSalesforce(accountId?: string, contactId?: string, orderUrl?: string): Promise<any> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    const separator = orderUrl?.includes('?') ? '&' : '?';
    const Url = orderUrl + `${separator}accountId=${encodeURIComponent(accountId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;

    const response = await fetchWithLogging(Url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();

    // New API shape: [{ Customer_Order__c: [...], Status__c: [...] }]
    // Return the full response so the caller can extract Customer_Order__c / Status__c
    if (Array.isArray(resultdata) && resultdata.length > 0 && resultdata[0]?.Customer_Order__c) {
      return resultdata;
    }

    // Legacy shape: { data: [...] }
    if (resultdata?.data) {
      return resultdata.data;
    }

    return resultdata ?? [];
  } catch (error) {
    console.error('Error fetching orders from Salesforce:', error);
    return [];
  }
}
export async function getOrderFromSalesforce(accountId?: string, contactId?: string, orderId?: string, orderUrl?: string): Promise<SalesforceOrder[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return []; // Return empty array if not authenticated to Salesforce
    }

    const separator = orderUrl?.includes('?') ? '&' : '?';
    let Url = orderUrl + `${separator}accountId=${encodeURIComponent(accountId ?? '001WL00000bapRiYAI')}&orderId=${encodeURIComponent(orderId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;

    // Make API call to Salesforce

    const response = await fetchWithLogging(Url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();
    // Return the records from the response
    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching orders from Salesforce:', error);
    return []; // Return empty array on error
  }
}
export async function getOrderslocationsFromSalesforce(accountId?: string, contactId?: string, locationUrl?: string): Promise<SalesforceOrder[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return []; // Return empty array if not authenticated to Salesforce
    }
    // console.log('Fetching orders from Salesforce with session:', session);

    const separator = locationUrl?.includes('?') ? '&' : '?';
    let Url = (locationUrl ?? '') + `${separator}accountId=${encodeURIComponent(accountId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;
    //console.log('Fetching authorized locations from Salesforce with URL:', Url);
    // Make API call to Salesforce

    const response = await fetchWithLogging(Url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();
    //console.log('order location resultdata:', resultdata);
    // Return the records from the response
    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching orders from Salesforce:', error);
    return []; // Return empty array on error
  }
}

// Fetch authorized locations from Salesforce
export async function getAuthorizedLocationsFromSalesforce(accountId: string, contactId: string): Promise<any> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/authorizedlocations`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`;

    const response = await fetchWithLogging(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();
    return resultdata;
  } catch (error) {
    console.error('Error fetching authorized locations from Salesforce:', error);
    return null;
  }
}

// Fetch order lines from Salesforce
export async function getOrderLinesFromSalesforce(accountId: string, contactId: string, orderId: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/orderlines`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&orderId=${encodeURIComponent(orderId)}&contactId=${encodeURIComponent(contactId)}`;

    const response = await fetchWithLogging(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();

    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching order lines from Salesforce:', error);
    return [];
  }
}

// Fetch contacts from Salesforce
export async function getContactsFromSalesforce(accountId?: string, contactId?: string, contactUrl?: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return []; // Return empty array if not authenticated to Salesforce
    }

    const separator = contactUrl?.includes('?') ? '&' : '?';
    let Url = (contactUrl ?? '') + `${separator}accountId=${encodeURIComponent(accountId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;
    //console.log('Fetching contacts from Salesforce with URL:', Url);

    const response = await fetchWithLogging(Url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();
    //console.log('Contacts resultdata:', resultdata);
    // Return the records from the response
    return Array.isArray(resultdata) ? resultdata : (resultdata.data || []);
  } catch (error) {
    console.error('Error fetching contacts from Salesforce:', error);
    return []; // Return empty array on error
  }
}

// Fetch account from Salesforce
export async function getAccountFromSalesforce(accountId?: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    // Try singular 'account' as plural 'accounts' resulted in 404
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/account`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId ?? '')}`;

    const response = await fetchWithLogging(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Salesforce Account API error: ${response.status} ${response.statusText}. URL: ${url}`);
      return [];
    }

    const resultdata = await response.json();

    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching account from Salesforce:', error);
    return [];
  }
}
// Create a new order in Salesforce
export async function createOrderFromSalesforce(orderData: any): Promise<SalesforceOrder | null> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const baseUrl = session.instanceUrl.replace(/\/$/, '');
    let Url = `${baseUrl}/services/apexrest/gtherp/orders`;

    const response = await fetchWithLogging(Url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce API error response:', errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating order in Salesforce:', error);
    return null;
  }
}

// Update an existing order in Salesforce
export async function updateOrderFromSalesforce(orderId: string, orderData: any): Promise<boolean> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    // Use the same custom Apex REST endpoint as create order
    const baseUrl = session.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/services/apexrest/gtherp/orders`;

    const response = await fetchWithLogging(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce API error response:', errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json().catch(() => null);
    const signal = extractApexSuccessSignal(result);
    if (signal === false) {
      console.error('Salesforce PATCH reported failure in response body:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating order in Salesforce:', error);
    return false;
  }
}
// Clone an existing order in Salesforce
export async function cloneOrderFromSalesforce(orderData: any): Promise<any> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    // Use the same custom Apex REST endpoint as create order
    const baseUrl = session.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/services/apexrest/gtherp/orders`;

    const response = await fetchWithLogging(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce API error response:', errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error Clone order in Salesforce:', error);
    return null;
  }
}


// Inspect a parsed Apex REST response body for an explicit success/failure signal.
// A 2xx HTTP status alone does not guarantee the Apex REST resource actually applied
// the change, so callers use this to look for a real confirmation in the body before
// trusting response.ok. Returns null when the shape doesn't say either way.
function extractApexSuccessSignal(result: any): boolean | null {
  if (result === null || result === undefined) return false;
  if (typeof result.success === 'boolean') return result.success;
  if (Array.isArray(result)) {
    if (result.length === 0) return false;
    if (typeof result[0]?.success === 'boolean') return result[0].success;
    return null;
  }
  if (Array.isArray(result.errors) && result.errors.length > 0) return false;
  if (Array.isArray(result.data)) return result.data.length > 0 ? true : null;
  if (typeof result === 'object' && Object.keys(result).length === 0) return false;
  return null;
}

// Delete an order line from Salesforce
export async function deleteOrderFromSalesforce(accountId: string, contactId: string, orderLineId: string, orderId?: string): Promise<boolean> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/orderlines`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderLineId=${encodeURIComponent(orderLineId)}`;

    const response = await fetchWithLogging(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce DELETE failed:', response.status, errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json().catch(() => null);
    const signal = extractApexSuccessSignal(result);
    if (signal === false) {
      console.error('Salesforce DELETE reported failure in response body:', result);
      return false;
    }
    if (signal === true) return true;

    // Body didn't confirm either way — fall back to verifying directly against the
    // order lines list rather than assuming the 2xx status meant it worked.
    if (orderId) {
      const remainingLines = await getOrderLinesFromSalesforce(accountId, contactId, orderId);
      const stillPresent = remainingLines.some((line: any) => line?.Id === orderLineId);
      if (stillPresent) {
        console.error('Order line still present after delete confirmation check:', orderLineId);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting order line from Salesforce:', error);
    return false;
  }
}

// Delete an entire order and its related lines from Salesforce
export async function deleteFullOrderFromSalesforce(accountId: string, contactId: string, orderId: string): Promise<boolean> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/orders`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderId=${encodeURIComponent(orderId)}`;

    const response = await fetchWithLogging(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce DELETE full order failed:', response.status, errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return true;
  } catch (error) {
    console.error('Error deleting full order from Salesforce:', error);
    return false;
  }
}

// Fetch files from Salesforce
export async function getFilesFromSalesforce(accountId: string, contactId: string, orderId: string, objectName: string = "Customer_Order__c"): Promise<any[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(orderId)}&objectName=${encodeURIComponent(objectName)}`;

    const response = await fetchWithLogging(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    //console.log('Fetching files from Salesforce with response:', response);
    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();

    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching files from Salesforce:', error);
    return [];
  }
}

// Download file(s) from Salesforce - returns download URLs for the specified content document IDs
export async function downloadFileFromSalesforce(
  accountId: string,
  contactId: string,
  objectId: string,
  contentDocumentIds: string | string[]
): Promise<Array<{ DownloadUrl: string; Title: string; FileExtension: string; Id: string; ContentDocumentId: string }> | null> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    // Convert to comma-separated string if array
    const documentIds = Array.isArray(contentDocumentIds)
      ? contentDocumentIds.join(',')
      : contentDocumentIds;

    // Construct URL with query parameters for download
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(objectId)}&objectName=Customer_Order__c&contentDocumentId=${encodeURIComponent(documentIds)}`;

    const response = await fetchWithLogging(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();

    // Return the file data array with download URLs
    return resultdata.data || null;
  } catch (error) {
    console.error('Error downloading file from Salesforce:', error);
    return null;
  }
}

// Delete file(s) from Salesforce
export async function deleteFileFromSalesforce(
  accountId: string,
  contactId: string,
  objectId: string,
  contentDocumentIds: string | string[]
): Promise<boolean> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    // Convert to comma-separated string if array
    const documentIds = Array.isArray(contentDocumentIds)
      ? contentDocumentIds.join(',')
      : contentDocumentIds;

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(objectId)}&objectName=Customer_Order__c&contentDocumentId=${encodeURIComponent(documentIds)}`;

    const response = await fetchWithLogging(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce DELETE file failed:', response.status, errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return true;
  } catch (error) {
    console.error('Error deleting file from Salesforce:', error);
    return false;
  }
}

// Upload files to Salesforce using ContentVersion and ContentDocumentLink
export async function uploadFilesToSalesforce(uploadData: {
  accountId: string;
  contactId: string;
  objectId: string; // The linked record ID (e.g., Order ID)
  objectName: string;
  files: Array<{
    fileName: string;
    fileType: string;
    base64Data: string;
  }>;
}): Promise<any> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const results = [];

    for (const file of uploadData.files) {
      try {
        // Step 1: Create ContentVersion (upload file)
        const contentVersionId = await createContentVersion(
          session.instanceUrl,
          session.accessToken,
          file.fileName,
          file.base64Data
        );

        if (!contentVersionId) {
          console.error(`Failed to create ContentVersion for ${file.fileName}`);
          continue;
        }

        // Step 2: Get ContentDocumentId from ContentVersion
        const contentDocumentId = await getContentDocumentId(
          session.instanceUrl,
          session.accessToken,
          contentVersionId
        );

        if (!contentDocumentId) {
          console.error(`Failed to get ContentDocumentId for ${file.fileName}`);
          continue;
        }

        // Step 3: Create ContentDocumentLink to link file to the record
        const linkId = await createContentDocumentLink(
          session.instanceUrl,
          session.accessToken,
          contentDocumentId,
          uploadData.objectId
        );

        results.push({
          fileName: file.fileName,
          contentVersionId,
          contentDocumentId,
          linkId,
          success: true
        });
      } catch (fileError) {
        console.error(`Error uploading file ${file.fileName}:`, fileError);
        results.push({
          fileName: file.fileName,
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    return {
      success: results.some(r => r.success),
      results
    };
  } catch (error) {
    console.error('Error uploading files to Salesforce:', error);
    return null;
  }
}

// Helper: Create ContentVersion (upload file)
async function createContentVersion(
  instanceUrl: string,
  accessToken: string,
  fileName: string,
  base64Data: string
): Promise<string | null> {
  try {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const CRLF = '\r\n';

    // 1. entity_content part (JSON metadata)
    const entityContent = JSON.stringify({
      Title: fileName,
      PathOnClient: fileName
    });

    const part1Headers = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="entity_content"`,
      `Content-Type: application/json; charset=UTF-8`,
      ``,
      ``
    ].join(CRLF);

    const part1 = Buffer.concat([
      Buffer.from(part1Headers, 'utf-8'),
      Buffer.from(entityContent, 'utf-8'),
      Buffer.from(CRLF)
    ]);

    // 2. VersionData part (File content)
    const part2Headers = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="VersionData"; filename="${fileName}"`,
      `Content-Type: application/octet-stream`,
      ``,
      ``
    ].join(CRLF);

    const fileContent = Buffer.from(base64Data, 'base64');

    const part2 = Buffer.concat([
      Buffer.from(part2Headers, 'utf-8'),
      fileContent,
      Buffer.from(CRLF)
    ]);

    // 3. Footer
    const footer = Buffer.from(`--${boundary}--${CRLF}`);

    // Combine all parts
    const body = Buffer.concat([part1, part2, footer]);

    const response = await fetchWithLogging(
      `${instanceUrl}/services/data/v60.0/sobjects/ContentVersion`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ContentVersion creation failed:', response.status, errorText);
      throw new Error(`Failed to create ContentVersion: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating ContentVersion:', error);
    return null;
  }
}

// Helper: Get ContentDocumentId from ContentVersion
async function getContentDocumentId(
  instanceUrl: string,
  accessToken: string,
  contentVersionId: string
): Promise<string | null> {
  try {
    const query = `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${contentVersionId}'`;
    const response = await fetchWithLogging(
      `${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to query ContentDocumentId:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    if (result.records && result.records.length > 0) {
      const contentDocumentId = result.records[0].ContentDocumentId;
      return contentDocumentId;
    }

    return null;
  } catch (error) {
    console.error('Error querying ContentDocumentId:', error);
    return null;
  }
}

// Helper: Create ContentDocumentLink to link file to a record
async function createContentDocumentLink(
  instanceUrl: string,
  accessToken: string,
  contentDocumentId: string,
  linkedEntityId: string
): Promise<string | null> {
  try {
    const payload = {
      ContentDocumentId: contentDocumentId,
      LinkedEntityId: linkedEntityId,
      ShareType: 'V', // V = Viewer, C = Collaborator, I = Inferred
      Visibility: 'AllUsers' // Or 'InternalUsers', 'SharedUsers'
    };

    const response = await fetchWithLogging(
      `${instanceUrl}/services/data/v60.0/sobjects/ContentDocumentLink`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      // Check for duplicate link error (already linked)
      if (errorData && Array.isArray(errorData) && errorData[0]?.errorCode === 'DUPLICATE_VALUE') {
        return 'existing';
      }
      console.error('Failed to create ContentDocumentLink:', errorData);
      throw new Error(`Failed to create ContentDocumentLink: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating ContentDocumentLink:', error);
    return null;
  }
}

// Create ContentDistribution for public file access (no login required)
export async function createContentDistribution(
  contentVersionId: string
): Promise<string | null> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const payload = {
      Name: `Public_Access_${contentVersionId}`,
      ContentVersionId: contentVersionId,
      PreferencesAllowOriginalDownload: true,
      PreferencesAllowViewInBrowser: true,
      PreferencesAllowPDFDownload: true
    };

    const response = await fetchWithLogging(
      `${session.instanceUrl}/services/data/v60.0/sobjects/ContentDistribution`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ContentDistribution creation failed:', response.status, errorText);
      throw new Error(`Failed to create ContentDistribution: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating ContentDistribution:', error);
    return null;
  }
}

// Helper to decode HTML entities in URLs (e.g. &amp; -> &)
function decodeSalesforceUrl(url: string): string {
  if (!url) return url;
  return url.replace(/&amp;/g, '&');
}


// Get public distribution URLs from distribution ID
export async function getPublicDistributionUrl(
  distributionId: string
): Promise<{ previewUrl: string; downloadUrl: string } | null> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const response = await fetchWithLogging(
      `${session.instanceUrl}/services/data/v60.0/sobjects/ContentDistribution/${distributionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get ContentDistribution:', response.status, errorText);
      return null;
    }

    const result = await response.json();

    return {
      previewUrl: decodeSalesforceUrl(result.DistributionPublicUrl),
      downloadUrl: decodeSalesforceUrl(result.ContentDownloadUrl)
    };
  } catch (error) {
    console.error('Error getting public distribution URL:', error);
    return null;
  }
}

// Get file preview and download URLs - creates ContentDistribution and returns public URLs
export async function getFileUrl(
  id: string
): Promise<{ previewUrl: string; downloadUrl: string; } | null> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) return null;

    let contentVersionId = id;

    // Check if the ID is a ContentDocumentLink ID (starts with 06A)
    if (id.startsWith('06A')) {
      const query = `SELECT ContentDocumentId FROM ContentDocumentLink WHERE Id = '${id}'`;
      const response = await fetchWithLogging(
        `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`,
        {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.records && result.records.length > 0) {
          id = result.records[0].ContentDocumentId; // Fall through to 069 check
          contentVersionId = id;
        }
      }
    }

    // Check if the ID is a ContentDocument ID (starts with 069)
    if (id.startsWith('069')) {
      const query = `SELECT LatestPublishedVersionId FROM ContentDocument WHERE Id = '${id}'`;
      const response = await fetchWithLogging(
        `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`,
        {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.records && result.records.length > 0) {
          contentVersionId = result.records[0].LatestPublishedVersionId;
        }
      }
    }

    // Step 1: Check if an active ContentDistribution already exists
    const existingDistQuery = `SELECT Id, DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE ContentVersionId = '${contentVersionId}' AND IsDeleted = false LIMIT 1`;
    const distResponse = await fetchWithLogging(
      `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(existingDistQuery)}`,
      {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      }
    );

    if (distResponse.ok) {
      const distResult = await distResponse.json();
      if (distResult.records && distResult.records.length > 0) {
        const existing = distResult.records[0];
        if (existing.DistributionPublicUrl || existing.ContentDownloadUrl) {
          return {
            previewUrl: decodeSalesforceUrl(existing.DistributionPublicUrl),
            downloadUrl: decodeSalesforceUrl(existing.ContentDownloadUrl)
          };
        }
      }
    }

    // Step 2: Create ContentDistribution if not found
    const distributionId = await createContentDistribution(contentVersionId);
    if (!distributionId) {
      console.error('Failed to create ContentDistribution for:', contentVersionId);
      return null;
    }
    // Step 3: Get public URL for the newly created distribution
    const urls = await getPublicDistributionUrl(distributionId);

    if (!urls) {
      console.error('Failed to get public URLs for distribution:', distributionId);
      return null;
    }

    return urls;
  } catch (error) {
    console.error('Error in getFileUrl:', error);
    return null;
  }
}

