import { QuoteCreditMemo } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

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

export default function QuoteCreditMemoSubTab({
    memos,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteCreditMemoSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteCreditMemo);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            {memos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                    <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                    <p className="text-sm truncate" title="There are no credit memos associated with this quote.">There are no credit memos associated with this quote.</p>
                </div>
            ) : (
                <table className="w-full table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Credit Memo" field="memoNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.memoNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Invoice" field="invoice" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoice} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Credit to Account" field="creditToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditToAccount} onResize={onResize} align="left" />
                            <SortableHeader label="Credit to Contact" field="creditToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditToContact} onResize={onResize} align="left" />
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
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {memos.map((memo) => (
                            <tr key={memo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.memoNumber }}>{memo.memoNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${memo.status === 'Applied' ? 'bg-green-100 text-green-800' :
                                        memo.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {memo.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.invoice }}>{memo.invoice}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>{memo.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>{memo.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.creditToAccount }}>{memo.creditToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.creditToContact }}>{memo.creditToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }}>{memo.totalLines}</td>
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
            )}
        </div>
    );
}
