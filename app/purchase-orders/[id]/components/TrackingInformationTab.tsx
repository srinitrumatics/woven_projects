import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import Pagination from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useMemo } from 'react';
import { formatDate, displayCell } from "@/lib/utils/formatting";

interface TrackingInfo {
    Logistics_Partner__c: string;
    Logistics_Contact__c: string;
    Shipping_Method__c: string;
    Service_Level__c: string;
    Tracking_URL__c: string;
    Tracking_Number__c: string;
    Tracking_Status__c: string;
    Estimated_Delivery_Date__c: string;
    Actual_Delivery_Date__c: string;
}

interface TrackingInformationTabProps {
    data: TrackingInfo[];
}

const ITEMS_PER_PAGE = 10;

export default function TrackingInformationTab({ data }: TrackingInformationTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const mappedData = useMemo(() => data.map((item, index) => ({
        ...item,
        id: index,
        logisticsPartner: item.Logistics_Partner__c,
        logisticsContact: item.Logistics_Contact__c,
        shippingMethod: item.Shipping_Method__c,
        serviceLevel: item.Service_Level__c,
        trackingNumber: item.Tracking_Number__c,
        trackingStatus: item.Tracking_Status__c,
        estimatedDelivery: item.Estimated_Delivery_Date__c,
        actualDelivery: item.Actual_Delivery_Date__c,
    })), [data]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedData);

    const initialWidths = {
        logisticsPartner: 180,
        logisticsContact: 180,
        shippingMethod: 150,
        serviceLevel: 150,
        trackingUrl: 200,
        trackingNumber: 150,
        trackingStatus: 120,
        estimatedDelivery: 180,
        actualDelivery: 180,
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There is no Tracking Information associated with this purchase order.">There is no Tracking Information associated with this purchase order.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader truncate={false} label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.logisticsPartner} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.logisticsContact} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shippingMethod} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Service Level" field="serviceLevel" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.serviceLevel} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Tracking URL" field="Tracking_URL__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.trackingUrl} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.trackingNumber} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.trackingStatus} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Estimated Delivery Date" field="estimatedDelivery" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.estimatedDelivery} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Actual Delivery Date" field="actualDelivery" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.actualDelivery} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Logistics_Partner__c || '-'}>{displayCell(item.Logistics_Partner__c)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Logistics_Contact__c || '-'}>{displayCell(item.Logistics_Contact__c)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Shipping_Method__c || '-'}>{displayCell(item.Shipping_Method__c)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Service_Level__c || '-'}>{displayCell(item.Service_Level__c)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Tracking_URL__c || '-'}>
                                    {displayCell(item.Tracking_URL__c)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Tracking_Number__c || '-'}>{displayCell(item.Tracking_Number__c)}</td>
                                <td className="px-3 py-2 text-sm truncate">
                                    <StatusBadge status={item.Tracking_Status__c || '-'} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Estimated_Delivery_Date__c ? formatDate(item.Estimated_Delivery_Date__c, 'numeric-dash') : '-'}>{item.Estimated_Delivery_Date__c ? formatDate(item.Estimated_Delivery_Date__c, 'numeric-dash') : '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={item.Actual_Delivery_Date__c ? formatDate(item.Actual_Delivery_Date__c, 'numeric-dash') : '-'}>{item.Actual_Delivery_Date__c ? formatDate(item.Actual_Delivery_Date__c, 'numeric-dash') : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={data.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Tracking Info"
                />
            </div>
        </div>
    );
}
