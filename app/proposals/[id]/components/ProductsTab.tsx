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

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof ProposedProduct);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">There are no products associated with this proposal.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Proposed Product" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.Name} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={onResize} align="left" />
                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} align="left" />
                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={onResize} align="left" />
                        <SortableHeader label="Grouping" field="grouping" sortConfig={sortConfig} requestSort={requestSort} width={widths.grouping} onResize={onResize} align="left" />
                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} align="left" />
                        <SortableHeader label="Total Order Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={onResize} align="left" />
                        <SortableHeader label="Total Price" field="subtotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.subtotal} onResize={onResize} align="left" />
                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                        <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" />
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: widths.actions }}>Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">

                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left" style={{ width: widths.Name }}>
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.Name || ''}>
                                    <Link href={`/proposals/${proposalId}/lines/${product.id}`} className="text-primary rounded font-semibold  hover:underline truncate block" title={product.Name}>
                                        {product.Name}
                                    </Link>
                                </div>
                            </td>

                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium text-left" style={{ width: widths.productName }}>
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.productName || ''}>{product.productName}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left min-w-[186px]" style={{ width: widths.description }}>
                                <div className="truncate" title={product.description || ''}>{product.description || '-'}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left min-w-[190px]" style={{ width: widths.manufacturerDBA }}>
                                <div className="truncate" title={product.manufacturerDBA || ''}>{product.manufacturerDBA || '-'}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left" style={{ width: widths.grouping }}>
                                <div className="truncate" title={product.grouping || ''}>{product.grouping || '-'}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.unitPrice }} title={`$${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                ${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.quantity }} title={product.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}>{product.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold truncate" style={{ width: widths.subtotal }} title={`$${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                ${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }} title={`$${product.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                ${product.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.taxes }} title={`$${product.taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                ${product.taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold truncate" style={{ width: widths.grandTotal }} title={`$${product.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                ${product.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-left" style={{ width: widths.actions }}>
                                <Link href={`/proposals/${proposalId}/lines/${product.id}`} className="text-primary rounded font-medium inline-block">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}
