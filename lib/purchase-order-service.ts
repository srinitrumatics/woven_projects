import { getSalesforceSession, fetchWithLogging } from './salesforce-service';

export async function getPurchaseOrderFilesFromSalesforce(accountId: string, contactId: string, objectId: string, objectName: string = "Purchase_Order__c"): Promise<any[]> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
        const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(objectId)}&objectName=${encodeURIComponent(objectName)}`;

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
        console.error('Error fetching PO files:', error);
        return [];
    }
}

export async function getPurchaseOrdersFromSalesforce(
    accountId: string,
    contactId: string,
    objectId?: string,
    tabName: string = "Purchases",
    objectName: string = "Purchase_Order__c"
): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/generic/tab`;
        let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectName=${encodeURIComponent(objectName)}&tabName=${encodeURIComponent(tabName)}`;

        if (objectId) {
            url += `&objectId=${encodeURIComponent(objectId)}`;
        }

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

        const result = await response.json();

        if (result.data && result.data.length > 0) {
            const dataObject = result.data[0];

            if ([tabName, 'Purchases', 'Fulfillment', 'Returns', 'Purchase_Order__c', 'Purchase_Order'].includes(tabName)) {
                return dataObject;
            }

            const objectKey = Object.keys(dataObject).find(key => key.endsWith('__c'));
            if (objectKey && Array.isArray(dataObject[objectKey])) {
                return dataObject[objectKey];
            }
        }

        return [];
    } catch (error) {
        console.error(`Error fetching Purchase Order data for ${tabName}:`, error);
        return [];
    }
}

// Update Tracking Number / Promise Date on a Purchase Order Line in Salesforce
export async function patchPurchaseOrderLineInSalesforce(payload: {
    purchaseOrderLines: Array<{ Id: string; Tracking_Number__c?: string; Promise_Date__c?: string }>;
    accountId: string;
    contactId: string;
}): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/purchaseorderlines`;

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
        console.error("Error updating purchase order line in Salesforce (PATCH):", error);
        throw error;
    }
}
