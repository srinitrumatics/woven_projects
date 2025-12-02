// app/orders/types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  productFamily: string;
  brand: string;
  sku: string;
  availableQty: number;
  moq: number;
  listPrice: number;
  unitPrice: number;
  orderQty: number;
  subtotal: number;
  orderLineId?: string; // Salesforce order line ID for updates
  lineItemKey?: string; // Unique identifier for each line item in the order
}

export interface Order {
  id: string;
  status: string;
  proposal: string;
  cpo: string;
  billTo: string;
  shipTo: string;
  items: number;
  total: number;
}

export interface OrderStats {
  totalOrders: number;
  totalOrdersChange: number;
  orderItems: number;
  orderItemsChange: number;
  returnsOrders: number;
  returnsOrdersChange: number;
  fulfilledOrders: number;
  fulfilledOrdersChange: number;
}

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