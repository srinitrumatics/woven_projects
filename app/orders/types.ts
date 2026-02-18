// app/orders/types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  productFamily: string;
  productGrouping?: string;
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
  customerPO: string;
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
  Bill_to_Account_Name?: string;
  Ship_to_Account_Name?: string;
  Total_Lines__c?: number;
  Total_Price__c?: number;
  [key: string]: any; // Allow additional fields
}

export interface OrderDetail {
  Id: string;
  Name: string;
  Status__c: string;
  Total_Price__c: number;
  Grand_Total__c: number;
  Total_Taxes_Amount__c: number;
  Total_Shipping_Charges__c: number;
  Request_Date__c: string;
  Customer_PO__c?: string;
  Customer_Order_Notes__c?: string;
  Drop_Ship__c?: boolean;
  Authorized_Ship_To_Location__c?: string;
  Authorized_Bill_To_Location__c?: string;
  Ship_to_Contact__c?: string;
  Bill_to_Account_Name?: string;
  Ship_to_Account_Name?: string;
  CustomerOrderLines?: OrderItem[];
  Authorized_Ship_To_Location_Delivery_Notes?: string;
  Authorized_Ship_To_Location_Inside_Delivery?: boolean;
  Authorized_Ship_To_Location_Lift_Gate?: boolean;
  Authorized_Ship_To_Location_Name?: string;
  [key: string]: any;
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

export interface Address {
  city: string;
  country: string;
  countryCode: string;
  postalCode: string;
  state: string;
  stateCode: string;
  street: string;
}

export interface AuthorizedLocation {
  Id: string;
  Name: string;
  Account_Name__c: string;
  Account_Name__r?: { Name: string };
  Active__c: boolean;
  Lift_Gate__c: boolean;
  Inside_Delivery__c: boolean;
  Address__c: Address;
  Authorized_Ship_To_Location_Delivery_Notes?: string;
  Authorized_Ship_To_Location_Delivery_Notes__c?: string;
  Delivery_Notes__c?: string;
}

export interface ShippingMethodOption {
  label: string;
  value: string;
}

export interface LocationResponse {
  Payment_Terms__c: string;
  Assigned_Price_Book_Name?: string;
  Shipping_Method__c?: ShippingMethodOption[];
  AuthorizedLocation: AuthorizedLocation[];
}

export interface Contact {
  Id: string;
  Name: string;
  Email: string;
  Phone: string;
}

export interface OrderItem {
  Id: string;
  Name: string;
  Product_Name__c: string; // Product ID
  ProductName: string; // Product Name
  Product_Description__c?: string;
  Order_Qty__c: number;
  Unit_Price__c: number;
  Total_Price__c: number;
  MOQ__c?: number;
  Status__c?: string;
  Manufacturer_Name__c?: string;
  ProductFamily?: string;
}



export interface FileData {
  Id: string;
  Title: string;
  FileType: string;
  FileExtension: string;
  FileSize: number;
  CreatedDate: string;
  CreatedBy: string;
  ContentDocumentId?: string; // Document ID for downloading and deletion
  ContentVersionId?: string; // Version ID for preview
  DownloadUrl?: string; // Direct download URL from Salesforce
}