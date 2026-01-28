import Link from "next/link";
import { ProposedProduct, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";

interface ProductsTabProps {
    products: ProposedProduct[];
    proposalId: string;
    loading: boolean;
    sortField: keyof ProposedProduct;
    sortDirection: SortDirection;
    onSort: (field: keyof ProposedProduct) => void;
}

export default function ProductsTab({ products, proposalId, loading, sortField, sortDirection, onSort }: ProductsTabProps) {
    //console.log("product ui res", products);

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof ProposedProduct);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">&nbsp;</th>
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Manufacturer" field="manufacturer" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Product Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Unit Price" field="unitPrice" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Total Order Qty" field="quantity" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Total Price" field="subtotal" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Shipping" field="shipping" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Taxes" field="taxes" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Grand Total" field="grandTotal" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mb-3">
                                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium">No products found</p>
                                    <p className="text-xs">There are no products listed in this proposal.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">{product.productName}</div>
                                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">{product.productSku}</div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{product.manufacturer}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                                        {product.productFamily}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                    ${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{product.quantity}</td>
                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                    ${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                    ${product.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                    ${product.taxes.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                </td>
                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                    ${product.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link href={`/proposals/${proposalId}/lines/${product.id}`} className="px-4 py-1.5 text-primary rounded font-medium inline-block">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div >
    );
}
