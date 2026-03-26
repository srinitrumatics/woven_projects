import { QuotePurchase } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

type SortDirection = 'asc' | 'desc';

interface QuotePurchasesSubTabProps {
    purchases: QuotePurchase[];
    loading: boolean;
    sortField: keyof QuotePurchase;
    sortDirection: SortDirection;
    onSort: (field: keyof QuotePurchase) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuotePurchasesSubTab({
    purchases,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuotePurchasesSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuotePurchase);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            {purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                    <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                    <p className="text-sm truncate" title="There are no purchases associated with this quote.">There are no purchases associated with this quote.</p>
                </div>
            ) : (
                <table className="w-full truncate">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Purchase Order" field="purchaseOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierDBA} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                            <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={onResize} align="left" />
                            <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={onResize} align="left" />
                            <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={onResize} align="left" />
                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                            <SortableHeader label="Product Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                            <SortableHeader label="Acknowledged Date" field="acknowledgedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.acknowledgedDate} onResize={onResize} align="left" />
                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} align="left" />
                            <SortableHeader label="Promise Date" field="promiseDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.promiseDate} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={onResize} align="left" />
                            <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" />
                            <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={onResize} align="left" />
                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" />
                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" />
                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" />
                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" />
                            <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={onResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {purchases.map((po) => (
                            <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.purchaseOrderNumber }}>{po.purchaseOrderNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${po.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        po.status === 'Issued' ? 'bg-blue-100 text-blue-800' :
                                            po.status === 'Received' ? 'bg-green-100 text-green-800' :
                                                'bg-white text-gray-800 border border-gray-200'
                                        }`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>{po.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>{po.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerPO }}>{po.customerPO}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierName }}>{po.supplierName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierDBA }}>{po.supplierDBA}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierContact }}>{po.supplierContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipToAccount }}>{po.shipToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipToLocation }}>{po.shipToLocation}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate" style={{ width: widths.shipToContact }}>{po.shipToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate" style={{ width: widths.dropShip }}>{po.dropShip ? 'Yes' : 'No'}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate" style={{ width: widths.totalLines }}>{po.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.productCost }}>{formatCurrency(po.productCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(po.shipping)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold text-primary truncate" style={{ width: widths.totalCost }}>{formatCurrency(po.totalCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.issuedDate }}>{formatDate(po.issuedDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.acknowledgedDate }}>{formatDate(po.acknowledgedDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.requestDate }}>{formatDate(po.requestDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.promiseDate }}>{formatDate(po.promiseDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shippingMethod }}>{po.shippingMethod}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.logisticsPartner }}>{po.logisticsPartner}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.logisticsContact }}>{po.logisticsContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingNumber }}>{po.trackingNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.estimatedDeliveryDate }}>{formatDate(po.estimatedDeliveryDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingStatus }}>{po.trackingStatus}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.actualDeliveryDate }}>{formatDate(po.actualDeliveryDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.goodsReceiptDate }}>{formatDate(po.goodsReceiptDate, 'numeric-dash')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
