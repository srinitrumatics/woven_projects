"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import InvoiceHeader from "@/app/invoices/[id]/components/InvoiceHeader";
import InvoiceTabs, { InvoiceTabType } from "@/app/invoices/[id]/components/InvoiceTabs";
import InvoiceDetails from "@/app/invoices/[id]/components/InvoiceDetails";
import InvoiceLineItems from "@/app/invoices/[id]/components/InvoiceLineItems";
import InvoicePayments from "@/app/invoices/[id]/components/InvoicePayments";
import InvoiceCredits from "@/app/invoices/[id]/components/InvoiceCredits";
import InvoiceFiles from "@/app/invoices/[id]/components/InvoiceFilesTab";
import InvoiceTaxes from "@/app/invoices/[id]/components/InvoiceTaxes";
import { getMockInvoiceDetails } from "@/app/invoices/mockData";
import { InvoiceDetails as InvoiceDetailsType } from "@/app/invoices/types";
import { useUserSession } from "@/components/UserSessionContext";
import { isServiceRecordType } from "@/lib/utils/product-record-type";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState<InvoiceTabType>("products");
  const [invoice, setInvoice] = useState<InvoiceDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || user?.Id || "";

  useEffect(() => {
    async function fetchInvoiceDetails() {
      if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
      try {
        setLoading(true);
        // Fetch Primary Invoice Data
        const res = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&invoiceId=${id}`);
        if (!res.ok) throw new Error('Failed to fetch invoice details');
        const data = await res.json();

        // Fetch Invoice Lines separately as requested
        const linesRes = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&invoiceId=${id}&action=lines`);
        const linesData = linesRes.ok ? await linesRes.json() : {};

        const lines = (linesData?.Invoice_Line__c || []).map((line: any) => ({
          id: line.Id,
          invoiceLineName: line.Name || 'N/A',
          status: line.Status__c || 'Draft',
          productName: line.Product_Name || 'N/A',
          productSku: line.Product_Name || 'N/A',
          description: line.Product_Description__c || '',
          manufacturerDBA: line.Manufacturer_DBA__c || 'N/A',
          brand: line.Brand_Name__c || line.gtherp__Brand_Name__c || '',
          productRecordType: line.Product_Record_Type__c || '',
          quantity: line.Total_Order_Qty__c || line.gtherp__Total_Order_Qty__c || 0,
          unitPrice: line.Unit_Price__c || 0,
          discount: 0,
          taxAmount: line.Total_Taxes_Amount__c || 0,
          totalTaxesAmount: line.Total_Taxes_Amount__c || 0,
          shippingCharges: line.Shipping_Charges__c || 0,
          subtotal: line.Total_Price__c || 0,
          total: line.Line_Grand_Total__c || 0,
          lineGrandTotal: line.Line_Grand_Total__c || 0,
          salesOrderLineId: line.Sales_Order_Line__c || '',
          salesOrderId: line.Sales_Order__c || line.Sales_Order_Line__r?.Sales_Order__c || '',
          customerQuoteLineId: line.Customer_Quote_Line__c || '',
          customerQuoteId: line.Customer_Quote__c || line.Customer_Quote_Line__r?.Customer_Quote__c || '',
          salesOrderLine: line.Sales_Order_Line_Name || '',
          purchaseOrderLine: line.Purchase_Order_Line_Name || '',
          customerQuoteLineName: line.Customer_Quote_Line_Name || '',
          proposedProduct: line.Proposed_Product_Name || '',
          proposedProductId: line.Proposed_Product__c || '',
          proposalId: line.Proposal__c || '',
          productId: line.Product_Name__c || ''
        }));

        // Fetch Payments separately
        const paymentsRes = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&invoiceId=${id}&action=payments`);
        const paymentsData = paymentsRes.ok ? await paymentsRes.json() : {};

        const receivePayments = (paymentsData?.Receive_Payment__c || []).map((pay: any) => ({
          id: pay.Id,
          name: pay.Name || 'N/A',
          status: pay.Status__c || 'N/A',
          amount: pay.Amount__c || 0,
          paymentMethod: pay.Payment_Method__c || 'N/A',
          referenceNo: pay.Reference_No__c || 'N/A',
          transactionDate: pay.Transaction_Date__c || '',
          scheduledDate: pay.Scheduled_Date__c || '',
          failedDate: pay.Failed_Date__c || '',
          postedDate: pay.Posted_Date__c || '',
          customerQuoteName: pay.Customer_Quote_Name || pay.Customer_Quote__r?.Name || '',
          customerQuoteId: pay.Customer_Quote__c || '',
          customerOrderName: pay.Customer_Order_Name || pay.Customer_Order__r?.Name || '',
          customerOrderId: pay.Customer_Order__c || '',
          invoiceName: pay.Invoice_Name || pay.Invoice__r?.Name || pay.Invoice_Number__c || '',
          invoiceId: pay.Invoice__c || '',
          proposalName: pay.Proposal_Name || pay.Proposal__r?.Name || '',
          proposalId: pay.Proposal__c || '',
        }));

        const creditMemos = (paymentsData?.Applied_Credit_Memo__c || []).map((cm: any) => ({
          id: cm.Id,
          name: cm.Name || 'N/A',
          status: cm.Status__c || 'N/A',
          appliedAmount: cm.Applied_Amount__c || 0,
          appliedDate: cm.Applied_Date__c || '',
          postedDate: cm.Posted_Date__c || '',
          creditMemoName: cm.Credit_Memo_Name || 'N/A',
          invoiceName: cm.Invoice_Name || 'N/A',
          availableCreditBalance: cm.Available_Credit_Balance__c || 0,
          notes: cm.Applied_Credit_Memo_Notes__c || '',
          customerQuoteName: cm.Customer_Quote_Name || cm.Customer_Quote__r?.Name || '',
          customerQuoteId: cm.Customer_Quote__c || '',
          customerOrderName: cm.Customer_Order_Name || cm.Customer_Order__r?.Name || '',
          customerOrderId: cm.Customer_Order__c || '',
          invoiceId: cm.Invoice__c || '',
          proposalName: cm.Proposal_Name || cm.Proposal__r?.Name || '',
          proposalId: cm.Proposal__c || '',
        }));

        // Fetch Credits separately (Full Credit Memo records)
        const creditsRes = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&invoiceId=${id}&action=credits`);
        const creditsData = creditsRes.ok ? await creditsRes.json() : {};

        const credits = (creditsData?.Credit_Memo__c || []).map((cm: any) => ({
          id: cm.Id,
          name: cm.Name || 'N/A',
          status: cm.Status__c || 'N/A',
          invoiceName: cm.Invoice_Name || cm.Invoice__r?.Name || 'N/A',
          salesOrderName: cm.Sales_Order_Name || '',
          customerQuoteName: cm.Customer_Quote_Name || cm.Customer_Quote__r?.Name || 'N/A',
          customerQuoteId: cm.Customer_Quote__c || '',
          proposalName: cm.Proposal_Name || cm.Proposal__r?.Name || '',
          proposalNumber: cm.Proposal_Number__c || cm.Proposal_Name || cm.Proposal__r?.Name || '',
          proposalId: cm.Proposal__c || '',
          customerOrderName: cm.Customer_Order_Name || cm.Customer_Order__r?.Name || 'N/A',
          customerOrderId: cm.Customer_Order__c || '',
          creditToAccountName: cm.Credit_to_Account_Name || 'N/A',
          creditToContactName: cm.Credit_to_Contact_Name || 'N/A',
          totalLines: cm.Total_Lines__c || 0,
          totalPrice: cm.Total_Price__c || 0,
          shipping: cm.Total_Shipping_Charges__c || 0,
          taxes: cm.Total_Taxes_Amount__c || 0,
          totalCreditAmount: cm.Total_Credit_Amount__c || 0,
          issuedDate: cm.Issued_Date__c || '',
          expirationDate: cm.Expiration_Date__c || '',
          availableCreditBalance: cm.Available_Credit_Balance__c || 0,
          settledDate: cm.Settled_Date__c || '',
        }));

        // Fetch Files separately
        const filesRes = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&invoiceId=${id}&action=files`);
        const filesData = filesRes.ok ? await filesRes.json() : [];

        const files = (filesData || []).map((file: any) => ({
          id: file.Id,
          fileName: file.Title || 'N/A',
          fileType: file.FileExtension || 'N/A',
          sizeInBytes: file.FileSize || 0,
          uploadedBy: file.CreatedBy || 'N/A',
          uploadedDate: file.CreatedDate ? new Date(file.CreatedDate).toLocaleDateString() : 'N/A',
        }));

        // The API returns { Invoice__c: [...], Invoice_Lines__c: [...], Payment_History__c: [...] }
        const rawInvoice = data?.Invoice__c?.[0];
        if (!rawInvoice) {
          setInvoice(null);
          return;
        }

        const formatAddress = (addr: any) => {
          if (!addr) return "N/A";
          const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
          return parts.join(", ");
        };

        const mappedInvoice: InvoiceDetailsType = {
          id: rawInvoice.Id,
          invoiceNumber: rawInvoice.Name || 'N/A',
          accountName: rawInvoice.Bill_to_Account_Name || 'N/A',
          contactName: rawInvoice.Bill_to_Contact_Name || 'N/A',
          status: (rawInvoice.Status__c || 'Draft') as any,
          totalAmount: rawInvoice.Grand_Total__c || 0,
          amountPaid: rawInvoice.Total_Amount_Collected__c || 0,
          amountDue: rawInvoice.Open_Balance__c || 0,
          invoiceDate: rawInvoice.Issued_Date__c || '',
          dueDate: rawInvoice.Due_Date__c || '',
          description: rawInvoice.Invoice_Notes__c || '',
          lineItemCount: rawInvoice.Total_Lines__c || 0,
          relatedOrderNumber: rawInvoice.Sales_Order_Name || '',
          salesOrderNumber: rawInvoice.Sales_Order_Name || '',
          purchaseOrderNumber: rawInvoice.Purchase_Order_Name || '',
          proposalName: rawInvoice.Proposal_Name || '',
          customerOrder: rawInvoice.Customer_Order_Name || '',
          customerPO: rawInvoice.Customer_PO__c || '',
          paymentTerms: rawInvoice.Payment_Terms__c || '',
          collectionStatus: rawInvoice.Collection_Status__c || '',
          billingAddress: formatAddress(rawInvoice.Authorized_Bill_To_Location_Address),
          shippingAddress: formatAddress(rawInvoice.Authorized_Ship_To_Location_Address),
          notes: rawInvoice.Invoice_Notes__c || '',
          subtotal: rawInvoice.Total_Price__c || 0,
          taxTotal: rawInvoice.Total_Taxes_Amount__c || 0,
          discountTotal: rawInvoice.Applied_Credit_Amount__c || 0,
          shippingCost: rawInvoice.Total_Shipping_Charges__c || 0,
          grandTotal: rawInvoice.Grand_Total__c || 0,
          arRep: rawInvoice.Owner_Name || 'N/A',
          billToLocation: rawInvoice.Authorized_Bill_To_Location_Name || 'N/A',
          shipToLocation: rawInvoice.Authorized_Ship_To_Location_Name || 'N/A',
          shipConfirmedDate: rawInvoice.Delivered_Date__c || 'N/A',
          siteName: rawInvoice.Site_Name || 'N/A',
          productsSubtotal: lines.filter((l: any) => !isServiceRecordType(l.productRecordType)).reduce((sum: number, l: any) => sum + (l.subtotal || 0), 0),
          servicesSubtotal: lines.filter((l: any) => isServiceRecordType(l.productRecordType)).reduce((sum: number, l: any) => sum + (l.subtotal || 0), 0),
          appliedCredits: rawInvoice.Applied_Credit_Amount__c || 0,
          salesTaxRate: rawInvoice.Sales_Tax_Rate__c || 0,
          salesTaxAmount: rawInvoice.Total_Sales_Tax_Amount__c || 0,
          useTaxRate: rawInvoice.Use_Tax_Rate__c || 0,
          useTaxAmount: rawInvoice.Total_Use_Tax_Amount__c || 0,
          localTaxRate: rawInvoice.Local_Tax_Rate__c || 0,
          localTaxAmount: rawInvoice.Total_Local_Tax_Amount__c || 0,
          exciseTaxRate: rawInvoice.Excise_Tax_Rate__c || 0,
          exciseTaxAmount: rawInvoice.Total_Excise_Tax_Amount__c || 0,
          grtRate: rawInvoice.Gross_Receipts_Tax_Rate__c || 0,
          grtAmount: rawInvoice.Total_Gross_Receipts_Tax_Amount__c || 0,
          gstRate: rawInvoice.GST_Rate__c || 0,
          gstAmount: rawInvoice.Total_GST_Amount__c || 0,
          vatRate: rawInvoice.VAT_Rate__c || 0,
          vatAmount: rawInvoice.Total_VAT_Amount__c || 0,
          lines,
          payments: (data?.Payment_History__c || []).map((pay: any) => ({
            id: pay.Id,
            paymentNumber: pay.Name || 'N/A',
            paymentDate: pay.Payment_Date__c || '',
            amount: pay.Amount__c || 0,
            paymentMethod: (pay.Payment_Method__c || 'Credit Card') as any,
            status: (pay.Status__c || 'Completed') as any,
            transactionId: pay.Transaction_Id__c || 'N/A',
            notes: pay.Notes__c || '',
            processedBy: pay.Processed_By_Name || '',
          })),
          receivePayments,
          creditMemos,
          credits,
          files,
          salesOrderId: rawInvoice.Sales_Order__c || '',
          purchaseOrderId: rawInvoice.Purchase_Order__c || '',
          proposalId: rawInvoice.Proposal__c || '',
          customerOrderId: rawInvoice.Customer_Order__c || '',
          accountId: rawInvoice.Bill_to_Account__c || '',
          billToLocationId: rawInvoice.Authorized_Bill_To_Location__c || '',
          shipToLocationId: rawInvoice.Authorized_Ship_To_Location__c || '',
          siteId: rawInvoice.Site__c || '',
          issuedDate: rawInvoice.Issued_Date__c || '',
          daysOutstanding: rawInvoice.Days_Outstanding__c || rawInvoice.gtherp__Days_Outstanding__c || 0
        };

        setInvoice(mappedInvoice);
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoiceDetails();
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  const handleBack = () => {
    router.push("/invoices");
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-[400px] min-w-0">
          <LoadingSpinner size="md" />
        </div>
      </Sidebar>
    );
  }

  if (!invoice) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white ">Invoice not found</h2>
          <button
            onClick={handleBack}
            className="mt-4 text-primary hover:underline truncate"
          >
            Cancel
          </button>
        </div>
      </Sidebar>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <InvoiceLineItems lines={invoice.lines} invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />;
      case "taxes":
        return (
          <InvoiceTaxes
            salesTaxRate={invoice.salesTaxRate}
            salesTaxAmount={invoice.salesTaxAmount}
            useTaxRate={invoice.useTaxRate}
            useTaxAmount={invoice.useTaxAmount}
            localTaxRate={invoice.localTaxRate}
            localTaxAmount={invoice.localTaxAmount}
            exciseTaxRate={invoice.exciseTaxRate}
            exciseTaxAmount={invoice.exciseTaxAmount}
            grtRate={invoice.grtRate}
            grtAmount={invoice.grtAmount}
            gstRate={invoice.gstRate}
            gstAmount={invoice.gstAmount}
            vatRate={invoice.vatRate}
            vatAmount={invoice.vatAmount}
          />
        );
      case "payments":
        return <InvoicePayments receivePayments={invoice.receivePayments} creditMemos={invoice.creditMemos} />;
      case "credits":
        return <InvoiceCredits credits={invoice.credits} />;
      case "files":
        return <InvoiceFiles files={invoice.files} invoiceId={invoice.id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} />;
      default:
        return null;
    }
  };

  return (
    <Sidebar>
      <InvoiceHeader
        invoiceNumber={invoice.invoiceNumber}
        status={invoice.status}
        accountName={invoice.accountName}
        onBack={handleBack}
      />

      <InvoiceDetails
        accountName={invoice.accountName}
        contactName={invoice.contactName}
        invoiceNumber={invoice.invoiceNumber}
        invoiceDate={invoice.invoiceDate}
        dueDate={invoice.dueDate}
        billingAddress={invoice.billingAddress}
        shippingAddress={invoice.shippingAddress}
        paymentTerms={invoice.paymentTerms}
        relatedOrderNumber={invoice.relatedOrderNumber}
        salesOrderNumber={invoice.salesOrderNumber}
        purchaseOrderNumber={invoice.purchaseOrderNumber}
        proposalName={invoice.proposalName}
        customerOrder={invoice.customerOrder}
        customerPO={invoice.customerPO}
        collectionStatus={invoice.collectionStatus}
        notes={invoice.notes}
        subtotal={invoice.subtotal}
        taxTotal={invoice.taxTotal}
        shippingCost={invoice.shippingCost}
        discountTotal={invoice.discountTotal}
        grandTotal={invoice.grandTotal}
        amountPaid={invoice.amountPaid}
        amountDue={invoice.amountDue}
        arRep={invoice.arRep}
        billToLocation={invoice.billToLocation}
        shipToLocation={invoice.shipToLocation}
        shipConfirmedDate={invoice.shipConfirmedDate}
        siteName={invoice.siteName}
        productsSubtotal={invoice.productsSubtotal}
        servicesSubtotal={invoice.servicesSubtotal}
        appliedCredits={invoice.appliedCredits}
        productCount={invoice.lines.filter(l => !isServiceRecordType(l.productRecordType)).length}
        serviceCount={invoice.lines.filter(l => isServiceRecordType(l.productRecordType)).length}
        issuedDate={invoice.issuedDate}
        daysOutstanding={invoice.daysOutstanding}
        proposalId={invoice.proposalId}
        customerOrderId={invoice.customerOrderId}
        salesOrderId={invoice.salesOrderId}
        purchaseOrderId={invoice.purchaseOrderId}
        billToLocationId={invoice.billToLocationId}
        shipToLocationId={invoice.shipToLocationId}
        siteId={invoice.siteId}
        accountId={invoice.accountId}
      />

      {/* Tabs Section Section Below Details */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <InvoiceTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{
              products: invoice.lines.length,
              taxes: invoice.taxTotal > 0 ? 1 : 0,
              payments: invoice.receivePayments.length + invoice.creditMemos.length,
              credits: invoice.credits.length,
              files: invoice.files.length
            }}
          />
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      <div className="h-24" />

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] gap-4 sm:gap-0 z-40">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium truncate"
          >
            Cancel
          </button>
        </div>
      </div>
    </Sidebar>
  );
}



