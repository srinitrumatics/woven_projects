import { PurchaseOrder } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface POSupplierInfoProps {
    po: PurchaseOrder;
}

export default function POSupplierInfo({ po }: POSupplierInfoProps) {
    const formatAddress = (addr: any) => {
        if (!addr) return 'N/A';
        const parts = [
            addr.street,
            addr.city,
            addr.state,
            addr.postalCode,
            addr.country
        ].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Billing Information">Billing Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Invoice Destination">Invoice Destination</p>
                </div>
            </div>

            <div className="text-sm flex-1">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Row 1 */}
                    <div className="md:col-span-3 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Bill to Account">Bill to Account</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={po.billToAccountName || ''} placeholder="N/A" title={po.billToAccountName || ''} />
                    </div>
                    <div className="md:col-span-3 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Bill to Location">
                            Bill to Location
                        </label>
                        <div className="relative">
                            <input type="text" readOnly className="w-full h-11 pl-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={po.siteName || ''} placeholder="N/A" title={po.siteName || ''} />
                            <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="md:col-span-6 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Billing Address">
                            Billing Address
                        </label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={formatAddress(po.billingAddress) === 'N/A' ? '' : formatAddress(po.billingAddress)} placeholder="N/A" title={formatAddress(po.billingAddress) === 'N/A' ? '' : formatAddress(po.billingAddress)} />
                    </div>

                    {/* Row 3 */}
                    <div className="md:col-span-2 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Customer PO">
                            Customer PO
                        </label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={po.customerPO || ''} placeholder="Enter PO number" title={po.customerPO || ''} />
                    </div>
                    <div className="md:col-span-2 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Payment Terms">Payment Terms</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={po.paymentTerms || ''} placeholder="N/A" title={po.paymentTerms || ''} />
                    </div>
                    <div className="md:col-span-2 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Price Book">Goods Receipt Date</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={formatDate(po.goodsReceiptsDate, 'numeric-dash') || ''} title={formatDate(po.goodsReceiptsDate, 'numeric-dash') || ''} />
                    </div>
                </div>
            </div>
        </div>
    );
}
