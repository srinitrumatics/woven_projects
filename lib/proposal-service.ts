import { getSalesforceSession } from './salesforce-service';

export async function getProposalsFromSalesforce(accountId: string, contactId: string, proposalId?: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    let url = `${session.instanceUrl}/services/apexrest/gtherp/proposals?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`;

    if (proposalId) {
      url += `&proposalId=${encodeURIComponent(proposalId)}`;
    }

    console.log('Fetching proposals from Salesforce with URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Proposals result:', result);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }
}
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

    console.log('Fetching files from Salesforce with URL:', url);

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
    console.log('Files resultdata:', resultdata);

    return resultdata.data || [];
  } catch (error) {
    console.error('Error fetching files from Salesforce:', error);
    return [];
  }
}

export async function getProposalElementsFromSalesforce(accountId: string, contactId: string, proposalId: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/proposal/elements`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&proposalId=${encodeURIComponent(proposalId)}`;

    console.log('Fetching proposal elements from Salesforce with URL:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log('Fetching proposal elements from Salesforce with response:', response);
    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Proposal elements result:', result);

    return result.data || [];

  } catch (error) {
    console.error('Error fetching proposal elements:', error);
    return [];
  }
}

export async function getProposedProductsFromSalesforce(accountId: string, contactId: string, proposalId: string): Promise<any[]> {
  try {
    const session = await getSalesforceSession();
    if (!session.accessToken) {
      console.error('No Salesforce access token available');
      return [];
    }

    const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/proposal/products`;
    const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&proposalId=${encodeURIComponent(proposalId)}`;


    console.log('Fetching proposed products from Salesforce with URL:', url);

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
    console.log('Proposed products result:', result);

    return result.data || [];

  } catch (error) {
    console.error('Error fetching proposed products:', error);
    return [];
  }
}


