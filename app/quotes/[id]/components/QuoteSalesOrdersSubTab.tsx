import { QuoteSalesOrder } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto ">
                    {salesOrders.length === 0 ? (
                        <TableEmptyState message="No records found" description="There are no sales orders associated with this quote." />
                    ) : (
                        <>
                            <Table>
                                <THead>
                                    <tr>
                                        <SortableHeader label="Sales Order #" field="salesOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                        <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                        <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" />
                                        <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" />
                                        <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
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
                                        <SortableHeader label="Planned Ship Date" field="plannedShipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={onResize} align="left" />
                                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={onResize} align="left" />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedOrders.map((order) => (
                                        <Tr key={order.id}>
                                            <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.salesOrderNumber }} title={order.salesOrderNumber}>
                                                {order.salesOrderNumber}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.status }}>
                                                <StatusBadge status={order.status} variant="pill" />
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.customerQuote }}>
                                                {order.customerQuoteId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/quotes/${order.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {order.customerQuote}
                                                        </Link>
                                                    ) : displayCell(order.customerQuote)
                                                ) : displayCell(order.customerQuote)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.proposalNumber }}>
                                                {order.proposalId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/proposals/${order.proposalId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {order.proposalNumber}
                                                        </Link>
                                                    ) : displayCell(order.proposalNumber)
                                                ) : displayCell(order.proposalNumber)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.proposalName }}>
                                                {displayCell(order.proposalName)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.customerOrder }}>
                                                {order.customerOrderId ? (
                                                    !isManufacturer && !isRestricted ? (
                                                        <Link href={`/orders/${order.customerOrderId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {order.customerOrder}
                                                        </Link>
                                                    ) : displayCell(order.customerOrder)
                                                ) : displayCell(order.customerOrder)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.customerPO }}>{displayCell(order.customerPO)}</Td>
                                            <Td className="truncate" style={{ width: widths.billToAccount }}>{displayCell(order.billToAccount)}</Td>
                                            <Td className="truncate" style={{ width: widths.billToLocation }}>{displayCell(order.billToLocation)}</Td>
                                            <Td className="truncate" style={{ width: widths.billToContact }}>{displayCell(order.billToContact)}</Td>
                                            <Td className="truncate" style={{ width: widths.shipToAccount }}>{displayCell(order.shipToAccount)}</Td>
                                            <Td className="truncate" style={{ width: widths.shipToLocation }}>{displayCell(order.shipToLocation)}</Td>
                                            <Td className="truncate" style={{ width: widths.shipToContact }}>{displayCell(order.shipToContact)}</Td>
                                            <Td className="truncate" style={{ width: widths.dropShip }}>{order.dropShip ? 'Yes' : 'No'}</Td>
                                            <Td className="truncate" style={{ width: widths.totalLines }}>{formatNumber(order.totalLines)}</Td>
                                            <Td className="font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(order.totalPrice)}</Td>
                                            <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(order.shipping)}</Td>
                                            <Td className="truncate" style={{ width: widths.taxes }}>{formatCurrency(order.taxes)}</Td>
                                            <Td className="text-primary font-bold truncate" style={{ width: widths.grandTotal }}>{formatCurrency(order.grandTotal)}</Td>
                                            <Td className="truncate" style={{ width: widths.requestDate }}>{formatDate(order.requestDate, 'numeric-dash')}</Td>
                                            <Td className="truncate" style={{ width: widths.plannedShipDate }}>{formatDate(order.plannedShipDate, 'numeric-dash')}</Td>
                                            <Td className="truncate" style={{ width: widths.shipConfirmedDate }}>{formatDate(order.shipConfirmedDate, 'numeric-dash')}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>

                        </>
                    )}
                </div>
            </div>
            <div className="px-3 py-2">
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

