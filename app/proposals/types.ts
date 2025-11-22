export type ProposalStatus = "Draft" | "Pending Review" | "Under Review" | "Approved" | "Rejected" | "Expired" | "Accepted";

export interface Proposal {
  id: string;
  proposalNumber: string;
  accountName: string;
  contactName: string;
  status: ProposalStatus;
  totalAmount: number;
  proposalDate: string;
  expirationDate: string;
  description: string;
  productCount: number;
  opportunityName?: string;
  submittedBy?: string;
}

export interface ProposalStats {
  totalProposals: number;
  pendingReview: number;
  approvedProposals: number;
  totalValue: number;
}

export interface ProposedProduct {
  id: string;
  productName: string;
  productSku: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  margin: number;
  subtotal: number;
  notes?: string;
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
