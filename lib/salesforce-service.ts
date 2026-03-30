// lib/salesforce-service.ts
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
export async function getSalesforceSession() {
  // obtain or reuse token
  const tokenUrl = process.env.SF_AUTH_URL || "https://test.salesforce.com/services/oauth2/token";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SF_CLIENT_ID || "",
    client_secret: process.env.SF_CLIENT_SECRET || "",
  });

  const res = await fetch(tokenUrl, {
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
  console.log("getSalesforceSession - tokenData received:", !!tokenData.access_token);
  if (!tokenData.access_token) {
    console.error("getSalesforceSession - FAILED to get access token:", tokenData);
  }
  return {
    accessToken: tokenData.access_token,
    instanceUrl: tokenData.instance_url,
  };
}

// Fetch orders from Salesforce
export async function getOrderslistFromSalesforce(accountId?: string, contactId?: string, orderUrl?: string): Promise<any> {
  try {
    console.log("getOrderslistFromSalesforce called with accountId:", accountId, "contactId:", contactId);
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    const separator = orderUrl?.includes('?') ? '&' : '?';
    const Url = orderUrl + `${separator}accountId=${encodeURIComponent(accountId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;

    console.log('Fetching orders from Salesforce with URL:', Url);

    const response = await fetch(Url, {
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
    console.log('getOrderslistFromSalesforce raw response:', JSON.stringify(resultdata)?.slice(0, 300));

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
    console.log('Fetching orders from Salesforce with session:', session);

    const separator = orderUrl?.includes('?') ? '&' : '?';
    let Url = orderUrl + `${separator}accountId=${encodeURIComponent(accountId ?? '001WL00000bapRiYAI')}&orderId=${encodeURIComponent(orderId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;

    console.log('Fetching orders from Salesforce with URL:', Url);
    // Make API call to Salesforce

    const response = await fetch(Url, {
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
    console.log('order details resultdata', resultdata);
    //console.log(resultdata);

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

    const response = await fetch(Url, {
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

    console.log('Fetching authorized locations with URL:', url);

    const response = await fetch(url, {
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

    console.log('Fetching order lines from Salesforce with URL:', url);

    const response = await fetch(url, {
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
    console.log('Order lines resultdata:', resultdata);

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

    const response = await fetch(Url, {
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
    return resultdata.data || [];
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

    console.log('Fetching account from Salesforce with URL:', url);

    const response = await fetch(url, {
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
    console.log('Account resultdata:', resultdata);

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

    let Url = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders`;
    console.log('createOrderFromSalesforce URL:', Url);
    console.log('createOrderFromSalesforce Payload:', JSON.stringify(orderData, null, 2));

    const response = await fetch(Url, {
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
    console.log('createOrderFromSalesforce Response:', JSON.stringify(result, null, 2));
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
    const url = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders`;
    console.log('updateOrderFromSalesforce URL:', url);
    console.log('updateOrderFromSalesforce orderData:', JSON.stringify(orderData, null, 2));

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    console.log('updateOrderFromSalesforce Response:', response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce API error response:', errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('updateOrderFromSalesforce Result:', result);
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
    const url = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders`;
    console.log('cloneOrderFromSalesforce URL:', url);
    console.log('cloneOrderFromSalesforce orderData:', JSON.stringify(orderData, null, 2));

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    console.log('cloneOrderFromSalesforce Response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce API error response:', errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('cloneOrderFromSalesforce Result:', result);
    return result;
  } catch (error) {
    console.error('Error Clone order in Salesforce:', error);
    return null;
  }
}

// Fetch products from Salesforce
export async function getProductsFromSalesforce(accountId?: string, contactId?: string, contactUrl?: string): Promise<any[]> {
  try {
    console.log('DEBUG: getProductsFromSalesforce called', { accountId, contactId });
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('DEBUG: No Salesforce access token available');
      return [];
    }

    // Use the specific Apex REST endpoint for products
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/products`;

    // Construct URL with query parameters
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;

    console.log('DEBUG: Fetching products from Salesforce with URL:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log('DEBUG: Salesforce products response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: Salesforce products error text:', errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();
    console.log('DEBUG: getProductsFromSalesforce resultdata received:', !!resultdata);
    if (resultdata) {
      console.log('DEBUG: resultdata keys:', Object.keys(resultdata));
      console.log('DEBUG: resultdata.success:', resultdata.success);
      if (resultdata.data) {
        console.log('DEBUG: resultdata.data count/type:', Array.isArray(resultdata.data) ? resultdata.data.length : typeof resultdata.data);
        if (Array.isArray(resultdata.data) && resultdata.data.length > 0) {
          console.log('DEBUG: resultdata.data[0] keys:', Object.keys(resultdata.data[0]));
        }
      }
    }

    // Try to extract data robustly
    if (resultdata.data) {
      if (Array.isArray(resultdata.data)) {
        // Check if it's the nested format: [{ Products__c: [...] }]
        if (resultdata.data.length > 0) {
          const firstItem = resultdata.data[0];
          const objectKey = Object.keys(firstItem).find(key => key.endsWith('__c') && Array.isArray(firstItem[key]));
          if (objectKey) {
            console.log('DEBUG: found nested array in key:', objectKey);
            return firstItem[objectKey];
          }
        }
        return resultdata.data;
      }
    }

    return [];
  } catch (error) {
    console.error('DEBUG: Error fetching Products from Salesforce:', error);
    return [];
  }
}

// Delete an order line from Salesforce
export async function deleteOrderFromSalesforce(accountId: string, contactId: string, orderLineId: string): Promise<boolean> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/orderlines`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderLineId=${encodeURIComponent(orderLineId)}`;

    console.log('Deleting order line from Salesforce with URL:', url);

    const response = await fetch(url, {
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

    const result = await response.json();
    console.log('Order line deleted successfully:', result);
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

    console.log('Deleting full order from Salesforce with URL:', url);

    const response = await fetch(url, {
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
    console.log('Order and related lines are deleted successfully:', result);
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

    console.log('Fetching files from Salesforce with URL:', url);

    const response = await fetch(url, {
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
    console.log('Files resultdata:', resultdata);

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

    console.log('Downloading file from Salesforce with URL:', url);

    const response = await fetch(url, {
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
    console.log('File download resultdata received:', resultdata);

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

    console.log('Deleting file from Salesforce with URL:', url);

    const response = await fetch(url, {
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
    console.log('File deleted successfully:', result);
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

        console.log(`File ${file.fileName} uploaded and linked successfully`);
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

    const response = await fetch(
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
    console.log('ContentVersion created:', result.id);
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
    const response = await fetch(
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
      console.log('ContentDocumentId:', contentDocumentId);
      return contentDocumentId;
    }

    console.log('ContentDocumentId not found');
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

    const response = await fetch(
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
        console.log('ContentDocumentLink already exists');
        return 'existing';
      }
      console.error('Failed to create ContentDocumentLink:', errorData);
      throw new Error(`Failed to create ContentDocumentLink: ${response.status}`);
    }

    const result = await response.json();
    console.log('ContentDocumentLink created:', result.id);
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

    const response = await fetch(
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
    console.log('ContentDistribution created:', result.id);
    return result.id;
  } catch (error) {
    console.error('Error creating ContentDistribution:', error);
    return null;
  }
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

    const response = await fetch(
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
    console.log('ContentDistribution URLs - Preview:', result.DistributionPublicUrl, 'Download:', result.ContentDownloadUrl);
    
    return {
      previewUrl: result.DistributionPublicUrl,
      downloadUrl: result.ContentDownloadUrl
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
      const response = await fetch(
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
      const response = await fetch(
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

    console.log('getFileUrl for ID:', id, 'resolved to ContentVersionId:', contentVersionId);
    
    // Step 1: Check if an active ContentDistribution already exists
    const existingDistQuery = `SELECT Id, DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE ContentVersionId = '${contentVersionId}' AND IsDeleted = false LIMIT 1`;
    const distResponse = await fetch(
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
          console.log('getFileUrl: Reusing existing ContentDistribution:', existing.Id);
          return {
            previewUrl: existing.DistributionPublicUrl,
            downloadUrl: existing.ContentDownloadUrl
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

    console.log('getFileUrl success:', urls);
    return urls;

  } catch (error) {
    console.error('Error in getFileUrl:', error);
    return null;
  }
}
