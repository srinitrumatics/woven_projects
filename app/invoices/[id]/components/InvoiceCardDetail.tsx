import { formatDate } from "@/lib/utils/formatting";
import DetailInput from "./DetailInput";

interface InvoiceKeyDatesProps {
    arRep?: string;
    proposalName?: string;
    proposalId?: string;
    customerOrder?: string;
    customerOrderId?: string;
    salesOrderNumber?: string;
    salesOrderId?: string;
    purchaseOrderNumber?: string;
    purchaseOrderId?: string;
    invoiceDate: string;
    className?: string;
}

export default function InvoiceKeyDates({
    arRep,
    proposalName,
    proposalId,
    customerOrder,
    customerOrderId,
    salesOrderNumber,
    salesOrderId,
    purchaseOrderNumber,
    purchaseOrderId,
    invoiceDate,
    className = ""
}: InvoiceKeyDatesProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full ${className}`}>
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Key Dates">Invoice Details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Invoice Information">Invoice Information</p>
                </div>
            </div>
            <div className="text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w1025:grid-cols-6 gap-4">
                    <DetailInput label="Account Rep" value={arRep} />
                    <DetailInput label="Proposal Name" value={proposalName} href={proposalId ? `/proposals/${proposalId}` : undefined} />
                    <DetailInput label="Customer Order" value={customerOrder} href={customerOrderId ? `/orders/${customerOrderId}` : undefined} />
                    <DetailInput label="Sales Order" value={salesOrderNumber} href={salesOrderId ? `/sales-orders/${salesOrderId}` : undefined} />
                    <DetailInput label="Purchase Order" value={purchaseOrderNumber} href={purchaseOrderId ? `/purchase-orders/${purchaseOrderId}` : undefined} />
                    <DetailInput label="Issued Date" value={formatDate(invoiceDate, 'numeric-dash')} />
                </div>
            </div>
        </div>
    );
}
