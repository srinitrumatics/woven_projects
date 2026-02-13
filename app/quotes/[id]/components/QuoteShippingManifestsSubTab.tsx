import { QuoteShippingManifest } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";

type SortDirection = 'asc' | 'desc';

interface QuoteShippingManifestsSubTabProps {
    manifests: QuoteShippingManifest[];
    loading: boolean;
    sortField: keyof QuoteShippingManifest;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteShippingManifest) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteShippingManifestsSubTab({
    manifests,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteShippingManifestsSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteShippingManifest);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            <table className="w-full whitespace-nowrap">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Shipping Manifest" field="manifestNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.manifestNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                        <SortableHeader label="Sales Order" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                        <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                        <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                        <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                        <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={onResize} align="left" />
                        <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={onResize} align="left" />
                        <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={onResize} align="left" />
                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="center" />
                        <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxCount} onResize={onResize} align="right" />
                        <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxNetWeight} onResize={onResize} align="right" />
                        <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxGrossWeight} onResize={onResize} align="right" />
                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="right" />
                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="right" />
                        <SortableHeader label="Planned Ship Date" field="plannedShipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={onResize} align="left" />
                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={onResize} align="left" />
                        <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={onResize} align="left" />
                        <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" />
                        <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={onResize} align="left" />
                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" />
                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" />
                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" />
                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {manifests.length === 0 ? (
                        <tr>
                            <td colSpan={24} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No Shipping Manifests found</td>
                        </tr>
                    ) : (
                        manifests.map((manifest) => (
                            <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.manifestNumber }}>{manifest.manifestNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${manifest.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        manifest.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                            manifest.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {manifest.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.salesOrder }}>{manifest.salesOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerQuote }}>{manifest.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerOrder }}>{manifest.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerPO }}>{manifest.customerPO}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipToAccount }}>{manifest.shipToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipToLocation }}>{manifest.shipToLocation}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipToContact }}>{manifest.shipToContact}</td>
                                <td className="px-3 py-2 text-sm text-center text-gray-900 dark:text-white" style={{ width: widths.dropShip }}>{manifest.dropShip ? 'Yes' : 'No'}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.boxCount }}>{manifest.boxCount}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.boxNetWeight }}>{manifest.boxNetWeight} kg</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.boxGrossWeight }}>{manifest.boxGrossWeight} kg</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.totalLines }}>{manifest.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.totalPrice }}>${manifest.totalPrice.toFixed(2)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.plannedShipDate }}>{manifest.plannedShipDate}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipConfirmedDate }}>{manifest.shipConfirmedDate}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shippingMethod }}>{manifest.shippingMethod}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.logisticsPartner }}>{manifest.logisticsPartner}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.logisticsContact }}>{manifest.logisticsContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.trackingNumber }}>{manifest.trackingNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.estimatedDeliveryDate }}>{manifest.estimatedDeliveryDate}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.trackingStatus }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${manifest.trackingStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {manifest.trackingStatus}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.actualDeliveryDate }}>{manifest.actualDeliveryDate}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
