import { formatDate } from "@/lib/utils/formatting";
import DetailInput from "./DetailInput";

interface ShipmentInfoProps {
    shipment: any;
    formatAddress: (addr: any) => string;
}

export default function ShipmentInfo({ shipment, formatAddress }: ShipmentInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white " title="Shipping Information">Shipping Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Delivery Destination">Delivery Destination</p>
                </div>
            </div>
            <div className="text-sm mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailInput label="Ship to Account" value={shipment.Ship_to_Account_Name} />
                    <DetailInput label="Ship to Location" value={shipment.Authorized_Ship_To_Location_Name} />
                    <DetailInput label="Shipping Address" value={formatAddress(shipment.Authorized_Ship_To_Location_Address)} />
                    <DetailInput label="Planned Ship Date" value={formatDate(shipment.Ship_Date__c, 'numeric-dash')} />
                    <DetailInput label="Drop-Ship" value={shipment.Drop_Ship__c ? "Yes" : "No"} />
                    <DetailInput label="Site" value={shipment.Site_Name} />
                </div>
            </div>
        </div>
    );
}
