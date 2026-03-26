import { formatDate } from "@/lib/utils/formatting";
import DetailInput from "./DetailInput";

interface ShipmentDetailsProps {
    shipment: any;
}

export default function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Shipping Manifest Details">Shipping Manifest Details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Shipping Manifest Information">Shipping Manifest Information</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w1025:grid-cols-6 gap-4">
                <DetailInput label="Proposal Name" value={shipment.Proposal_Name} />
                <DetailInput label="Customer Order" value={shipment.Customer_Order_Name} />
                <DetailInput label="Customer PO" value={shipment.Customer_PO__c} />
                <DetailInput label="Customer Quote" value={shipment.Customer_Quote_Name} />
                <DetailInput label="Sales Order" value={shipment.Sales_Order_Name} />
                <DetailInput label="Ship Confirmed Date" value={formatDate(shipment.Delivered_Date__c, 'numeric-dash')} />
            </div>
        </div>
    );
}
