import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency } from "@/lib/utils/formatting";
import { InvoiceLine } from "../../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Link from "next/link";

interface InvoiceLineItemsProps {
    lines: InvoiceLine[];
    invoiceId?: string;
}

export default function InvoiceLineItems({ lines, invoiceId }: InvoiceLineItemsProps) {
    const { items: sortedLines, requestSort, sortConfig } = useSortableData<InvoiceLine>(lines, { key: 'invoiceLineName', direction: 'desc' });
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
        grandTotal: 140,
        actions: 100
    });

    if (lines.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg truncate" title="No invoice lines found">No invoice lines found</p>
                <p className="text-sm truncate" title="There are no items associated with this invoice.">There are no items associated with this invoice.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader truncate={false} label="Invoice Line" field="invoiceLineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader truncate={false} label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.product} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Total Qty" field="quantity" sortConfig={sortConfig} requestSort={requestSort} width={widths.quantity} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Total Price" field="subtotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Shipping" field="shippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                        <SortableHeader truncate={false} label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: widths.actions }}>Action</th>
                    </tr>
                    {/* Force minimum height for header to prevent collapse */}
                    <tr aria-hidden="true" className="h-0 border-none"></tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedLines.map((line) => (
                        <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-3 py-2 text-sm font-bold text-left sticky left-0 bg-white dark:bg-gray-800 truncate">
                                {invoiceId ? (
                                    <Link href={`/invoices/${invoiceId}/lines/${line.id}`} className="text-primary hover:underline truncate block" title={line.invoiceLineName}>
                                        {line.invoiceLineName}
                                    </Link>
                                ) : (
                                    <span className="text-primary truncate block" title={line.invoiceLineName}>{line.invoiceLineName}</span>
                                )}
                            </td>
                            <td className="px-3 py-2 text-left truncate">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${line.status === 'Paid' || line.status === 'Settled' || line.status === 'Approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {line.status}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium text-left truncate">
                                <div className="truncate">
                                    <span title={line.productName}>{line.productName}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">
                                <div className="truncate" title={line.description}>{line.description}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">
                                {line.manufacturerDBA}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate">
                                {formatCurrency(line.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate">
                                {line.quantity.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-bold truncate">
                                {formatCurrency(line.subtotal)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate">
                                {formatCurrency(line.shippingCharges)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate">
                                {formatCurrency(line.totalTaxesAmount)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white min-w-[170px] font-bold text-primary truncate">
                                {formatCurrency(line.lineGrandTotal)}
                            </td>
                            <td className="px-3 py-2 text-sm text-left truncate">
                                {invoiceId && (
                                    <Link
                                        href={`/invoices/${invoiceId}/lines/${line.id}`}
                                        className="p-1.5 text-gray-400 hover:text-primary transition-colors inline-block"
                                        title="View Line Details"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
