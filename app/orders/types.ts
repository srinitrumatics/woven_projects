// app/orders/types.ts

export interface SalesforceOrder {
  Id: string;
  Name: string;
  Status__c?: string;
  Bill_To_Contact_Name?: string;
  Ship_To_Contact_Name?: string;
  Total_Lines__c?: number;
  Total_Price__c?: number;
  [key: string]: any; // Allow additional fields
}

export interface UIOrder {
  id: string;
  name: string;
  status: string;
  billTo: string;
  shipTo: string;
  items: number;
  total: number;
}

export type OrderStatus = 'Success' | 'Pending' | 'Draft' | 'Cancelled' | string;