import { getSalesforceSession, fetchWithLogging } from './salesforce-service';

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

    const response = await fetchWithLogging(url, {
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

    // Try to extract data robustly
    if (resultdata?.data) {
      if (Array.isArray(resultdata.data)) {
        // Check if it's the nested format: [{ Products__c: [...] }]
        if (resultdata.data.length > 0) {
          const firstItem = resultdata.data[0];
          const objectKey = Object.keys(firstItem).find(key => key.endsWith('__c') && Array.isArray(firstItem[key]));
          if (objectKey) {
            console.log('DEBUG: found nested array in key:', objectKey);
            const products = firstItem[objectKey];
            console.log(`DEBUG: getProductsFromSalesforce returning ${products.length} products (nested)`);
            if (products.length > 0) {
              console.log('DEBUG: First product sample (nested):', JSON.stringify(products[0], null, 2));
            }
            return products;
          }
        }
        const products = resultdata.data;
        console.log(`DEBUG: getProductsFromSalesforce returning ${products.length} products`);
        // Log the first few products for inspection
        if (products.length > 0) {
          console.log('DEBUG: First product sample:', JSON.stringify(products[0], null, 2));
        }
        return products;
      }
    }

    console.log('DEBUG: getProductsFromSalesforce returning empty list');
    return [];
  } catch (error) {
    console.error('DEBUG: Error fetching Products from Salesforce:', error);
    return [];
  }
}

// Fetch single product details from Salesforce
export async function getProductDetailsFromSalesforce(accountId: string, contactId: string, productId: string, tabName: string = "product"): Promise<any> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return null;
    }

    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/product/details`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&productId=${encodeURIComponent(productId)}&tabName=${encodeURIComponent(tabName)}`;

    console.log('Fetching product details from Salesforce with URL:', url);

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
    console.error('Error fetching product details from Salesforce:', error);
    return null;
  }
}

// Create Product in Salesforce
export async function createProductInSalesforce(accountId: string, contactId: string, productData: any): Promise<any> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      throw new Error("No Salesforce access token available");
    }

    const url = `${session.instanceUrl}/services/apexrest/gtherp/product/details`;

    const body = {
      product: [productData],
      accountId: accountId,
      contactId: contactId,
      tabName: "product"
    };

    console.log("=== SALESFORCE PRODUCT CREATION PAYLOAD ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("===========================================");

    const response = await fetchWithLogging(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Salesforce API error details:", errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating product in Salesforce:", error);
    throw error;
  }
}

// Update specific tab data for a product in Salesforce
export async function updateProductTabInSalesforce(payload: any): Promise<any> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      throw new Error("No Salesforce access token available");
    }

    const url = `${session.instanceUrl}/services/apexrest/gtherp/product/details`;

    console.log("=== SALESFORCE TAB UPDATE PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("===========================================");

    const response = await fetchWithLogging(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Salesforce API error details:", errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product tab in Salesforce:", error);
    throw error;
  }
}

// Update specific tab data for a product in Salesforce using PATCH
export async function patchProductTabInSalesforce(payload: any): Promise<any> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      throw new Error("No Salesforce access token available");
    }

    const url = `${session.instanceUrl}/services/apexrest/gtherp/product/details`;

    console.log("=== SALESFORCE TAB PATCH PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("===========================================");

    const response = await fetchWithLogging(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Salesforce API error details:", errorText);
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product tab in Salesforce (PATCH):", error);
    throw error;
  }
}