import { getSalesforceSession } from './salesforce-service';

/**
 * Fetch shipment manifest data from Salesforce generic tab API
 */
export async function getShipmentsFromSalesforce(
    accountId: string,
    contactId: string,
    objectName: string = "Shipping_Manifest__c",
    tabName: string = "Shipping_Manifest",
    objectId?: string
): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return { success: false, message: "No access token" };
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/generic/tab`;
        let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectName=${encodeURIComponent(objectName)}&tabName=${encodeURIComponent(tabName)}`;

        if (objectId) {
            url += `&objectId=${encodeURIComponent(objectId)}`;
        }

        console.log('Fetching shipment data from Salesforce with URL:', url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Salesforce Shipment API error:', response.status, errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Shipment resultdata:', JSON.stringify(result)?.slice(0, 300));
        return result;
    } catch (error) {
        console.error('Error fetching shipments from Salesforce:', error);
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
}

/** Fetch shipment files from Salesforce */
export async function getShipmentFilesFromSalesforce(accountId: string, contactId: string, shipmentId: string, objectName: string = "Shipping_Manifest__c"): Promise<any[]> {
    try {
        const session = await getSalesforceSession();

        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
        const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(shipmentId)}&objectName=${encodeURIComponent(objectName)}`;

        console.log('Fetching shipment files from Salesforce with URL:', url);

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
        return resultdata.data || [];
    } catch (error) {
        console.error('Error fetching shipment files from Salesforce:', error);
        return [];
    }
}

/**
 * Alias for getShipmentFilesFromSalesforce as requested
 */
export const file = getShipmentFilesFromSalesforce;

