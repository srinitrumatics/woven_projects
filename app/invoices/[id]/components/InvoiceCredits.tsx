import { useState, useMemo } from "react";
import { CreditMemo } from "../../types";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

interface InvoiceCreditsProps {
    credits: CreditMemo[];
}

export default function InvoiceCredits({ credits }: InvoiceCreditsProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedCredits, requestSort, sortConfig } = useSortableData<CreditMemo>(credits, { key: 'name', direction: 'asc' });

    const paginatedCredits = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedCredits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedCredits, currentPage]);

    const totalPages = Math.ceil(credits.length / ITEMS_PER_PAGE);

    const { widths, handleResize } = useResizableColumns({
        name: 180,
        status: 120,
        invoiceNumber: 140,
        salesOrder: 150,
        customerQuote: 180,
        proposal: 150,
        proposalName: 180,
        customerOrder: 180,
        totalLines: 120,
        totalPrice: 140,
        shipping: 140,
        taxes: 140,
        totalCredit: 180,
        issuedDate: 150,
        expirationDate: 150,
        balance: 200,
        settledDate: 150
    });

    if (credits.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg truncate" title="No record found">No record found</p>
                <p className="text-sm truncate" title="There are no credit memos associated with this invoice.">There are no credit memos associated with this invoice.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Credit Memo #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                            <SortableHeader label="Invoice #" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceNumber} onResize={handleResize} />
                            <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={handleResize} />
                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Proposal #" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposal} onResize={handleResize} />
                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                            <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                            <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCredit} onResize={handleResize} />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={handleResize} />
                            <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expirationDate} onResize={handleResize} />
                            <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.balance} onResize={handleResize} />
                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={handleResize} />
                        </tr>
                        <tr aria-hidden="true" className="h-0 border-none"></tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedCredits.map((cm) => (
                            <tr key={cm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-3 py-2 text-sm font-medium sticky left-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white truncate">
                                    {displayCell(cm.name)}
                                </td>
                                <td className="px-3 py-2 truncate">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${cm.status === 'Posted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {cm.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {displayCell(cm.invoiceName)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {displayCell(cm.salesOrderName)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">
                                    {cm.customerQuoteId && cm.customerQuoteId !== 'N/A' && cm.customerQuoteId !== '' ? (
                                        <Link href={`/quotes/${cm.customerQuoteId}`} target='_blank' className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {cm.customerQuoteName && cm.customerQuoteName !== 'N/A' ? cm.customerQuoteName : cm.customerQuoteId}
                                        </Link>
                                    ) : (
                                        displayCell(cm.customerQuoteName)
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">
                                    {cm.proposalId ? (
                                        <Link href={`/proposals/${cm.proposalId}`} target='_blank' className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {displayCell(cm.proposalName)}
                                        </Link>
                                    ) : (
                                        displayCell(cm.proposalName)
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {displayCell(cm.proposalName)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">
                                    {cm.customerOrderId && cm.customerOrderId !== 'N/A' && cm.customerOrderId !== '' ? (
                                        <Link href={`/orders/${cm.customerOrderId}`} target='_blank' className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {cm.customerOrderName && cm.customerOrderName !== 'N/A' ? cm.customerOrderName : cm.customerOrderId}
                                        </Link>
                                    ) : (
                                        displayCell(cm.customerOrderName)
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-center truncate">
                                    {formatNumber(cm.totalLines)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate">
                                    {formatCurrency(cm.totalPrice)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {formatCurrency(cm.shipping)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {formatCurrency(cm.taxes)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold text-primary min-w-[160px] truncate">
                                    {formatCurrency(cm.totalCreditAmount)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {formatDate(cm.issuedDate, 'numeric-dash')}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {formatDate(cm.expirationDate, 'numeric-dash')}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate">
                                    {formatCurrency(cm.availableCreditBalance)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    {formatDate(cm.settledDate, 'numeric-dash')}
                                </td>
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
                    totalItems={credits.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
