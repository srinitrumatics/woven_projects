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

// Get Salesforce session info (this would normally come from your session management)
async function getSalesforceSession() {
  // In a real implementation, you'd retrieve the SF session from server-side session storage
  // For simulation, we'll return a mock session
  return {
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
  };
}

// Fetch orders from Salesforce
export async function getOrdersFromSalesforce(accountId?: string): Promise<SalesforceOrder[]> {
  try {
    const session = await getSalesforceSession();
    
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return []; // Return empty array if not authenticated to Salesforce
    }

    // Build SOQL query
    let soql = `SELECT Id, Name, Status__c, Bill_To_Contact_Name, Ship_To_Contact_Name, Total_Lines__c, Total_Price__c FROM Order__c`;
    
    const conditions = [];
    if (accountId) {
      conditions.push(`AccountId = '${accountId}'`);
    }
    
    if (conditions.length > 0) {
      soql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ORDER BY clause
    soql += ` ORDER BY CreatedDate DESC`;

    // Make API call to Salesforce
    const response = await fetch(`${session.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the records from the response
    return data.records || [];
  } catch (error) {
    console.error('Error fetching orders from Salesforce:', error);
    return []; // Return empty array on error
  }
}

// Get a single order by ID
export async function getOrderById(orderId: string): Promise<SalesforceOrder | null> {
  try {
    const session = await getSalesforceSession();
    
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const soql = `SELECT Id, Name, Status__c, Bill_To_Contact_Name, Ship_To_Contact_Name, Total_Lines__c, Total_Price__c FROM Order__c WHERE Id = '${orderId}'`;

    const response = await fetch(`${session.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.records && data.records.length > 0 ? data.records[0] : null;
  } catch (error) {
    console.error('Error fetching order from Salesforce:', error);
    return null;
  }
}

// Create a new order in Salesforce
export async function createOrderInSalesforce(orderData: any): Promise<SalesforceOrder | null> {
  try {
    const session = await getSalesforceSession();
    
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const response = await fetch(`${session.instanceUrl}/services/data/v58.0/sobjects/Order__c/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

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
export async function updateOrderInSalesforce(orderId: string, orderData: any): Promise<boolean> {
  try {
    const session = await getSalesforceSession();
    
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return false;
    }

    const response = await fetch(`${session.instanceUrl}/services/data/v58.0/sobjects/Order__c/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating order in Salesforce:', error);
    return false;
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