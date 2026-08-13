import { getSalesforceSession } from './salesforce-service';

// Marks a fetch result as a real Salesforce failure (org down, auth failure, non-2xx
// response) rather than a legitimate "no records" result, without changing the
// array shape existing callers already rely on (e.g. `.map()`, `.length`).
function sfFetchFailed(): any {
    return Object.assign([], { _sfFetchFailed: true });
}

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
            return sfFetchFailed();
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

        // The Apex endpoint reports query-level failures (e.g. a bad field reference)
        // with `success: false` in an HTTP 200 response — `!response.ok` above can't
        // catch this, so it must be checked explicitly or it looks identical to "no
        // records found".
        if (result.success === false) {
            console.error(`Salesforce reported failure for ${tabName}:`, result.message);
            return sfFetchFailed();
        }

        if (result.data && result.data.length > 0) {
            // Return the first object which contains all the arrays (e.g. Supplier_Bill__c, Supplier_Bill_Line__c)
            return result.data[0];
        }

        return [];
    } catch (error) {
        console.error(`Error fetching Supplier Bill data for ${tabName}:`, error);
        return sfFetchFailed();
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
            return sfFetchFailed();
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

        if (resultdata.success === false) {
            console.error('Salesforce reported failure fetching Supplier Bill files:', resultdata.message);
            return sfFetchFailed();
        }

        return resultdata.data || [];
    } catch (error) {
        console.error('Error fetching Supplier Bill files:', error);
        return sfFetchFailed();
    }
}
