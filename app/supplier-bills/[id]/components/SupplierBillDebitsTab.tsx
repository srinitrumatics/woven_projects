"use client";

import React, { useState, useMemo } from 'react';
import { DebitMemo } from '../../types';
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from 'next/link';
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";

interface SupplierBillDebitsTabProps {
    debitMemos: DebitMemo[];
}

const ITEMS_PER_PAGE = 10;

export default function SupplierBillDebitsTab({ debitMemos }: SupplierBillDebitsTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    const initialWidths = {
        name: 180,
        status: 120,
        purchaseOrder: 150,
        customerQuote: 150,
        proposalNumber: 150,
        proposalName: 180,
        customerOrder: 150,
        totalLines: 120,
        totalCost: 140,
        shipping: 140,
        taxes: 140,
        totalDebitAmount: 180,
        issuedDate: 150,
        expirationDate: 150,
        availableDebitBalance: 180,
        settledDate: 150
    };

    const { items: sortedData, requestSort, sortConfig } = useSortableData<DebitMemo>(debitMemos, { key: 'name', direction: 'desc' });
    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(debitMemos.length / ITEMS_PER_PAGE);

    if (debitMemos.length === 0) {
        return (
            <TableEmptyState
                message="No records found"
                description="There are no debit memos associated with this supplier bill."
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Debit Memo #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Purchase Order #" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposalNumber} onResize={handleResize} />
                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposalName} onResize={handleResize} />
                            <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Taxes" field="totalTaxes" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.taxes} onResize={handleResize} />
                            <SortableHeader label="Total Debit Amount" field="totalDebitAmount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalDebitAmount} onResize={handleResize} />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.issuedDate} onResize={handleResize} />
                            <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.expirationDate} onResize={handleResize} />
                            <SortableHeader label="Available Debit Balance" field="availableDebitBalance" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.availableDebitBalance} onResize={handleResize} />
                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.settledDate} onResize={handleResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((debit) => (
                            <Tr key={debit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={debit.name}>
                                    {displayCell(debit.name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm truncate">
                                    <StatusBadge status={debit.status} />
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={debit.purchaseOrderName || '-'}>
                                    {debit.purchaseOrderId ? (
                                        <Link href={`/purchase-orders/${debit.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {displayCell(debit.purchaseOrderName)}
                                        </Link>
                                    ) : displayCell(debit.purchaseOrderName)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={debit.customerQuoteName || '-'}>
                                    {debit.customerQuoteId ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${debit.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {displayCell(debit.customerQuoteName)}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(debit.customerQuoteName)}</span>
                                        )
                                    ) : displayCell(debit.customerQuoteName)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={debit.proposalNumber || debit.proposalName || '-'}>
                                    {debit.proposalId ? (
                                        !isManufacturer ? (
                                            <Link href={`/proposals/${debit.proposalId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {displayCell(debit.proposalNumber || debit.proposalName)}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(debit.proposalNumber || debit.proposalName)}</span>
                                        )
                                    ) : displayCell(debit.proposalNumber || debit.proposalName)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={debit.proposalName || '-'}>{displayCell(debit.proposalName)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={debit.customerOrderName || '-'}>
                                    {debit.customerOrderId ? (
                                        !isManufacturer ? (
                                            <Link href={`/orders/${debit.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {displayCell(debit.customerOrderName)}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(debit.customerOrderName)}</span>
                                        )
                                    ) : displayCell(debit.customerOrderName)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                                        {debit.totalLines || 0}
                                    </span>
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.totalCost || 0)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{formatCurrency(debit.totalShippingCharges || 0)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{formatCurrency(debit.totalTaxes || 0)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.totalDebitAmount || 0)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.issuedDate ? formatDate(debit.issuedDate, 'numeric-dash') : '-'}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.expirationDate ? formatDate(debit.expirationDate, 'numeric-dash') : '-'}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.availableDebitBalance || 0)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.settledDate ? formatDate(debit.settledDate, 'numeric-dash') : '-'}</Td>
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
                    totalItems={debitMemos.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Debit Memos"
                />
            </div>
        </div>
    );
}
