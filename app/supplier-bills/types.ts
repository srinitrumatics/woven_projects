export type SupplierBillStatus = "Draft" | "Pending" | "Approved" | "Paid" | "Overdue" | "Partially Paid" | "Cancelled";

export interface SupplierBill {
  id: string;
  name: string; // Supplier Bill Name (e.g., SB-0001)
  status: string;
  apRep: string;
  purchaseOrderName: string;
  customerQuoteName: string;
  customerOrderName: string;
  proposalName: string;
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
  billToAccount: string;
  billToLocation: string;
  billingAddress: string;
  shipToAccount: string;
  shipToLocation: string;
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
  customerQuoteLineName?: string;
  purchaseOrderLineName: string;
  productName: string;
  productDescription: string;
  manufacturerDBA: string;
  unitCost: number;
  billedQty: number;
  billAmount: number;
  shipping: number;
  totalBillAmount: number;
  goodsReceiptDate: string;
  supplierBillLineNotes?: string;
  proposedProduct?: string;
  site?: string;
  inventoryAccount?: string;
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
}

export interface AppliedDebitMemo {
  id: string;
  name: string;
  status: string;
  debitMemoName: string;
  supplierBillName: string;
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
  purchaseOrderName?: string;
  customerQuoteName?: string;
  customerOrderName?: string;
  supplierCreditMemo?: string;
  debitToAccountName?: string;
  debitToContactName?: string;
  totalLines?: number;
  totalCost?: number;
  totalShippingCharges?: number;
  totalDebitAmount?: number;
  issuedDate?: string;
  approvalDate?: string;
  availableDebitBalance?: number;
  settledDate?: string;
}
