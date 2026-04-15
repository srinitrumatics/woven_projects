import { PurchaseOrder } from "../../types";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

interface PODetailsProps {
    po: PurchaseOrder;
}

export default function PODetails({ po }: PODetailsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Purchase Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="bg-primary/5 dark:bg-primary/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary text-white">
                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white " title="Purchase Summary">Purchase Summary</h2>
                </div>
                <div className="p-6 space-y-5">
                    <DetailRow label="Customer Order" value={po.customerOrderName || 'N/A'} isBold />
                    <DetailRow label="Customer Quote" value={po.customerQuoteName || 'N/A'} />
                    <DetailRow label="Customer PO" value={po.customerPO || 'N/A'} />
                    <DetailRow label="Issued Date" value={formatDate(po.issuedDate, 'numeric-dash')} />
                    <DetailRow label="Acknowledged" value={formatDate(po.acknowledgedDate, 'numeric-dash')} />
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest truncate mr-2" title="Total Cost">Total Cost</span>
                            <span className="text-2xl font-black text-primary truncate" title={formatCurrency(po.totalCost)}>{formatCurrency(po.totalCost)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Supplier Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="bg-orange-50 dark:bg-orange-900/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500 text-white">
                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white " title="Supplier Information">Supplier Information</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-0.5 truncate" title={po.supplierName}>{po.supplierName}</p>
                        {po.supplierDBA && <p className="text-sm font-semibold text-primary uppercase tracking-wide italic truncate" title={po.supplierDBA}>{po.supplierDBA}</p>}
                    </div>
                    <DetailRow label="Contact" value={po.supplierContact || 'Not assigned'} isBold />
                    <DetailRow label="Shipping Method" value={po.shippingMethod || 'Standard'} />
                    {po.trackingNumber && <DetailRow label="Tracking" value={po.trackingNumber} icon={<svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" /></svg>} />}
                </div>
            </div>

            {/* Ship-To Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500 text-white">
                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white " title="Shipping To">Shipping To</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-0.5 truncate" title={po.shipToAccountName}>{po.shipToAccountName}</p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate" title={po.shipToLocationName}>{po.shipToLocationName}</p>
                    </div>
                    <DetailRow label="Contact Recipient" value={po.shipToContactName || 'N/A'} />
                    <div className="flex items-center gap-3 pt-3 min-w-0">
                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl ${po.dropShip ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title="Drop Ship">Drop Ship</p>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest truncate" title={po.dropShip ? 'Enabled' : 'Disabled'}>{po.dropShip ? 'Enabled' : 'Disabled'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, isBold = false, icon = null }: any) {
    return (
        <div className="flex justify-between items-start group min-w-0">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate mr-2" title={label}>{label}</span>
            <div className="flex items-center gap-1.5 min-w-0">
                {icon}
                <span className={`text-sm text-right truncate ${isBold ? 'font-bold text-gray-900 dark:text-white underline-offset-4 decoration-primary/30 group-hover:underline' : 'font-medium text-gray-700 dark:text-gray-300'}`} title={value}>
                    {value}
                </span>
            </div>
        </div>
    );
}
