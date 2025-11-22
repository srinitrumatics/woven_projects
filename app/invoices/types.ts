export type InvoiceStatus = "Draft" | "Sent" | "Viewed" | "Partial" | "Paid" | "Overdue" | "Cancelled";
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
  productName: string;
  productSku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  notes?: string;
  processedBy?: string;
}

export interface InvoiceDetails extends Invoice {
  billingAddress: string;
  shippingAddress: string;
  paymentTerms: string;
  notes: string;
  lines: InvoiceLine[];
  payments: Payment[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCost: number;
  grandTotal: number;
}
