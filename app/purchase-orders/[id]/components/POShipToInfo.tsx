import { PurchaseOrder } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface POShipToInfoProps {
    po: PurchaseOrder;
}

export default function POShipToInfo({ po }: POShipToInfoProps) {
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
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Shipping Information">Shipping Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Delivery Destination</p>
                </div>
            </div>

            <div className="text-sm flex-1">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Row 1 */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Ship to Account"> Ship to Account</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.shipToAccountName || ''} placeholder="N/A" title={po.shipToAccountName || ''} />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Ship to Location">
                            Ship to Location
                        </label>
                        <div className="relative">
                            <input type="text" readOnly className="w-full h-11 pl-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={po.shipToLocationName || ''} placeholder="N/A" title={po.shipToLocationName || ''} />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="md:col-span-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Shipping Address">
                            Shipping Address
                        </label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={formatAddress(po.shippingAddress) === 'N/A' ? '' : formatAddress(po.shippingAddress)} placeholder="N/A" title={formatAddress(po.shippingAddress) === 'N/A' ? '' : formatAddress(po.shippingAddress)} />
                    </div>

                    {/* Row 3 */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Request Date">
                            Request Date
                        </label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" value={formatDate(po.requestDate, 'numeric-dash') || ''} placeholder="N/A" title={formatDate(po.requestDate, 'numeric-dash') || ''} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Drop-Ship">Drop-Ship</label>
                        <div className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={po.dropShip}
                                readOnly
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 cursor-default"
                            />
                            <span className="text-sm text-gray-900 dark:text-white" title={po.dropShip ? 'Required' : 'Not Required'}>{po.dropShip ? 'Required' : 'Not Required'}</span>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 truncate" title="Site">Site</label>
                        <input type="text" readOnly className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 truncate" value={po.siteName || ''} placeholder="N/A" title={po.siteName || ''} />
                    </div>
                </div>
            </div>
        </div>
    );
}
