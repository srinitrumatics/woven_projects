import { formatDate } from "@/lib/utils/formatting";
import DetailInput from "./DetailInput";

interface TrackingInfoProps {
    shipment: any;
    trackingData?: any;
}

export default function TrackingInfo({ shipment, trackingData }: TrackingInfoProps) {
    const logisticsPartner = trackingData?.logisticsPartner || shipment.Logistics_Partner_Name;
    const trackingNumber = trackingData?.trackingNumber || shipment.Tracking_Number__c;
    const trackingStatus = trackingData?.data?.currentStatusDescription || shipment.Tracking_Status__c;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.894 0l5.447 2.724A2 2 0 0118 6v9.382a2 2 0 01-1.106 1.789L11.447 18.276a2 2 0 01-1.894 0z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white " title="Tracking Information">Tracking Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Shipment Tracking">Shipment Tracking Details</p>
                </div>
            </div>
            <div className="text-sm mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailInput label="Logistics Partner" value={logisticsPartner} />
                    <DetailInput label="Logistics Contact" value={shipment.Logistics_Contact_Name} />
                    <DetailInput label="Tracking URL" value={shipment.Tracking_URL__c} />
                    <DetailInput label="Tracking Number" value={trackingNumber} />
                    <DetailInput label="Tracking Status" value={trackingStatus} />
                    <DetailInput label="ETA" value={formatDate(shipment.Estimated_Delivery_Date__c, 'numeric-dash')} />
                </div>
            </div>
        </div>
    );
}
