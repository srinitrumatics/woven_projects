import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from"@/lib/utils/formatting";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from"react";
import Link from"next/link";

interface RMALine {
    id: string;
    lineName: string;
    status: string;
    rmaName: string;
    rmaId: string;
    salesOrderLine: string;
    salesOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    returnQty: number;
    unitPrice: number;
    totalPrice: number;
    reasonCode: string;
    openBalanceQty: number;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate: string;
    trackingStatus: string;
    receiptDate: string;
}

interface QuoteLineRMALinesSubTabProps {
    data: RMALine[];
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineRMALinesSubTab({
    data,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLineRMALinesSubTabProps) {
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
                        <p className="text-sm">There are no RMAs associated with this quote line.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader
                                    label="RMA Line"
                                    field="lineName"
                                    sortConfig={sortConfig}
                                    requestSort={requestSort}
                                    width={widths.lineName}
                                    onResize={handleResize}
                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                />
                                <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="RMA"field="rmaName"sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaName} onResize={handleResize} />
                                <SortableHeader label="Sales Order Line"field="salesOrderLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line"field="customerQuoteLine"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Product Name"field="productName"sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description"field="description"sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Brand"field="brand"sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Reason Code"field="reasonCode"sortConfig={sortConfig} requestSort={requestSort} width={widths.reasonCode} onResize={handleResize} />
                                <SortableHeader label="Unit Price"field="unitPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                <SortableHeader label="Return Qty"field="returnQty"sortConfig={sortConfig} requestSort={requestSort} width={widths.returnQty} onResize={handleResize} />
                                <SortableHeader label="Total Price"field="totalPrice"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                <SortableHeader label="Open Balance Qty"field="openBalanceQty"sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalanceQty} onResize={handleResize} />
                                <SortableHeader label="Tracking Number"field="trackingNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                <SortableHeader label="Estimated Delivery Date"field="estimatedDeliveryDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                <SortableHeader label="Tracking Status"field="trackingStatus"sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                <SortableHeader label="Actual Delivery Date"field="actualDeliveryDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                                <SortableHeader label="Goods Receipt Date"field="receiptDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.receiptDate} onResize={handleResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.lineName }}>{displayCell(item.lineName)}</td>
                                    <td className="px-3 py-2 text-sm truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.rmaName }}>
                                        {displayCell(item.rmaName)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrderLine }}>
                                        {displayCell(item.salesOrderLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuoteLine }}>
                                        {displayCell(item.customerQuoteLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.manufacturerDBA }}>{displayCell(item.brand)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.reasonCode }}>{displayCell(item.reasonCode)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.unitPrice }}>{formatCurrency(item.unitPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnQty }}>{item.returnQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(item.totalPrice)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.openBalanceQty }}>{item.openBalanceQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingNumber }}>{displayCell(item.trackingNumber)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.estimatedDeliveryDate }}>{formatDate(item.estimatedDeliveryDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingStatus }}>{displayCell(item.trackingStatus)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.actualDeliveryDate }}>{formatDate(item.actualDeliveryDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.receiptDate }}>{formatDate(item.receiptDate, 'numeric-dash')}</td>
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

