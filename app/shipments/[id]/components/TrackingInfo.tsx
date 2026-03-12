import { formatDate } from "@/lib/utils/formatting";
import DetailInput from "./DetailInput";

interface TrackingInfoProps {
    shipment: any;
}

export default function TrackingInfo({ shipment }: TrackingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.894 0l5.447 2.724A2 2 0 0118 6v9.382a2 2 0 01-1.106 1.789L11.447 18.276a2 2 0 01-1.894 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white" title="Tracking Information">Tracking Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400" title="Delivery Status">Delivery Status</p>
                </div>
            </div>
            <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <DetailInput label="Logistics Partner" value={shipment.Logistics_Partner_Name} />
                    <DetailInput label="Logistics Contact" value={shipment.Logistics_Contact_Name} />
                </div>
                <DetailInput label="Tracking Number" value={shipment.Tracking_Number__c} />
                <div className="grid grid-cols-2 gap-4">
                    <DetailInput label="Tracking Status" value={shipment.Tracking_Status__c} />
                    <DetailInput label="ETA" value={formatDate(shipment.Estimated_Delivery_Date__c, 'numeric-dash')} />
                </div>
            </div>
        </div>
    );
}
