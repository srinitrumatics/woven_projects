import { getSalesforceSession } from "./salesforce-service";

export interface SalesforceAuthorizedLocationPayload {
    Id?: string;
    Name: string;
    Account_Name__c: string;
    Address_Type__c: string;
    Location_ID__c: string;
    Location_Type__c: string;
    Street: string;
    City: string;
    State: string;
    ZipCode: string;
    Country: string;
    Lift_Gate__c: boolean;
    Inside_Delivery__c: boolean;
    Delivery_Notes__c: string;
    Active__c: boolean;
}

export interface CreateAuthorizedLocationRequest {
    authorizedLocations: SalesforceAuthorizedLocationPayload[];
    accountId: string;
    contactId: string;
}

export async function createAuthorizedLocationInSalesforce(payload: CreateAuthorizedLocationRequest) {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/authorizedlocations`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Salesforce API error response:", errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in createAuthorizedLocationInSalesforce:", error);
        throw error;
    }
}

export async function updateAuthorizedLocationInSalesforce(payload: CreateAuthorizedLocationRequest) {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/authorizedlocations`;

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Salesforce API error response:", errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in updateAuthorizedLocationInSalesforce:", error);
        throw error;
    }
}

export async function getDeliveryWindowsFromSalesforce(accountId: string, contactId: string, locationId: string) {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/deliverywindows?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&locationId=${encodeURIComponent(locationId)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Salesforce API error response:", errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in getDeliveryWindowsFromSalesforce:", error);
        throw error;
    }
}

export interface SalesforceDeliveryWindowPayload {
    Id?: string;
    Authorized_Ship_To_Location__c: string;
    Day_of_Week__c: string;
    WindowStart__c: string;
    WindowEnd__c: string;
    Open_24_Hours__c: boolean;
    Receive_on_Federal_Holidays__c: boolean;
    Closed_for_Deliveries__c: boolean;
    Delivery_Notes__c: string;
    Active__c: boolean;
}

export interface CreateDeliveryWindowRequest {
    deliveryWindows: SalesforceDeliveryWindowPayload[];
    accountId: string;
    contactId: string;
}

export async function createDeliveryWindowInSalesforce(payload: CreateDeliveryWindowRequest) {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/deliverywindows`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Salesforce API error response (Create):", errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in createDeliveryWindowInSalesforce:", error);
        throw error;
    }
}

export async function updateDeliveryWindowInSalesforce(payload: CreateDeliveryWindowRequest) {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/deliverywindows`;

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Salesforce API error response (Update):", errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in updateDeliveryWindowInSalesforce:", error);
        throw error;
    }
}

export async function deleteDeliveryWindowFromSalesforce(accountId: string, contactId: string, deliveryWindowId: string) {
    try {
        const session = await getSalesforceSession();
        if (!session.accessToken) {
            throw new Error("No Salesforce access token available");
        }

        const url = `${session.instanceUrl}/services/apexrest/gtherp/deliverywindows?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&deliveryWindowId=${encodeURIComponent(deliveryWindowId)}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Salesforce API error response (Delete):", errorText);
            throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in deleteDeliveryWindowFromSalesforce:", error);
        throw error;
    }
}
