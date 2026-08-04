import { Proposal } from "../types";
import ReadOnlyField from "@/components/ui/ReadOnlyField";

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
                        <ReadOnlyField label="Ship to Account" value={proposal.shipToAccount} />
                        <ReadOnlyField label="Ship to Location" value={proposal.shipTo} />
                    </div>

                    <ReadOnlyField label="Shipping Address" value={proposal.shippingAddress} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ReadOnlyField label="Request Date" value={proposal.requestedDeliveryDate} />
                        <ReadOnlyField
                            label="Drop-Ship"
                            value={proposal.dropShip ? 'Yes' : 'No'}
                            valueClassName={proposal.dropShip ? 'text-green-600 font-medium' : ''}
                        />
                        <ReadOnlyField label="Site" value={proposal.site} />
                    </div>
                </div>
            </div>
        </div>
    );
}
