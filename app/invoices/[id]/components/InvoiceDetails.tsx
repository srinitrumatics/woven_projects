import InvoiceBillingInfo from "./InvoiceBillingInfo";
import InvoiceShippingInfo from "./InvoiceShippingInfo";
import InvoiceSummary from "./InvoiceSummary";
import InvoiceKeyDates from "./InvoiceCardDetail";
import InvoiceNotes from "./InvoiceNotes";

interface InvoiceDetailsProps {
    accountName: string;
    contactName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    billingAddress: string;
    shippingAddress: string;
    paymentTerms: string;
    relatedOrderNumber?: string;
    salesOrderNumber?: string;
    purchaseOrderNumber?: string;
    proposalName?: string;
    customerOrder?: string;
    customerPO?: string;
    collectionStatus?: string;
    notes?: string;
    // Financials
    subtotal: number;
    taxTotal: number;
    shippingCost: number;
    discountTotal: number;
    grandTotal: number;
    amountPaid: number;
    amountDue: number;
    // New fields
    arRep?: string;
    billToLocation?: string;
    shipToLocation?: string;
    shipConfirmedDate?: string;
    siteName?: string;
    productsSubtotal?: number;
    servicesSubtotal?: number;
    appliedCredits?: number;
    productCount?: number;
    serviceCount?: number;
    // Navigation IDs
    accountId?: string;
    proposalId?: string;
    customerOrderId?: string;
    salesOrderId?: string;
    purchaseOrderId?: string;
    billToLocationId?: string;
    shipToLocationId?: string;
    siteId?: string;
}

export default function InvoiceDetails(props: InvoiceDetailsProps) {
    const {
        accountName,
        invoiceDate,
        dueDate,
        billingAddress,
        shippingAddress,
        paymentTerms,
        purchaseOrderNumber,
        proposalName,
        customerOrder,
        customerPO,
        collectionStatus,
        notes,
        taxTotal,
        shippingCost,
        grandTotal,
        amountPaid,
        amountDue,
        arRep,
        billToLocation,
        shipToLocation,
        shipConfirmedDate,
        siteName,
        productsSubtotal,
        servicesSubtotal,
        appliedCredits,
        productCount,
        serviceCount,
        accountId,
        proposalId,
        customerOrderId,
        salesOrderId,
        purchaseOrderId,
        billToLocationId,
        shipToLocationId,
        siteId
    } = props;

    // Handlers for summary buttons
    const handleDownloadPDF = () => {
        console.log("Downloading PDF...");
    };

    const handleMakePayment = () => {
        console.log("Opening payment modal...");
    };

    return (
        <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6 items-stretch">
            {/* Row 1 Left - Key Dates (70%) */}
            <div className="w1025:col-span-7">
                <InvoiceKeyDates
                    arRep={arRep}
                    proposalName={proposalName}
                    proposalId={proposalId}
                    customerOrder={customerOrder}
                    customerOrderId={customerOrderId}
                    salesOrderNumber={props.salesOrderNumber}
                    salesOrderId={salesOrderId}
                    purchaseOrderNumber={purchaseOrderNumber}
                    purchaseOrderId={purchaseOrderId}
                    invoiceDate={invoiceDate}
                    className="h-full"
                />
            </div>

            {/* Row 1 Right - Invoice Notes (30%) */}
            <div className="w1025:col-span-3">
                <InvoiceNotes notes={notes || ""} className="h-full" />
            </div>

            {/* Row 2 Left - Billing & Shipping (70%) */}
            <div className="w1025:col-span-7">
                <div className="flex flex-col gap-6 min-w-0">
                    <InvoiceBillingInfo
                        accountName={accountName}
                        accountId={accountId}
                        billingAddress={billingAddress}
                        billToLocation={billToLocation}
                        billToLocationId={billToLocationId}
                        paymentTerms={paymentTerms}
                        customerPO={customerPO}
                        dueDate={dueDate}
                    />

                    <InvoiceShippingInfo
                        accountName={accountName}
                        accountId={accountId}
                        shippingAddress={shippingAddress}
                        shipToLocation={shipToLocation}
                        shipToLocationId={shipToLocationId}
                        shipConfirmedDate={shipConfirmedDate}
                        siteName={siteName}
                        siteId={siteId}
                    />
                </div>
            </div>

            {/* Row 2 Right - Invoice Summary (30%) */}
            <div className="w1025:col-span-3 flex flex-col h-full">
                <InvoiceSummary
                    subtotal={props.subtotal}
                    taxTotal={taxTotal}
                    shippingCost={shippingCost}
                    grandTotal={grandTotal}
                    amountPaid={amountPaid}
                    amountDue={amountDue}
                    productCount={productCount || 0}
                    serviceCount={serviceCount || 0}
                    productsSubtotal={productsSubtotal || 0}
                    servicesSubtotal={servicesSubtotal || 0}
                    appliedCredits={appliedCredits || 0}
                    collectionStatus={collectionStatus}
                    handleDownloadPDF={handleDownloadPDF}
                    handleMakePayment={handleMakePayment}
                    discountTotal={props.discountTotal}
                />
            </div>
        </div>
    );
}
