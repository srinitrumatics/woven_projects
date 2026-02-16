import Link from "next/link";
import { QuoteLine } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";

type SortDirection = 'asc' | 'desc';

interface QuoteLinesTabProps {
    products: QuoteLine[];
    quoteId: string;
    loading: boolean;
    sortField: keyof QuoteLine;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteLine) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteLinesTab({
    products,
    quoteId,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteLinesTabProps) {
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
                        <SortableHeader label="Quote Line Number" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.Name} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={onResize} align="left" />
                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} align="left" />
                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={onResize} align="left" />
                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={onResize} align="left" />
                        <SortableHeader label="Total Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={onResize} align="left" />
                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineGrandTotal} onResize={onResize} align="left" />
                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={onResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={12} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No quote lines found</td>
                        </tr>
                    ) : (
                        products.map((line) => (
                            <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left" style={{ width: widths.Name }}>
                                    <Link
                                        href={`/quotes/${quoteId}/lines/${line.id}`}
                                        className="text-primary hover:underline line-clamp-2"
                                        title={line.Name}
                                    >
                                        {line.Name}
                                    </Link>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400" style={{ width: widths.status }}>
                                    {line.status}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.productName }}>
                                    <div className="line-clamp-2" title={line.productName}>{line.productName}</div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400" style={{ width: widths.description }}>
                                    <div className="max-w-xs line-clamp-1" title={line.description}>{line.description}</div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400" style={{ width: widths.manufacturerDBA }}>
                                    {line.manufacturerDBA}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.unitPrice }}>
                                    ${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.quantity }}>
                                    {line.quantity}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.totalPrice }}>
                                    ${line.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipping }}>
                                    ${line.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.taxes }}>
                                    ${line.taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold" style={{ width: widths.lineGrandTotal }}>
                                    ${line.lineGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.qtyShipped }}>
                                    {line.qtyShipped}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
