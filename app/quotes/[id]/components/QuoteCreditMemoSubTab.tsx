import { QuoteCreditMemo } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SortDirection = 'asc' | 'desc';

interface QuoteCreditMemoSubTabProps {
    memos: QuoteCreditMemo[];
    loading: boolean;
    sortField: keyof QuoteCreditMemo;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteCreditMemo) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteCreditMemoSubTab({
    memos,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteCreditMemoSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteCreditMemo);

    const paginatedMemos = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return memos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [memos, currentPage]);

    const totalPages = Math.ceil(memos.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {memos.length === 0 ? (
                        <TableEmptyState message="No records found" description="There are no credit memos associated with this quote." />
                    ) : (
                        <>
                            <Table className="table-fixed">
                                <THead>
                                    <tr>
                                        <SortableHeader label="Credit Memo #" field="memoNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.memoNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                        <SortableHeader label="Invoice #" field="invoice" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoice} onResize={onResize} align="left" />
                                        <SortableHeader label="Sales Order #" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                                        <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                        <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" />
                                        <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" />
                                        <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                                        <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCreditAmount} onResize={onResize} align="left" />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                        <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expirationDate} onResize={onResize} align="left" />
                                        <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.availableCreditBalance} onResize={onResize} align="left" />
                                        <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedMemos.map((memo) => (
                                        <Tr key={memo.id}>
                                            <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.memoNumber }}>
                                                {/* No direct Credit Memo module listed, but keeping it consistent */}
                                                {memo.memoNumber}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.status }}>
                                                <StatusBadge status={memo.status} variant="pill" />
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.invoice }}>
                                                {memo.invoiceId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/invoices/${memo.invoiceId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {memo.invoice}
                                                        </Link>
                                                    ) : displayCell(memo.invoice)
                                                ) : displayCell(memo.invoice)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.salesOrder }}>
                                                {displayCell(memo.salesOrder)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.customerQuote }}>
                                                {memo.customerQuoteId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/quotes/${memo.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {memo.customerQuote}
                                                        </Link>
                                                    ) : displayCell(memo.customerQuote)
                                                ) : displayCell(memo.customerQuote)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.proposalNumber }}>
                                                {memo.proposalId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/proposals/${memo.proposalId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {memo.proposalNumber}
                                                        </Link>
                                                    ) : displayCell(memo.proposalNumber)
                                                ) : displayCell(memo.proposalNumber)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.proposalName }}>
                                                {displayCell(memo.proposalName)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.customerOrder }}>
                                                {memo.customerOrderId ? (
                                                    !isManufacturer && !isRestricted ? (
                                                        <Link href={`/orders/${memo.customerOrderId}`} target="_blank" className="text-primary hover:underline font-semibold">
                                                            {memo.customerOrder}
                                                        </Link>
                                                    ) : displayCell(memo.customerOrder)
                                                ) : displayCell(memo.customerOrder)}
                                            </Td>
                                            <Td className="truncate" style={{ width: widths.totalLines }}>{formatNumber(memo.totalLines)}</Td>
                                            <Td className="text-left font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(memo.totalPrice)}</Td>
                                            <Td className="text-left truncate" style={{ width: widths.shipping }}>{formatCurrency(memo.shipping)}</Td>
                                            <Td className="text-left truncate" style={{ width: widths.taxes }}>{formatCurrency(memo.taxes)}</Td>
                                            <Td className="text-left truncate" style={{ width: widths.totalCreditAmount }}>{formatCurrency(memo.totalCreditAmount)}</Td>
                                            <Td className="truncate" style={{ width: widths.issuedDate }}>{formatDate(memo.issuedDate, 'numeric-dash')}</Td>
                                            <Td className="truncate" style={{ width: widths.expirationDate }}>{formatDate(memo.expirationDate, 'numeric-dash')}</Td>
                                            <Td className="text-left truncate" style={{ width: widths.availableCreditBalance }}>{formatCurrency(memo.availableCreditBalance)}</Td>
                                            <Td className="truncate" style={{ width: widths.settledDate }}>{formatDate(memo.settledDate, 'numeric-dash')}</Td>
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
                    totalItems={memos.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="credit memos"
                />
            </div>
        </div>
    );
}

