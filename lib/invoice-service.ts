import { getSalesforceSession } from './salesforce-service';

/**
 * Fetch invoice data from Salesforce generic tab API
 */
export async function getInvoicesFromSalesforce(
    accountId: string,
    contactId: string,
    invoiceId: string = "",
    tabName: string = "Invoice",
    objectName: string = "Invoice__c"
): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/generic/tab`;
        let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectName=${encodeURIComponent(objectName)}&tabName=${encodeURIComponent(tabName)}`;

        if (invoiceId) {
            url += `&objectId=${encodeURIComponent(invoiceId)}`;
        }

        console.log(`Fetching ${tabName} from Salesforce with URL:`, url);

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
        console.log(`${tabName} result:`, result);

        if (result.data && result.data.length > 0) {
            const dataObject = result.data[0];

            // Return the entire object for primary tabs to access collections and metadata
            if (['Invoice', 'Fulfillment', 'Purchases', 'Returns', 'Products', 'Payments', 'Credits'].includes(tabName)) {
                return dataObject;
            }

            // For nested lists (lines, payments, etc.), return the array
            const objectKey = Object.keys(dataObject).find(key => key.endsWith('__c'));
            if (objectKey && Array.isArray(dataObject[objectKey])) {
                return dataObject[objectKey];
            }
        }

        return [];
    } catch (error) {
        console.error(`Error fetching ${tabName}:`, error);
        return [];
    }
}

/**
 * Fetch files related to an invoice from Salesforce
 */
export async function getInvoiceFilesFromSalesforce(
    accountId: string,
    contactId: string,
    invoiceId: string
): Promise<any[]> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
        const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(invoiceId)}&objectName=Invoice__c`;

        console.log('Fetching invoice files from Salesforce with URL:', url);

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
        console.error('Error fetching invoice files:', error);
        return [];
    }
}
