import Link from "next/link";
import { QuoteLine } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";

type SortDirection = 'asc' | 'desc';

interface QuoteProductsTabProps {
    products: QuoteLine[];
    quoteId: string;
    loading: boolean;
    sortField: keyof QuoteLine;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteLine) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteProductsTab({
    products,
    quoteId,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteProductsTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteLine);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="SKU" field="productSku" sortConfig={sortConfig} requestSort={requestSort} width={widths.productSku} onResize={onResize} align="left" />
                        <SortableHeader label="Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} align="left" />
                        <SortableHeader label="Quantity" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={onResize} align="right" />
                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} align="right" />
                        <SortableHeader label="Discount" field="discount" sortConfig={sortConfig} requestSort={requestSort} width={widths.discount} onResize={onResize} align="right" />
                        <SortableHeader label="Subtotal" field="subtotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.subtotal} onResize={onResize} align="right" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No products found</td>
                        </tr>
                    ) : (
                        products.map((line) => (
                            <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left" style={{ width: widths.productName }}>
                                    <div className="line-clamp-2" title={line.productName}>{line.productName}</div>
                                </td>
                                <td className="px-3 py-2 text-sm font-mono text-gray-600 dark:text-gray-400" style={{ width: widths.productSku }}>{line.productSku}</td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400" style={{ width: widths.description }}>
                                    <div className="max-w-xs line-clamp-2" title={line.description}>{line.description}</div>
                                </td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.quantity }}>{line.quantity}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.unitPrice }}>
                                    ${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-right text-gray-600 dark:text-gray-400" style={{ width: widths.discount }}>
                                    {line.discount > 0 ? `${line.discount}%` : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white font-semibold" style={{ width: widths.subtotal }}>
                                    ${line.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
