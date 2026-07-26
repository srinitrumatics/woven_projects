import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

interface DebitMemoLine {
    id: string;
    lineName: string;
    status: string;
    debitMemoName: string;
    debitMemoId: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    supplierBillLine: string;
    supplierBillLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    debitQty: number;
    unitCost: number;
    totalCost: number;
    shipping: number;
    grandTotal: number;
}

interface QuoteLineDebitMemoLinesSubTabProps {
    data: DebitMemoLine[];
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineDebitMemoLinesSubTab({
    data,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLineDebitMemoLinesSubTabProps) {
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
                    <TableEmptyState message="No records found" description="There are no debit memos associated with this quote line." />
                ) : (
                    <Table className="text-sm table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader
                                    label="Debit Memo Line"
                                    field="lineName"
                                    sortConfig={sortConfig}
                                    requestSort={requestSort}
                                    width={widths.lineName}
                                    onResize={handleResize}
                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Debit Memo" field="debitMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debitMemoName} onResize={handleResize} />
                                <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Supplier Bill Line" field="supplierBillLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierBillLine} onResize={handleResize} />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                <SortableHeader label="Debit Qty" field="debitQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.debitQty} onResize={handleResize} />
                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedData.map((item) => (
                                <Tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                                    <Td className="sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.lineName }}>{displayCell(item.lineName)}</Td>
                                    <Td className="truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.debitMemoName }}>
                                        {displayCell(item.debitMemoName)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.purchaseOrderLine }}>
                                        {displayCell(item.purchaseOrderLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerQuoteLine }}>
                                        {displayCell(item.customerQuoteLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.supplierBillLine }}>
                                        {displayCell(item.supplierBillLine)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</Td>
                                    <Td className="truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</Td>
                                    <Td className="truncate" style={{ width: widths.brand }}>{displayCell(item.brand)}</Td>
                                    <Td className="truncate" style={{ width: widths.unitCost }}>{formatCurrency(item.unitCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.debitQty }}>{item.debitQty}</Td>
                                    <Td className="font-bold truncate" style={{ width: widths.totalCost }}>{formatCurrency(item.totalCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(item.shipping)}</Td>
                                    <Td className="text-primary font-bold truncate" style={{ width: widths.grandTotal }}>{formatCurrency(item.grandTotal)}</Td>
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

