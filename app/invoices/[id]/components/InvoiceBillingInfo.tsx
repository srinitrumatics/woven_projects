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
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Billing Information">Billing Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Invoice Destination">Invoice Destination</p>
                </div>
            </div>

            <div className="text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Bill to Account">Bill to Account</label>
                        <input type="text" readOnly value={accountName} title={accountName} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Bill to Location">Bill to Location</label>
                        <input type="text" readOnly value={billToLocation || ""} title={billToLocation || ""} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Billing Address">Billing Address</label>
                        <input type="text" readOnly value={billingAddress} title={billingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Payment Terms">Payment Terms</label>
                        <input type="text" readOnly value={paymentTerms} title={paymentTerms} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Customer PO">Customer PO</label>
                        <input type="text" readOnly value={customerPO || ""} title={customerPO || ""} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Due Date">Due Date</label>
                        <input type="text" readOnly value={formatDate(dueDate, 'numeric-dash')} title={formatDate(dueDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                </div>
            </div>
        </div>
    );
}
