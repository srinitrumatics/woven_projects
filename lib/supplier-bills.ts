import { getSalesforceSession } from './salesforce-service';

export async function getSupplierBillsFromSalesforce(
    accountId: string,
    contactId: string,
    objectId?: string,
    tabName: string = "Supplier_Bill",
    objectName: string = "Supplier_Bill__c"
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

        console.log(`Fetching Supplier Bill ${tabName} from Salesforce with URL:`, url);

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
            // Return the first object which contains all the arrays (e.g. Supplier_Bill__c, Supplier_Bill_Line__c)
            return result.data[0];
        }

        return [];
    } catch (error) {
        console.error(`Error fetching Supplier Bill data for ${tabName}:`, error);
        return [];
    }
}

export async function getSupplierBillFilesFromSalesforce(
    accountId: string,
    contactId: string,
    objectId: string,
    objectName: string = "Supplier_Bill__c"
): Promise<any[]> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
        const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(objectId)}&objectName=${encodeURIComponent(objectName)}`;

        console.log('Fetching Supplier Bill files from Salesforce with URL:', url);

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
        console.error('Error fetching Supplier Bill files:', error);
        return [];
    }
}
