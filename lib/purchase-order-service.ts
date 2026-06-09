import { getSalesforceSession } from './salesforce-service';

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
