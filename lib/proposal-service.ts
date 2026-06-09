import { getSalesforceSession } from './salesforce-service';

export async function getFilesFromSalesforce(accountId: string, contactId: string, objectId: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();

    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    // Construct URL with query parameters
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/files`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(objectId)}&objectName=Proposal__c`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    //console.log('Fetching files from Salesforce with response:', response);
    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const resultdata = await response.json();

    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching files from Salesforce:', error);
    return [];
  }
}

/**
 * Generic function to fetch data from Salesforce generic tab API
 * @param accountId - Salesforce account ID
 * @param contactId - Salesforce contact ID
 * @param proposalId - Proposal ID (used as objectId)
 * @param tabName - Name of the tab (Projects, Orders, Fulfillments, etc.)
 * @returns Array of records from the specified tab
 */
export async function getGenericTabDataFromSalesforce(
  accountId: string,
  contactId: string,
  proposalId: string,
  tabName: string,
  objectName?: string
): Promise<any[]> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }
    const targetObjectName = objectName || "Proposal__c";
    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/generic/tab`;

    let url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectName=${encodeURIComponent(targetObjectName)}&tabName=${encodeURIComponent(tabName)}`;

    if (proposalId) {
      url += `&objectId=${encodeURIComponent(proposalId)}`;
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

    // The API returns data in format: { data: [{ <ObjectName>__c: [...] }] }
    // Extract the data from the nested structure
    if (result.data && result.data.length > 0) {
      const dataObject = result.data[0];

      // For certain tabs, return the entire object with all types
      if (tabName === 'Fulfillment' || tabName === 'Purchases' || tabName === 'Returns' || tabName === 'Proposal') {
        return dataObject;
      }

      // For other tabs (Projects, Orders), find the first key that ends with __c
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


