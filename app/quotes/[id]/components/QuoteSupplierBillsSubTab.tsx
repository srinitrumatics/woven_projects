import { QuoteSupplierBill, QuoteStatus } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";

type SortDirection = 'asc' | 'desc';

interface QuoteSupplierBillsSubTabProps {
    bills: QuoteSupplierBill[];
    loading: boolean;
    sortField: keyof QuoteSupplierBill;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteSupplierBill) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteSupplierBillsSubTab({
    bills,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteSupplierBillsSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteSupplierBill);

    const paginatedBills = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return bills.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [bills, currentPage]);

    const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            {bills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                    <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                    <p className="text-sm truncate" title="There are no supplier bills associated with this quote.">There are no supplier bills associated with this quote.</p>
                </div>
            ) : (
                <>
                    <table className="w-full truncate">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader label="Bill Number" field="billNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.billNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                <SortableHeader label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                                <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                                <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierDBA} onResize={onResize} align="left" />
                                <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                                <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                                <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={onResize} align="left" />
                                <SortableHeader label="Billed Date" field="billedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.billedDate} onResize={onResize} align="left" />
                                <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={onResize} align="left" />
                                <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={onResize} align="left" />
                                <SortableHeader label="Remittance Status" field="remittanceStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.remittanceStatus} onResize={onResize} align="left" />
                                <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalance} onResize={onResize} align="left" />
                                <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfig} requestSort={requestSort} width={widths.daysOutstanding} onResize={onResize} align="left" />
                                <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedBills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.billNumber }}>
                                        <Link href={`/supplier-bills/${bill.id}`} target="_blank" className="text-primary hover:underline font-medium">
                                            {bill.billNumber}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                        <StatusBadge status={bill.status as QuoteStatus} />
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.purchaseOrder }}>
                                        {bill.purchaseOrderId ? (
                                            <Link href={`/purchase-orders/${bill.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {bill.purchaseOrder}
                                            </Link>
                                        ) : bill.purchaseOrder}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>
                                        {bill.customerQuoteId ? (
                                            <Link href={`/quotes/${bill.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {bill.customerQuote}
                                            </Link>
                                        ) : bill.customerQuote}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>
                                        {bill.customerOrderId ? (
                                            <Link href={`/orders/${bill.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {bill.customerOrder}
                                            </Link>
                                        ) : bill.customerOrder}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierName }}>{bill.supplierName}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierDBA }}>{bill.supplierDBA}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierContact }}>{bill.supplierContact}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate" style={{ width: widths.totalLines }}>{bill.totalLines}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalCost }}>{formatCurrency(bill.totalCost)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(bill.shipping)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold text-primary truncate" style={{ width: widths.totalAmount }}>{formatCurrency(bill.totalAmount)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billedDate }}>{formatDate(bill.billedDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.paymentTerms }}>{bill.paymentTerms}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.dueDate }}>{formatDate(bill.dueDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.remittanceStatus }}>{bill.remittanceStatus}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.openBalance }}>{formatCurrency(bill.openBalance)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate" style={{ width: widths.daysOutstanding }}>{bill.daysOutstanding}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.settledDate }}>{formatDate(bill.settledDate, 'numeric-dash')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Draft":
                return "bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "Rejected":
            case "Canceled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Converted":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Shipped":
                return "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
            case "Partial Shipment":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
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
