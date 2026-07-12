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
    sizeInBytes: number; // Added for sorting
    uploadedBy: string;
    uploadedDate: string;
    category: string;
    downloadUrl?: string;
}

export interface ProposedProduct {
    id: string;
    Name: string;
    productName: string;
    productId: string;
    productSku: string;
    description: string;
    manufacturer: string;
    manufacturerDBA: string;
    productFamily: string;
    grouping: string;
    category?: string; // Syncing with main types
    quantity: number;
    unitPrice: number;
    margin: number; // Added for financial calculations
    subtotal: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
    product_record_type?: string;
    status?: string;
    brandName?: string;
    qtyShipped?: number;
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
    purchaseOrderId?: string;
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
    proposalRequested?: boolean;
    transferOrder?: boolean;
}

export interface Invoice {
    id: string;
    name: string; // This is the Invoice Line Name
    status: string;
    invoiceName: string; // The parent Invoice Name
    salesOrderName: string;
    customerQuoteName: string;
    salesOrderLineName: string;
    customerQuoteLineName: string;
    customerOrderName?: string;
    purchaseOrderLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    invoiceQty: number;
    totalOrderQty?: number; // gtherp__Total_Order_Qty__c — distinct from invoiceQty
    totalPrice: number; // Invoiced Amount
    shipping: number;
    taxes: number;
    lineGrandTotal: number;
    // Related IDs
    invoiceId?: string;
    salesOrderId?: string;
    salesOrderLineId?: string;
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    customerOrderId?: string;
    purchaseOrderId?: string;
    purchaseOrderLineId?: string;
    purchaseOrderName?: string;
    proposalId?: string;
    proposalName?: string;
    // Keeping old fields just in case, but they might not be used in the new table view
    customerPO?: string;
    billToAccountName?: string;
    billToLocationName?: string;
    billToContactName?: string;
    totalLines?: number;
    totalShippingCharges?: number;
    totalTaxesAmount?: number;
    grandTotal?: number;
    issuedDate?: string;
    dueDate?: string;
    paymentTerms?: string;
    collectionStatus?: string;
    openBalance?: number;
    daysOutstanding?: number;
    settledDate?: string;
}

export interface ShippingManifest {
    id: string;
    name: string; // Shipping Manifest Line Name
    status: string;
    shippingManifestName: string; // Parent Manifest
    salesOrderLineName: string;
    customerQuoteLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    boxCount: number;
    boxNetWeight: number;
    boxGrossWeight: number;
    boxLength?: number;
    boxWidth?: number;
    boxHeight?: number;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    trackingStatus: string;
    actualDeliveryDate: string;
    // Keeping old fields as optional/legacy
    customerQuoteName?: string;
    salesOrderName?: string;
    customerOrderName?: string;
    customerPO?: string;
    shipToAccountName?: string;
    shipToLocationName?: string;
    shipToContactName?: string;
    dropShip?: boolean;
    totalLines?: number;
    shippingMethod?: string;
    shipDate?: string;
    deliveredDate?: string;
    logisticsPartnerName?: string;
    logisticsContactName?: string;
    requestDate?: string;
    // Related IDs
    shippingManifestId?: string;
    salesOrderId?: string;
    salesOrderLineId?: string;
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    customerOrderId?: string;
    purchaseOrderId?: string;
    proposalId?: string;
    proposalName?: string;
}

export interface SalesOrder {
    id: string;
    name: string; // Sales Order Line Name
    status: string;
    salesOrderName: string; // Parent Sales Order
    customerQuoteLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    lineGrandTotal: number;
    qtyPicked: number;
    backOrderQty: number;
    qtyShipped: number;
    // Keeping old fields as optional/legacy
    customerQuoteName?: string;
    customerOrderName?: string;
    customerPO?: string;
    billToAccountName?: string;
    billToLocationName?: string;
    billToContactName?: string;
    shipToAccountName?: string;
    shipToLocationName?: string;
    shipToContactName?: string;
    dropShip?: boolean;
    totalLines?: number;
    totalShippingCharges?: number;
    totalTaxesAmount?: number;
    grandTotal?: number;
    requestDate?: string;
    pickDate?: string;
    pickCompleteDate?: string;
    shipDate?: string;
    deliveredDate?: string;
    // Related IDs
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    customerOrderId?: string;
    purchaseOrderId?: string;
    salesOrderId?: string;
    proposalId?: string;
    proposalName?: string;
}

export interface CustomerQuote {
    id: string;
    name: string; // Customer Quote Line Name
    status: string;
    customerQuoteName: string; // Parent Customer Quote
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    lineGrandTotal: number;
    qtyShipped: number;
    // Keeping old fields as optional/legacy
    customerOrderName?: string;
    customerPO?: string;
    billToAccountName?: string;
    billToLocationName?: string;
    billToContactName?: string;
    shipToAccountName?: string;
    shipToLocationName?: string;
    shipToContactName?: string;
    dropShip?: boolean;
    totalLines?: number;
    totalShippingCharges?: number;
    totalTaxesAmount?: number;
    grandTotal?: number;
    issuedDate?: string;
    expirationDate?: string;
    requestDate?: string;
    shipDate?: string;
    deliveredDate?: string;
    // Related IDs
    customerOrderId?: string;
    purchaseOrderId?: string;
    customerQuoteId?: string;
    proposalId?: string;
    proposalName?: string;
}

