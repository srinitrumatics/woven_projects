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
async function getSalesforceSession() {
  // obtain or reuse token
  const tokenUrl = "https://test.salesforce.com/services/oauth2/token";
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.SF_CLIENT_ID || "",
    client_secret: process.env.SF_CLIENT_SECRET || "",
    username: process.env.SF_USERNAME || "",
    password: process.env.SF_PASSWORD || "",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const tokenData = await res.json();
  return {
    accessToken: tokenData.access_token,
    instanceUrl: tokenData.instance_url,
  };
}

// Fetch orders from Salesforce
export async function getOrderslistFromSalesforce(accountId?: string, contactId?: string, orderUrl?: string): Promise<SalesforceOrder[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return []; // Return empty array if not authenticated to Salesforce
    }


    const separator = orderUrl?.includes('?') ? '&' : '?';
    let Url = orderUrl + `${separator}accountId=${encodeURIComponent(accountId ?? '001WL00000bapRiYAI')}&contactId=${encodeURIComponent(contactId ?? 'abc')}`;

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
    //console.log('resultdata');
    //console.log(resultdata);

    // Return the records from the response
    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching orders from Salesforce:', error);
    return []; // Return empty array on error
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
    let Url = orderUrl + `${separator}accountId=${encodeURIComponent(accountId ?? '001WL00000bapRiYAI')}&orderId=${encodeURIComponent(orderId ?? '')}&contactId=${encodeURIComponent(contactId ?? 'abc')}`;

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
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    // Use the specific Apex REST endpoint for products
    // Default to the provided URL structure if contactUrl is not passed or doesn't match
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/products`;

    // Construct URL with query parameters
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId ?? '')}&contactId=${encodeURIComponent(contactId ?? '')}`;

    console.log('Fetching products from Salesforce with URL:', url);

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
    //console.log('Products resultdata:', resultdata);

    // The API returns { data: [...], message: "...", success: true }
    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching Products from Salesforce:', error);
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

// Fetch files from Salesforce
export async function getFilesFromSalesforce(accountId: string, contactId: string, orderId: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(orderId)}&objectName=Customer_Order__c`;

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
    // Use multipart/form-data approach for ContentVersion
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    // Build multipart body
    const entityContent = JSON.stringify({
      Title: fileName,
      PathOnClient: fileName
    });

    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="entity_content"\r\n';
    body += 'Content-Type: application/json\r\n\r\n';
    body += entityContent + '\r\n';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="VersionData"; filename="${fileName}"\r\n`;
    body += 'Content-Type: application/octet-stream\r\n';
    body += 'Content-Transfer-Encoding: base64\r\n\r\n';
    body += base64Data + '\r\n';
    body += `--${boundary}--\r\n`;

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
      Name: "Public File",
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

// Get public distribution URL from distribution ID
export async function getPublicDistributionUrl(
  distributionId: string
): Promise<string | null> {
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
    console.log('ContentDistribution URL:', result.DistributionPublicUrl);
    return result.DistributionPublicUrl;
  } catch (error) {
    console.error('Error getting public distribution URL:', error);
    return null;
  }
}

// Get file preview URL - creates ContentDistribution and returns public URLs
export async function getFileUrl(
  contentVersionId: string
): Promise<{ previewUrl: string; } | null> {
  try {
    // Step 1: Create ContentDistribution
    const distributionId = await createContentDistribution(contentVersionId);
    if (!distributionId) {
      console.error('Failed to create ContentDistribution');
      return null;
    }
    // Step 2: Get public URL
    const publicUrl = await getPublicDistributionUrl(distributionId);

    if (!publicUrl) {
      console.error('Failed to get public URL');
      return null;
    }

    return { previewUrl: publicUrl };

  } catch (error) {
    console.error('Error getting file preview URL:', error);
    return null;
  }
}