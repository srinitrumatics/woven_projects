import { useState, useMemo } from "react";
import Link from "next/link";
import { Order, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";
import { useUserSession } from "../../../../components/UserSessionContext";
import { displayCell } from "@/lib/utils/formatting";

const ITEMS_PER_PAGE = 10;

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
    const [currentPage, setCurrentPage] = useState(1);
    const { selectedAccount } = useUserSession();
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => {
        onSort(key as keyof Order);
        setCurrentPage(1);
    };

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [orders, currentPage]);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium" title="No records found">No records found</p>
                <p className="text-sm" title="There are no customer orders associated with this proposal.">There are no customer orders associated with this proposal.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Customer Order" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" truncate={false} />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="CPO Date" field="customerPODate" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPODate} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccountName} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocationName} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContactName} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccountName} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocationName} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContactName} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalShippingCharges} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalTaxesAmount} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" truncate={false} />
                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} truncate={false} />
                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipDate} onResize={onResize} truncate={false} />
                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveredDate} onResize={onResize} truncate={false} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={order.name}>
                                    {!isRestricted && order.id ? (
                                        <Link
                                            href={`/orders/${order.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold text-primary hover:underline truncate inline-block w-full"
                                        >
                                            {order.name}
                                        </Link>
                                    ) : (
                                        <span className="text-sm font-semibold truncate">{order.name}</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 truncate">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerPO}>{displayCell(order.customerPO)}</div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.customerPODate)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToAccountName}>{displayCell(order.billToAccountName)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToLocationName}>{displayCell(order.billToLocationName)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToContactName}>{displayCell(order.billToContactName)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToAccountName}>{displayCell(order.shipToAccountName)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToLocationName}>{displayCell(order.shipToLocationName)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToContactName}>{displayCell(order.shipToContactName)}</td>
                                <td className="px-3 py-2 truncate">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${order.dropShip
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.dropShip ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                        {order.totalLines}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                    ${order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    ${order.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    ${order.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">
                                    ${order.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.requestDate)}</td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.shipDate)}</td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.deliveredDate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={orders.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Draft":
            case "Submitted":
            case "Open":
            case "Closed":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "In Progress":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Completed":
            case "Approved":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Cancelled":
            case "Canceled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
