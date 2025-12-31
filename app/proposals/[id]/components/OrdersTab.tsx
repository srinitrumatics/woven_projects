import { Order } from "../types";

interface OrdersTabProps {
    orders: Order[];
    loading: boolean;
}

export default function OrdersTab({ orders, loading }: OrdersTabProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Order Number</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer PO</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">PO Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill To Account</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship To Account</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Drop Ship</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Total Lines</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Shipping</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Tax</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Grand Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Request Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Delivered Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{order.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${order.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                            order.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.customerPO}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.customerPODate}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    <div className="text-sm font-medium">{order.billToAccountName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.billToLocationName}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    <div className="text-sm font-medium">{order.shipToAccountName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.shipToLocationName}</div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${order.dropShip
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
                                    ${order.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
