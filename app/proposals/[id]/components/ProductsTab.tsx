import { useState, useMemo } from "react";
import Link from "next/link";
import { ProposedProduct, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";
import { displayCell } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ITEMS_PER_PAGE = 10;

interface ProductsTabProps {
    products: ProposedProduct[];
    proposalId: string;
    loading: boolean;
    sortField: keyof ProposedProduct;
    sortDirection: SortDirection;
    onSort: (field: keyof ProposedProduct) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function ProductsTab({
    products,
    proposalId,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: ProductsTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => {
        onSort(key as keyof ProposedProduct);
        setCurrentPage(1);
    };

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, currentPage]);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    if (products.length === 0) {
        return (
            <TableEmptyState message="No records found" description="There are no products associated with this proposal." />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed text-left">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Proposed Products" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.Name} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={onResize} align="left" />
                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} align="left" />
                            <SortableHeader label="Brand Name" field="brandName" sortConfig={sortConfig} requestSort={requestSort} width={widths.brandName} onResize={onResize} align="left" />
                            <SortableHeader label="Grouping" field="grouping" sortConfig={sortConfig} requestSort={requestSort} width={widths.grouping} onResize={onResize} align="left" />
                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} align="left" />
                            <SortableHeader label="Total Order Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={onResize} align="left" />
                            <SortableHeader label="Total Price" field="subtotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.subtotal} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                            <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" />
                            <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={onResize} align="left" />
                            <Th style={{ width: widths.actions }}>Action</Th>
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedProducts.map((product) => (
                            <Tr key={product.id} className="group transition-colors">
                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10  truncate" style={{ width: widths.Name }}>
                                    <Link href={`/proposals/${proposalId}/lines/${product.id}`} className="text-primary rounded font-bold hover:underline truncate" title={product.Name}>
                                        {product.Name}
                                    </Link>
                                </Td>
                                <Td className="text-left truncate" style={{ width: widths.status }}>
                                    {product.status
                                        ? <StatusBadge status={product.status} variant="compact" />
                                        : <span className="text-gray-400">-</span>}
                                </Td>
                                <Td className="text-left truncate" style={{ width: widths.productName }} title={product.productName || ''}>
                                    {product.productId ? (
                                        <Link href={`/products/${product.productId}`} target="_blank" className="text-primary hover:underline truncate">
                                            {product.productName}
                                        </Link>
                                    ) : displayCell(product.productName)}
                                </Td>
                                <Td className="text-left truncate" style={{ width: widths.description }} title={product.description || ''}>{displayCell(product.description)}</Td>
                                <Td className="text-left truncate" style={{ width: widths.brandName }} title={product.brandName || ''}>{displayCell(product.brandName)}</Td>
                                <Td className="text-left truncate" style={{ width: widths.grouping }} title={product.grouping || ''}>{displayCell(product.grouping)}</Td>
                                <Td className="text-left truncate font-medium" style={{ width: widths.unitPrice }} title={`$${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate font-medium" style={{ width: widths.quantity }} title={product.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}>{product.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Td>
                                <Td className="text-left font-bold truncate" style={{ width: widths.subtotal }} title={`$${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate font-medium" style={{ width: widths.shipping }} title={`$${product.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${product.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate font-medium" style={{ width: widths.taxes }} title={`$${product.taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${product.taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left font-bold truncate" style={{ width: widths.grandTotal }} title={`$${product.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${product.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate" style={{ width: widths.qtyShipped }}>{displayCell(String(product.qtyShipped ?? ''))}</Td>
                                <Td className="text-left truncate" style={{ width: widths.actions }}>
                                    <Link href={`/proposals/${proposalId}/lines/${product.id}`} target="_blank" className="text-primary hover:text-primary-dark transition-colors inline-block">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Link>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={products.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}

