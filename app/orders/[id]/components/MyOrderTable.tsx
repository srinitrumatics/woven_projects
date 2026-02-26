import { Dispatch, SetStateAction, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/app/orders/types";
import { formatCurrency, truncateText } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "@/components/ui/Pagination";

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

    const { items: sortedProducts, requestSort, sortConfig } = useSortableData<Product>(filteredOrderProducts);
    const [currentPage, setCurrentPage] = useState(1);

    // Track per-product qty warnings
    const [qtyWarnings, setQtyWarnings] = useState<Record<string, boolean>>({});

    // Reset pagination when search or products change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredOrderProducts.length, searchQuery]);

    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedProducts, currentPage]);

    const setWarning = (key: string, warn: boolean) => {
        setQtyWarnings(prev => ({ ...prev, [key]: warn }));
    };

    const handleTooltipEnter = (e: React.MouseEvent<HTMLElement>, product: Product) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredTooltip({
            product,
            x: rect.left,
            y: rect.top
        });
    };

    const handleTooltipLeave = () => {
        setHoveredTooltip(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-auto">
                <table className="w-full text-sm ">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-10">
                        <tr>
                            <SortableHeader label="Order Line " field="sku" sortConfig={sortConfig} requestSort={requestSort} width={widths.sku} onResize={onResize} />
                            <SortableHeader label="Product Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} />
                            <SortableHeader label="Manufacturer" field="manufacturer" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={onResize} />
                            <SortableHeader label="Product Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} width={widths.productFamily} onResize={onResize} />
                            <SortableHeader label="Unit Price" field="unitPrice" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} />
                            <SortableHeader label="Total Order Qty" field="orderQty" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.orderQty} onResize={onResize} />
                            <SortableHeader label="Sub Total" field="subtotal" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.subtotal} onResize={onResize} />
                            {isEditing && (
                                <th
                                    className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                                >
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        {loadingOrder ? (
                            <tr>
                                <td colSpan={isEditing ? 9 : 8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Loading order details...
                                </td>
                            </tr>
                        ) : paginatedProducts.length === 0 ? (
                            <tr>
                                <td colSpan={isEditing ? 9 : 8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    {searchQuery ? "No products found matching your search." : "Your order is empty. Click 'Add Products' to start adding items."}
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map((product) => (
                                <tr key={product.lineItemKey || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                                    <td className="px-2 py-3 text-left min-w-[100px]">
                                        <Link
                                            href={`/orders/${orderId}/lines/${product.orderLineId || product.id}`}
                                            className="text-sm font-semibold text-primary hover:underline truncate block"
                                            title={product.sku}
                                        >
                                            {product.sku}
                                        </Link>
                                    </td>
                                    <td className="px-2 py-3 text-sm text-gray-900 dark:text-white font-medium text-left w-[100px]">
                                        {/* Product name with hover tooltip showing full details */}
                                        <span
                                            className="underline cursor-help block truncate"
                                            onMouseEnter={(e) => handleTooltipEnter(e, product)}
                                            onMouseLeave={handleTooltipLeave}
                                        >
                                            {truncateText(product.name, 50)}
                                        </span>
                                        {product.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate break-words" title={product.description}>
                                                {truncateText(product.description, 50)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left w-[100px]" title={product.manufacturer}><div className="text-sm text-gray-900 dark:text-white truncate">{product.manufacturer}</div></td>
                                    <td className="px-2 py-3 w-[150px] text-left" title={product.productFamily}>
                                        <div className="truncate"><span className="inline-block px-2 py-1 text-sm font-medium rounded bg-primary/10 text-primary">
                                            {product.productFamily}
                                        </span></div></td>
                                    <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white w-[100px]">{formatCurrency(product.unitPrice)}</td>
                                    <td className="px-2 py-3 text-left w-[150px]">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const moq = product.moq || 1;
                                                            const newQty = Math.max(product.orderQty - moq, moq);
                                                            handleQuantityChange(product.lineItemKey!, newQty);
                                                            setWarning(product.lineItemKey!, false);
                                                        }}
                                                        className="w-6 h-6 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                                                                const exceeded = numVal > product.availableQty;
                                                                setWarning(product.lineItemKey!, exceeded);
                                                                // Let the value be set but show warning (no silent clamping)
                                                                handleQuantityChange(product.lineItemKey!, numVal);
                                                            }
                                                        }}
                                                        className={`w-16 px-1 py-0.5 border rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent ${qtyWarnings[product.lineItemKey!]
                                                            ? 'border-amber-500 focus:ring-amber-400'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                            }`}
                                                        min={product.moq || 1}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const moq = product.moq || 1;
                                                            const newQty = Math.min(product.orderQty + moq, product.availableQty);
                                                            handleQuantityChange(product.lineItemKey!, newQty);
                                                            setWarning(product.lineItemKey!, false);
                                                        }}
                                                        className="w-6 h-6 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                {qtyWarnings[product.lineItemKey!] ? (
                                                    <div className="flex gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                        </svg>
                                                        Exceeds available ({product.availableQty})
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {product.moq || 1} / Avail: {product.availableQty}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-left text-sm text-gray-900 dark:text-white font-medium">
                                                {product.orderQty}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white font-semibold w-[100px]">{formatCurrency(product.subtotal)}</td>
                                    {isEditing && (
                                        <td className="px-2 py-3 text-left">
                                            <button
                                                onClick={() => handleRemoveProduct(product.lineItemKey!)}
                                                title="Remove from order"
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
    );
}
