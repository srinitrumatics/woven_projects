import { CreditMemo } from "../../types";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

interface InvoiceCreditsProps {
    credits: CreditMemo[];
}

export default function InvoiceCredits({ credits }: InvoiceCreditsProps) {
    const { items: sortedCredits, requestSort, sortConfig } = useSortableData<CreditMemo>(credits);
    const { widths, handleResize } = useResizableColumns({
        name: 180,
        status: 120,
        invoiceName: 160,
        customerQuote: 180,
        customerOrder: 180,
        creditAccount: 200,
        creditContact: 180,
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
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg mb-2">No credits found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">

            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Credit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceName} onResize={handleResize} />
                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={handleResize} />
                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                        <SortableHeader label="Credit to Account" field="creditToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditAccount} onResize={handleResize} />
                        <SortableHeader label="Credit to Contact" field="creditToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditContact} onResize={handleResize} />
                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                        <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCredit} onResize={handleResize} />
                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={handleResize} />
                        <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expirationDate} onResize={handleResize} />
                        <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.balance} onResize={handleResize} />
                        <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={handleResize} />
                    </tr>
                    <tr aria-hidden="true" className="h-0 border-none"></tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedCredits.map((cm) => (
                        <tr key={cm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-3 py-2 text-sm text-primary font-medium sticky left-0 bg-white dark:bg-gray-800 whitespace-nowrap">
                                {cm.name}
                            </td>
                            <td className="px-3 py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${cm.status === 'Posted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {cm.status}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {cm.invoiceName}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {cm.customerQuoteName}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {cm.customerOrderName}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {cm.creditToAccountName}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {cm.creditToContactName}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-center">
                                {cm.totalLines}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold">
                                {formatCurrency(cm.totalPrice)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {formatCurrency(cm.taxes)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {formatCurrency(cm.shipping)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold text-primary min-w-[160px]">
                                {formatCurrency(cm.totalCreditAmount)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {formatDate(cm.issuedDate, 'numeric-dash')}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {formatDate(cm.expirationDate, 'numeric-dash')}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold">
                                {formatCurrency(cm.availableCreditBalance)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {formatDate(cm.settledDate, 'numeric-dash')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
