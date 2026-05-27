import { QuoteInvoice } from"@/app/quotes/types";
import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from"@/lib/utils/formatting";
import Link from"next/link";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";

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

const ITEMS_PER_PAGE = 10;

export default function QuoteInvoicesSubTab({
    invoices,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteInvoicesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteInvoice);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return invoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [invoices, currentPage]);

    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);

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
                {invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium"title="No records found">No records found</p>
                        <p className="text-sm"title="There are no invoices associated with this quote.">There are no invoices associated with this quote.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full table-fixed">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Invoice"field="invoiceNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceNumber} onResize={onResize} align="left"className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"truncate={false} />
                                    <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Sales Order"field="salesOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Customer Quote"field="customerQuote"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Customer Order"field="customerOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Customer PO"field="customerPO"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Bill to Account"field="billToAccount"sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccount} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Bill to Location"field="billToLocation"sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocation} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Bill to Contact"field="billToContact"sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContact} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Total Lines"field="totalLines"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Total Price"field="totalPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Shipping"field="shipping"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Taxes"field="taxes"sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Grand Total"field="grandTotal"sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Issued Date"field="issuedDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Payment Terms"field="paymentTerms"sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Due Date"field="dueDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Collection Status"field="collectionStatus"sortConfig={sortConfig} requestSort={requestSort} width={widths.collectionStatus} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Open Balance"field="openBalance"sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalance} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Days Outstanding"field="daysOutstanding"sortConfig={sortConfig} requestSort={requestSort} width={widths.daysOutstanding} onResize={onResize} align="left"truncate={false} />
                                    <SortableHeader label="Settled Date"field="settledDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left"truncate={false} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.invoiceNumber }}>
                                            <Link href={`/invoices/${invoice.id}`} target="_blank"className="text-primary hover:underline font-medium">
                                                {invoice.invoiceNumber}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={invoice.status} />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrder }}>
                                            {invoice.salesOrder}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>
                                            {invoice.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${invoice.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {invoice.customerQuote}
                                                    </Link>
                                                ) : invoice.customerQuote
                                            ) : invoice.customerQuote}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>
                                            {invoice.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${invoice.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {invoice.customerOrder}
                                                    </Link>
                                                ) : invoice.customerOrder
                                            ) : invoice.customerOrder}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerPO }}>{invoice.customerPO}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billToAccount }}>{invoice.billToAccount}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billToLocation }}>{invoice.billToLocation}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billToContact }}>{invoice.billToContact}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }}>{invoice.totalLines}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(invoice.totalPrice)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(invoice.shipping)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.taxes }}>{formatCurrency(invoice.taxes)}</td>
                                        <td className="px-3 py-2 text-sm text-primary font-bold truncate" style={{ width: widths.grandTotal }}>{formatCurrency(invoice.grandTotal)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.issuedDate }}>{formatDate(invoice.issuedDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.paymentTerms }}>{invoice.paymentTerms}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.dueDate }}>{formatDate(invoice.dueDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.collectionStatus }}>{invoice.collectionStatus}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.openBalance }}>{formatCurrency(invoice.openBalance)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.daysOutstanding }}>{invoice.daysOutstanding}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.settledDate }}>{formatDate(invoice.settledDate, 'numeric-dash')}</td>
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
                    totalItems={invoices.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="invoices"
                />
            </div>
        </div>
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
