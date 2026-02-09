export type ProposalStatus = "Draft" | "Pending Review" | "Under Review" | "Approved" | "Rejected" | "Expired" | "Accepted" | "Lead" | "Quote Requested" | "Quote Ready" | "Proposal Sent" | "Negotiation" | "Awarded";

export interface Proposal {
  id: string;
  proposalNumber: string;
  proposalName: string;
  accountName: string;
  contactName: string;
  status: ProposalStatus;
  totalAmount: number;
  totalShippingCharges: number;
  totalTaxesAmount: number;
  proposalDate: string;
  expirationDate: string;
  description: string;
  productCount: number;
  billTo: string;
  billToAccount?: string;
  shipTo: string;
  shipToAccount?: string;
  opportunityName?: string;
  submittedBy?: string;
  accountExecutive?: string;
  issuedDate?: string;
  orderNumber?: string;
  billingAddress?: string;
  paymentTerms?: string;
  customerPO?: string;
  shippingAddress?: string;
  requestedDeliveryDate?: string;
  dropShip?: boolean;
  specialTerms?: string;
  internalNotes?: string;
  clientSignedBy?: string;
  clientSignedTitle?: string;
  clientSignedDate?: string;
  companySignedBy?: string;
  companySignedTitle?: string;
  companySignedDate?: string;
  // Salesforce IDs for API calls
  accountId?: string;
  contactId?: string;
  orderId?: string;
  proposalType?: string;
  priceBook?: string;
  site?: string;
}

export interface ProposalStats {
  totalProposals: number;
  pendingReview: number;
  approvedProposals: number;
  totalValue: number;
}

export interface ProposedProduct {
  id: string;
  Name: string;
  productName: string;
  productSku: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  margin: number;
  subtotal: number;
  shipping: number;
  taxes: number;
  grandTotal: number;
  notes?: string;
  product_record_type?: string;
}

export interface ProposalDetails extends Proposal {
  billingAddress: string;
  shippingAddress: string;
  deliveryTerms: string;
  paymentTerms: string;
  validityPeriod: string;
  specialTerms: string;
  internalNotes: string;
  proposedProducts: ProposedProduct[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCost: number;
  grandTotal: number;
}
