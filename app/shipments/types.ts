export type ShipmentStatus = "Pending" | "Picked" | "Packed" | "Shipped" | "In Transit" | "Out for Delivery" | "Delivered" | "Exception" | "Cancelled";
export type CarrierType = "FedEx" | "UPS" | "USPS" | "DHL" | "OnTrac" | "Local Courier" | "Will Call";

export interface ShippingManifest {
  id: string;
  manifestNumber: string;
  orderNumber: string;
  accountName: string;
  status: ShipmentStatus;
  carrier: CarrierType;
  trackingNumber: string;
  shipDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingAddress: string;
  totalWeight: number;
  totalValue: number;
  packageCount: number;
  lineItemCount: number;
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
