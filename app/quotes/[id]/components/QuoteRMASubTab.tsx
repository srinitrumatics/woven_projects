import { QuoteRMA } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

type SortDirection = 'asc' | 'desc';

interface QuoteRMASubTabProps {
    rmas: QuoteRMA[];
    loading: boolean;
    sortField: keyof QuoteRMA;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteRMA) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteRMASubTab({
    rmas,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteRMASubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteRMA);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            {rmas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                    <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                    <p className="text-sm truncate" title="There are no RMAs associated with this quote.">There are no RMAs associated with this quote.</p>
                </div>
            ) : (
                <table className="w-full truncate">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="RMA" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Sales Order" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                            <SortableHeader label="RMA Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaType} onResize={onResize} align="left" />
                            <SortableHeader label="Ship from Account" field="shipFromAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromAccount} onResize={onResize} align="left" />
                            <SortableHeader label="Ship from Contact" field="shipFromContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromContact} onResize={onResize} align="left" />
                            <SortableHeader label="Return to Account" field="returnToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnToAccount} onResize={onResize} align="left" />
                            <SortableHeader label="Return to Contact" field="returnToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnToContact} onResize={onResize} align="left" />
                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                            <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnByDate} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={onResize} align="left" />
                            <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" />
                            <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={onResize} align="left" />
                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" />
                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" />
                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" />
                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" />
                            <SortableHeader label="Goods Receipts Date" field="goodsReceiptsDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptsDate} onResize={onResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rmas.map((rma) => (
                            <tr key={rma.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.rmaNumber }} title={rma.rmaNumber}>{rma.rmaNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${rma.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        rma.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {rma.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrder }} title={rma.salesOrder}>{rma.salesOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }} title={rma.customerQuote}>{rma.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }} title={rma.customerOrder}>{rma.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.rmaType }} title={rma.rmaType}>{rma.rmaType}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipFromAccount }} title={rma.shipFromAccount}>{rma.shipFromAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipFromContact }} title={rma.shipFromContact}>{rma.shipFromContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnToAccount }} title={rma.returnToAccount}>{rma.returnToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnToContact }} title={rma.returnToContact}>{rma.returnToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.dropShip }} title={rma.dropShip ? 'Yes' : 'No'}>{rma.dropShip ? 'Yes' : 'No'}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }} title={String(rma.totalLines)}>{rma.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold" style={{ width: widths.totalPrice }} title={formatCurrency(rma.totalPrice)}>{formatCurrency(rma.totalPrice)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.issuedDate }} title={formatDate(rma.issuedDate, 'numeric-dash')}>{formatDate(rma.issuedDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnByDate }} title={formatDate(rma.returnByDate, 'numeric-dash')}>{formatDate(rma.returnByDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shippingMethod }} title={rma.shippingMethod}>{rma.shippingMethod}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.logisticsPartner }} title={rma.logisticsPartner}>{rma.logisticsPartner}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.logisticsContact }} title={rma.logisticsContact}>{rma.logisticsContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingNumber }} title={rma.trackingNumber}>{rma.trackingNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.estimatedDeliveryDate }} title={formatDate(rma.estimatedDeliveryDate, 'numeric-dash')}>{formatDate(rma.estimatedDeliveryDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingStatus }} title={rma.trackingStatus}>{rma.trackingStatus}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.actualDeliveryDate }} title={formatDate(rma.actualDeliveryDate, 'numeric-dash')}>{formatDate(rma.actualDeliveryDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.goodsReceiptsDate }} title={formatDate(rma.goodsReceiptsDate, 'numeric-dash')}>{formatDate(rma.goodsReceiptsDate, 'numeric-dash')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
