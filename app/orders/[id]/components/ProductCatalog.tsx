import { useState, useRef } from "react";
import Link from "next/link";
import { Product } from "@/app/orders/types";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatNumber, truncateText, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { SortConfig } from "../../../../hooks/useSortableData"; // Import SortConfig type
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState } from "@/components/ui/DataTable";

interface ProductCatalogProps {
    selectedProductIds: Set<string>;
    handleAddSelectedProducts: () => void;
    paginatedCatalogProducts: Product[];
    handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectProduct: (productId: string) => void;
    handleImageClick: (product: Product) => void;
    catalogQuantities: Record<string, number>;
    handleCatalogQuantityChange: (productId: string, quantity: number, moq: number) => void;
    handleAddProduct: (product: Product) => void;
    popupProduct: Product | null;
    handleClosePopup: () => void;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    searchQuery: string;
    sortConfig: SortConfig<Product> | null;
    requestSort: (key: keyof Product) => void;
    isEditing?: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function ProductCatalog({
    selectedProductIds,
    handleAddSelectedProducts,
    paginatedCatalogProducts,
    handleSelectAll,
    handleSelectProduct,
    handleImageClick,
    catalogQuantities,
    handleCatalogQuantityChange,
    handleAddProduct,
    popupProduct,
    handleClosePopup,
    currentPage,
    totalPages,
    setCurrentPage,
    itemsPerPage,
    searchQuery,
    sortConfig,
    requestSort,
    isEditing = false,
    widths,
    onResize
}: ProductCatalogProps) {
    // Single consistent success banner for both single and bulk adds
    const [bannerMessage, setBannerMessage] = useState<string>("");
    const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showBanner = (message: string) => {
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        setBannerMessage(message);
        bannerTimerRef.current = setTimeout(() => setBannerMessage(""), 3000);
    };

    // Reset ALL products' quantities back to their MOQ
    const resetAllQuantities = () => {
        paginatedCatalogProducts.forEach(product => {
            const moq = product.moq || 1;
            handleCatalogQuantityChange(product.id, moq, moq);
        });
    };

    // Wrap bulk-add to also reset all qtys and show banner
    const handleBulkAdd = () => {
        const count = selectedProductIds.size;
        handleAddSelectedProducts();
        // Reset ALL products' quantities back to MOQ
        resetAllQuantities();
        showBanner(`${count} product${count !== 1 ? 's' : ''} added to order!`);
    };

    return (
        <>
            {/* Consistent success banner — shown for both single and bulk adds */}
            {bannerMessage && (
                <div className="flex items-center gap-2 mb-3 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-300 font-medium min-w-0">
                    <svg className="w-4 h-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {bannerMessage}
                </div>
            )}
            <div className="flex justify-end mb-2">
                {isEditing && selectedProductIds.size > 0 && (
                    <button
                        onClick={handleBulkAdd}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm truncate"
                    >
                        Add Selected ({selectedProductIds.size})
                    </button>
                )}
            </div>
            {paginatedCatalogProducts.length === 0 ? (
                <TableEmptyState
                    message="No records found"
                    description={searchQuery ? "No products found matching your search." : "All products have been added to your order."}
                />
            ) : (
                <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <Table className="table-fixed">
                        <THead className="sticky top-0 z-10">
                            <tr>
                                {isEditing && (
                                    <Th
                                        className="text-left truncate"
                                        style={{ width: widths.selection, minWidth: widths.selection, maxWidth: widths.selection }}
                                    >
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={paginatedCatalogProducts.length > 0 && paginatedCatalogProducts.every(p => selectedProductIds.has(p.id))}
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        />
                                    </Th>
                                )}
                                {/*<th
                                className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white truncate"
                            style={{ width: widths.image, minWidth: widths.image, maxWidth: widths.image }}
                            >Image</th>*/}
                                <SortableHeader label="Product Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} />
                                <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={onResize} />
                                <SortableHeader label="Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} width={widths.productFamily} onResize={onResize} />
                                <SortableHeader label="List Price" field="listPrice" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.listPrice} onResize={onResize} />
                                <SortableHeader label="Unit Price" field="unitPrice" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} />
                                {/* Removed Available Qty Header */}
                                {isEditing && (
                                    <>
                                        <SortableHeader label="Total Order Qty" field="orderQty" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.orderQty} onResize={onResize} />
                                        <Th
                                            className="truncate"
                                            style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                                        >Action</Th>
                                    </>
                                )}
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedCatalogProducts.map((product) => (
                                <Tr key={product.id} className={`${selectedProductIds.has(product.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    {isEditing && (
                                        <Td className="text-left truncate">
                                            <input
                                                type="checkbox"
                                                checked={selectedProductIds.has(product.id)}
                                                onChange={() => handleSelectProduct(product.id)}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                        </Td>
                                    )}
                                    {/*<td className="px-4 py-2 text-center truncate">
                                        <div
                                            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity mx-auto"
                                            onClick={() => handleImageClick(product)}
                                        >
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </td>*/}
                                    <Td className="px-3 py-2 text-left truncate">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.name}>
                                            <Link href={`/products/${product.id}`}
                                                className="text-gray-900 hover:text-primary dark:text-gray-600 dark:hover:text-primary transition-colors p-1"
                                                title="Product Details" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                {truncateText(product.name, 50)}
                                            </Link>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate break-words" title={product.description || "—"}>
                                            {product.description ? truncateText(product.description, 50) : "—"}
                                        </div>
                                    </Td>
                                    <Td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate">
                                        <div className="truncate" title={displayCell(product.brand)}>{displayCell(product.brand)}</div>
                                    </Td>
                                    <Td className="px-3 py-2 text-left truncate">
                                        <div className="truncate" title={displayCell(product.productFamily)}>
                                            <span className="inline-block px-2 py-0.5 text-sm font-medium rounded bg-primary/10 text-primary  tracking-wider whitespace-normal truncate">
                                                {displayCell(product.productFamily)}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className="px-3 py-2 text-sm text-left text-gray-500 dark:text-gray-400 line-through truncate">
                                        {formatCurrency(product.listPrice)}
                                    </Td>
                                    <Td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold truncate">
                                        {formatCurrency(product.unitPrice)}
                                    </Td>
                                    {/* Removed Available Qty Cell */}
                                    {isEditing && (
                                        <>
                                            <Td className="px-3 py-2 text-left truncate">
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                const currentQty = catalogQuantities[product.id] || product.moq || 1;
                                                                const moq = product.moq || 1;
                                                                const newQty = Math.max(currentQty - moq, 0);
                                                                handleCatalogQuantityChange(product.id, newQty, moq);
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center rounded transition-colors bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="text"
                                                            min={0}
                                                            value={catalogQuantities[product.id] ?? product.moq ?? 1}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === '' || /^[0-9]+$/.test(val)) {
                                                                    const numVal = val === '' ? 0 : Number(val);
                                                                    handleCatalogQuantityChange(product.id, numVal, product.moq || 1);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                const moq = product.moq || 1;
                                                                if ((catalogQuantities[product.id] ?? moq) < moq) {
                                                                    handleCatalogQuantityChange(product.id, moq, moq);
                                                                }
                                                            }}
                                                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const currentQty = catalogQuantities[product.id] || product.moq || 1;
                                                                const moq = product.moq || 1;
                                                                const newQty = currentQty + moq;
                                                                handleCatalogQuantityChange(product.id, newQty, moq);
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center rounded transition-colors bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {product.moq || 1} / Avail: {product.availableQty}</div>
                                                </div>
                                            </Td>
                                            <Td className="px-3 py-2 text-left truncate">
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <button
                                                        onClick={() => {
                                                            handleAddProduct(product);
                                                            // Reset ALL products' quantities back to MOQ
                                                            resetAllQuantities();
                                                            showBanner("Product added to order!");
                                                        }}
                                                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 w-full rounded text-sm font-medium transition-colors bg-primary text-white hover:bg-primary-dark"
                                                        title="Add to Order"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4l-3.87 7H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z" />
                                                        </svg>
                                                        Add
                                                    </button>
                                                </div>
                                            </Td>
                                        </>
                                    )}
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </div>
                </div>
            )}
            {/* Image Popup Modal */}
            {
                popupProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClosePopup}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
                            <button
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 truncate"
                                onClick={handleClosePopup}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex flex-col items-center min-w-0">
                                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center " title={popupProduct.name}>{popupProduct.name}</h3>
                                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4 truncate">{popupProduct.sku}</p>

                                <div className="w-full grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Brand</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{popupProduct.brand}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Family</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{popupProduct.productFamily}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Price</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{formatCurrency(popupProduct.unitPrice)}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Available</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{formatNumber(popupProduct.availableQty)}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-center mb-6 truncate">
                                    {popupProduct.description || "No description available."}
                                </p>

                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            handleAddProduct(popupProduct);
                                            handleClosePopup();
                                        }}
                                        className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        Add to Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Pagination for Catalog */}
            {
                paginatedCatalogProducts.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={itemsPerPage * totalPages} // Estimating total items based on pages, or pass total items count prop
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        itemName="products"
                    />
                )
            }
        </>
    );
}
