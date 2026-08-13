import { Dispatch, SetStateAction, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/app/orders/types";
import { formatCurrency, truncateText, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "@/components/ui/Pagination";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

interface MyOrderTableProps {
    loadingOrder: boolean;
    filteredOrderProducts: Product[];
    orderId: string;
    handleQuantityChange: (lineItemKey: string, newQuantity: number) => void;
    handleRemoveProduct: (lineItemKey: string) => void;
    searchQuery: string;
    setHoveredTooltip: Dispatch<SetStateAction<{ product: Product; x: number; y: number } | null>>;
    accountId: string;
    contactId: string;
    setOrderProducts: Dispatch<SetStateAction<Product[]>>;
    isEditing?: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function MyOrderTable({
    loadingOrder,
    filteredOrderProducts,
    orderId,
    handleQuantityChange,
    handleRemoveProduct,
    searchQuery,
    setHoveredTooltip,
    isEditing = false,
    widths,
    onResize
}: MyOrderTableProps) {

    // Data fetching is now handled by the parent component (page.tsx) to prevent
    // overwriting local state when switching tabs.
    // Order lines are passed down via filteredOrderProducts.

    const { items: sortedProducts, requestSort, sortConfig } = useSortableData<Product>(filteredOrderProducts, { key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);

    // Reset pagination when search or products change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredOrderProducts.length, searchQuery]);

    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedProducts, currentPage]);

    const handleTooltipEnter = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, product: Product) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Assuming tooltip max-width is ~350px, adjust x so it doesn't go off screen
        const tooltipWidth = 350;
        const padding = 16;
        let x = rect.left;
        if (typeof window !== 'undefined' && x + tooltipWidth + padding > window.innerWidth) {
            x = Math.max(padding, window.innerWidth - tooltipWidth - padding);
        }
        
        setHoveredTooltip({
            product,
            x,
            y: rect.top
        });
    };

    const handleTooltipLeave = () => {
        setHoveredTooltip(null);
    };

    return (
        <div className="flex flex-col gap-4 min-w-0">
            {loadingOrder ? (
                <TableLoadingState />
            ) : paginatedProducts.length === 0 ? (
                <TableEmptyState
                    message="No records found"
                    description={
                        searchQuery
                            ? "No products found matching your search."
                            : "There are no products associated with this order." + (isEditing ? " Your order is empty. Click 'Add Products' to start adding items." : "")
                    }
                />
            ) : (
                <div className="rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-auto">
                        <Table className="text-sm table-fixed">
                            <THead className="sticky top-0 z-10">
                                <tr>
                                    <SortableHeader label="Order Line " field="sku" sortConfig={sortConfig} requestSort={requestSort} width={widths.sku} onResize={onResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-20" />
                                    <SortableHeader label="Product Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} />
                                    <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={onResize} />
                                    <SortableHeader label="Product Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} width={widths.productFamily} onResize={onResize} />
                                    <SortableHeader label="Unit Price" field="unitPrice" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} />
                                    <SortableHeader label="Total Order Qty" field="orderQty" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.orderQty} onResize={onResize} />
                                    <SortableHeader label="Total Price" field="subtotal" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.subtotal} onResize={onResize} />
                                    <Th
                                        style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                                    >
                                        Action
                                    </Th>
                                </tr>
                            </THead>
                            <TBody className="text-sm">
                                {paginatedProducts.map((product) => (
                                    <Tr key={product.lineItemKey || product.id}>
                                        <Td className="text-left min-w-[100px] sticky left-0 z-10 bg-white dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <Link
                                                href={`/orders/${orderId}/lines/${product.orderLineId || product.id}`}
                                                className="text-sm font-semibold text-primary hover:underline block"
                                                title={product.sku}
                                            >
                                                {product.sku}
                                            </Link>
                                        </Td>
                                        <Td className="font-medium text-left">
                                            {/* Product name with hover tooltip showing full details */}
                                            <span
                                                className="underline cursor-help block truncate"
                                                onMouseEnter={(e) => handleTooltipEnter(e, product)}
                                                onMouseLeave={handleTooltipLeave}
                                                onClick={(e) => { e.stopPropagation(); handleTooltipEnter(e, product); }}
                                            >
                                                {product.name}
                                            </span>
                                            {product.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={product.description}>
                                                    {product.description}
                                                </div>
                                            )}
                                        </Td>
                                        <Td className="text-left" title={displayCell(product.brand)}>
                                            <div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(product.brand)}</div>
                                        </Td>
                                        <Td className="text-left" title={displayCell(product.productFamily)}>
                                            <span className="inline-block max-w-full px-2 py-1 text-sm font-medium rounded bg-primary/10 text-primary truncate align-middle">
                                                {displayCell(product.productFamily)}
                                            </span>
                                        </Td>
                                        <Td className="text-left">{formatCurrency(product.unitPrice)}</Td>
                                        <Td className="text-left w-[150px]">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const moq = product.moq || 1;
                                                                const newQty = Math.max(product.orderQty - moq, 0);
                                                                handleQuantityChange(product.lineItemKey!, newQty);
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center rounded transition-colors bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={product.orderQty}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === '' || /^[0-9]+$/.test(val)) {
                                                                    const numVal = val === '' ? 0 : parseInt(val);
                                                                    handleQuantityChange(product.lineItemKey!, numVal);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                if ((product.orderQty || 0) < (product.moq || 1)) {
                                                                    handleQuantityChange(product.lineItemKey!, product.moq || 1);
                                                                }
                                                            }}
                                                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                            min={0}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const moq = product.moq || 1;
                                                                const newQty = product.orderQty + moq;
                                                                handleQuantityChange(product.lineItemKey!, newQty);
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center rounded transition-colors bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {product.moq || 1} / Avail: {product.availableQty}</div>
                                                </div>
                                            ) : (
                                                <div className="text-left text-sm text-gray-900 dark:text-white font-medium">
                                                    {product.orderQty}
                                                </div>
                                            )}
                                        </Td>
                                        <Td className="text-left font-semibold">{formatCurrency(product.subtotal)}</Td>
                                        <Td className="text-left">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/orders/${orderId}/lines/${product.orderLineId || product.id}`}
                                                    className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors p-1"
                                                    title="View Line Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => handleRemoveProduct(product.lineItemKey!)}
                                                        title="Remove from order"
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                    {
                        sortedProducts.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={sortedProducts.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setCurrentPage}
                                itemName="products"
                            />
                        )
                    }
                </div>
            )}
        </div>
    );
}
