"use client";

import React, { useState, useMemo } from 'react';
import { BillPayment, AppliedDebitMemo } from '../../types';
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from 'next/link';

interface SupplierBillPaymentsTabProps {
    billPayments: BillPayment[];
    appliedDebits: AppliedDebitMemo[];
}

const ITEMS_PER_PAGE = 10;

export default function SupplierBillPaymentsTab({ billPayments, appliedDebits }: SupplierBillPaymentsTabProps) {
    const [subTab, setSubTab] = useState<'bill-payments' | 'applied-debits'>('bill-payments');
    const [currentPagePayments, setCurrentPagePayments] = useState(1);
    const [currentPageDebits, setCurrentPageDebits] = useState(1);

    // Bill Payments Sorting and Resizing
    const initialPaymentWidths = {
        name: 180,
        status: 120,
        amount: 140,
        paymentMethod: 160,
        referenceNo: 180,
        transactionDate: 160,
        scheduledDate: 160,
        failedDate: 160,
        postedDate: 160
    };
    const { items: sortedPayments, requestSort: requestSortPayments, sortConfig: sortConfigPayments } = useSortableData<BillPayment>(billPayments, { key: 'name', direction: 'desc' });
    const { widths: columnWidthsPayments, handleResize: handleResizePayments } = useResizableColumns(initialPaymentWidths);

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPagePayments - 1) * ITEMS_PER_PAGE;
        return sortedPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPayments, currentPagePayments]);

    const totalPagesPayments = Math.ceil(billPayments.length / ITEMS_PER_PAGE);

    // Applied Debit Memos Sorting and Resizing
    const initialDebitWidths = {
        name: 200,
        status: 120,
        appliedAmount: 160,
        debitMemoName: 180,
        supplierBillName: 180,
        appliedDate: 160,
        postedDate: 160,
        availableDebitBalance: 180,
        notes: 300
    };
    const { items: sortedDebits, requestSort: requestSortDebits, sortConfig: sortConfigDebits } = useSortableData<AppliedDebitMemo>(appliedDebits, { key: 'name', direction: 'desc' });
    const { widths: columnWidthsDebits, handleResize: handleResizeDebits } = useResizableColumns(initialDebitWidths);

    const paginatedDebits = useMemo(() => {
        const startIndex = (currentPageDebits - 1) * ITEMS_PER_PAGE;
        return sortedDebits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedDebits, currentPageDebits]);

    const totalPagesDebits = Math.ceil(appliedDebits.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-4 min-w-0">
            {/* Sub-tabs design from Proposal */}
            <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <button
                    onClick={() => setSubTab('bill-payments')}
                    className={`text-sm font-bold pb-1 transition-all border-b-2 truncate max-w-[150px] ${subTab === 'bill-payments'
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                    title={`Bill Payments (${billPayments.length})`}
                >
                    Bill Payments ({billPayments.length})
                </button>
                <button
                    onClick={() => setSubTab('applied-debits')}
                    className={`text-sm font-bold pb-1 transition-all border-b-2 truncate max-w-[150px] ${subTab === 'applied-debits'
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                    title={`Applied Debit Memos (${appliedDebits.length})`}
                >
                    Applied Debit Memos ({appliedDebits.length})
                </button>
            </div>

            {/* Sub Tab Content */}
            <div className="mt-2">
                {subTab === 'bill-payments' && (
                    billPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                            <p className="text-lg font-medium truncate" title="No Bill Payments Recorded">No Bill Payments Recorded</p>
                            <p className="text-sm truncate" title="There are no bill payments associated with this supplier bill.">There are no bill payments associated with this supplier bill.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" label="Bill Payment" field="name" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.name} onResize={handleResizePayments} />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.status} onResize={handleResizePayments} />
                                            <SortableHeader label="Amount" field="amount" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.amount} onResize={handleResizePayments} />
                                            <SortableHeader label="Payment Method" field="paymentMethod" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.paymentMethod} onResize={handleResizePayments} />
                                            <SortableHeader label="Reference No" field="referenceNo" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.referenceNo} onResize={handleResizePayments} />
                                            <SortableHeader label="Transaction Date" field="transactionDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.transactionDate} onResize={handleResizePayments} />
                                            <SortableHeader label="Scheduled Date" field="scheduledDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.scheduledDate} onResize={handleResizePayments} />
                                            <SortableHeader label="Failed Date" field="failedDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.failedDate} onResize={handleResizePayments} />
                                            <SortableHeader label="Posted Date" field="postedDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={columnWidthsPayments.postedDate} onResize={handleResizePayments} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                                <td className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white truncate sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 z-10 border-r border-gray-100 dark:border-gray-700">
                                                    {payment.name}
                                                </td>
                                                <td className="px-3 py-2 text-sm truncate">
                                                    <StatusBadge status={payment.status} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(payment.amount)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{payment.paymentMethod || '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{payment.referenceNo || '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{payment.transactionDate ? formatDate(payment.transactionDate, 'numeric-dash') : '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{payment.scheduledDate ? formatDate(payment.scheduledDate, 'numeric-dash') : '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{payment.failedDate ? formatDate(payment.failedDate, 'numeric-dash') : '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{payment.postedDate ? formatDate(payment.postedDate, 'numeric-dash') : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-3 py-2">
                                <Pagination
                                    currentPage={currentPagePayments}
                                    totalPages={totalPagesPayments}
                                    onPageChange={setCurrentPagePayments}
                                    totalItems={billPayments.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    itemName=""
                                />
                            </div>
                        </div>
                    )
                )}
                {subTab === 'applied-debits' && (
                    appliedDebits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                            <p className="text-lg font-medium truncate" title="No Applied Debit Memos">No Applied Debit Memos</p>
                            <p className="text-sm truncate" title="There are no applied debit memos associated with this supplier bill.">There are no applied debit memos associated with this supplier bill.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" label="Applied Debit Payment" field="name" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.name} onResize={handleResizeDebits} />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.status} onResize={handleResizeDebits} />
                                            <SortableHeader label="Applied Amount" field="appliedAmount" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.appliedAmount} onResize={handleResizeDebits} />
                                            <SortableHeader label="Debit Memo" field="debitMemoName" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.debitMemoName} onResize={handleResizeDebits} />
                                            <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.supplierBillName} onResize={handleResizeDebits} />
                                            <SortableHeader label="Applied Date" field="appliedDate" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.appliedDate} onResize={handleResizeDebits} />
                                            <SortableHeader label="Posted Date" field="postedDate" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.postedDate} onResize={handleResizeDebits} />
                                            <SortableHeader label="Available Debit Balance" field="availableDebitBalance" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.availableDebitBalance} onResize={handleResizeDebits} />
                                            <SortableHeader label="Applied Debit Memo Notes" field="notes" sortConfig={sortConfigDebits} requestSort={requestSortDebits} width={columnWidthsDebits.notes} onResize={handleResizeDebits} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedDebits.map((debit) => (
                                            <tr key={debit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                                <td className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white truncate sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 z-10 border-r border-gray-100 dark:border-gray-700">
                                                    {debit.name || ''}
                                                </td>
                                                <td className="px-3 py-2 text-sm truncate">
                                                    <StatusBadge status={debit.status} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.appliedAmount)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">
                                                    {debit.debitMemoName || ' '}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">
                                                    {debit.supplierBillName || ''}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.appliedDate ? formatDate(debit.appliedDate, 'numeric-dash') : '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate">{debit.postedDate ? formatDate(debit.postedDate, 'numeric-dash') : '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(debit.availableDebitBalance)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={debit.notes}>{debit.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-3 py-2">
                                <Pagination
                                    currentPage={currentPageDebits}
                                    totalPages={totalPagesDebits}
                                    onPageChange={setCurrentPageDebits}
                                    totalItems={appliedDebits.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    itemName=""
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
