"use client";

import React, { useState, useMemo } from 'react';
import { SupplierBillLine } from "../../types";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";


interface SupplierBillLinesTableProps {
    lines: SupplierBillLine[];
}

const ITEMS_PER_PAGE = 10;

export default function SupplierBillLinesTable({ lines }: SupplierBillLinesTableProps) {
    const params = useParams();
    const id = params.id as string;
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    const [currentPage, setCurrentPage] = useState(1);
    const { items: sortedData, requestSort, sortConfig } = useSortableData<SupplierBillLine>(lines, { key: 'name', direction: 'asc' });

    const initialWidths = {
        name: 180,
        status: 120,
        customerQuoteLineName: 180,
        proposedProduct: 180,
        productName: 200,
        productDescription: 250,
        manufacturerDBA: 180,
        brand: 180,
        unitCost: 120,
        billedQty: 160,
        billAmount: 180,
        shipping: 190,
        totalBillAmount: 200,
        goodsReceiptDate: 200
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(lines.length / ITEMS_PER_PAGE);
    if (lines.length === 0) {
        return (
            <TableEmptyState
                message="No records found"
                description="There are no lines for this supplier bill."
            />
        );
    }

    return (

        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Supplier Bill Line" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuoteLineName} onResize={handleResize} />
                            <SortableHeader label="Proposed Product" field="proposedProduct" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposedProduct} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productDescription} onResize={handleResize} />
                            <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.brand} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billedQty} onResize={handleResize} />
                            <SortableHeader label="Bill Amount" field="billAmount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billAmount} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Total Bill Amount" field="totalBillAmount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalBillAmount} onResize={handleResize} />
                            <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.goodsReceiptDate} onResize={handleResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((line) => (
                            <Tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate">
                                    <Link href={`/supplier-bills/${id}/lines/${line.id}`} target="_blank" className="hover:underline text-primary font-medium">
                                        {line.name}
                                    </Link>
                                </Td>
                                <Td className="px-3 py-2 text-sm truncate">
                                    <StatusBadge status={line.status} />
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={line.customerQuoteLineName}>
                                    {displayCell(line.customerQuoteLineName)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={line.proposedProduct}>
                                    {line.proposedProductId ? (
                                        !isManufacturer ? (
                                            <Link href={`/proposals/${line.proposalId}/lines/${line.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {line.proposedProduct || 'View Product'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(line.proposedProduct)}</span>
                                        )
                                    ) : displayCell(line.proposedProduct)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(line.productName)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.productDescription}>{displayCell(line.productDescription)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{displayCell(line.brand)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{formatCurrency(line.unitCost)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{line.billedQty}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{formatCurrency(line.billAmount)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{formatCurrency(line.shipping)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(line.totalBillAmount)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : '-'}</Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={lines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Supplier Bill Lines"
                />
            </div>
        </div>
    );
}
