export type QuoteStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Expired" | "Converted";

export interface QuoteCreditMemo {
  id: string;
  memoNumber: string;
  status: string;
  customer: string;
  date: string;
  totalAmount: number;
  relatedInvoice: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  accountName: string;
  contactName: string;
  status: QuoteStatus;
  totalAmount: number;
  proposalName?: string;
  customerOrder?: string;
  shipToAccountName?: string;
  billToAccountName?: string;
  totalLines?: number;
  requestDate?: string;
  plannedShipDate?: string;
  expirationDate?: string;
  validUntil?: string;
  issuedDate?: string;
  createdDate?: string;
  description?: string;
  opportunityName?: string;
  lineItemCount?: number;
}

export interface QuoteStats {
  totalQuotes: number;
  pendingQuotes: number;
  approvedQuotes: number;
  totalValue: number;
}

export interface QuoteLine {
  id: string;
  productName: string;
  productSku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface QuoteTax {
  id: string;
  salesTaxRate: number;
  salesTaxAmount: number;
  useTaxRate: number;
  useTaxAmount: number;
  localTaxRate: number;
  localTaxAmount: number;
  exciseTaxRate: number;
  exciseTaxAmount: number;
  grtRate: number;
  grtAmount: number;
  gstRate: number;
  gstAmount: number;
  vatRate: number;
  vatAmount: number;
}

export interface QuoteSalesOrder {
  id: string;
  salesOrderNumber: string;
  status: string;
  customerQuote: string;
  customerOrder: string;
  customerPO: string;
  billToAccount: string;
  billToLocation: string;
  billToContact: string;
  shipToAccount: string;
  shipToLocation: string;
  shipToContact: string;
  dropShip: boolean;
  totalLines: number;
  totalPrice: number;
  shipping: number;
  taxes: number;
  grandTotal: number;
  requestDate: string;
  pickDate: string;
  pickCompleteDate: string;
  plannedShipDate: string;
  shipConfirmedDate: string;
}

export interface QuoteShippingManifest {
  id: string;
  manifestNumber: string;
  status: string;
  salesOrder: string;
  customerQuote: string;
  customerOrder: string;
  customerPO: string;
  shipToAccount: string;
  shipToLocation: string;
  shipToContact: string;
  dropShip: boolean;
  boxCount: number;
  boxNetWeight: number;
  boxGrossWeight: number;
  totalLines: number;
  totalPrice: number;
  plannedShipDate: string;
  shipConfirmedDate: string;
  shippingMethod: string;
  logisticsPartner: string;
  logisticsContact: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
  trackingStatus: string;
  actualDeliveryDate: string;
}

export interface QuoteInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  salesOrder: string;
  customerQuote: string;
  customerOrder: string;
  customerPO: string;
  billToAccount: string;
  billToLocation: string;
  billToContact: string;
  totalLines: number;
  totalPrice: number;
  shipping: number;
  taxes: number;
  grandTotal: number;
  issuedDate: string;
  paymentTerms: string;
  dueDate: string;
  collectionStatus: string;
  openBalance: number;
  daysOutstanding: number;
  settledDate: string;
}

export interface QuotePurchase {
  id: string;
  purchaseOrderNumber: string;
  status: string;
  vendor: string;
  date: string;
  totalAmount: number;
  expectedDeliveryDate: string;
}

export interface QuoteSupplierBill {
  id: string;
  billNumber: string;
  status: string;
  vendor: string;
  purchaseOrder: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
}

export interface QuoteRMA {
  id: string;
  rmaNumber: string;
  status: string;
  salesOrder: string;
  customerQuote: string;
  customerOrder: string;
  rmaType: string;
  shipFromAccount: string;
  shipFromContact: string;
  returnToAccount: string;
  returnToContact: string;
  dropShip: boolean;
  totalLines: number;
  totalPrice: number;
  issuedDate: string;
  returnByDate: string;
  shippingMethod: string;
  logisticsPartner: string;
  logisticsContact: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
  trackingStatus: string;
  actualDeliveryDate: string;
  goodsReceiptsDate: string;
}


export interface QuoteRTV {
  id: string;
  rtvNumber: string;
  status: string;
  vendor: string;
  date: string;
  totalAmount: number;
  reason: string;
}

export interface QuoteDebitMemo {
  id: string;
  memoNumber: string;
  status: string;
  supplierBill: string;
  purchaseOrder: string;
  customerQuote: string;
  customerOrder: string;
  supplierCredit: string;
  debitToAccount: string;
  debitToContact: string;
  totalLines: number;
  totalCost: number;
  shipping: number;
  totalDebitAmount: number;
  issuedDate: string;
  approvalDate: string;
  availableBalance: number;
  settledDate: string;
}

export interface QuoteDetails extends Quote {
  billingAddress: string;
  shippingAddress: string;
  paymentTerms: string;
  notes: string;
  lines: QuoteLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCost: number;
  grandTotal: number;
  // Added for layout compatibility
  accountExecutive?: string;
  proposalType?: string;
  billToAccount?: string;
  billToLocation?: string; // mapped from billTo in Proposal
  customerPO?: string;
  priceBook?: string;
  shipToAccount?: string;
  shipToLocation?: string; // mapped from shipTo in Proposal
  dropShip?: boolean;
  site?: string;
}
