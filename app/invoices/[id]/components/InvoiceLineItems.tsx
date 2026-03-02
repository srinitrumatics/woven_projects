import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency } from "@/lib/utils/formatting";
import { InvoiceLine } from "../../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

interface InvoiceLineItemsProps {
    lines: InvoiceLine[];
}

export default function InvoiceLineItems({ lines }: InvoiceLineItemsProps) {
    const { items: sortedLines, requestSort, sortConfig } = useSortableData<InvoiceLine>(lines);
    const { widths, handleResize } = useResizableColumns({
        lineName: 160,
        status: 120,
        product: 200,
        description: 250,
        manufacturer: 180,
        unitPrice: 120,
        quantity: 100,
        totalPrice: 120,
        shipping: 110,
        taxes: 110,
        grandTotal: 140
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Invoice Line" field="invoiceLineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.product} onResize={handleResize} />
                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={handleResize} />
                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                        <SortableHeader label="Total Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={handleResize} />
                        <SortableHeader label="Total Price" field="subtotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                        <SortableHeader label="Shipping" field="shippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                    </tr>
                    {/* Force minimum height for header to prevent collapse */}
                    <tr aria-hidden="true" className="h-0 border-none"></tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedLines.map((line) => (
                        <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-3 py-2 text-sm text-primary font-medium text-left whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800">
                                {line.invoiceLineName}
                            </td>
                            <td className="px-3 py-2 text-left">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${line.status === 'Paid' || line.status === 'Settled'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {line.status}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium text-left">
                                <div className="line-clamp-1" title={line.productName}>{line.productName}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left">
                                <div className="line-clamp-1" title={line.description}>{line.description}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left whitespace-nowrap">
                                {line.manufacturerDBA}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(line.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                {line.quantity.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(line.subtotal)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(line.shippingCharges)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(line.totalTaxesAmount)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white min-w-[170px]">
                                {formatCurrency(line.lineGrandTotal)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
