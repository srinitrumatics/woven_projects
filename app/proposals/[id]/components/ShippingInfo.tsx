import { Proposal } from "../types";

interface ShippingInfoProps {
    proposal: Proposal;
}

export default function ShippingInfo({ proposal }: ShippingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Shipping Information">Shipping Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Delivery Destination">Delivery Destination</p>
                </div>
            </div>

            <div className="text-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship to Account">Ship to Account</label>
                            <input type="text" readOnly value={proposal.shipToAccount} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.shipToAccount} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship to Location">Ship to Location</label>
                            <input type="text" readOnly value={proposal.shipTo} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.shipTo} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Shipping Address">Shipping Address</label>
                        <input type="text" readOnly value={proposal.shippingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.shippingAddress} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Request Date">Request Date</label>
                            <input type="text" readOnly value={proposal.requestedDeliveryDate} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.requestedDeliveryDate} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Drop-Ship">Drop-Ship</label>
                            <input type="text" readOnly value={proposal.dropShip ? 'Yes' : 'No'} className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 sm:text-sm focus:ring-0 focus:border-gray-300 truncate ${proposal.dropShip ? 'text-green-600 font-medium' : 'text-gray-900 dark:text-white'}`} title={proposal.dropShip ? 'Yes' : 'No'} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Site">Site</label>
                            <input type="text" readOnly value={proposal.site} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.site} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
