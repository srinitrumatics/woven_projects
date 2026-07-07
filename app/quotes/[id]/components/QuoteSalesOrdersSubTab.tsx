import { QuoteSalesOrder } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";

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

const ITEMS_PER_PAGE = 10;

export default function QuoteSalesOrdersSubTab({
    salesOrders,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteSalesOrdersSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = '';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteSalesOrder);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return salesOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [salesOrders, currentPage]);

    const totalPages = Math.ceil(salesOrders.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto py-2">
                {salesOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium" title="No records found">No records found</p>
                        <p className="text-sm" title="There are no sales orders associated with this quote.">There are no sales orders associated with this quote.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Sales Order #" field="salesOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" truncate={false} />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Proposal #" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Bill to Account" field="billToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccount} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Bill to Location" field="billToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocation} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Bill to Contact" field="billToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContact} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Planned Ship Date" field="plannedShipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={onResize} align="left" truncate={false} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.salesOrderNumber }} title={order.salesOrderNumber}>
                                            {order.salesOrderNumber}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>
                                            {order.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${order.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {order.customerQuote}
                                                    </Link>
                                                ) : displayCell(order.customerQuote)
                                            ) : displayCell(order.customerQuote)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.proposalNumber }}>
                                            {order.proposalId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/proposals/${order.proposalId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {order.proposalName}
                                                    </Link>
                                                ) : displayCell(order.proposalName)
                                            ) : displayCell(order.proposalName)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.proposalName }}>
                                            {displayCell(order.proposalName)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>
                                            {order.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${order.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {order.customerOrder}
                                                    </Link>
                                                ) : displayCell(order.customerOrder)
                                            ) : displayCell(order.customerOrder)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerPO }}>{displayCell(order.customerPO)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billToAccount }}>{displayCell(order.billToAccount)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billToLocation }}>{displayCell(order.billToLocation)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billToContact }}>{displayCell(order.billToContact)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipToAccount }}>{displayCell(order.shipToAccount)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipToLocation }}>{displayCell(order.shipToLocation)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipToContact }}>{displayCell(order.shipToContact)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.dropShip }}>{order.dropShip ? 'Yes' : 'No'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }}>{formatNumber(order.totalLines)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(order.totalPrice)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(order.shipping)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.taxes }}>{formatCurrency(order.taxes)}</td>
                                        <td className="px-3 py-2 text-sm text-primary font-bold truncate" style={{ width: widths.grandTotal }}>{formatCurrency(order.grandTotal)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.requestDate }}>{formatDate(order.requestDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.plannedShipDate }}>{formatDate(order.plannedShipDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipConfirmedDate }}>{formatDate(order.shipConfirmedDate, 'numeric-dash')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </>
                )}
            </div>
            <div className="PX-3 Py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={salesOrders.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="sales orders"
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Paid":
            case "Posted":
            case "Delivered":
            case "Completed":
            case "Applied":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Open":
            case "Shipped":
            case "Converted":
            case "Allocated":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Pending":
            case "Partial Shipment":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Draft":
                return "bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "Rejected":
            case "Partial Rejected":
            case "Cancelled":
            case "Canceled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Closed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
