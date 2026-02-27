"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { QuoteDetails, QuoteLine, QuoteStatus, QuoteTax, QuoteFile } from "../types";
import QuoteHeader from "./components/QuoteHeader";
import QuoteDetailsSection from "./components/QuoteDetails";
import QuoteTabs, { QuoteTabType } from "./components/QuoteTabs";
import QuoteLinesTab from "./components/QuoteLinesTab";
import QuoteTaxesTab from "./components/QuoteTaxesTab";
import QuoteFulfillmentTab from "./components/QuoteFulfillmentTab";
import QuotePurchasesTab from "./components/QuotePurchasesTab";
import QuoteReturnsTab from "./components/QuoteReturnsTab";
import QuoteFilesTab from "./components/QuoteFilesTab";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/formatting";

const formatAddress = (addressConfig: any): string => {
  if (!addressConfig) return '';
  if (typeof addressConfig === 'string') return addressConfig;

  const parts = [
    addressConfig.street,
    addressConfig.city,
    addressConfig.stateCode || addressConfig.state,
    addressConfig.postalCode,
    addressConfig.countryCode || addressConfig.country
  ].filter(Boolean);

  return parts.join(', ');
};

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<QuoteTabType>("quotelines");
  const [sortField, setSortField] = useState<keyof QuoteLine>("productName");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([]);
  const [taxes, setTaxes] = useState<QuoteTax[]>([]);
  const [quoteFiles, setQuoteFiles] = useState<QuoteFile[]>([]);
  const [fulfillmentData, setFulfillmentData] = useState<any>({
    salesOrders: [],
    shippingManifests: [],
    invoices: [],
  });
  const [purchasesData, setPurchasesData] = useState<any>({
    purchases: [],
    supplierBills: [],
  });
  const [returnsData, setReturnsData] = useState<any>({
    rma: [],
    creditMemos: [],
    rtv: [],
    debitMemos: [],
  });

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

  // Interactive column resizing
  const { widths, handleResize } = useResizableColumns({
    Name: 190,
    status: 120,
    productName: 180,
    manufacturerDBA: 150,
    description: 200,
    quantity: 100,
    unitPrice: 140,
    totalPrice: 120,
    shipping: 100,
    taxes: 100,
    lineGrandTotal: 170,
    qtyShipped: 120
  });

  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/salesforce/quotes?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&quoteId=${id}&action=view`);
      if (!res.ok) throw new Error('Failed to fetch quote details');
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const mappedQuote: QuoteDetails = {
          id: item.Id,
          quoteNumber: item.Name || 'N/A',
          status: (item.Status__c || 'Draft') as QuoteStatus,
          accountName: item.Bill_to_Account_Name || 'N/A',
          contactName: item.Bill_to_Contact_Name || 'N/A',
          accountExecutive: item.Owner_Name || 'N/A',
          proposalName: item.Proposal_Name || 'N/A',
          customerOrder: item.Customer_Order_Name || 'N/A',
          issuedDate: item.Issued_Date__c || '',
          expirationDate: item.Expiration_Date__c || '',
          plannedShipDate: item.Ship_Date__c || '',
          billToAccountName: item.Bill_to_Account_Name || 'N/A',
          billToAccount: item.Bill_to_Account_Name || 'N/A',
          billToLocation: item.Authorized_Bill_To_Location_Name || 'N/A',
          billingAddress: formatAddress(item.Authorized_Bill_To_Location_Address),
          paymentTerms: item.Payment_Terms__c || 'N/A',
          customerPO: item.Customer_PO__c || 'N/A',
          priceBook: 'Standard Price Book',
          shipToAccountName: item.Ship_to_Account_Name || 'N/A',
          shipToAccount: item.Ship_to_Account_Name || 'N/A',
          shipToLocation: item.Authorized_Ship_To_Location_Name || 'N/A',
          shippingAddress: formatAddress(item.Authorized_Ship_To_Location_Address),
          requestDate: item.Request_Date__c || '',
          dropShip: item.Drop_Ship__c || false,
          site: item.Site_Name || 'N/A',
          totalAmount: item.Grand_Total__c || 0,
          totalLines: item.Total_Lines__c || 0,
          subtotal: item.Total_Price__c || 0,
          taxTotal: item.Total_Taxes_Amount__c || 0,
          discountTotal: 0,
          shippingCost: item.Total_Shipping_Charges__c || 0,
          serviceTotal: item.Total_Services_Amount__c || 0,
          serviceLinesCount: item.Total_Services_Lines__c || item.Total_Service_Lines__c || 0,
          grandTotal: item.Grand_Total__c || 0,
          notes: item.Quote_Notes__c || '',
          description: item.Quote_Notes__c || '',
          opportunityName: '',
          lines: [],
        };

        const mappedTaxes: QuoteTax = {
          id: `${item.Id}-tax`,
          salesTaxRate: item.Sales_Tax_Rate__c || 0,
          salesTaxAmount: item.Sales_Tax_Amount__c || 0,
          useTaxRate: item.Use_Tax_Rate__c || 0,
          useTaxAmount: item.Use_Tax_Amount__c || 0,
          localTaxRate: item.Local_Tax_Rate__c || 0,
          localTaxAmount: item.Local_Tax_Amount__c || 0,
          exciseTaxRate: item.Excise_Tax_Rate__c || 0,
          exciseTaxAmount: item.Excise_Tax_Amount__c || 0,
          grtRate: item.Gross_Receipts_Tax_Rate__c || 0,
          grtAmount: item.Gross_Receipts_Tax_Amount__c || 0,
          gstRate: item.GST_Rate__c || 0,
          gstAmount: item.GST_Amount__c || 0,
          vatRate: item.VAT_Rate__c || 0,
          vatAmount: item.Total_VAT_Amount__c || 0
        };

        setQuote(mappedQuote);
        setTaxes([mappedTaxes]);
      } else {
        setError('Quote not found');
      }
    } catch (err: any) {
      console.error('Error fetching quote:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  const fetchTabData = useCallback(async (tab: QuoteTabType) => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    setTabLoading(true);
    try {
      const res = await fetch(`/api/salesforce/quotes?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&quoteId=${id}&action=${tab}`);
      if (!res.ok) throw new Error(`Failed to fetch ${tab} data`);
      const json = await res.json();

      if (tab === 'quotelines') {
        const mappedLines: QuoteLine[] = (json || []).map((item: any) => ({
          id: item.Id,
          Name: item.Name || 'N/A',
          status: item.Status__c || '',
          productName: item.Product_Name || 'N/A',
          description: item.Product_Description__c || '',
          manufacturerDBA: item.Manufacturer_DBA__c || '',
          unitPrice: item.Unit_Price__c || 0,
          quantity: item.Total_Order_Qty__c || 0,
          totalPrice: item.Total_Price__c || 0,
          shipping: item.Shipping_Charges__c || 0,
          taxes: item.Total_Taxes_Amount__c || 0,
          lineGrandTotal: item.Line_Grand_Total__c || 0,
          qtyShipped: item.Qty_Shipped__c || 0
        }));
        setQuoteLines(mappedLines);
      } else if (tab === 'fulfillment') {
        setFulfillmentData({
          invoices: (json.Invoice__c || []).map((inv: any) => ({
            id: inv.Id,
            invoiceNumber: inv.Name || '',
            status: inv.Status__c || '',
            customerQuote: inv.Customer_Quote_Name || '',
            salesOrder: inv.Sales_Order_Name || '',
            customerOrder: inv.Customer_Order_Name || '',
            customerPO: inv.Customer_PO__c || '',
            billToAccount: inv.Bill_to_Account_Name || '',
            billToLocation: inv.Authorized_Bill_To_Location_Name || '',
            billToContact: inv.Bill_to_Contact_Name || '',
            totalLines: inv.Total_Lines__c || 0,
            totalPrice: inv.Total_Price__c || 0,
            shipping: inv.Total_Shipping_Charges__c || 0,
            taxes: inv.Total_Taxes_Amount__c || 0,
            grandTotal: inv.Grand_Total__c || 0,
            issuedDate: formatDate(inv.Issued_Date__c, 'numeric-dash') || '',
            paymentTerms: inv.Payment_Terms__c || '',
            dueDate: formatDate(inv.Due_Date__c, 'numeric-dash') || '',
            collectionStatus: inv.Collection_Status__c || '',
            openBalance: inv.Open_Balance__c || 0,
            daysOutstanding: inv.Days_Outstanding__c || 0,
            settledDate: formatDate(inv.Settled_Date__c, 'numeric-dash') || ''
          })),
          shippingManifests: (json.Shipping_Manifest__c || []).map((sm: any) => ({
            id: sm.Id,
            manifestNumber: sm.Name || '',
            status: sm.Status__c || '',
            salesOrder: sm.Sales_Order_Name || '',
            customerQuote: sm.Customer_Quote_Name || '',
            customerOrder: sm.Customer_Order_Name || '',
            customerPO: sm.Customer_PO__c || '',
            shipToAccount: sm.Ship_to_Account_Name || '',
            shipToLocation: sm.Authorized_Ship_To_Location_Name || '',
            shipToContact: sm.Ship_to_Contact_Name || '',
            dropShip: sm.Drop_Ship__c || false,
            boxCount: sm.Box__c || 0,
            boxNetWeight: sm.Case__Net_Weight__c || 0,
            boxGrossWeight: sm.Case__Gross_Weight__c || 0,
            totalLines: sm.Total_Lines__c || 0,
            totalPrice: sm.Total_Price__c || 0,
            plannedShipDate: formatDate(sm.Ship_Date__c, 'numeric-dash') || '',
            shipConfirmedDate: formatDate(sm.Delivered_Date__c, 'numeric-dash') || '',
            shippingMethod: sm.Shipping_Method__c || '',
            logisticsPartner: sm.Logistics_Partner_Name || '',
            logisticsContact: sm.Logistics_Contact_Name || '',
            trackingNumber: sm.Tracking_Number__c || '',
            estimatedDeliveryDate: formatDate(sm.Estimated_Delivery_Date__c, 'numeric-dash') || '',
            trackingStatus: sm.Tracking_Status__c || '',
            actualDeliveryDate: formatDate(sm.Actual_Delivery_Date__c, 'numeric-dash') || ''
          })),
          salesOrders: (json.Sales_Order__c || []).map((so: any) => ({
            id: so.Id,
            salesOrderNumber: so.Name || '',
            status: so.Status__c || '',
            customerQuote: so.Customer_Quote_Name || '',
            customerOrder: so.Customer_Order_Name || '',
            customerPO: so.Customer_PO__c || '',
            billToAccount: so.Bill_to_Account_Name || '',
            billToLocation: so.Authorized_Bill_To_Location_Name || '',
            billToContact: so.Bill_to_Contact_Name || '',
            shipToAccount: so.Ship_to_Account_Name || '',
            shipToLocation: so.Authorized_Ship_To_Location_Name || '',
            shipToContact: so.Ship_to_Contact_Name || '',
            dropShip: so.Drop_Ship__c || false,
            totalLines: so.Total_Lines__c || 0,
            totalPrice: so.Total_Price__c || 0,
            shipping: so.Total_Shipping_Charges__c || 0,
            taxes: so.Total_Taxes_Amount__c || 0,
            grandTotal: so.Grand_Total__c || 0,
            requestDate: formatDate(so.Request_Date__c, 'numeric-dash') || '',
            pickDate: formatDate(so.Pick_Date__c, 'numeric-dash') || '',
            pickCompleteDate: formatDate(so.Pick_Complete_Date__c, 'numeric-dash') || '',
            plannedShipDate: formatDate(so.Ship_Date__c, 'numeric-dash') || '',
            shipConfirmedDate: formatDate(so.Delivered_Date__c, 'numeric-dash') || ''
          }))
        });
      } else if (tab === 'purchases') {
        setPurchasesData({
          purchases: (json.Purchase_Order__c || []).map((p: any) => ({
            id: p.Id,
            purchaseOrderNumber: p.Name || '',
            status: p.Status__c || '',
            customerQuote: p.Customer_Quote_Name || '',
            customerOrder: p.Customer_Order_Name || '',
            customerPO: p.Customer_PO__c || '',
            supplierName: p.Supplier_Name || '',
            supplierDBA: p.Supplier_DBA__c || '',
            supplierContact: p.Supplier_Contact_Name || '',
            shipToAccount: p.Ship_to_Account_Name || '',
            shipToLocation: p.Authorized_Ship_To_Location_Name || '',
            shipToContact: p.Ship_to_Contact_Name || '',
            dropShip: p.Drop_Ship__c || false,
            totalLines: p.Total_Lines__c || 0,
            productCost: p.Total_Product_Cost__c || 0,
            shipping: p.Total_Shipping_Charges__c || 0,
            totalCost: p.Total_Cost__c || 0,
            issuedDate: formatDate(p.Issued_Date__c, 'numeric-dash') || '',
            acknowledgedDate: formatDate(p.Acknowledged_Date__c, 'numeric-dash') || '',
            requestDate: formatDate(p.Request_Date__c, 'numeric-dash') || '',
            promiseDate: formatDate(p.Promise_Date__c, 'numeric-dash') || '',
            shippingMethod: p.Shipping_Method__c || '',
            logisticsPartner: p.Logistics_Partner_Name || '',
            logisticsContact: p.Logistics_Contact_Name || '',
            trackingNumber: p.Tracking_Number__c || '',
            estimatedDeliveryDate: formatDate(p.Estimated_Delivery_Date__c, 'numeric-dash') || '',
            trackingStatus: p.Tracking_Status__c || '',
            actualDeliveryDate: formatDate(p.Actual_Delivery_Date__c, 'numeric-dash') || '',
            goodsReceiptDate: formatDate(p.Goods_Receipt_Date__c, 'numeric-dash') || ''
          })),
          supplierBills: (json.Supplier_Bill__c || []).map((sb: any) => ({
            id: sb.Id,
            billNumber: sb.Name || '',
            status: sb.Status__c || '',
            purchaseOrder: sb.Purchase_Order_Name || '',
            customerQuote: sb.Customer_Quote_Name || '',
            customerOrder: sb.Customer_Order_Name || '',
            supplierName: sb.Supplier_Name || '',
            supplierDBA: sb.Supplier_DBA__c || '',
            supplierContact: sb.Supplier_Contact_Name || '',
            totalLines: sb.Total_Lines__c || 0,
            totalCost: sb.Total_Product_Amount__c || 0,
            shipping: sb.Total_Shipping_Charges__c || 0,
            totalAmount: sb.TotalAmount__c || 0,
            billedDate: formatDate(sb.Billed_Date__c, 'numeric-dash') || '',
            paymentTerms: sb.Payment_Terms__c || '',
            dueDate: formatDate(sb.Due_Date__c, 'numeric-dash') || '',
            remittanceStatus: sb.Remittance_Status__c || '',
            openBalance: sb.Open_Balance__c || 0,
            daysOutstanding: sb.Days_Outstanding__c || 0,
            settledDate: formatDate(sb.Settled_Date__c, 'numeric-dash') || ''
          }))
        });
      } else if (tab === 'returns') {
        setReturnsData({
          rma: (json.RMA__c || []).map((r: any) => ({
            id: r.Id,
            rmaNumber: r.Name || '',
            status: r.Status__c || '',
            salesOrder: r.Sales_Order_Name || '',
            customerQuote: r.Customer_Quote_Name || '',
            customerOrder: r.Customer_Order_Name || '',
            rmaType: r.RMA_Type__c || '',
            shipFromAccount: r.Ship_from_Account_Name || '',
            shipFromContact: r.Ship_from_Contact_Name || '',
            returnToAccount: r.Return_to_Account_Name || '',
            returnToContact: r.Return_to_Contact_Name || '',
            dropShip: r.Drop_Ship__c || false,
            totalLines: r.Total_Lines__c || 0,
            totalPrice: r.Total_Price__c || 0,
            issuedDate: formatDate(r.Issued_Date__c, 'numeric-dash') || '',
            returnByDate: formatDate(r.Return_by_Date__c, 'numeric-dash') || '',
            shippingMethod: r.Shipping_Method__c || '',
            logisticsPartner: r.Logistics_Partner_Name || '',
            logisticsContact: r.Logistics_Contact_Name || '',
            trackingNumber: r.Tracking_Number__c || '',
            estimatedDeliveryDate: formatDate(r.Estimated_Delivery_Date__c, 'numeric-dash') || '',
            trackingStatus: r.Tracking_Status__c || '',
            actualDeliveryDate: formatDate(r.Actual_Delivery_Date__c, 'numeric-dash') || '',
            goodsReceiptsDate: formatDate(r.Goods_Receipt_Date__c, 'numeric-dash') || ''
          })),
          rtv: (json.RTV__c || []).map((r: any) => ({
            id: r.Id,
            rtvNumber: r.Name || '',
            status: r.Status__c || '',
            purchaseOrder: r.Purchase_Order_Name || '',
            customerQuote: r.Customer_Quote_Name || '',
            customerOrder: r.Customer_Order_Name || '',
            rtvType: r.RTV_Type__c || '',
            rmaNumber: r.Supplier_RMA_Number__c || '',
            shipFromAccount: r.Ship_from_Account_Name || '',
            shipFromContact: r.Ship_from_Contact_Name || '',
            supplierName: r.Supplier_Name || '',
            supplierContact: r.Supplier_Contact_Name || '',
            totalLines: r.Total_Lines__c || 0,
            totalCost: r.Total_Cost__c || 0,
            issuedDate: formatDate(r.Issued_Date__c, 'numeric-dash') || '',
            approvalDate: formatDate(r.Approval_Date__c, 'numeric-dash') || '',
            returnByDate: formatDate(r.Return_by_Date__c, 'numeric-dash') || ''
          })),
          creditMemos: (json.Credit_Memo__c || []).map((c: any) => ({
            id: c.Id,
            memoNumber: c.Name || '',
            status: c.Status__c || '',
            invoice: c.Invoice_Name || '',
            customerQuote: c.Customer_Quote_Name || '',
            customerOrder: c.Customer_Order_Name || '',
            creditToAccount: c.Credit_to_Account_Name || '',
            creditToContact: c.Credit_to_Contact_Name || '',
            totalLines: c.Total_Lines__c || 0,
            totalPrice: c.Total_Price__c || 0,
            shipping: c.Total_Shipping_Charges__c || 0,
            taxes: c.Total_Taxes_Amount__c || 0,
            totalCreditAmount: c.Total_Credit_Amount__c || 0,
            issuedDate: formatDate(c.Issued_Date__c, 'numeric-dash') || '',
            expirationDate: formatDate(c.Expiration_Date__c, 'numeric-dash') || '',
            availableCreditBalance: c.Available_Credit_Balance__c || 0,
            settledDate: formatDate(c.Settled_Date__c, 'numeric-dash') || ''
          })),
          debitMemos: (json.Debit_Memo__c || []).map((d: any) => ({
            id: d.Id,
            memoNumber: d.Name || '',
            status: d.Status__c || '',
            supplierBill: d.Supplier_Bill_Name || '',
            purchaseOrder: d.Purchase_Order_Name || '',
            customerQuote: d.Customer_Quote_Name || '',
            customerOrder: d.Customer_Order_Name || '',
            supplierCredit: d.Supplier_Credit_Memo__c || '',
            debitToAccount: d.Debit_to_Account_Name || '',
            debitToContact: d.Debit_to_Contact_Name || '',
            totalLines: d.Total_Lines__c || 0,
            totalCost: d.Total_Cost__c || 0,
            shipping: d.Total_Shipping_Charges__c || 0,
            totalDebitAmount: d.Total_Debit_Amount__c || 0,
            issuedDate: formatDate(d.Issued_Date__c, 'numeric-dash') || '',
            approvalDate: formatDate(d.Approval_Date__c, 'numeric-dash') || '',
            availableBalance: d.Available_Debit_Balance__c || 0,
            settledDate: formatDate(d.Settled_Date__c, 'numeric-dash') || ''
          }))
        });
      } else if (tab === 'files') {
        const mappedFiles = (json || []).map((f: any) => ({
          id: f.Id,
          fileName: f.Title,
          fileType: f.FileExtension,
          fileSize: f.FileSize ? (f.ContentSize / 1024 / 1024).toFixed(2) + ' MB' : '0 MB',
          sizeInBytes: f.ContentSize || 0,
          uploadedDate: f.CreatedDate,
          uploadedBy: f.CreatedBy?.Name || 'Unknown',
          contentDocumentId: f.ContentDocumentId
        }));
        setQuoteFiles(mappedFiles);
      }
    } catch (err: any) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setTabLoading(false);
    }
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  useEffect(() => {
    fetchQuote();
    // Initially fetch everything to get counts
    fetchTabData('quotelines');
    fetchTabData('fulfillment');
    fetchTabData('purchases');
    fetchTabData('returns');
    fetchTabData('files');
  }, [fetchQuote, fetchTabData]);

  const handleSort = (field: keyof QuoteLine) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLines = [...quoteLines].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // --- Taxes Tab Logic ---
  const [taxSortField, setTaxSortField] = useState<keyof QuoteTax>("salesTaxRate");
  const [taxSortDirection, setTaxSortDirection] = useState<'asc' | 'desc'>('asc');

  const { widths: taxWidths, handleResize: handleTaxResize } = useResizableColumns({
    salesTaxRate: 150,
    salesTaxAmount: 180,
    useTaxRate: 150,
    useTaxAmount: 150,
    localTaxRate: 150,
    localTaxAmount: 150,
    exciseTaxRate: 150,
    exciseTaxAmount: 150,
    grtRate: 150,
    grtAmount: 150,
    gstRate: 150,
    gstAmount: 150,
    vatRate: 150,
    vatAmount: 150
  });

  const handleTaxSort = (field: keyof QuoteTax) => {
    if (taxSortField === field) {
      setTaxSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTaxSortField(field);
      setTaxSortDirection('asc');
    }
  };

  const sortedTaxes = [...taxes].sort((a, b) => {
    const aVal = a[taxSortField];
    const bVal = b[taxSortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return taxSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  if (loading) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading quote details...</p>
        </div>
      </Sidebar>
    );
  }

  if (error || !quote) {
    return (
      <Sidebar>
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error || 'Quote not found'}</p>
          <button
            onClick={() => router.push("/quotes")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Quotes
          </button>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <QuoteHeader
        quoteNumber={quote.quoteNumber}
        status={quote.status}
        description={quote.description || ''}
        onBack={() => router.push("/quotes")}
      />

      <QuoteDetailsSection quote={quote} lines={quoteLines} />

      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
            {/* Tab buttons — left on desktop (>=1024px) */}
            <div className="flex-1">
              <QuoteTabs
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  if (['fulfillment', 'purchases', 'returns', 'files'].includes(tab)) {
                    fetchTabData(tab);
                  }
                }}
                counts={{
                  quotelines: quoteLines.length,
                  taxes: taxes.length,
                  fulfillment: (fulfillmentData.salesOrders?.length || 0) + (fulfillmentData.shippingManifests?.length || 0) + (fulfillmentData.invoices?.length || 0),
                  purchases: (purchasesData.purchases?.length || 0) + (purchasesData.supplierBills?.length || 0),
                  returns: (returnsData.rma?.length || 0) + (returnsData.rtv?.length || 0) + (returnsData.creditMemos?.length || 0) + (returnsData.debitMemos?.length || 0),
                  files: quoteFiles.length
                }}
              />
            </div>
          </div>
          <div className="p-4">
            {activeTab === 'quotelines' && (
              <QuoteLinesTab
                products={sortedLines}
                quoteId={id}
                loading={tabLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                widths={widths}
                onResize={handleResize}
              />
            )}
            {activeTab === 'taxes' && (
              <QuoteTaxesTab
                taxes={sortedTaxes}
                loading={false}
                sortField={taxSortField}
                sortDirection={taxSortDirection}
                onSort={handleTaxSort}
                widths={taxWidths}
                onResize={handleTaxResize}
              />
            )}
            {activeTab === 'fulfillment' && (
              <QuoteFulfillmentTab
                quoteId={id}
                data={fulfillmentData}
                loading={tabLoading}
              />
            )}
            {activeTab === 'purchases' && (
              <QuotePurchasesTab
                quoteId={id}
                data={purchasesData}
                loading={tabLoading}
              />
            )}
            {activeTab === 'returns' && (
              <QuoteReturnsTab
                quoteId={id}
                data={returnsData}
                loading={tabLoading}
              />
            )}
            {activeTab === 'files' && (
              <QuoteFilesTab
                quoteId={id}
                accountId={SF_ACCOUNT_ID}
                contactId={SF_CONTACT_ID}
                files={quoteFiles}
                loading={tabLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] gap-4 sm:gap-0 z-40">
        <button
          onClick={() => router.push("/quotes")}
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Quotes
        </button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        </div>
      </div>

      <div className="h-20"></div>
    </Sidebar>
  );
}
