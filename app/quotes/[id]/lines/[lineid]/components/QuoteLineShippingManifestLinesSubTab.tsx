import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from"@/lib/utils/formatting";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from"react";
import Link from"next/link";

interface SMLI {
    id: string;
    lineName: string;
    status: string;
    manifestName: string;
    manifestId: string;
    salesOrderLine: string;
    salesOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    boxCount: number;
    boxNetWeight: number;
    boxGrossWeight: number;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    trackingStatus: string;
    actualDeliveryDate: string;
}

interface QuoteLineShippingManifestLinesSubTabProps {
    data: SMLI[];
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineShippingManifestLinesSubTab({
    data,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLineShippingManifestLinesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [data, currentPage]);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium"title="No records found">No records found</p>
                        <p className="text-sm">There are no shipping manifests associated with this quote line.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader label="Shipping Manifest Line"field="lineName"sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"/>
                                <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Shipping Manifest"field="manifestName"sortConfig={sortConfig} requestSort={requestSort} width={widths.manifestName} onResize={handleResize} />
                                <SortableHeader label="Sales Order Line"field="salesOrderLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line"field="customerQuoteLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Product Name"field="productName"sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description"field="description"sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Manufacturer DBA"field="manufacturerDBA"sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Box Count"field="boxCount"sortConfig={sortConfig} requestSort={requestSort} width={widths.boxCount} onResize={handleResize} />
                                <SortableHeader label="Box Net Weight"field="boxNetWeight"sortConfig={sortConfig} requestSort={requestSort} width={widths.boxNetWeight} onResize={handleResize} />
                                <SortableHeader label="Box Gross Weight"field="boxGrossWeight"sortConfig={sortConfig} requestSort={requestSort} width={widths.boxGrossWeight} onResize={handleResize} />
                                <SortableHeader label="Unit Price"field="unitPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                <SortableHeader label="Total Order Qty"field="totalOrderQty"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                <SortableHeader label="Total Price"field="totalPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                <SortableHeader label="Qty Shipped"field="qtyShipped"sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={handleResize} />
                                <SortableHeader label="Tracking Number"field="trackingNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                <SortableHeader label="Estimated Delivery Date"field="estimatedDeliveryDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                <SortableHeader label="Tracking Status"field="trackingStatus"sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                <SortableHeader label="Actual Delivery Date"field="actualDeliveryDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.lineName }}>{item.lineName}</td>
                                    <td className="px-3 py-2 text-sm truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.manifestName }}>
                                        {item.manifestId ? (
                                            <Link href={`/shipments/${item.manifestId}`} target="_blank"className="text-primary hover:underline font-bold">
                                                {item.manifestName}
                                            </Link>
                                        ) : item.manifestName}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrderLine }}>
                                        {item.salesOrderLine}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuoteLine }}>
                                        {item.customerQuoteLine}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.productName }}>{item.productName}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.description }} title={item.description}>{item.description}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.manufacturerDBA }}>{item.manufacturerDBA}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.boxCount }}>{item.boxCount}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.boxNetWeight }}>{item.boxNetWeight}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.boxGrossWeight }}>{item.boxGrossWeight}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.unitPrice }}>{formatCurrency(item.unitPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalOrderQty }}>{item.totalOrderQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(item.totalPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.qtyShipped }}>{item.qtyShipped}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingNumber }}>{item.trackingNumber}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatDate(item.estimatedDeliveryDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.trackingStatus}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatDate(item.actualDeliveryDate, 'numeric-dash')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={data.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

