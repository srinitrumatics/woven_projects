import { useState, useMemo } from "react";
import Link from "next/link";
import { Order, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";
import { useUserSession } from "../../../../components/UserSessionContext";
import { displayCell } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
    const isRestricted = '';

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
        return <TableLoadingState />;
    }

    if (orders.length === 0) {
        return (
            <TableEmptyState message="No records found" description="There are no customer orders associated with this proposal." />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Customer Order #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                            <SortableHeader label="Customer PO Date" field="customerPODate" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPODate} onResize={onResize} align="left" />
                            <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccountName} onResize={onResize} align="left" />
                            <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocationName} onResize={onResize} align="left" />
                            <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContactName} onResize={onResize} align="left" />
                            <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccountName} onResize={onResize} align="left" />
                            <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocationName} onResize={onResize} align="left" />
                            <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContactName} onResize={onResize} align="left" />
                            <SortableHeader label="Proposal Requested" field="proposalRequested" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalRequested} onResize={onResize} align="left" />
                            <SortableHeader label="Transfer Order" field="transferOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.transferOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalShippingCharges} onResize={onResize} align="left" />
                            <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalTaxesAmount} onResize={onResize} align="left" />
                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" />
                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} />
                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipDate} onResize={onResize} />
                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveredDate} onResize={onResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedOrders.map((order) => (
                            <Tr key={order.id} className="group transition-colors">
                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={order.name}>
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
                                </Td>
                                <Td className="truncate">
                                    <StatusBadge status={order.status} variant="pill" />
                                </Td>
                                <Td className="truncate">
                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerPO}>{displayCell(order.customerPO)}</div>
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.customerPODate)}</Td>
                                <Td className="truncate" title={order.billToAccountName}>{displayCell(order.billToAccountName)}</Td>
                                <Td className="truncate" title={order.billToLocationName}>{displayCell(order.billToLocationName)}</Td>
                                <Td className="truncate" title={order.billToContactName}>{displayCell(order.billToContactName)}</Td>
                                <Td className="truncate" title={order.shipToAccountName}>{displayCell(order.shipToAccountName)}</Td>
                                <Td className="truncate" title={order.shipToLocationName}>{displayCell(order.shipToLocationName)}</Td>
                                <Td className="truncate" title={order.shipToContactName}>{displayCell(order.shipToContactName)}</Td>
                                <Td className="truncate">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${order.proposalRequested
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.proposalRequested ? 'Yes' : 'No'}
                                    </span>
                                </Td>
                                <Td className="truncate">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${order.transferOrder
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.transferOrder ? 'Yes' : 'No'}
                                    </span>
                                </Td>
                                <Td className="truncate">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${order.dropShip
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {order.dropShip ? 'Yes' : 'No'}
                                    </span>
                                </Td>
                                <Td className="truncate">
                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                        {order.totalLines}
                                    </span>
                                </Td>
                                <Td className="truncate font-medium">
                                    ${order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="truncate">
                                    ${order.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="truncate">
                                    ${order.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="font-bold truncate">
                                    ${order.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.requestDate)}</Td>
                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.shipDate)}</Td>
                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.deliveredDate)}</Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
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

