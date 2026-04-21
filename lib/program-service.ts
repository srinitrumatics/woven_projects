import { getSalesforceSession, fetchWithLogging } from './salesforce-service';

/**
 * Fetch dashboard insights for Program 360 from Salesforce
 */
export async function getProgramInsights(accountId: string, contactId: string): Promise<any> {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            console.error('[ProgramService] No Salesforce access token available');
            return null;
        }

        const baseUrl = `${session.instanceUrl}/services/apexrest/gtherp/programInsights`;
        const url = `${baseUrl}?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`;

        console.log('[ProgramService] Fetching program insights with URL:', url);

        const response = await fetchWithLogging(url, {
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
        return resultdata;
    } catch (error) {
        console.error('[ProgramService] Error fetching program insights from Salesforce:', error);
        return null;
    }
}
