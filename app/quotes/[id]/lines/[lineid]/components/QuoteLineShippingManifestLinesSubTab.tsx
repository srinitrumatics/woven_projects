import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

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
    proposedProductName?: string;
    proposedProductId?: string;
    proposalId?: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    boxCount: number;
    boxLength?: number;
    boxWidth?: number;
    boxHeight?: number;
    boxNetWeight: number;
    boxGrossWeight: number;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
}

interface QuoteLineShippingManifestLinesSubTabProps {
    data: SMLI[];
    quoteId: string;
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineShippingManifestLinesSubTab({
    data,
    quoteId,
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
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no shipping manifests associated with this quote line." />
                ) : (
                    <Table className="text-sm table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader label="Shipping Manifest Line #" field="lineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Shipping Manifest #" field="manifestName" sortConfig={sortConfig} requestSort={requestSort} width={widths.manifestName} onResize={handleResize} />
                                <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Proposed Product" field="proposedProductName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProductName} onResize={handleResize} />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={handleResize} />
                                <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxCount} onResize={handleResize} />
                                <SortableHeader label="Box Length" field="boxLength" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxLength} onResize={handleResize} />
                                <SortableHeader label="Box Width" field="boxWidth" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxWidth} onResize={handleResize} />
                                <SortableHeader label="Box Height" field="boxHeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxHeight} onResize={handleResize} />
                                <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxNetWeight} onResize={handleResize} />
                                <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxGrossWeight} onResize={handleResize} />
                                <Th className="text-center w-[80px]">Action</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedData.map((item) => (
                                <Tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                                    <Td className="sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.lineName }}>
                                        {item.manifestId ? (
                                            <Link href={`/shipments/${item.manifestId}/lines/${item.id}`} target="_blank" className="text-primary hover:underline font-bold">
                                                {item.lineName}
                                            </Link>
                                        ) : displayCell(item.lineName)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.manifestName }}>
                                        {displayCell(item.manifestName)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.salesOrderLine }}>
                                        {displayCell(item.salesOrderLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerQuoteLine }}>
                                        {item.customerQuoteLineId ? (
                                            <Link href={`/quotes/${quoteId}/lines/${item.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.customerQuoteLine}
                                            </Link>
                                        ) : displayCell(item.customerQuoteLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.proposedProductName }}>
                                        {item.proposedProductId ? (
                                            <Link href={`/proposals/${item.proposalId}/lines/${item.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.proposedProductName}
                                            </Link>
                                        ) : displayCell(item.proposedProductName)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</Td>
                                    <Td className="truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</Td>
                                    <Td className="truncate" style={{ width: widths.manufacturerDBA }}>{displayCell(item.brand)}</Td>
                                    <Td className="truncate" style={{ width: widths.unitPrice }}>{formatCurrency(item.unitPrice)}</Td>
                                    <Td className="truncate" style={{ width: widths.totalOrderQty }}>{item.totalOrderQty}</Td>
                                    <Td className="font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(item.totalPrice)}</Td>
                                    <Td className="truncate" style={{ width: widths.qtyShipped }}>{item.qtyShipped}</Td>
                                    <Td className="truncate" style={{ width: widths.boxCount }}>{formatNumber(item.boxCount)}</Td>
                                    <Td className="truncate" style={{ width: widths.boxLength }}>{formatNumber(item.boxLength)}</Td>
                                    <Td className="truncate" style={{ width: widths.boxWidth }}>{formatNumber(item.boxWidth)}</Td>
                                    <Td className="truncate" style={{ width: widths.boxHeight }}>{formatNumber(item.boxHeight)}</Td>
                                    <Td className="truncate" style={{ width: widths.boxNetWeight }}>{formatNumber(item.boxNetWeight)}</Td>
                                    <Td className="truncate" style={{ width: widths.boxGrossWeight }}>{formatNumber(item.boxGrossWeight)}</Td>
                                    <Td className="text-gray-600 dark:text-gray-400 text-center">
                                        {item.manifestId ? (
                                            <Link
                                                href={`/shipments/${item.manifestId}/lines/${item.id}`}
                                                target="_blank"
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full inline-flex items-center justify-center transition-colors"
                                                title="View Line Details"
                                            >
                                                <Eye className="w-5 h-5 text-primary" />
                                            </Link>
                                        ) : null}
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
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
