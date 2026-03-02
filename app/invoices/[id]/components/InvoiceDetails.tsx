import InvoiceBillingInfo from "./InvoiceBillingInfo";
import InvoiceShippingInfo from "./InvoiceShippingInfo";
import InvoiceSummary from "./InvoiceSummary";
import { formatDate } from "@/lib/utils/formatting";

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
        serviceCount
    } = props;

    // Handlers for summary buttons
    const handleDownloadPDF = () => {
        console.log("Downloading PDF...");
    };

    const handleMakePayment = () => {
        console.log("Opening payment modal...");
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Top Section: Basic Info & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Invoice Information */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Detail</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Information</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <InfoField label="Account Rep" value={arRep} />
                        <InfoField label="Proposal Name" value={proposalName} />
                        <InfoField label="Customer Order" value={customerOrder} />
                        <InfoField label="Sales Order" value={props.salesOrderNumber} />
                        <InfoField label="Purchase Order" value={purchaseOrderNumber} />
                        <InfoField label="Issued Date" value={formatDate(invoiceDate, 'numeric-dash')} />
                    </div>
                </div>

                {/* Invoice Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Notes</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Terms and additional notes</p>
                    </div>
                    <textarea
                        readOnly
                        className="flex-1 min-h-[100px] bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-white resize-none focus:ring-0 focus:border-gray-300"
                        value={notes || "No additional notes for this invoice."}
                    />
                </div>
            </div>

            {/* Middle Section: Billing, Shipping, Summary via Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InvoiceBillingInfo
                    accountName={accountName}
                    billingAddress={billingAddress}
                    billToLocation={billToLocation}
                    paymentTerms={paymentTerms}
                    customerPO={customerPO}
                    dueDate={dueDate}
                />

                <InvoiceShippingInfo
                    accountName={accountName}
                    shippingAddress={shippingAddress}
                    shipToLocation={shipToLocation}
                    shipConfirmedDate={shipConfirmedDate}
                    siteName={siteName}
                />

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

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">{subtitle}</p>
        </div>
    );
}

function InfoField({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="min-w-0">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate">{label}</p>
            <input
                type="text"
                readOnly
                value={String(value || '—')}
                className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300"
                title={String(value || 'N/A')}
            />
        </div>
    );
}

