export type OrderStatus = "Pending" | "Success" | "Draft" | "Cancelled";
export type FulfillmentStatus = "Fulfilled" | "Unfulfilled" | "Partial";

export interface Order {
  id: string;
  status: OrderStatus;
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

export interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  productFamily: string;
  brand: string;
  sku: string;
  availableQty: number;
  moq: number; // Minimum Order Quantity
  listPrice: number;
  unitPrice: number;
  orderQty: number;
  subtotal: number;
}

export interface OrderDetails {
  id: string;
  customerInfo: {
    // Shipping Information
    shipTo: string;
    shippingAddress: string;
    purchaseOrder: string;
    requestedDeliveryDate: string;

    // Ship to Contact
    locationContact: string;
    contactPhone: string;
    contactEmail: string;

    // Delivery Preferences (in Order Total sidebar)
    paymentTerms: string;
    dropShip: boolean;
    liftGateRequired: boolean;
    insideDelivery: boolean;

    // Order Notes
    orderNotes: string;
  };
  products: Product[];
  orderTotal: {
    productsSubtotal: number;
    totalExciseTax: number;
    excludeExciseTax: boolean;
    grandTotal: number;
    orderProcessing: number;
    shipping: number;
    distribution: number;
    factoringDiscount: number;
  };
}
