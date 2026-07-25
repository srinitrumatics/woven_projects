import { QuoteCreditMemo } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

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
            <div className="overflow-x-auto py-2">
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
                                            <StatusBadge status={memo.status} />
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.invoice }}>
                                            {memo.invoiceId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/invoices/${memo.invoiceId}`} target="_blank" className="text-primary hover:underline font-medium">
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
                                                    <Link href={`/quotes/${memo.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {memo.customerQuote}
                                                    </Link>
                                                ) : displayCell(memo.customerQuote)
                                            ) : displayCell(memo.customerQuote)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalNumber }}>
                                            {memo.proposalId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/proposals/${memo.proposalId}`} target="_blank" className="text-primary hover:underline font-medium">
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
                                                    <Link href={`/orders/${memo.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
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
