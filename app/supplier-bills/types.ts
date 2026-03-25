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
}
