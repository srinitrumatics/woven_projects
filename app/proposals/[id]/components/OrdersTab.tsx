import Link from "next/link";
import { Order, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";

interface OrdersTabProps {
    orders: Order[];
    loading: boolean;
    sortField: keyof Order;
    sortDirection: SortDirection;
    onSort: (field: keyof Order) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function OrdersTab({ orders, loading, sortField, sortDirection, onSort, widths, onResize }: OrdersTabProps) {

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof Order);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[2800px]">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <SortableHeader label="Customer Order" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} />
                        <SortableHeader label="CPO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} />
                        <SortableHeader label="CPO Date" field="customerPODate" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPODate} onResize={onResize} />
                        <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccountName} onResize={onResize} />
                        <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocationName} onResize={onResize} />
                        <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContactName} onResize={onResize} />
                        <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccountName} onResize={onResize} />
                        <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocationName} onResize={onResize} />
                        <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContactName} onResize={onResize} />
                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} />
                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} />
                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} />
                        <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalShippingCharges} onResize={onResize} />
                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalTaxesAmount} onResize={onResize} />
                        <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} />
                        <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} />
                        <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipDate} onResize={onResize} />
                        <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveredDate} onResize={onResize} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={19} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <p className="text-lg font-medium">No orders found</p>
                                    <p className="text-sm">There are no customer orders associated with this proposal.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium" title={order.name}>
                                    <div className="text-sm font-medium font-mono text-gray-900 dark:text-white line-clamp-2">
                                        {/*<Link href={`/orders/${order.id}`} className="text-primary hover:underline font-semibold">
                                            {order.name}
                                        </Link>*/}
                                        {order.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${order.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                        order.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.customerPO}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.customerPO}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.customerPODate}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.billToAccountName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.billToAccountName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.billToLocationName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.billToLocationName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.billToContactName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.billToContactName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.shipToAccountName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.shipToAccountName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.shipToLocationName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.shipToLocationName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={order.shipToContactName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{order.shipToContactName}</div></td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${order.dropShip
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.dropShip ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                        {order.totalLines}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${order.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${order.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                    ${order.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.requestDate}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.shipDate}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.deliveredDate}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
