import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import Link from "next/link";

interface SOLI {
    id: string;
    lineName: string;
    status: string;
    salesOrderName: string;
    salesOrderId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
    qtyPicked: number;
    backOrderQty: number;
    qtyShipped: number;
}

interface QuoteLineSalesOrderLinesSubTabProps {
    data: SOLI[];
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineSalesOrderLinesSubTab({
    data,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLineSalesOrderLinesSubTabProps) {
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
                        <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                        <p className="text-sm truncate">There are no sales orders associated with this quote line.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader label="Sales Order Line" field="lineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderName} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                                <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                <SortableHeader label="Qty Picked" field="qtyPicked" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyPicked} onResize={handleResize} />
                                <SortableHeader label="Back Order Qty" field="backOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.backOrderQty} onResize={handleResize} />
                                <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={handleResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate sticky left-0 bg-white dark:bg-gray-800 font-bold" style={{ width: widths.lineName }}>{item.lineName}</td>
                                    <td className="px-3 py-2 text-sm truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 truncate">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrderName }}>
                                        {item.salesOrderName}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuoteLine }}>
                                        {item.customerQuoteLine}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.productName }}>{item.productName}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.description }} title={item.description}>{item.description}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.manufacturerDBA }}>{item.manufacturerDBA}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.unitPrice }}>{formatCurrency(item.unitPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalOrderQty }}>{item.totalOrderQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold" style={{ width: widths.totalPrice }}>{formatCurrency(item.totalPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(item.shipping)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.taxes }}>{formatCurrency(item.taxes)}</td>
                                    <td className="px-3 py-2 text-sm font-bold text-primary truncate" style={{ width: widths.grandTotal }}>{formatCurrency(item.grandTotal)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.qtyPicked }}>{item.qtyPicked}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.backOrderQty }}>{item.backOrderQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.qtyShipped }}>{item.qtyShipped}</td>
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