export interface PurchaseOrder {
    id: string;
    name: string; // Purchase Order Name
    status: string;
    customerQuoteName: string;
    customerOrderName: string;
    salesOrderName?: string;
    shipmentName?: string;
    customerPO: string;
    supplierName: string;
    supplierDBA: string;
    supplierContact: string;
    shipToAccountName: string;
    shipToLocationName: string;
    shipToContactName: string;
    dropShip: boolean;
    totalLines: number;
    productCost: number;
    shippingCost: number;
    totalCost: number;
    issuedDate: string;
    acknowledgedDate: string;
    requestDate: string;
    promiseDate: string;
    shippingMethod: string;
    logisticsPartner: string;
    logisticsContact: string;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    trackingStatus: string;
    actualDeliveryDate: string;
    goodsReceiptsDate: string;
    // Related IDs
    customerQuoteId?: string;
    customerOrderId?: string;
    purchaseOrderId?: string; // This is the ID for the Customer PO link
    salesOrderId?: string;
    shipmentId?: string;
}

export interface PurchaseOrderLine {
    id: string;
    name: string; // Purchase Order Line Name
    status: string;
    purchaseOrderName: string; // Parent Purchase Order
    customerQuoteLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    totalOrderQty: number;
    totalCost: number; // Total Product Cost
    shipping: number;
    lineTotalCost: number; // Total Cost (with shipping etc)
    openBalanceQty: number;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    trackingStatus: string;
    actualDeliveryDate: string;
    goodsReceiptDate: string;
    invoiceStatus: string;
    // Keeping old fields as optional/legacy
    customerQuoteName?: string;
    customerOrderName?: string;
    customerPO?: string;
    supplierName?: string;
    supplierDBA?: string;
    supplierContact?: string;
    shipToAccountName?: string;
    shipToLocationName?: string;
    shipToContactName?: string;
    dropShip?: boolean;
    totalLines?: number;
    productCost?: number;
    shippingCost?: number;
    issuedDate?: string;
    acknowledgedDate?: string;
    requestDate?: string;
    promiseDate?: string;
    shippingMethod?: string;
    logisticsContact?: string;
    goodsReceiptsDate?: string;
    // Related IDs
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    customerOrderId?: string;
    purchaseOrderId?: string;
    salesOrderId?: string;
}

export interface SupplierBill {
    id: string;
    name: string; // Supplier Bill Name
    status: string;
    purchaseOrderName: string;
    customerQuoteName: string;
    customerOrderName: string;
    salesOrderName?: string;
    shipmentName?: string;
    supplierName: string;
    supplierDBA: string;
    supplierContact: string;
    totalLines: number;
    totalProductAmount: number;
    totalShippingCharges: number;
    totalAmount: number;
    billedDate: string;
    paymentTerms: string;
    dueDate: string;
    remittanceStatus: string;
    openBalance: number;
    daysOutstanding: number;
    settledDate: string;
    // Related IDs
    purchaseOrderId?: string;
    customerQuoteId?: string;
    customerOrderId?: string;
    salesOrderId?: string;
    shipmentId?: string;
}

export interface SupplierBillLine {
    id: string;
    name: string; // Supplier Bill Line Name
    status: string;
    supplierBillName: string; // Parent Supplier Bill
    purchaseOrderLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    billedQty: number;
    billAmount: number;
    shipping: number;
    totalBillAmount: number;
    goodsReceiptDate: string;
    // Keeping old fields as optional/legacy
    purchaseOrderName?: string;
    customerQuoteName?: string;
    customerOrderName?: string;
    supplierName?: string;
    supplierDBA?: string;
    supplierContact?: string;
    totalLines?: number;
    totalProductAmount?: number;
    totalShippingCharges?: number;
    totalAmount?: number;
    billedDate?: string;
    paymentTerms?: string;
    dueDate?: string;
    remittanceStatus?: string;
    openBalance?: number;
    daysOutstanding?: number;
    holdStatus?: string;
    settledDate?: string;
    // Related IDs
    purchaseOrderId?: string;
    purchaseOrderLineId?: string;
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    customerOrderId?: string;
    supplierBillId?: string;
    salesOrderId?: string;
    shipmentId?: string;
}

