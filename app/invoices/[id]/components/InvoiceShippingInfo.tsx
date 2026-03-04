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
            <div className="mb-6 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Shipping Information">Shipping Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Delivery Destination">Delivery Destination</p>
            </div>
            <div className="text-sm space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship to Account">Ship to Account</label>
                        <input type="text" disabled value={accountName} title={accountName} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship to Location">Ship to Location</label>
                        <input type="text" disabled value={shipToLocation || '—'} title={shipToLocation || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Shipping Address">Shipping Address</label>
                    <input type="text" disabled value={shippingAddress} title={shippingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship Confirmed Date">Ship Confirmed Date</label>
                        <input type="text" disabled value={formatDate(shipConfirmedDate, 'numeric-dash')} title={formatDate(shipConfirmedDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Site">Site</label>
                        <input type="text" disabled value={siteName || '—'} title={siteName || '—'} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" />
                    </div>
                </div>
            </div>
        </div>
    );
}
