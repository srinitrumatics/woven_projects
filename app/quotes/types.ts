export type QuoteStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Expired" | "Converted" | "Partial Shipment" | "Shipped";

export interface QuoteCreditMemo {
  id: string;
  memoNumber: string; // 1. Name
  status: string; // 2. gtherp__Status__c
  invoice: string; // 3. gtherp__Invoice__c
  customerQuote: string; // 4. gtherp__Customer_Quote__c
  customerOrder: string; // 5. gtherp__Customer_Order__c
  creditToAccount: string; // 6. gtherp__Credit_to_Account__c
  creditToContact: string; // 7. gtherp__Credit_to_Contact__c
  totalLines: number; // 8. gtherp__Total_Lines__c
  totalPrice: number; // 9. gtherp__Total_Price__c
  shipping: number; // 10. gtherp__Total_Shipping_Charges__c
  taxes: number; // 11. gtherp__Total_Taxes_Amount__c
  totalCreditAmount: number; // 12. gtherp__Total_Credit_Amount__c
  issuedDate: string; // 13. gtherp__Issued_Date__c
  expirationDate: string; // 14. gtherp__Expiration_Date__c
  availableCreditBalance: number; // 15. gtherp__Available_Credit_Balance__c
  settledDate: string; // 16. gtherp__Settled_Date__c
}

export interface Quote {
  id: string;
  quoteNumber: string;
  accountName: string;
  contactName: string;
  status: QuoteStatus;
  totalAmount: number;
  proposalName?: string;
  customerPO?: string;
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
  Name: string;
  status: string;
  productName: string;
  description: string;
  manufacturerDBA: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  shipping: number;
  taxes: number;
  lineGrandTotal: number;
  qtyShipped: number;
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
  purchaseOrderNumber: string; // 1. Name
  status: string; // 2. gtherp__Status__c
  customerQuote: string; // 3. gtherp__Customer_Quote__c
  customerOrder: string; // 4. gtherp__Customer_Order__c
  customerPO: string; // 5. gtherp__Customer_PO__c
  supplierName: string; // 6. gtherp__Supplier_Name__c
  supplierDBA: string; // 7. gtherp__Supplier_DBA__c
  supplierContact: string; // 8. gtherp__Supplier_Contact__c
  shipToAccount: string; // 9. gtherp__Ship_to_Account__c
  shipToLocation: string; // 10. gtherp__Authorized_Ship_To_Location__c
  shipToContact: string; // 11. gtherp__Ship_to_Contact__c
  dropShip: boolean; // 12. gtherp__Drop_Ship__c
  totalLines: number; // 13. gtherp__Total_Lines__c
  productCost: number; // 14. gtherp__Total_Product_Cost__c
  shipping: number; // 15. gtherp__Total_Shipping_Charges__c
  totalCost: number; // 16. gtherp__Total_Cost__c
  issuedDate: string; // 17. gtherp__Issued_Date__c
  acknowledgedDate: string; // 18. gtherp__Acknowledged_Date__c
  requestDate: string; // 19. gtherp__Request_Date__c
  promiseDate: string; // 20. gtherp__Promise_Date__c
  shippingMethod: string; // 21. gtherp__Shipping_Method__c
  logisticsPartner: string; // 22. gtherp__Logistics_Partner__c
  logisticsContact: string; // 23. gtherp__Logistics_Contact__c
  trackingNumber: string; // 24. gtherp__Tracking_Number__c
  estimatedDeliveryDate: string; // 25. gtherp__Estimated_Delivery_Date__c
  trackingStatus: string; // 26. gtherp__Tracking_Status__c
  actualDeliveryDate: string; // 27. gtherp__Actual_Delivery_Date__c
  goodsReceiptDate: string; // 28. gtherp__Goods_Receipt_Date__c
}

export interface QuoteSupplierBill {
  id: string;
  billNumber: string; // 1. Name
  status: string; // 2. gtherp__Status__c
  purchaseOrder: string; // 3. gtherp__Purchase_Order__c
  customerQuote: string; // 4. gtherp__Customer_Quote__c
  customerOrder: string; // 5. gtherp__Customer_Order__c
  supplierName: string; // 6. gtherp__Supplier_Name__c
  supplierDBA: string; // 7. gtherp__Supplier_DBA__c
  supplierContact: string; // 8. gtherp__Supplier_Contact__c
  totalLines: number; // 9. gtherp__Total_Lines__c
  totalCost: number; // 10. gtherp__Total_Product_Amount__c
  shipping: number; // 11. gtherp__Total_Shipping_Charges__c
  totalAmount: number; // 12. gtherp__TotalAmount__c
  billedDate: string; // 13. gtherp__Billed_Date__c
  paymentTerms: string; // 14. gtherp__Payment_Terms__c
  dueDate: string; // 15. gtherp__Due_Date__c
  remittanceStatus: string; // 16. gtherp__Remittance_Status__c
  openBalance: number; // 17. gtherp__Open_Balance__c
  daysOutstanding: number; // 18. gtherp__Days_Outstanding__c
  settledDate: string; // 19. gtherp__Settled_Date__c
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
  rtvNumber: string; // 1. Name
  status: string; // 2. gtherp__Status__c
  purchaseOrder: string; // 3. gtherp__Purchase_Order__c
  customerQuote: string; // 4. gtherp__Customer_Quote__c
  customerOrder: string; // 5. gtherp__Customer_Order__c
  rtvType: string; // 6. gtherp__RTV_Type__c
  rmaNumber: string; // 7. gtherp__Supplier_RMA_Number__c
  shipFromAccount: string; // 8. gtherp__Ship_from_Account__c
  shipFromContact: string; // 9. gtherp__Ship_from_Contact__c
  supplierName: string; // 10. gtherp__Supplier_Name__c
  supplierContact: string; // 11. gtherp__Supplier_Contact__c
  totalLines: number; // 12. gtherp__Total_Price__c (label says Total Lines)
  totalCost: number; // 13. gtherp__Total_Cost__c
  issuedDate: string; // 14. gtherp__Issued_Date__c
  approvalDate: string; // 15. gtherp__Approval_Date__c
  returnByDate: string; // 16. gtherp__Return_by_Date__c
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
  serviceTotal: number;
  serviceLinesCount: number;
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
export interface QuoteFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  sizeInBytes: number;
  uploadedDate: string;
  uploadedBy: string;
  contentDocumentId: string;
}
