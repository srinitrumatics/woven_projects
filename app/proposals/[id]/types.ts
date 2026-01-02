// Type definitions for Proposals Detail Page
export type { Proposal } from "../types";



export interface ProposalElement {
    id: string;
    wbs: string;
    proposalElement: string;
    description: string;
    proposalId?: string;
}

export interface ProposalFile {
    id: string;
    contentDocumentId: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    uploadedBy: string;
    uploadedDate: string;
    category: string;
    downloadUrl?: string;
}

export interface ProposedProduct {
    id: string;
    productName: string;
    productSku: string;
    description: string;
    manufacturer: string;
    productFamily: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Project {
    id: string;
    name: string;
    projectNumber: string;
    status: string;
    customerAccountName: string;
    customerContactName: string;
    billingType: string;
    projectManagerName: string;
    estimatedBudget: number;
    totalMilestones: number;
    totalTasks: number;
    percentCompleted: number | null;
    estimatedStartDate: string;
    estimatedEndDate: string;
}

export interface Order {
    id: string;
    name: string;
    status: string;
    customerPO: string;
    customerPODate: string;
    billToAccountName: string;
    billToLocationName: string;
    billToContactName: string;
    shipToAccountName: string;
    shipToLocationName: string;
    shipToContactName: string;
    dropShip: boolean;
    totalLines: number;
    totalPrice: number;
    totalShippingCharges: number;
    totalTaxesAmount: number;
    grandTotal: number;
    requestDate: string;
    shipDate: string;
    deliveredDate: string;
}

export interface Invoice {
    id: string;
    name: string;
    status: string;
    customerQuoteName: string;
    salesOrderName: string;
    customerOrderName: string;
    customerPO: string;
    billToAccountName: string;
    billToLocationName: string;
    billToContactName: string;
    totalLines: number;
    totalPrice: number;
    totalShippingCharges: number;
    totalTaxesAmount: number;
    grandTotal: number;
    issuedDate: string;
    dueDate: string;
    paymentTerms: string;
    collectionStatus: string;
    openBalance: number;
    daysOutstanding: number;
    settledDate: string;
}

export interface ShippingManifest {
    id: string;
    name: string;
    status: string;
    customerQuoteName: string;
    salesOrderName: string;
    customerOrderName: string;
    customerPO: string;
    shipToAccountName: string;
    shipToLocationName: string;
    shipToContactName: string;
    dropShip: boolean;
    totalLines: number;
    totalPrice: number;
    shippingMethod: string;
    shipDate: string;
    deliveredDate: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate: string;
    trackingNumber: string;
    trackingStatus: string;
    logisticsPartnerName: string;
    logisticsContactName: string;
}

export interface SalesOrder {
    id: string;
    name: string;
    status: string;
    customerQuoteName: string;
    customerOrderName: string;
    customerPO: string;
    billToAccountName: string;
    billToLocationName: string;
    billToContactName: string;
    shipToAccountName: string;
    shipToLocationName: string;
    shipToContactName: string;
    dropShip: boolean;
    totalLines: number;
    totalPrice: number;
    totalShippingCharges: number;
    totalTaxesAmount: number;
    grandTotal: number;
    requestDate: string;
    pickDate: string;
    pickCompleteDate: string;
    shipDate: string;
    deliveredDate: string;
}

export interface CustomerQuote {
    id: string;
    name: string;
    status: string;
    customerOrderName: string;
    customerPO: string;
    billToAccountName: string;
    billToLocationName: string;
    billToContactName: string;
    shipToAccountName: string;
    shipToLocationName: string;
    shipToContactName: string;
    dropShip: boolean;
    totalLines: number;
    totalPrice: number;
    totalShippingCharges: number;
    totalTaxesAmount: number;
    grandTotal: number;
    issuedDate: string;
    expirationDate: string;
    requestDate: string;
    shipDate: string;
    deliveredDate: string;
}

export interface Purchase {
    id: string;
    name: string;
    status: string;
    vendorName: string;
    vendorPO: string;
    orderDate: string;
    expectedDate: string;
    totalAmount: number;
}

export interface SupplierBill {
    id: string;
    name: string;
    status: string;
    supplierBillName: string;
    billAmount: number;
    totalBillAmount: number;
    billedQty: number;
    unitCost: number;
    manufacturerDBA: string;
    productName: string;
    purchaseOrderLineName: string;
}

export interface PurchasesData {
    purchaseOrders: Purchase[];
    supplierBills: SupplierBill[];
}

// Basic Return interface for table display
export interface Return {
    id: string;
    name: string;
    status: string;
    description: string;
    requestDate: string;
    type: string;
    reason: string;
    totalAmount: number;
}

export interface DebitMemo extends Return {
    debitToAccountName: string;
}

export interface RTV extends Return {
    supplierName: string;
    rtvType: string;
}

export interface CreditMemo extends Return {
    creditToAccountName: string;
    invoiceName: string;
}

export interface RMA extends Return {
    shipFromAccountName: string;
}


export interface ReturnsData {
    rma: RMA[];
    rtv: RTV[];
    creditMemos: CreditMemo[];
    debitMemos: DebitMemo[];
}

export type ReturnsTabType = "rma" | "rtv" | "credit" | "debit";

export interface FulfillmentData {
    invoices: Invoice[];
    shippingManifests: ShippingManifest[];
    salesOrders: SalesOrder[];
    customerQuotes: CustomerQuote[];
}

export type FulfillmentTabType = "invoices" | "shipping" | "sales" | "quotes";
export type ProposalTabType = "products" | "elements" | "files" | "signatures" | "projects" | "orders" | "fulfillments" | "purchases" | "returns";
export type SortDirection = "asc" | "desc";
