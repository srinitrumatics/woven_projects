import { formatDate } from "@/lib/utils/formatting";

interface InvoiceKeyDatesProps {
    arRep?: string;
    proposalName?: string;
    customerOrder?: string;
    salesOrderNumber?: string;
    purchaseOrderNumber?: string;
    invoiceDate: string;
    className?: string;
}

export default function InvoiceKeyDates({
    arRep,
    proposalName,
    customerOrder,
    salesOrderNumber,
    purchaseOrderNumber,
    invoiceDate,
    className = ""
}: InvoiceKeyDatesProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full ${className}`}>
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Key Dates">Invoice Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Invoice Information</p>
            </div>
            <div className="text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w1025:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Account Rep">Account Rep</label>
                        <input type="text" disabled value={arRep || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={arRep || '—'} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Proposal Name">Proposal Name</label>
                        <input type="text" disabled value={proposalName || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposalName || '—'} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Customer Order">Customer Order</label>
                        <input type="text" disabled value={customerOrder || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={customerOrder || '—'} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Sales Order">Sales Order</label>
                        <input type="text" disabled value={salesOrderNumber || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={salesOrderNumber || '—'} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Purchase Order">Purchase Order</label>
                        <input type="text" disabled value={purchaseOrderNumber || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={purchaseOrderNumber || '—'} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Issued Date">Issued Date</label>
                        <input type="text" disabled value={formatDate(invoiceDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={formatDate(invoiceDate, 'numeric-dash')} />
                    </div>
                </div>
            </div>
        </div>
    );
}
