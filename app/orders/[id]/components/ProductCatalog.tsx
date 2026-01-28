import { Product } from "@/app/orders/types";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { SortConfig } from "../../../../hooks/useSortableData"; // Import SortConfig type

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
    isEditing = false
}: ProductCatalogProps) {
    return (
        <>
            <div className="flex justify-end mb-2">
                {isEditing && selectedProductIds.size > 0 && (
                    <button
                        onClick={handleAddSelectedProducts}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                    >
                        Add Selected ({selectedProductIds.size})
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            {isEditing && (
                                <th className="px-4 py-2 text-left w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedCatalogProducts.length > 0 && paginatedCatalogProducts.every(p => selectedProductIds.has(p.id))}
                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">&nbsp;</th>
                            <SortableHeader label="Product Name" field="name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Manufacturer" field="manufacturer" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="List Price" field="listPrice" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Selling Price" field="unitPrice" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Available Qty" field="availableQty" align="center" sortConfig={sortConfig} requestSort={requestSort} />
                            {isEditing && (
                                <>
                                    <SortableHeader label="Qty to Order" field="orderQty" align="center" sortConfig={sortConfig} requestSort={requestSort} />
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Action</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedCatalogProducts.length === 0 ? (
                            <tr>
                                <td colSpan={isEditing ? 9 : 6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    {searchQuery ? "No products found matching your search." : "All products have been added to your order."}
                                </td>
                            </tr>
                        ) : (
                            paginatedCatalogProducts.map((product) => (
                                <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedProductIds.has(product.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    {isEditing && (
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedProductIds.has(product.id)}
                                                onChange={() => handleSelectProduct(product.id)}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-2">
                                        <div
                                            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleImageClick(product)}
                                        >
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2" title={product.name}>{product.name}</div>
                                        {product.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words" title={product.description}>
                                                {product.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                        <div className="line-clamp-2" title={product.manufacturer}>{product.manufacturer}</div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="line-clamp-2" title={product.productFamily}>
                                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                                                {product.productFamily}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-xs text-right text-gray-500 dark:text-gray-400 line-through">
                                        {formatCurrency(product.listPrice)}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                        {formatCurrency(product.unitPrice)}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-center text-gray-900 dark:text-white">
                                        <div>{formatNumber(product.availableQty)}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {product.moq || 1}</div>
                                    </td>
                                    {isEditing && (
                                        <>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const currentQty = catalogQuantities[product.id] || product.moq || 1;
                                                            const moq = product.moq || 1;
                                                            const newQty = Math.max(currentQty - moq, moq);
                                                            handleCatalogQuantityChange(product.id, newQty, moq);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={product.moq || 1}
                                                        step={product.moq || 1}
                                                        value={catalogQuantities[product.id] || product.moq || 1}
                                                        onChange={(e) => handleCatalogQuantityChange(product.id, Number(e.target.value), product.moq || 1)}
                                                        className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const currentQty = catalogQuantities[product.id] || product.moq || 1;
                                                            const moq = product.moq || 1;
                                                            const newQty = currentQty + moq;
                                                            handleCatalogQuantityChange(product.id, newQty, moq);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => handleAddProduct(product)}
                                                    className="p-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                                                    title="Add to Order"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4l-3.87 7H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Image Popup Modal */}
            {popupProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClosePopup}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={handleClosePopup}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col items-center">
                            <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{popupProduct.name}</h3>
                            <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4">{popupProduct.sku}</p>

                            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Manufacturer</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{popupProduct.manufacturer}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Family</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{popupProduct.productFamily}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Price</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(popupProduct.unitPrice)}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Available</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(popupProduct.availableQty)}</span>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
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
            )}

            {/* Pagination for Catalog */}
            {paginatedCatalogProducts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={itemsPerPage * totalPages} // Estimating total items based on pages, or pass total items count prop
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    itemName="products"
                />
            )}
        </>
    );
}
