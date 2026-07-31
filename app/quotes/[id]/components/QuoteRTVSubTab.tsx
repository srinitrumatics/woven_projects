import { QuoteRTV } from"@/app/quotes/types";
import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from"next/link";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SortDirection = 'asc' | 'desc';

interface QuoteRTVSubTabProps {
    rtvs: QuoteRTV[];
    loading: boolean;
    sortField: keyof QuoteRTV;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteRTV) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteRTVSubTab({
    rtvs,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteRTVSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteRTV);

    const paginatedRTVs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return rtvs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [rtvs, currentPage]);

    const totalPages = Math.ceil(rtvs.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto py-2">
                {rtvs.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no RTVs associated with this quote." />
                ) : (
                    <>
                        <Table>
                            <THead>
                                <tr>
                                    <SortableHeader label="RTV"field="rtvNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvNumber} onResize={onResize} align="left"className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                    <SortableHeader label="Purchase Order"field="purchaseOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Quote"field="customerQuote"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Order"field="customerOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="RTV Type"field="rtvType"sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvType} onResize={onResize} align="left" />
                                    <SortableHeader label="RMA Number"field="rmaNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship from Account"field="shipFromAccount"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship from Contact"field="shipFromContact"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Supplier Name"field="supplierName"sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                                    <SortableHeader label="Supplier Contact"field="supplierContact"sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Lines"field="totalLines"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Cost"field="totalCost"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                                    <SortableHeader label="Issued Date"field="issuedDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Approval Date"field="approvalDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.approvalDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Return by Date"field="returnByDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.returnByDate} onResize={onResize} align="left" />
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedRTVs.map((rtv) => (
                                    <Tr key={rtv.id}>
                                        <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.rtvNumber }}>
                                            {/* No direct RTV module listed, but keeping it consistent */}
                                            {rtv.rtvNumber}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={rtv.status} variant="pill" />
                                        </Td>
                                        <Td className="text-left truncate" style={{ width: widths.purchaseOrder }}>
                                            {rtv.purchaseOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/purchase-orders/${rtv.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rtv.purchaseOrder}
                                                    </Link>
                                                ) : displayCell(rtv.purchaseOrder)
                                            ) : displayCell(rtv.purchaseOrder)}
                                        </Td>
                                        <Td className="text-left truncate" style={{ width: widths.customerQuote }}>
                                            {rtv.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${rtv.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rtv.customerQuote}
                                                    </Link>
                                                ) : displayCell(rtv.customerQuote)
                                            ) : displayCell(rtv.customerQuote)}
                                        </Td>
                                        <Td className="text-left truncate" style={{ width: widths.customerOrder }}>
                                            {rtv.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${rtv.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rtv.customerOrder}
                                                    </Link>
                                                ) : displayCell(rtv.customerOrder)
                                            ) : displayCell(rtv.customerOrder)}
                                        </Td>
                                        <Td className="text-left truncate" style={{ width: widths.rtvType }}>{displayCell(rtv.rtvType)}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.rmaNumber }}>
                                            {/* No direct RMA module listed, but keeping it consistent if we had rmaId */}
                                            {displayCell(rtv.rmaNumber)}
                                        </Td>
                                        <Td className="text-left truncate" style={{ width: widths.shipFromAccount }}>{displayCell(rtv.shipFromAccount)}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.shipFromContact }}>{displayCell(rtv.shipFromContact)}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.supplierName }}>{displayCell(rtv.supplierName)}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.supplierContact }}>{displayCell(rtv.supplierContact)}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.totalLines }}>{formatNumber(rtv.totalLines)}</Td>
                                        <Td className="text-left font-bold truncate" style={{ width: widths.totalCost }}>{formatCurrency(rtv.totalCost)}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.issuedDate }}>{formatDate(rtv.issuedDate, 'numeric-dash')}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.approvalDate }}>{formatDate(rtv.approvalDate, 'numeric-dash')}</Td>
                                        <Td className="text-left truncate" style={{ width: widths.returnByDate }}>{formatDate(rtv.returnByDate, 'numeric-dash')}</Td>
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
                    totalItems={rtvs.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName=""
                />
            </div>
        </div>
    );
}

