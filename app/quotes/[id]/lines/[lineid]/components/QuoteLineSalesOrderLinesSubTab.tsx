import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

interface SOLI {
    id: string;
    lineName: string;
    status: string;
    salesOrderName: string;
    salesOrderId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    proposedProductName?: string;
    proposedProductId?: string;
    proposalId?: string;
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
    qtyShipped: number;
}

interface QuoteLineSalesOrderLinesSubTabProps {
    data: SOLI[];
    quoteId: string;
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineSalesOrderLinesSubTab({
    data,
    quoteId,
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
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no sales orders associated with this quote line." />
                ) : (
                    <Table className="text-sm table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader label="Sales Order Line" field="lineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderName} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Proposed Product" field="proposedProductName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProductName} onResize={handleResize} />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                                <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={handleResize} />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedData.map((item) => (
                                <Tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                                    <Td className="sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.lineName }}>{displayCell(item.lineName)}</Td>
                                    <Td className="truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.salesOrderName }}>
                                        {displayCell(item.salesOrderName)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerQuoteLine }}>
                                        {item.customerQuoteLineId ? (
                                            <Link href={`/quotes/${quoteId}/lines/${item.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.customerQuoteLine}
                                            </Link>
                                        ) : displayCell(item.customerQuoteLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.proposedProductName }}>
                                        {item.proposedProductId ? (
                                            <Link href={`/proposals/${item.proposalId}/lines/${item.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.proposedProductName}
                                            </Link>
                                        ) : displayCell(item.proposedProductName)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</Td>
                                    <Td className="truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</Td>
                                    <Td className="truncate" style={{ width: widths.brand }}>{displayCell(item.brand)}</Td>
                                    <Td className="truncate" style={{ width: widths.unitPrice }}>{formatCurrency(item.unitPrice)}</Td>
                                    <Td className="truncate" style={{ width: widths.totalOrderQty }}>{item.totalOrderQty}</Td>
                                    <Td className="font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(item.totalPrice)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(item.shipping)}</Td>
                                    <Td className="truncate" style={{ width: widths.taxes }}>{formatCurrency(item.taxes)}</Td>
                                    <Td className="font-bold text-primary truncate" style={{ width: widths.grandTotal }}>{formatCurrency(item.grandTotal)}</Td>
                                    <Td className="truncate" style={{ width: widths.qtyShipped }}>{item.qtyShipped}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </div>
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

