/**
 * Salesforce API Client
 *
 * This module handles all interactions with Salesforce (WOVN) API.
 * Configure credentials in .env.local file.
 */

import { Order, OrderStats, Product } from "@/app/orders/types";

// API Configuration
const SALESFORCE_CONFIG = {
  instanceUrl: process.env.NEXT_PUBLIC_SALESFORCE_INSTANCE_URL || '',
  clientId: process.env.SALESFORCE_CLIENT_ID || '',
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
  username: process.env.SALESFORCE_USERNAME || '',
  password: process.env.SALESFORCE_PASSWORD || '',
  securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
};

// Access token cache
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Authenticate with Salesforce using OAuth 2.0 Username-Password Flow
 * @returns Access token
 */
async function authenticate(): Promise<string> {
  // Check if we have a valid cached token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: SALESFORCE_CONFIG.clientId,
    client_secret: SALESFORCE_CONFIG.clientSecret,
    username: SALESFORCE_CONFIG.username,
    password: SALESFORCE_CONFIG.password + SALESFORCE_CONFIG.securityToken,
  });

  try {
    const response = await fetch(
      `${SALESFORCE_CONFIG.instanceUrl}/services/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      throw new Error(`Salesforce authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;

    if (!accessToken) {
      throw new Error('Salesforce authentication failed: No access token received');
    }

    // Set token expiry to 1 hour from now (Salesforce tokens typically last 2 hours)
    tokenExpiry = Date.now() + 3600000;

    return accessToken;
  } catch (error) {
    console.error('Salesforce authentication error:', error);
    throw error;
  }
}

/**
 * Execute a SOQL query against Salesforce
 * @param query SOQL query string
 * @returns Query results
 */
