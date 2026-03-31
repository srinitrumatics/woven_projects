"use client";

import React, { useState, useMemo } from 'react';
import { DebitMemo } from '../../types';
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SupplierBillDebitsTabProps {
    debitMemos: DebitMemo[];
}

const ITEMS_PER_PAGE = 10;

export default function SupplierBillDebitsTab({ debitMemos }: SupplierBillDebitsTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const initialWidths = {
        name: 180,
        status: 120,
        totalLines: 120,
        totalCost: 140,
        shipping: 140,
        totalDebitAmount: 180,
        issuedDate: 150,
        approvalDate: 150,
        availableDebitBalance: 180,
        settledDate: 150
    };

    const { items: sortedData, requestSort, sortConfig } = useSortableData<DebitMemo>(debitMemos);
    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(debitMemos.length / ITEMS_PER_PAGE);

    if (debitMemos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no debit memos associated with this supplier bill.">There are no debit memos associated with this supplier bill.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Debit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Total Debit Amount" field="totalDebitAmount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalDebitAmount} onResize={handleResize} />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.issuedDate} onResize={handleResize} />
                            <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.approvalDate} onResize={handleResize} />
                            <SortableHeader label="Available Balance" field="availableDebitBalance" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.availableDebitBalance} onResize={handleResize} />
                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.settledDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((debit) => (
                            <tr key={debit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={debit.name}>
                                    {debit.name}
                                </td>
                                <td className="px-3 py-2 text-sm truncate">
                                    <StatusBadge status={debit.status} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                                        {debit.totalLines || 0}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.totalCost || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{formatCurrency(debit.totalShippingCharges || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.totalDebitAmount || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.issuedDate ? formatDate(debit.issuedDate, 'numeric-dash') : '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.approvalDate ? formatDate(debit.approvalDate, 'numeric-dash') : '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.availableDebitBalance || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.settledDate ? formatDate(debit.settledDate, 'numeric-dash') : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={debitMemos.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Debit Memos"
                />
            </div>
        </div>
    );
}