export interface PurchasesData {
    purchaseOrders: PurchaseOrderLine[];
    supplierBills: SupplierBillLine[];
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
    debitMemoName: string; // Parent Debit Memo
    supplierBillLineName: string;
    purchaseOrderLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    debitQty: number;
    totalCost: number;
    shipping: number;
    lineGrandTotal: number;
    // Keeping old fields as optional/legacy
    supplierBillName?: string;
    purchaseOrderName?: string;
    customerOrderName?: string;
    supplierCreditMemoName?: string;
    debitToAccountName?: string;
    debitToContactName?: string;
    totalLines?: number;
    totalShippingCharges?: number;
    totalDebitAmount?: number;
    issuedDate?: string;
    approvalDate?: string;
    availableDebitBalance?: number;
    settledDate?: string;
    // Related IDs
    customerOrderId?: string;
    purchaseOrderId?: string;
    supplierBillId?: string;
    salesOrderId?: string;
    customerQuoteId?: string;
    shipmentId?: string;
    customerQuoteName?: string;
    salesOrderName?: string;
    shipmentName?: string;
}

export interface CreditMemo extends Return {
    creditMemoName: string; // Parent Credit Memo
    invoiceLineName: string;
    invoiceLineId?: string;
    salesOrderLineName: string;
    salesOrderLineId?: string;
    customerQuoteLineName?: string;
    customerQuoteLineId?: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    creditQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    lineGrandTotal: number;
    // Keeping old fields as optional/legacy
    invoiceName?: string;
    customerQuoteName?: string;
    customerOrderName?: string;
    creditToAccountName?: string;
    creditToContactName?: string;
    totalLines?: number;
    totalShippingCharges?: number;
    totalTaxesAmount?: number;
    totalCreditAmount?: number;
    issuedDate?: string;
    expirationDate?: string;
    availableCreditBalance?: number;
    settledDate?: string;
    // Related IDs
    invoiceId?: string;
    customerQuoteId?: string;
    customerOrderId?: string;
    salesOrderId?: string;
    purchaseOrderId?: string;
    shipmentId?: string;
    salesOrderName?: string;
    purchaseOrderName?: string;
    supplierBillName?: string;
    supplierBillId?: string;
    shipmentName?: string;
    proposalId?: string;
    proposalName?: string;
}

export interface RMA extends Return {
    rmaName: string; // Parent RMA
    salesOrderLineName: string;
    customerQuoteLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    returnQty: number;
    openBalanceQty: number;
    trackingNumber: string; // Already in Return but explicit here for clarity if needed or removed from Return? Inherited is fine.
    estimatedDeliveryDate: string;
    trackingStatus: string;
    actualDeliveryDate: string;
    goodsReceiptDate: string;
    // Keeping old fields as optional/legacy
    salesOrderName?: string;
    customerQuoteName?: string;
    customerOrderName?: string;
    rmaType?: string;
    shipFromAccountName?: string;
    shipFromContactName?: string;
    returnToAccountName?: string;
    returnToContactName?: string;
    dropShip?: boolean;
    totalLines?: number;
    totalPrice?: number;
    issuedDate?: string;
    returnByDate?: string;
    shippingMethod?: string;
    logisticsPartner?: string;
    logisticsContact?: string;
    // Related IDs
    salesOrderId?: string;
    salesOrderLineId?: string;
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    customerOrderId?: string;
    purchaseOrderId?: string;
    shipmentId?: string;
    customerPO?: string;
    supplierBillName?: string;
    supplierBillId?: string;
    shipmentName?: string;
    proposalId?: string;
    proposalName?: string;
}

export interface RTV extends Return {
    rtvName: string; // Parent RTV
    purchaseOrderLineName: string;
    customerQuoteLineName: string;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    returnQty: number;
    totalCost: number;
    // Keeping old fields as optional/legacy
    purchaseOrderName?: string;
    customerQuoteName?: string;
    customerOrderName?: string;
    rtvType?: string;
    rmaNumber?: string;
    shipFromAccountName?: string;
    shipFromContactName?: string;
    supplierName?: string;
    supplierContact?: string;
    totalLines?: number;
    issuedDate?: string;
    approvalDate?: string;
    returnByDate?: string;
    // Related IDs
    purchaseOrderId?: string;
    customerQuoteId?: string;
    customerOrderId?: string;
    salesOrderId?: string;
    shipmentId?: string;
    salesOrderName?: string;
    supplierBillName?: string;
    supplierBillId?: string;
    shipmentName?: string;
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
export interface TaxDetail {
    id: string;
    salesTaxRate: number;
    salesTaxAmount: number;
    useTaxRate: number;
    useTaxAmount: number;
    localTaxRate: number;
    localTaxAmount: number;
    exciseTaxRate: number;
    exciseTaxAmount: number;
    grossReceiptsTaxRate: number;
    grossReceiptsTaxAmount: number;
    gstRate: number;
    gstAmount: number;
    vatRate: number;
    vatAmount: number;
}

export type ProposalTabType = "products" | "elements" | "files" | "signatures" | "projects" | "orders" | "fulfillment" | "purchases" | "returns" | "taxes";
export type SortDirection = "asc" | "desc";
