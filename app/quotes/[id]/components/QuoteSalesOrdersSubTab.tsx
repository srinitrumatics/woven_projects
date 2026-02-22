import { QuoteSalesOrder } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

type SortDirection = 'asc' | 'desc';

interface QuoteSalesOrdersSubTabProps {
    salesOrders: QuoteSalesOrder[];
    loading: boolean;
    sortField: keyof QuoteSalesOrder;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteSalesOrder) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteSalesOrdersSubTab({
    salesOrders,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteSalesOrdersSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteSalesOrder);

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
                        <SortableHeader label="Sales Order" field="salesOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                        <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                        <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                        <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                        <SortableHeader label="Bill to Account" field="billToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccount} onResize={onResize} align="left" />
                        <SortableHeader label="Bill to Location" field="billToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocation} onResize={onResize} align="left" />
                        <SortableHeader label="Bill to Contact" field="billToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContact} onResize={onResize} align="left" />
                        <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={onResize} align="left" />
                        <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={onResize} align="left" />
                        <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={onResize} align="left" />
                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                        <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" />
                        <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} align="left" />
                        <SortableHeader label="Pick Date" field="pickDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.pickDate} onResize={onResize} align="left" />
                        <SortableHeader label="Pick Complete Date" field="pickCompleteDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.pickCompleteDate} onResize={onResize} align="left" />
                        <SortableHeader label="Planned Ship Date" field="plannedShipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={onResize} align="left" />
                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={onResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {salesOrders.length === 0 ? (
                        <tr>
                            <td colSpan={22} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No Sales Orders found</td>
                        </tr>
                    ) : (
                        salesOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.salesOrderNumber }}>{order.salesOrderNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerQuote }}>{order.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerOrder }}>{order.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerPO }}>{order.customerPO}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billToAccount }}>{order.billToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billToLocation }}>{order.billToLocation}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billToContact }}>{order.billToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipToAccount }}>{order.shipToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipToLocation }}>{order.shipToLocation}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipToContact }}>{order.shipToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.dropShip }}>{order.dropShip ? 'Yes' : 'No'}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.totalLines }}>{order.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.totalPrice }}>{formatCurrency(order.totalPrice)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipping }}>{formatCurrency(order.shipping)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.taxes }}>{formatCurrency(order.taxes)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium" style={{ width: widths.grandTotal }}>{formatCurrency(order.grandTotal)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.requestDate }}>{formatDate(order.requestDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.pickDate }}>{formatDate(order.pickDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.pickCompleteDate }}>{formatDate(order.pickCompleteDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.plannedShipDate }}>{formatDate(order.plannedShipDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipConfirmedDate }}>{formatDate(order.shipConfirmedDate, 'numeric-dash')}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
