export type ShipmentStatus = "Draft" | "Pending" | "Inprogress" | "Approved" | "Partial Shipment" | "Picked" | "Packed" | "Shipped" | "In Transit" | "Out for Delivery" | "Delivered" | "Exception" | "Cancelled" | "Will Call";
export type CarrierType = "FedEx" | "UPS" | "USPS" | "DHL" | "OnTrac" | "Local Courier" | "Will Call";

export interface ShippingManifest {
  Id: string;
  Name: string;
  Status__c: ShipmentStatus;
  Sales_Order_Name?: string;
  Sales_Order__c?: string;
  Customer_Quote_Name?: string;
  Customer_Quote__c?: string;
  Proposal_Name?: string;
  Proposal__c?: string;
  Customer_Order_Name?: string;
  Customer_Order__c?: string;
  Customer_PO__c?: string;
  Ship_to_Account_Name?: string;
  Ship_to_Account__c?: string;
  Authorized_Ship_To_Location_Name?: string;
  Authorized_Ship_To_Location__c?: string;
  Total_Lines__c: number;
  Total_Price__c: number;
  Logistics_Partner_Name?: string;
  Logistics_Partner__c?: string;
  Ship_Date__c?: string;
  Tracking_Number__c?: string;
  Tracking_Status__c?: string;
  Delivered_Date__c?: string;
  Actual_Delivery_Date__c?: string;
}

export interface ShipmentStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  pending: number;
}

export interface ShippingManifestLine {
  id: string;
  productName: string;
  productSku: string;
  description: string;
  quantityOrdered: number;
  quantityShipped: number;
  unitPrice: number;
  subtotal: number;
  lotNumber?: string;
  expirationDate?: string;
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface ShippingManifestDetails extends ShippingManifest {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  billingAddress: string;
  shipFromAddress: string;
  specialInstructions: string;
  lines: ShippingManifestLine[];
  trackingEvents: TrackingEvent[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  shippingCost: number;
  insuranceValue: number;
  signatureRequired: boolean;
}
