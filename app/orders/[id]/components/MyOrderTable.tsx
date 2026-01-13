import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { Product } from "@/app/orders/types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

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
}

export default function MyOrderTable({
    loadingOrder,
    filteredOrderProducts,
    orderId,
    handleQuantityChange,
    handleRemoveProduct,
    searchQuery,
    setHoveredTooltip,
    isEditing = false
}: MyOrderTableProps) {

    // Data fetching is now handled by the parent component (page.tsx) to prevent
    // overwriting local state when switching tabs.
    // Order lines are passed down via filteredOrderProducts.

    const { items: sortedProducts, requestSort, sortConfig } = useSortableData<Product>(filteredOrderProducts);

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
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-[5%]">&nbsp;</th>
                        <SortableHeader label="Order Line #" field="orderLineId" align="center" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Product Name" field="name" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Manufacturer" field="manufacturer" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Product Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Unit Price" field="unitPrice" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Order Qty" field="orderQty" align="center" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Subtotal" field="subtotal" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        {isEditing && (
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white w-[5%]">Action</th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loadingOrder ? (
                        <tr>
                            <td colSpan={isEditing ? 9 : 8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                Loading order details...
                            </td>
                        </tr>
                    ) : sortedProducts.length === 0 ? (
                        <tr>
                            <td colSpan={isEditing ? 9 : 8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? "No products found matching your search." : "Your order is empty. Click 'Add Products' to start adding items."}
                            </td>
                        </tr>
                    ) : (
                        sortedProducts.map((product) => (
                            <tr key={product.lineItemKey || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                                <td className="px-4 py-3">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link
                                        href={`/orders/${orderId}/lines/${product.orderLineId || product.orderLineId}`}
                                        className="text-sm font-semibold text-primary hover:underline"
                                        title="View line details"
                                    >
                                        {product.orderLineId}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                    {/* Product name with hover tooltip showing full details */}
                                    <span
                                        className="underline cursor-help"
                                        onMouseEnter={(e) => handleTooltipEnter(e, product)}
                                        onMouseLeave={handleTooltipLeave}
                                    >
                                        {product.name}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                                        {product.productFamily}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3">
                                    {isEditing ? (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const moq = product.moq || 1;
                                                        const newQty = Math.max(product.orderQty - moq, moq);
                                                        handleQuantityChange(product.lineItemKey!, newQty);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={product.orderQty}
                                                    onChange={(e) => handleQuantityChange(product.lineItemKey!, parseInt(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    min={product.moq || 1}
                                                    step={product.moq || 1}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const moq = product.moq || 1;
                                                        handleQuantityChange(product.lineItemKey!, product.orderQty + moq);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">MOQ: {product.moq || 1}</div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm text-gray-900 dark:text-white font-medium">
                                            {product.orderQty}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                {isEditing && (
                                    <td className="px-4 py-3 text-center">
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
    );
}
