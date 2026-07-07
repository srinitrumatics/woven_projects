import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from"@/lib/utils/formatting";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from"react";
import Link from"next/link";
import { Eye } from "lucide-react";

interface INLI {
    id: string;
    lineName: string;
    status: string;
    invoiceName: string;
    invoiceId: string;
    salesOrderLine: string;
    salesOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    proposedProductName?: string;
    proposedProductId?: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
}

interface QuoteLineInvoiceLinesSubTabProps {
    data: INLI[];
    quoteId: string;
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineInvoiceLinesSubTab({
    data,
    quoteId,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLineInvoiceLinesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [data, currentPage]);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium"title="No records found">No records found</p>
                        <p className="text-sm">There are no invoices associated with this quote line.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader label="Invoice Line"field="lineName"sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" truncate={false}/>
                                <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Invoice #"field="invoiceName"sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceName} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Sales Order Line"field="salesOrderLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Purchase Order Line"field="purchaseOrderLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Customer Quote Line"field="customerQuoteLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Proposed Product"field="proposedProductName"sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProductName} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Product Name"field="productName"sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Product Description"field="description"sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Brand Name"field="brand"sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Unit Price"field="unitPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Total Order Qty"field="totalOrderQty"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Total Price"field="totalPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Shipping"field="shipping"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Taxes"field="taxes"sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} truncate={false} />
                                <SortableHeader label="Line Grand Total"field="grandTotal"sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} truncate={false} />
                                <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white w-[80px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.lineName }}>
                                        {item.invoiceId ? (
                                            <Link href={`/invoices/${item.invoiceId}/lines/${item.id}`} target="_blank" className="text-primary hover:underline font-bold">
                                                {item.lineName}
                                            </Link>
                                        ) : displayCell(item.lineName)}
                                    </td>
                                    <td className="px-3 py-2 text-sm truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.invoiceName }}>
                                        {item.invoiceId ? (
                                            <Link href={`/invoices/${item.invoiceId}`} target="_blank"className="text-primary hover:underline font-medium">
                                                {item.invoiceName}
                                            </Link>
                                        ) : displayCell(item.invoiceName)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrderLine }}>
                                        {displayCell(item.salesOrderLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.purchaseOrderLine }}>
                                        {displayCell(item.purchaseOrderLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuoteLine }}>
                                        {item.customerQuoteLineId ? (
                                            <Link href={`/quotes/${quoteId}/lines/${item.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.customerQuoteLine}
                                            </Link>
                                        ) : displayCell(item.customerQuoteLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.proposedProductName }}>
                                        {item.proposedProductId ? (
                                            <Link href={`/products/${item.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.proposedProductName}
                                            </Link>
                                        ) : displayCell(item.proposedProductName)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.manufacturerDBA }}>{displayCell(item.brand)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.unitPrice }}>{formatCurrency(item.unitPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalOrderQty }}>{item.totalOrderQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(item.totalPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(item.shipping)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.taxes }}>{formatCurrency(item.taxes)}</td>
                                    <td className="px-3 py-2 text-sm font-bold text-primary truncate" style={{ width: widths.grandTotal }}>{formatCurrency(item.grandTotal)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                                        {item.invoiceId ? (
                                            <Link
                                                href={`/invoices/${item.invoiceId}/lines/${item.id}`}
                                                target="_blank"
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full inline-flex items-center justify-center transition-colors"
                                                title="View Line Details"
                                            >
                                                <Eye className="w-5 h-5 text-primary" />
                                            </Link>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={data.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
