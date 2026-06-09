import { getSalesforceSession } from './salesforce-service';

export async function getQuotesFromSalesforce(
    accountId: string,
    contactId: string,
    quoteId?: string,
    tabName: string = "Customer_Quote",
    objectName: string = "Customer_Quote__c"
): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/generic/tab`;

        let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectName=${encodeURIComponent(objectName)}&tabName=${encodeURIComponent(tabName)}`;

        if (quoteId) {
            url += `&objectId=${encodeURIComponent(quoteId)}`;
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

        // Standard return for header/list
        if (result.data && result.data.length > 0) {
            const dataObject = result.data[0];

            // For complex tabs like fulfillment, returns, purchases, return the whole object
            if (['Fulfillment', 'Purchases', 'Returns'].includes(tabName)) {
                return dataObject;
            }

            // Otherwise return the array for the specific object
            // Use provided objectName or find the first array
            if (dataObject[objectName] && Array.isArray(dataObject[objectName])) {
                return dataObject[objectName];
            }

            const possibleKeys = [tabName, `${tabName}__c`, objectName, `${objectName}__c`];
            for (const key of possibleKeys) {
                if (Array.isArray(dataObject[key])) {
                    return dataObject[key];
                }
            }

            // Fallback: finding the first key that looks like it contains an array
            const objectKey = Object.keys(dataObject).find(key => Array.isArray(dataObject[key]));
            if (objectKey) {
                return dataObject[objectKey];
            }
        }

        return [];
    } catch (error) {
        console.error(`Error fetching Quote Data (${tabName}):`, error);
        return [];
    }
}

export async function getQuoteFilesFromSalesforce(
    accountId: string,
    contactId: string,
    quoteId: string
): Promise<any[]> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
        const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(quoteId)}&objectName=Customer_Quote__c`;

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
        return result.data || [];
    } catch (error) {
        console.error('Error fetching quote files:', error);
        return [];
    }
}
