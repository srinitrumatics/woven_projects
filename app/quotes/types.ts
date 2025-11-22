export type QuoteStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Expired" | "Converted";

export interface Quote {
  id: string;
  quoteNumber: string;
  accountName: string;
  contactName: string;
  status: QuoteStatus;
  totalAmount: number;
  validUntil: string;
  createdDate: string;
  description: string;
  lineItemCount: number;
  opportunityName?: string;
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
}
