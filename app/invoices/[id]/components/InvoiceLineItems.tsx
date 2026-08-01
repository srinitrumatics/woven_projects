import { useState, useMemo } from "react";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency, displayCell } from "@/lib/utils/formatting";
import { InvoiceLine } from "../../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ITEMS_PER_PAGE = 10;

interface InvoiceLineItemsProps {
    lines: InvoiceLine[];
    invoiceId?: string;
    invoiceNumber?: string;
}

export default function InvoiceLineItems({ lines, invoiceId, invoiceNumber }: InvoiceLineItemsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { items: sortedLines, requestSort, sortConfig } = useSortableData<InvoiceLine>(lines, { key: 'invoiceLineName', direction: 'asc' });

    const paginatedLines = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedLines.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedLines, currentPage]);

    const totalPages = Math.ceil(lines.length / ITEMS_PER_PAGE);

    const { widths, handleResize } = useResizableColumns({
        lineName: 160,
        status: 120,
        invoiceNumber: 140,
        salesOrderLine: 160,
        purchaseOrderLine: 160,
        customerQuoteLine: 170,
        proposedProduct: 180,
        product: 200,
        description: 250,
        brand: 180,
        unitPrice: 120,
        quantity: 180,
        totalPrice: 150,
        shipping: 110,
        taxes: 110,
        grandTotal: 140,
        actions: 100
    });

    if (lines.length === 0) {
        return (
            <TableEmptyState message="No invoice lines found" description="There are no items associated with this invoice." />
        );
    }

    return (
        <div className="flex flex-col">
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="table-fixed">
                    <THead>
                        <tr>
                            <SortableHeader label="Invoice Line" field="invoiceLineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                            <Th className="whitespace-nowrap" style={{ width: widths.invoiceNumber }}>Invoice #</Th>
                            <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                            <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                            <SortableHeader label="Proposed Product" field="proposedProduct" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProduct} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.product} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.brand} onResize={handleResize} />
                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                            <SortableHeader label="Total Order Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={handleResize} />
                            <SortableHeader label="Total Price" field="subtotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="shippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                            <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                            <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                            <Th style={{ width: widths.actions }}>Action</Th>
                        </tr>
                        {/* Force minimum height for header to prevent collapse */}
                        <tr aria-hidden="true" className="h-0 border-none"></tr>
                    </THead>
                    <TBody>
                        {paginatedLines.map((line) => (
                            <Tr key={line.id} className="transition-colors">
                                <Td className="font-bold text-left sticky left-0 bg-white dark:bg-gray-800 truncate">
                                    {invoiceId ? (
                                        <Link href={`/invoices/${invoiceId}/lines/${line.id}`} className="text-primary hover:underline truncate block" title={line.invoiceLineName}>
                                            {line.invoiceLineName}
                                        </Link>
                                    ) : (
                                        <span className="text-primary truncate block" title={line.invoiceLineName}>{line.invoiceLineName}</span>
                                    )}
                                </Td>
                                <Td className="text-left truncate">
                                    <StatusBadge status={line.status} variant="compact" />
                                </Td>
                                <Td className="text-left truncate">
                                    {invoiceId ? (
                                        <Link href={`/invoices/${invoiceId}`} className="text-primary hover:underline font-medium">
                                            {displayCell(invoiceNumber)}
                                        </Link>
                                    ) : (
                                        displayCell(invoiceNumber)
                                    )}
                                </Td>
                                <Td className="text-left truncate">
                                    {displayCell(line.salesOrderLine)}
                                </Td>
                                <Td className="text-left truncate">
                                    {displayCell(line.purchaseOrderLine)}
                                </Td>
                                <Td className="text-left truncate">
                                    {line.customerQuoteId && line.customerQuoteLineId ? (
                                        <Link href={`/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {displayCell(line.customerQuoteLineName)}
                                        </Link>
                                    ) : line.customerQuoteId ? (
                                        <Link href={`/quotes/${line.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {displayCell(line.customerQuoteLineName)}
                                        </Link>
                                    ) : (
                                        displayCell(line.customerQuoteLineName)
                                    )}
                                </Td>
                                <Td className="text-left truncate">
                                    {line.proposedProductId ? (
                                        <Link href={`/proposals/${line.proposalId}/lines/${line.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {displayCell(line.proposedProduct)}
                                        </Link>
                                    ) : (
                                        displayCell(line.proposedProduct)
                                    )}
                                </Td>
                                <Td className="font-medium text-left truncate">
                                    <div className="truncate">
                                        {line.productId ? (
                                            <Link href={`/products/${line.productId}`} target="_blank" className="text-primary hover:underline font-medium" title={line.productName} onClick={(e) => e.stopPropagation()}>
                                                {displayCell(line.productName)}
                                            </Link>
                                        ) : (
                                            <span title={line.productName}>{displayCell(line.productName)}</span>
                                        )}
                                    </div>
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 text-left truncate">
                                    <div className="truncate" title={line.description}>{displayCell(line.description)}</div>
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 text-left truncate">
                                    {displayCell(line.brand)}
                                </Td>
                                <Td className="text-left truncate">
                                    {formatCurrency(line.unitPrice)}
                                </Td>
                                <Td className="text-left truncate">
                                    {line.quantity.toFixed(2)}
                                </Td>
                                <Td className="text-left font-bold truncate">
                                    {formatCurrency(line.subtotal)}
                                </Td>
                                <Td className="text-left truncate">
                                    {formatCurrency(line.shippingCharges)}
                                </Td>
                                <Td className="text-left truncate">
                                    {formatCurrency(line.totalTaxesAmount)}
                                </Td>
                                <Td className="text-left min-w-[170px] font-bold text-primary truncate">
                                    {formatCurrency(line.lineGrandTotal)}
                                </Td>
                                <Td className="text-left truncate">
                                    {invoiceId && (
                                        <Link
                                            href={`/invoices/${invoiceId}/lines/${line.id}`}
                                            className="p-1.5 text-gray-400 hover:text-primary transition-colors inline-block"
                                            title="View Line Details"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </Link>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={lines.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemName=""
            />
        </div>
    );
}
