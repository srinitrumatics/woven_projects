import { Proposal } from "../types";

interface ShippingInfoProps {
    proposal: Proposal;
}

export default function ShippingInfo({ proposal }: ShippingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Destination</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Ship to Account</label>
                        <p className="text-gray-900 dark:text-white font-medium truncate" title={proposal.shipToAccount}>{proposal.shipToAccount}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Ship to Location</label>
                        <p className="text-gray-900 dark:text-white font-medium truncate" title={proposal.shipTo}>{proposal.shipTo}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
                    <p className="text-gray-900 dark:text-white">{proposal.shippingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Requested Date</label>
                        <p className="text-gray-900 dark:text-white truncate" title={proposal.requestedDeliveryDate}>{proposal.requestedDeliveryDate}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Drop-Ship</label>
                        <span className={`block w-fit px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${proposal.dropShip ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {proposal.dropShip ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Site</label>
                    <p className="text-gray-900 dark:text-white truncate" title={proposal.site}>{proposal.site}</p>
                </div>
            </div>
        </div>
    );
}
