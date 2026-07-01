export type InvoiceStatus = "Draft" | "Sent" | "Viewed" | "Partial" | "Paid" | "Approved" | "Overdue" | "Cancelled" | "Shipped" | "Settled";
export type PaymentStatus = "Pending" | "Processing" | "Completed" | "Failed" | "Refunded";
export type PaymentMethod = "Credit Card" | "ACH" | "Wire Transfer" | "Check" | "Cash";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  accountName: string;
  contactName: string;
  status: InvoiceStatus;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  invoiceDate: string;
  dueDate: string;
  description: string;
  lineItemCount: number;
  relatedOrderNumber?: string;
  salesOrderNumber?: string;
  purchaseOrderNumber?: string;
  proposalName?: string;
  customerOrder?: string;
  customerPO?: string;
  paymentTerms?: string;
  collectionStatus?: string;
  salesOrderId?: string;
  purchaseOrderId?: string;
  proposalId?: string;
  customerOrderId?: string;
  accountId?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
}

export interface InvoiceLine {
  id: string;
  invoiceLineName: string; // The "Name" field INLI-...
  status: InvoiceStatus;
  productName: string;
  productSku: string;
  description: string;
  manufacturerDBA: string;
  brand?: string;
  quantity: number; // Total_Order_Qty__c
  unitPrice: number;
  discount: number;
  taxAmount: number; // Total_Taxes_Amount__c or existing
  totalTaxesAmount: number;
  shippingCharges: number;
  subtotal: number; // Total_Price__c
  total: number; // Line_Grand_Total__c
  lineGrandTotal: number;
  salesOrderLineId?: string;
  salesOrderId?: string;
  customerQuoteLineId?: string;
  customerQuoteId?: string;
}

export interface ReceivePayment {
  id: string;
  name: string; // Receive Payment Name (RPAY-...)
  status: string; // Status__c
  amount: number; // Amount__c
  paymentMethod: string; // Payment_Method__c
  referenceNo: string; // Reference_No__c
  transactionDate: string; // Transaction_Date__c
  scheduledDate: string; // Scheduled_Date__c
  failedDate: string; // Failed_Date__c
  postedDate: string; // Posted_Date__c
  customerQuoteName?: string;
  customerQuoteId?: string;
  customerOrderName?: string;
  customerOrderId?: string;
  invoiceName?: string;
  invoiceId?: string;
  proposalName?: string;
  proposalId?: string;
}

export interface CreditMemo {
  id: string;
  name: string; // Credit Memo (Name)
  status: string; // Status__c
  invoiceName: string; // Invoice_Name
  invoiceId?: string;
  customerQuoteName: string; // Customer_Quote_Name
  customerQuoteId?: string;
  customerOrderName: string; // Customer_Order_Name
  customerOrderId?: string;
  creditToAccountName: string; // Credit_to_Account_Name
  creditToContactName: string; // Credit_to_Contact_Name
  totalLines: number; // Total_Lines__c
  totalPrice: number; // Total_Price__c
  shipping: number; // Total_Shipping_Charges__c
  taxes: number; // Total_Taxes_Amount__c
  totalCreditAmount: number; // Total_Credit_Amount__c
  issuedDate: string; // Issued_Date__c
  expirationDate: string; // Expiration_Date__c
  availableCreditBalance: number; // Available_Credit_Balance__c
  settledDate: string; // Settled_Date__c
  proposalName?: string;
  proposalId?: string;
}

export interface AppliedCreditMemo {
  id: string;
  name: string; // Name (ACM-...)
  status: string; // Status__c
  appliedAmount: number; // Applied_Amount__c
  appliedDate: string; // Applied_Date__c
  postedDate: string; // Posted_Date__c
  creditMemoName: string; // Credit_Memo_Name
  invoiceName: string; // Invoice_Name
  availableCreditBalance: number; // Available_Credit_Balance__c
  notes: string; // Applied_Credit_Memo_Notes__c
  customerQuoteName?: string;
  customerQuoteId?: string;
  customerOrderName?: string;
  customerOrderId?: string;
  invoiceId?: string;
  proposalName?: string;
  proposalId?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  notes?: string;
  processedBy?: string;
}

export interface InvoiceFile {
  id: string; // ContentVersionId
  fileName: string; // Title
  fileType: string; // FileExtension
  sizeInBytes: number; // ContentSize
  uploadedBy: string; // CreatedBy.Name
  uploadedDate: string; // CreatedDate
  previewUrl?: string;
}

export interface InvoiceDetails extends Invoice {
  billingAddress: string;
  shippingAddress: string;
  paymentTerms: string;
  notes: string;
  lines: InvoiceLine[];
  payments: Payment[]; // This can be deprecated or used for legacy/mapped data
  receivePayments: ReceivePayment[];
  creditMemos: AppliedCreditMemo[];
  credits: CreditMemo[];
  files: InvoiceFile[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCost: number;
  grandTotal: number;
  // New fields for the revamped layout
  arRep?: string;
  billToLocation?: string;
  shipToLocation?: string;
  shipConfirmedDate?: string;
  siteName?: string;
  billToLocationId?: string;
  shipToLocationId?: string;
  siteId?: string;
  productsSubtotal?: number;
  servicesSubtotal?: number;
  appliedCredits?: number;
  // Tax Breakdown
  salesTaxRate?: number;
  salesTaxAmount?: number;
  useTaxRate?: number;
  useTaxAmount?: number;
  localTaxRate?: number;
  localTaxAmount?: number;
  exciseTaxRate?: number;
  exciseTaxAmount?: number;
  grtRate?: number;
  grtAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  // Shipment fields
  logisticsPartner?: string;
  logisticsContact?: string;
  trackingNumber?: string;
  trackingStatus?: string;
  trackingUrl?: string;
  eta?: string;
  boxCount?: number;
  dimLength?: number;
  dimWidth?: number;
  dimHeight?: number;
  netWeight?: number;
  grossWeight?: number;
  dw139?: number;
  dw166?: number;
  issuedDate?: string;
  daysOutstanding?: number;
}
