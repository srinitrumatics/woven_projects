import Link from "next/link";
import { formatCurrency, displayCell } from "@/lib/utils/formatting";
import { QuoteLine, QuoteStatus } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";


interface QuoteLinesTabProps {
    products: QuoteLine[];
    quoteId: string;
    loading: boolean;
    sortField: keyof QuoteLine;
    sortDirection: 'asc' | 'desc';
    onSort: (field: keyof QuoteLine) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLinesTab({
    products,
    quoteId,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteLinesTabProps): JSX.Element {
    const [currentPage, setCurrentPage] = useState(1);
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteLine);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, currentPage]);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    if (products.length === 0) {
        return <TableEmptyState message="No records found" description="There are no quote lines listed in this quote." />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto py-2">
                <Table className="table-fixed">
                    <THead>
                        <tr>
                            <SortableHeader label="Customer Quote Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.Name} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Proposed Product" field="proposedProductName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProductName} onResize={onResize} align="left" />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={onResize} align="left" />
                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} align="left" />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={onResize} align="left" />
                            <SortableHeader label="Grouping" field="grouping" sortConfig={sortConfig} requestSort={requestSort} width={widths.grouping} onResize={onResize} align="left" />
                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} align="left" />
                            <SortableHeader label="Total Order Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={onResize} align="left" />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                            <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineGrandTotal} onResize={onResize} align="left" />
                            <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={onResize} align="left" />
                            <Th className="text-center w-[80px]">Action</Th>
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedProducts.map((line) => (
                            <Tr key={line.id}>
                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" style={{ width: widths.Name }}>
                                    <Link
                                        href={`/quotes/${quoteId}/lines/${line.id}`}
                                        className="text-primary font-medium hover:underline"
                                        title={line.Name}
                                    >
                                        {line.Name}
                                    </Link>
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.status }}>
                                    <StatusBadge status={line.status as QuoteStatus} variant="pill" />
                                </Td>
                                <Td className="min-w-[160px] truncate" style={{ width: widths.proposedProductName }} title={line.proposedProductName}>
                                    {line.proposedProductId ? (
                                        <Link href={`/proposals/${line.proposalId}/lines/${line.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium">
                                            {line.proposedProductName}
                                        </Link>
                                    ) : displayCell(line.proposedProductName)}
                                </Td>
                                <Td className="min-w-[160px] truncate" style={{ width: widths.productName }} title={line.productName}>
                                    {line.productId ? (
                                        <Link href={`/products/${line.productId}`} target="_blank" className="text-primary hover:underline font-medium">
                                            {line.productName}
                                        </Link>
                                    ) : displayCell(line.productName)}
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 min-w-[160px] truncate" style={{ width: widths.description }} title={line.description}>
                                    {displayCell(line.description)}
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 min-w-[160px] truncate" style={{ width: widths.manufacturerDBA }} title={line.brand}>
                                    {displayCell(line.brand)}
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 min-w-[160px] truncate" style={{ width: widths.grouping }} title={line.grouping}>
                                    {displayCell(line.grouping)}
                                </Td>
                                <Td className="truncate" style={{ width: widths.unitPrice }} title={formatCurrency(line.unitPrice)}>
                                    {formatCurrency(line.unitPrice)}
                                </Td>
                                <Td className="truncate" style={{ width: widths.quantity }} title={String(line.quantity)}>
                                    {line.quantity}
                                </Td>
                                <Td className="truncate" style={{ width: widths.totalPrice }} title={formatCurrency(line.totalPrice)}>
                                    {formatCurrency(line.totalPrice)}
                                </Td>
                                <Td className="truncate" style={{ width: widths.shipping }} title={formatCurrency(line.shipping)}>
                                    {formatCurrency(line.shipping)}
                                </Td>
                                <Td className="truncate" style={{ width: widths.taxes }} title={formatCurrency(line.taxes)}>
                                    {formatCurrency(line.taxes)}
                                </Td>
                                <Td className="truncate" style={{ width: widths.lineGrandTotal }} title={formatCurrency(line.lineGrandTotal)}>
                                    {formatCurrency(line.lineGrandTotal)}
                                </Td>
                                <Td className="truncate" style={{ width: widths.qtyShipped }} title={String(line.qtyShipped)}>
                                    {line.qtyShipped}
                                </Td>
                                <Td className="text-gray-600 dark:text-gray-400 text-center">
                                    <Link
                                        href={`/quotes/${quoteId}/lines/${line.id}`}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full inline-flex items-center justify-center transition-colors"
                                        title="View Line Details"
                                    >
                                        <Eye className="w-5 h-5 text-primary" />
                                    </Link>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>

            </div>
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={products.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="quote lines"
                />
            </div>
        </div>
    );
}

