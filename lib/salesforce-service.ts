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
    console.log('Fetching authorized locations from Salesforce with URL:', Url);
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
    console.log('order location resultdata:', resultdata);
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
    console.log('Fetching contacts from Salesforce with URL:', Url);

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
    console.log('Contacts resultdata:', resultdata);
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

    const response = await fetch(Url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    console.log('createOrderFromSalesforce Reponse:', response);
    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
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

    console.log('updateOrderFromSalesforce Response:', response.status, response.statusText);

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
    console.log('Products resultdata:', resultdata);

    // The API returns { data: [...], message: "...", success: true }
    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching Products from Salesforce:', error);
    return [];
  }
}

// Delete an order from Salesforce
export async function deleteOrderFromSalesforce(orderId: string): Promise<boolean> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    const response = await fetch(`${session.instanceUrl}/services/data/v58.0/sobjects/Order__c/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting order from Salesforce:', error);
    return false;
  }
}