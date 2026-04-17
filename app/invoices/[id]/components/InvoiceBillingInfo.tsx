import { formatDate } from "@/lib/utils/formatting";
import DetailInput from "./DetailInput";

interface InvoiceBillingInfoProps {
    accountName: string;
    accountId?: string;
    billToLocation?: string;
    billToLocationId?: string;
    billingAddress: string;
    paymentTerms: string;
    customerPO?: string;
    dueDate: string;
    className?: string;
}

export default function InvoiceBillingInfo({
    accountName,
    accountId,
    billToLocation,
    billToLocationId,
    billingAddress,
    paymentTerms,
    customerPO,
    dueDate,
    className = ""
}: InvoiceBillingInfoProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col ${className}`}>
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <div className="min-w-0 p-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white " title="Billing Information">Billing Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400" title="Invoice Destination">Invoice Destination</p>
                </div>
            </div>

            <div className="text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                    <DetailInput label="Bill to Account" value={accountName} href={accountId ? `/accounts/${accountId}` : undefined} className="lg:col-span-3 p-1" />
                    <DetailInput label="Bill to Location" value={billToLocation} href={billToLocationId ? `/locations/${billToLocationId}` : undefined} className="lg:col-span-3 p-1" />
                    <DetailInput label="Billing Address" value={billingAddress} className="lg:col-span-6 p-1" />
                    <DetailInput label="Payment Terms" value={paymentTerms} className="lg:col-span-2 p-1" />
                    <DetailInput label="Customer PO" value={customerPO} className="lg:col-span-2 p-1" />
                    <DetailInput label="Due Date" value={formatDate(dueDate, 'numeric-dash')} className="lg:col-span-2 p-1" />
                </div>
            </div>
        </div>
    );
}
