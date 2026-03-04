import { QuoteInvoice } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

type SortDirection = 'asc' | 'desc';

interface QuoteInvoicesSubTabProps {
    invoices: QuoteInvoice[];
    loading: boolean;
    sortField: keyof QuoteInvoice;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteInvoice) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteInvoicesSubTab({
    invoices,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteInvoicesSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteInvoice);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">There are no invoices associated with this quote.</p>

                </div>
            ) : (
                <table className="w-full truncate">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Invoice" field="invoiceNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Sales Order" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                            <SortableHeader label="Bill to Account" field="billToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccount} onResize={onResize} align="left" />
                            <SortableHeader label="Bill to Location" field="billToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocation} onResize={onResize} align="left" />
                            <SortableHeader label="Bill to Contact" field="billToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContact} onResize={onResize} align="left" />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                            <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={onResize} align="left" />
                            <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={onResize} align="left" />
                            <SortableHeader label="Collection Status" field="collectionStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.collectionStatus} onResize={onResize} align="left" />
                            <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalance} onResize={onResize} align="left" />
                            <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfig} requestSort={requestSort} width={widths.daysOutstanding} onResize={onResize} align="left" />
                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.invoiceNumber }}>{invoice.invoiceNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${invoice.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        invoice.status === 'Posted' ? 'bg-blue-100 text-blue-800' :
                                            invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.salesOrder }}>{invoice.salesOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerQuote }}>{invoice.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerOrder }}>{invoice.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerPO }}>{invoice.customerPO}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billToAccount }}>{invoice.billToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billToLocation }}>{invoice.billToLocation}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billToContact }}>{invoice.billToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.totalLines }}>{invoice.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.totalPrice }}>{formatCurrency(invoice.totalPrice)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipping }}>{formatCurrency(invoice.shipping)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.taxes }}>{formatCurrency(invoice.taxes)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium" style={{ width: widths.grandTotal }}>{formatCurrency(invoice.grandTotal)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.issuedDate }}>{formatDate(invoice.issuedDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.paymentTerms }}>{invoice.paymentTerms}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.dueDate }}>{formatDate(invoice.dueDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.collectionStatus }}>{invoice.collectionStatus}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.openBalance }}>{formatCurrency(invoice.openBalance)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.daysOutstanding }}>{invoice.daysOutstanding}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.settledDate }}>{formatDate(invoice.settledDate, 'numeric-dash')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
