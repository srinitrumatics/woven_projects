import { SupplierBill } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface SupplierBillKeyDatesProps {
    bill: SupplierBill;
}

export default function SupplierBillKeyDates({ bill }: SupplierBillKeyDatesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Key Dates">Key Dates</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Important Timeline Information">Important Timeline Information</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billed Date">Billed Date</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.billedDate ? formatDate(bill.billedDate, 'numeric-dash') : ''} placeholder="N/A" title={bill.billedDate ? formatDate(bill.billedDate, 'numeric-dash') : undefined} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Due Date">Due Date</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.dueDate ? formatDate(bill.dueDate, 'numeric-dash') : ''} placeholder="N/A" title={bill.dueDate ? formatDate(bill.dueDate, 'numeric-dash') : undefined} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Remittance Status">Remittance Status</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.remittanceStatus || ''} placeholder="N/A" title={bill.remittanceStatus} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Payment Terms">Payment Terms</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.paymentTerms || ''} placeholder="N/A" title={bill.paymentTerms} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Purchase Order">Purchase Order</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.purchaseOrderName || ''} placeholder="N/A" title={bill.purchaseOrderName} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Proposal Name">Proposal Name</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={bill.proposalName || ''} placeholder="N/A" title={bill.proposalName} />
                </div>
            </div>
        </div>
    );
}
