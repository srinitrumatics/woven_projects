import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

interface POLI {
    id: string;
    name: string;
    status: string;
    purchaseOrder: string;
    purchaseOrderId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    orderQty: number;
    productCost: number;
    shipping: number;
    totalCost: number;
    openBalanceQty: number;
    estimatedDeliveryDate: string;
    actualDeliveryDate: string;
    trackingNumber: string;
    trackingStatus: string;
    receiptDate: string;
    invoiceStatus: string;
}

interface QuoteLinePurchaseOrderLinesSubTabProps {
    data: POLI[];
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLinePurchaseOrderLinesSubTab({
    data,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLinePurchaseOrderLinesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [data, currentPage]);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no purchase order lines associated with this quote line." />
                ) : (
                    <Table className="text-sm table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader label="Purchase Order Line" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                <SortableHeader label="Total Order Qty" field="orderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.orderQty} onResize={handleResize} />
                                <SortableHeader label="Total Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={handleResize} />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                <SortableHeader label="Line Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                                <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalanceQty} onResize={handleResize} />
                                <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                                <SortableHeader label="Goods Receipt Date" field="receiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receiptDate} onResize={handleResize} />
                                <SortableHeader label="Invoice Status" field="invoiceStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceStatus} onResize={handleResize} />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedData.map((item) => (
                                <Tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                                    <Td className="sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.name }}>{displayCell(item.name)}</Td>
                                    <Td className="truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.purchaseOrder }}>
                                        {item.purchaseOrderId ? (
                                            <Link href={`/purchase-orders/${item.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.purchaseOrder}
                                            </Link>
                                        ) : displayCell(item.purchaseOrder)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerQuoteLine }}>
                                        {displayCell(item.customerQuoteLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</Td>
                                    <Td className="truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</Td>
                                    <Td className="truncate" style={{ width: widths.manufacturerDBA }}>{displayCell(item.brand)}</Td>
                                    <Td className="truncate" style={{ width: widths.unitCost }}>{formatCurrency(item.unitCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.orderQty }}>{item.orderQty}</Td>
                                    <Td className="truncate" style={{ width: widths.productCost }}>{formatCurrency(item.productCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(item.shipping)}</Td>
                                    <Td className="font-bold truncate" style={{ width: widths.totalCost }}>{formatCurrency(item.totalCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.openBalanceQty }}>{item.openBalanceQty}</Td>
                                    <Td className="truncate" style={{ width: widths.trackingNumber }}>{displayCell(item.trackingNumber)}</Td>
                                    <Td className="truncate">{formatDate(item.estimatedDeliveryDate, 'numeric-dash')}</Td>
                                    <Td className="truncate">{displayCell(item.trackingStatus)}</Td>
                                    <Td className="truncate">{formatDate(item.actualDeliveryDate, 'numeric-dash')}</Td>
                                    <Td className="truncate">{formatDate(item.receiptDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.invoiceStatus }}>{displayCell(item.invoiceStatus)}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </div>
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

