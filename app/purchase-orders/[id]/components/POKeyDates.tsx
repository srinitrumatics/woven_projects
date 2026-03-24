import { PurchaseOrder } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface POKeyDatesProps {
    po: PurchaseOrder;
}

export default function POKeyDates({ po }: POKeyDatesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Purchase Order Details">Purchase Order Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Purchase Order Information</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate  ">Account Rep</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.buyerName || ''} placeholder="N/A" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate  ">Proposal Name</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.proposalName || ''} placeholder="N/A" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate  ">Customer Order</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.customerOrderName || ''} placeholder="N/A" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate  ">Logistics Partner</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.logisticsPartner || ''} placeholder="N/A" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate  ">Purchase Order</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.customerPO || ''} placeholder="N/A" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate  ">Issued Date</label>
                    <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={formatDate(po.issuedDate, 'numeric-dash') || ''} placeholder="N/A" />
                </div>
            </div>
        </div>
    );
}
