import { getSalesforceSession } from './salesforce-service';

export async function getQuotesFromSalesforce(
    accountId: string,
    contactId: string,
    quoteId?: string
): Promise<any[]> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('No Salesforce access token available');
            return [];
        }

        // Using the generic tab endpoint or a specific quote endpoint if available
        // For consistency with other modules, we'll follow the pattern of using the generic tab endpoint
        // but encapsulated here for separation of concerns
        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/generic/tab`;

        // We request the "Quote" tab data for the "Quote__c" object (or standard Quote object if applicable)
        // Adjust objectName if your Salesforce implementation uses standard 'Quote' object instead of custom 'Quote__c'
        const objectName = "Customer_Quote__c";
        const tabName = "Customer_Quote";

        let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectName=${encodeURIComponent(objectName)}&tabName=${encodeURIComponent(tabName)}`;

        if (quoteId) {
            url += `&objectId=${encodeURIComponent(quoteId)}`;
        }

        console.log(`Fetching Quotes from Salesforce with URL:`, url);

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
        //console.log(`Quotes result:`, result);

        // The API returns data in format: { data: [{ <ObjectName>__c: [...] }] }
        // Extract the data from the nested structure
        if (result.data && result.data.length > 0) {
            const dataObject = result.data[0];

            // Look for the array of quotes in the response
            // It might be under 'Quote__c', 'Quotes__c', or standard 'Quote'
            const possibleKeys = ['Quote__c', 'Quotes__c', 'Quote', 'Quotes'];

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
        console.error(`Error fetching Quotes:`, error);
        return [];
    }
}