async function executeQuery<T>(query: string): Promise<T[]> {
  const token = await authenticate();
  const encodedQuery = encodeURIComponent(query);

  try {
    const response = await fetch(
      `${SALESFORCE_CONFIG.instanceUrl}/services/data/v58.0/query?q=${encodedQuery}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Salesforce query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Salesforce query error:', error);
    throw error;
  }
}

/**
 * Fetch all orders from Salesforce
 * @returns Array of orders
 */
export async function fetchOrders(): Promise<Order[]> {
  // TODO: Update this query to match your Salesforce Order object schema
  const query = `
    SELECT
      Id,
      Name,
      Status,
      Proposal__c,
      Customer_PO__c,
      Bill_To_Account__r.Name,
      Ship_To_Location__c,
      Total_Items__c,
      Total_Amount__c
    FROM Order
    ORDER BY CreatedDate DESC
    LIMIT 1000
  `;

  try {
    const records = await executeQuery<any>(query);

    // Map Salesforce records to Order interface
    return records.map(record => ({
      id: record.Id,
      status: mapSalesforceStatus(record.Status),
      proposal: record.Proposal__c || '',
      cpo: record.Customer_PO__c || '',
      billTo: record.Bill_To_Account__r?.Name || '',
      shipTo: record.Ship_To_Location__c || '',
      items: record.Total_Items__c || 0,
      total: record.Total_Amount__c || 0,
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Fetch order statistics from Salesforce
 * @returns Order statistics
 */
export async function fetchOrderStats(): Promise<OrderStats> {
  // TODO: Update these queries to match your Salesforce schema
  try {
    // You may need to use aggregate queries or multiple queries
    const totalOrdersQuery = `SELECT COUNT(Id) total FROM Order WHERE Status != 'Cancelled'`;
    const returnsQuery = `SELECT COUNT(Id) total FROM Return__c WHERE Status__c = 'Active'`;
    const fulfilledQuery = `SELECT COUNT(Id) total FROM Order WHERE Fulfillment_Status__c = 'Fulfilled'`;

    // Execute queries in parallel
    const [totalOrders, returns, fulfilled] = await Promise.all([
      executeQuery<{ total: number }>(totalOrdersQuery),
      executeQuery<{ total: number }>(returnsQuery),
      executeQuery<{ total: number }>(fulfilledQuery),
    ]);

    return {
      totalOrders: totalOrders[0]?.total || 0,
      totalOrdersChange: 0, // Calculate based on historical data
      orderItems: 0, // Calculate from order line items
      orderItemsChange: 0,
      returnsOrders: returns[0]?.total || 0,
      returnsOrdersChange: 0,
      fulfilledOrders: fulfilled[0]?.total || 0,
      fulfilledOrdersChange: 0,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
}

/**
 * Fetch a single order by ID
 * @param orderId Salesforce Order ID
 * @returns Order details
 */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const query = `
    SELECT
      Id,
      Name,
      Status,
      Proposal__c,
      Customer_PO__c,
      Bill_To_Account__r.Name,
      Ship_To_Location__c,
      Total_Items__c,
      Total_Amount__c,
      Payment_Terms__c,
      Delivery_Date__c,
      Notes__c
    FROM Order
    WHERE Id = '${orderId}'
  `;

  try {
    const records = await executeQuery<any>(query);
    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.Id,
      status: mapSalesforceStatus(record.Status),
      proposal: record.Proposal__c || '',
      cpo: record.Customer_PO__c || '',
      billTo: record.Bill_To_Account__r?.Name || '',
      shipTo: record.Ship_To_Location__c || '',
      items: record.Total_Items__c || 0,
      total: record.Total_Amount__c || 0,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Fetch products from Salesforce Product2 table
 * @returns Array of products
 */
export async function fetchProducts(): Promise<Product[]> {
  // TODO: Update field names to match your actual Salesforce Product2 schema
  // Common custom field patterns: Field_Name__c (custom), RelatedObject__r.Name (relationship)
  const query = `
    SELECT
      Id,
      Name,
      Description,
      ProductCode,
      Family,
      Manufacturer__c,
      Brand__c,
      Available_Quantity__c,
      Minimum_Order_Quantity__c,
      List_Price__c,
      Unit_Price__c
    FROM Product2
    WHERE IsActive = true
    ORDER BY Name
    LIMIT 1000
  `;

  try {
    const records = await executeQuery<any>(query);

    return records.map(record => ({
      id: record.Id,
      name: record.Name || '',
      description: record.Description || '',
      manufacturer: record.Manufacturer__c || '',
      productFamily: record.Family || '',
      brand: record.Brand__c || '',
      sku: record.ProductCode || '',
      availableQty: record.Available_Quantity__c || 0,
      moq: record.Minimum_Order_Quantity__c || 1,
      listPrice: record.List_Price__c || 0,
      unitPrice: record.Unit_Price__c || 0,
      orderQty: 0,
      subtotal: 0,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Create a new order in Salesforce
 * @param orderData Order data to create
 * @returns Created order ID
 */
export async function createOrder(orderData: any): Promise<string> {
  const token = await authenticate();

  try {
    const response = await fetch(
      `${SALESFORCE_CONFIG.instanceUrl}/services/data/v58.0/sobjects/Order`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update an existing order in Salesforce
 * @param orderId Salesforce Order ID
 * @param orderData Order data to update
 */
export async function updateOrder(orderId: string, orderData: any): Promise<void> {
  const token = await authenticate();

  try {
    const response = await fetch(
      `${SALESFORCE_CONFIG.instanceUrl}/services/data/v58.0/sobjects/Order/${orderId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Delete an order from Salesforce
 * @param orderId Salesforce Order ID
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const token = await authenticate();

  try {
    const response = await fetch(
      `${SALESFORCE_CONFIG.instanceUrl}/services/data/v58.0/sobjects/Order/${orderId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete order: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

/**
 * Map Salesforce order status to application status
 * @param salesforceStatus Salesforce status value
 * @returns Mapped status
 */
function mapSalesforceStatus(salesforceStatus: string): "Pending" | "Success" | "Draft" | "Cancelled" {
  const statusMap: Record<string, "Pending" | "Success" | "Draft" | "Cancelled"> = {
    'Draft': 'Draft',
    'Pending': 'Pending',
    'Activated': 'Success',
    'Completed': 'Success',
    'Cancelled': 'Cancelled',
  };

  return statusMap[salesforceStatus] || 'Pending';
}

/**
 * Check if Salesforce is configured
 * @returns True if all required config is present
 */
export function isSalesforceConfigured(): boolean {
  return !!(
    SALESFORCE_CONFIG.instanceUrl &&
    SALESFORCE_CONFIG.clientId &&
    SALESFORCE_CONFIG.clientSecret &&
    SALESFORCE_CONFIG.username &&
    SALESFORCE_CONFIG.password
  );
}
