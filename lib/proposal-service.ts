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
