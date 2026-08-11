export type SupplierBillStatus = "Draft" | "Pending" | "Approved" | "Paid" | "Overdue" | "Partially Paid" | "Cancelled";

export interface SupplierBill {
  id: string;
  name: string; // Supplier Bill Name (e.g., SB-0001)
  status: string;
  apRep: string;
  purchaseOrderName: string;
  purchaseOrderId?: string;
  customerQuoteName: string;
  customerQuoteId?: string;
  customerOrderName: string;
  customerOrderId?: string;
  proposalName: string;
  proposalId?: string;
  proposalNumber?: string;
  supplierName: string;
  supplierId?: string;
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
  billToAccount: string;
  billToLocation: string;
  billingAddress: string;
  shipToAccount: string;
  shipToLocation: string;
  shipToContact?: string;
  shippingAddress: string;
  site: string;
  goodsReceiptDate: string;
  productsSubtotal: number;
  servicesSubtotal: number;
  amountPaid: number;
  appliedDebits: number;
  notes: string;
  productLineCount?: number;
  serviceLineCount?: number;
}

export interface SupplierBillLine {
  id: string;
  name: string; // Supplier Bill Line Name
  status: string;
  supplierBillName: string; // Parent Supplier Bill
  supplierBillId?: string;
  customerQuoteLineName?: string;
  customerQuoteId?: string;
  customerQuoteLineId?: string;
  purchaseOrderLineName: string;
  purchaseOrderId?: string;
  purchaseOrderLineId?: string;
  productId: string;
  productName: string;
  productDescription: string;
  manufacturerDBA: string;
  brand?: string;
  productFamily?: string;
  productRecordType?: string;
  unitCost: number;
  billedQty: number;
  billAmount: number;
  shipping: number;
  totalBillAmount: number;
  goodsReceiptDate: string;
  supplierBillLineNotes?: string;
  proposedProduct?: string;
  proposedProductId?: string;
  proposalId?: string;
  site?: string;
  siteId?: string;
  inventoryAccount?: string;
  customerOrderName?: string;
  customerOrderId?: string;
  shipmentId?: string;
  shipmentName?: string;
  images?: string[];
}

export interface BillPayment {
  id: string;
  name: string;
  status: string;
  amount: number;
  paymentMethod: string;
  referenceNo: string;
  transactionDate: string;
  scheduledDate: string;
  failedDate: string;
  postedDate: string;
  supplierBillName: string;
  supplierBillId?: string;
}

export interface AppliedDebitMemo {
  id: string;
  name: string;
  status: string;
  debitMemoName: string;
  debitMemoId?: string;
  supplierBillName: string;
  supplierBillId?: string;
  appliedAmount: number;
  availableDebitBalance: number;
  appliedDate: string;
  postedDate: string;
  notes: string;
}

export interface DebitMemo {
  id: string;
  name: string;
  status: string;
  supplierBillName?: string;
  supplierBillId?: string;
  purchaseOrderName?: string;
  purchaseOrderId?: string;
  customerQuoteName?: string;
  customerQuoteId?: string;
  customerOrderName?: string;
  customerOrderId?: string;
  proposalName?: string;
  proposalNumber?: string;
  proposalId?: string;
  supplierCreditMemo?: string;
  debitToAccountName?: string;
  debitToContactName?: string;
  totalLines?: number;
  totalCost?: number;
  totalShippingCharges?: number;
  totalTaxes?: number;
  totalDebitAmount?: number;
  issuedDate?: string;
  expirationDate?: string;
  availableDebitBalance?: number;
  settledDate?: string;
}
