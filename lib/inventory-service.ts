import { getSalesforceSession } from './salesforce-service';

/**
 * Fetch inventory records from Salesforce
 * Supports both product-based and general inventory calls
 */
export async function getInventoryFromSalesforce(
    accountId: string,
    contactId: string,
    productId?: string,
    isInventory?: boolean
): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return { success: false, message: "No access token" };
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/inventory`;
        let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`;

        if (productId) {
            url += `&productId=${encodeURIComponent(productId)}`;
        }

        if (isInventory) {
            url += `&isInventory=true&isSupplier=false`;
        }
        else {
            url += `&isInventory=true&isSupplier=true`;
        }

        console.log('Fetching inventory data from Salesforce with URL:', url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Salesforce Inventory API error:', response.status, errorText);
            return { success: false, message: `Salesforce API error: ${response.status}` };
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching inventory from Salesforce:', error);
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
}
