export type POStatus = 
    | "Draft" 
    | "Pending Approval" 
    | "Approved" 
    | "Issued" 
    | "Acknowledged" 
    | "In Production" 
    | "Partially Shipped" 
    | "Shipped" 
    | "Partially Received" 
    | "Received" 
    | "Invoiced" 
    | "Closed" 
    | "Cancelled";

export interface PurchaseOrder {
    id: string;
    name: string;
    status: POStatus | string;
    customerQuoteName?: string;
    customerOrderName?: string;
    customerPO?: string;
    supplierName: string;
    supplierDBA?: string;
    supplierContact?: string;
    billToAccountName?: string;
    shipToAccountName?: string;
    shipToLocationName?: string;
    shipToContactName?: string;
    dropShip: boolean;
    totalLines: number;
    productCost: number;
    shippingCost: number;
    totalCost: number;
    issuedDate?: string;
    acknowledgedDate?: string;
    requestDate?: string;
    promiseDate?: string;
    shippingMethod?: string;
    logisticsPartner?: string;
    logisticsContact?: string;
    serviceLevel?: string;
    trackingUrl?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    trackingStatus?: string;
    actualDeliveryDate?: string;
    goodsReceiptsDate?: string;
    poNotes?: string;
    proposalName?: string;
    proposalNumber?: string;
    billingAddress?: any;
    shippingAddress?: any;
    paymentTerms?: string;
    siteName?: string;
    buyerName?: string;
    allowSplitShipment: boolean;
    // Salesforce IDs
    proposalId?: string;
    customerOrderId?: string;
    customerQuoteId?: string;
    accountId?: string;
    contactId?: string;
}

export interface POStats {
    totalCount: number;
    issuedCount: number;
    acknowledgedCount: number;
    totalValue: number;
}

export interface PurchaseOrderLine {
    id: string;
    name: string;
    status: string;
    purchaseOrderName: string;
    purchaseOrder: string;
    productName: string;
    productDescription: string;
    productFamily: string;
    productRecordType: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    totalProductCost: number;
    shippingCharges: number;
    totalCost: number;
    totalOrderQty: number;
    orderQty: number;
    openBalanceQty: number;
    moq: number;
    leadTimeWks: number;
    transitLTDays: number;
    qtyShipped?: number;
    promiseDate: string;
    shipByDate: string;
    needByDate: string;
    goodsReceiptDate: string;
    actualDeliveryDate: string;
    estimatedDeliveryDate: string;
    trackingNumber: string;
    trackingStatus: string;
    invoiceStatus: string;
    poLineNotes: string;
    customerQuoteLineName: string;
    customerQuoteLine: string;
    customerQuoteId?: string;
    customerOrderId?: string;
    customerOrderName?: string;
    customerPO?: string;
    shipmentId?: string;
    shipmentName?: string;
    images?: string[];
}
