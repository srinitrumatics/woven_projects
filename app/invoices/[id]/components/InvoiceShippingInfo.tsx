import { formatDate } from "@/lib/utils/formatting";

interface InvoiceShippingInfoProps {
    accountName: string;
    shipToLocation?: string;
    shippingAddress: string;
    shipConfirmedDate?: string;
    siteName?: string;
}

export default function InvoiceShippingInfo({
    accountName,
    shipToLocation,
    shippingAddress,
    shipConfirmedDate,
    siteName
}: InvoiceShippingInfoProps) {
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Shipping Information">Shipping Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Delivery Destination">Delivery Destination</p>
                </div>
            </div>
            <div className="text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Ship to Account">Ship to Account</label>
                        <input type="text" readOnly value={accountName} title={accountName} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Ship to Location">Ship to Location</label>
                        <input type="text" readOnly value={shipToLocation || ""} title={shipToLocation || ""} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Shipping Address">Shipping Address</label>
                        <input type="text" readOnly value={shippingAddress} title={shippingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Ship Confirmed Date">Ship Confirmed Date</label>
                        <input type="text" readOnly value={formatDate(shipConfirmedDate, 'numeric-dash')} title={formatDate(shipConfirmedDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Site">Site</label>
                        <input type="text" readOnly value={siteName || ""} title={siteName || ""} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                </div>
            </div>
        </div>
    );
}
