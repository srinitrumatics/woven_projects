import { SupplierBill } from "../../types";

interface SupplierBillInfoProps {
    bill: SupplierBill;
}

export default function SupplierBillInfo({ bill }: SupplierBillInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Supplier Information">Supplier Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Vendor Details">Vendor Details</p>
                </div>
            </div>

            <div className="text-sm flex-1">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Supplier">Supplier</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.supplierName || ''} placeholder="N/A" title={bill.supplierName} />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Customer Order">Customer Order</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.customerOrderName || ''} placeholder="N/A" title={bill.customerOrderName} />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Customer Quote">Customer Quote</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.customerQuoteName || ''} placeholder="N/A" title={bill.customerQuoteName} />
                    </div>
                </div>
            </div>
        </div>
    );
}
