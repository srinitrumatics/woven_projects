"use client";

import React, { useState, useMemo } from 'react';
import { SupplierBillLine } from "../../types";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";

interface SupplierBillLinesTableProps {
    lines: SupplierBillLine[];
}

const ITEMS_PER_PAGE = 10;

export default function SupplierBillLinesTable({ lines }: SupplierBillLinesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { items: sortedData, requestSort, sortConfig } = useSortableData<SupplierBillLine>(lines);

    const initialWidths = {
        name: 180,
        status: 120,
        purchaseOrderLine: 180,
        productName: 200,
        billedQty: 100,
        unitCost: 120,
        totalAmount: 140,
        goodsReceiptDate: 150
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(lines.length / ITEMS_PER_PAGE);

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no lines for this supplier bill.">There are no lines for this supplier bill.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-0">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Line Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="PO Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrderLine} onResize={handleResize} />
                            <SortableHeader label="Product" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billedQty} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader label="Total Amount" field="totalBillAmount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalAmount} onResize={handleResize} />
                            <SortableHeader label="Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.goodsReceiptDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((line) => (
                            <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-4 py-3 text-sm font-semibold text-primary truncate">{line.name}</td>
                                <td className="px-4 py-3 text-sm truncate">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${line.status === 'Approved' ? 'bg-green-100/80 text-green-700 border-green-200' : 'bg-gray-100/80 text-gray-700 border-gray-200'
                                        }`}>
                                        {line.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate">{line.purchaseOrderLineName || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate">
                                    <div className="font-medium truncate max-w-[200px]" title={line.productName}>{line.productName}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]" title={line.productDescription}>{line.productDescription}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium truncate">{line.billedQty}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(line.unitCost)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(line.totalBillAmount)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {lines.length > ITEMS_PER_PAGE && (
                <div className="mt-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={lines.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemName="Supplier Bill Lines"
                    />
                </div>
            )}
        </div>
    );
}
