import { QuoteCreditMemo } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";

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
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto py-2">
                {memos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium" title="No records found">No records found</p>
                        <p className="text-sm" title="There are no credit memos associated with this quote.">There are no credit memos associated with this quote.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full table-fixed">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Credit Memo" field="memoNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.memoNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" truncate={false} />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Invoice" field="invoice" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoice} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Credit to Account" field="creditToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditToAccount} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Credit to Contact" field="creditToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditToContact} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCreditAmount} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expirationDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.availableCreditBalance} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" truncate={false} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedMemos.map((memo) => (
                                    <tr key={memo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.memoNumber }}>
                                            {/* No direct Credit Memo module listed, but keeping it consistent */}
                                            {memo.memoNumber}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={memo.status} />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.invoice }}>
                                            {memo.invoiceId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/invoices/${memo.invoiceId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {memo.invoice}
                                                    </Link>
                                                ) : displayCell(memo.invoice)
                                            ) : displayCell(memo.invoice)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>
                                            {memo.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${memo.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {memo.customerQuote}
                                                    </Link>
                                                ) : displayCell(memo.customerQuote)
                                            ) : displayCell(memo.customerQuote)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>

                                            <Link href={`/orders/${memo.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {memo.customerOrder}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.creditToAccount }}>{displayCell(memo.creditToAccount)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.creditToContact }}>{displayCell(memo.creditToContact)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }}>{formatNumber(memo.totalLines)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(memo.totalPrice)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(memo.shipping)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.taxes }}>{formatCurrency(memo.taxes)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.totalCreditAmount }}>{formatCurrency(memo.totalCreditAmount)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.issuedDate }}>{formatDate(memo.issuedDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.expirationDate }}>{formatDate(memo.expirationDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.availableCreditBalance }}>{formatCurrency(memo.availableCreditBalance)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.settledDate }}>{formatDate(memo.settledDate, 'numeric-dash')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
