import { QuoteDebitMemo } from"@/app/quotes/types";
import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from"next/link";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

type SortDirection = 'asc' | 'desc';

interface QuoteDebitMemoSubTabProps {
    memos: QuoteDebitMemo[];
    loading: boolean;
    sortField: keyof QuoteDebitMemo;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteDebitMemo) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteDebitMemoSubTab({
    memos,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteDebitMemoSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteDebitMemo);

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
                    <TableEmptyState message="No records found" description="There are no debit memos associated with this quote." />
                ) : (
                    <>
                        <Table className="table-fixed">
                            <THead>
                                <tr>
                                    <SortableHeader label="Debit Memo"field="memoNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.memoNumber} onResize={onResize} align="left"className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                    <SortableHeader label="Supplier Bill"field="supplierBill"sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierBill} onResize={onResize} align="left" />
                                    <SortableHeader label="Purchase Order"field="purchaseOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Quote"field="customerQuote"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Order"field="customerOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Supplier Credit Memo"field="supplierCredit"sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierCredit} onResize={onResize} align="left" />
                                    <SortableHeader label="Debit to Account"field="debitToAccount"sortConfig={sortConfig} requestSort={requestSort} width={widths.debitToAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Debit to Contact"field="debitToContact"sortConfig={sortConfig} requestSort={requestSort} width={widths.debitToContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Lines"field="totalLines"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Cost"field="totalCost"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                                    <SortableHeader label="Shipping"field="shipping"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Debit Amount"field="totalDebitAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalDebitAmount} onResize={onResize} align="left" />
                                    <SortableHeader label="Issued Date"field="issuedDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Approval Date"field="approvalDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.approvalDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Available Debit Balance"field="availableBalance"sortConfig={sortConfig} requestSort={requestSort} width={widths.availableBalance} onResize={onResize} align="left" />
                                    <SortableHeader label="Settled Date"field="settledDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" />
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedMemos.map((memo) => (
                                    <Tr key={memo.id}>
                                        <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.memoNumber }}>
                                            {/* No direct Debit Memo module listed, but keeping it consistent */}
                                            {memo.memoNumber}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={memo.status} />
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.supplierBill }}>
                                            {memo.supplierBillId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/supplier-bills/${memo.supplierBillId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {memo.supplierBill}
                                                    </Link>
                                                ) : displayCell(memo.supplierBill)
                                            ) : displayCell(memo.supplierBill)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.purchaseOrder }}>
                                            {memo.purchaseOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/purchase-orders/${memo.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {memo.purchaseOrder}
                                                    </Link>
                                                ) : displayCell(memo.purchaseOrder)
                                            ) : displayCell(memo.purchaseOrder)}
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
                                        <Td className="truncate" style={{ width: widths.customerOrder }}>
                                            {memo.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${memo.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {memo.customerOrder}
                                                    </Link>
                                                ) : displayCell(memo.customerOrder)
                                            ) : displayCell(memo.customerOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.supplierCredit }}>{displayCell(memo.supplierCredit)}</Td>
                                        <Td className="truncate" style={{ width: widths.debitToAccount }}>{displayCell(memo.debitToAccount)}</Td>
                                        <Td className="truncate" style={{ width: widths.debitToContact }}>{displayCell(memo.debitToContact)}</Td>
                                        <Td className="truncate" style={{ width: widths.totalLines }}>{formatNumber(memo.totalLines)}</Td>
                                        <Td className="font-bold truncate" style={{ width: widths.totalCost }}>{formatCurrency(memo.totalCost)}</Td>
                                        <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(memo.shipping)}</Td>
                                        <Td className="truncate" style={{ width: widths.totalDebitAmount }}>{formatCurrency(memo.totalDebitAmount)}</Td>
                                        <Td className="truncate" style={{ width: widths.issuedDate }}>{formatDate(memo.issuedDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.approvalDate }}>{formatDate(memo.approvalDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.availableBalance }}>{formatCurrency(memo.availableBalance)}</Td>
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
                    itemName="debit memos"
                />
            </div>
        </div >

    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case"Approved":
            case"Paid":
            case"Posted":
            case"Delivered":
            case"Completed":
            case"Applied":
                return"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case"Open":
            case"Shipped":
            case"Converted":
                return"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case"Pending":
            case"Partial Shipment":
                return"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case"Draft":
                return"bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case"Rejected":
            case"Partial Rejected":
            case"Cancelled":
            case"Canceled":
                return"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case"Expired":
                return"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case"Closed":
                return"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            default:
                return"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
