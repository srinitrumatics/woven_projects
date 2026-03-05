import { formatDate } from "@/lib/utils/formatting";

interface InvoiceBillingInfoProps {
    accountName: string;
    billToLocation?: string;
    billingAddress: string;
    paymentTerms: string;
    customerPO?: string;
    dueDate: string;
}

export default function InvoiceBillingInfo({
    accountName,
    billToLocation,
    billingAddress,
    paymentTerms,
    customerPO,
    dueDate
}: InvoiceBillingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="mb-6 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Billing Information">Billing Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Invoice Destination">Invoice Destination</p>
            </div>

            <div className="text-sm space-y-6">
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Account">Bill to Account</label>
                        <input type="text" disabled value={accountName} title={accountName} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Location">Bill to Location</label>
                        <input type="text" disabled value={billToLocation || '—'} title={billToLocation || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billing Address">Billing Address</label>
                    <input type="text" disabled value={billingAddress} title={billingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Payment Terms">Payment Terms</label>
                        <input type="text" disabled value={paymentTerms} title={paymentTerms} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer PO">Customer PO</label>
                        <input type="text" disabled value={customerPO || '—'} title={customerPO || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Due Date">Due Date</label>
                        <input type="text" disabled value={formatDate(dueDate, 'numeric-dash')} title={formatDate(dueDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                </div>
            </div>
        </div>
    );
}
