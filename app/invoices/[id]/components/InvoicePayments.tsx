import { useState, useMemo } from "react";
import { ReceivePayment, AppliedCreditMemo } from "../../types";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

interface InvoicePaymentsProps {
    receivePayments: ReceivePayment[];
    creditMemos: AppliedCreditMemo[];
}

type SubTabType = "receive" | "applied";

export default function InvoicePayments({ receivePayments, creditMemos }: InvoicePaymentsProps) {
    const [activeSubTab, setActiveSubTab] = useState<SubTabType>("receive");

    const [currentPagePayments, setCurrentPagePayments] = useState(1);
    const [currentPageMemos, setCurrentPageMemos] = useState(1);

    const { items: sortedPayments, requestSort: requestSortPayments, sortConfig: sortConfigPayments } = useSortableData<ReceivePayment>(receivePayments, { key: 'name', direction: 'desc' });
    const { items: sortedMemos, requestSort: requestSortMemos, sortConfig: sortConfigMemos } = useSortableData<AppliedCreditMemo>(creditMemos, { key: 'name', direction: 'desc' });

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPagePayments - 1) * ITEMS_PER_PAGE;
        return sortedPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPayments, currentPagePayments]);
    const totalPagesPayments = Math.ceil(receivePayments.length / ITEMS_PER_PAGE);

    const paginatedMemos = useMemo(() => {
        const startIndex = (currentPageMemos - 1) * ITEMS_PER_PAGE;
        return sortedMemos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedMemos, currentPageMemos]);
    const totalPagesMemos = Math.ceil(creditMemos.length / ITEMS_PER_PAGE);

    const { widths: receiveWidths, handleResize: handleReceiveResize } = useResizableColumns({
        name: 180,
        status: 120,
        amount: 140,
        method: 150,
        reference: 160,
        customerQuote: 160,
        customerOrder: 160,
        invoice: 160,
        proposal: 160,
        transactionDate: 150,
        scheduledDate: 150,
        failedDate: 150,
        postedDate: 150
    });

    const { widths: appliedWidths, handleResize: handleAppliedResize } = useResizableColumns({
        acpName: 220,
        status: 120,
        appliedAmount: 160,
        customerQuote: 160,
        customerOrder: 160,
        creditMemo: 160,
        invoice: 160,
        proposal: 160,
        appliedDate: 150,
        postedDate: 150,
        balance: 200,
        notes: 250
    });

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('paid') || s.includes('posted') || s.includes('completed') || s.includes('success')) {
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        }
        if (s.includes('fail') || s.includes('error') || s.includes('rejected')) {
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        }
        if (s.includes('process') || s.includes('sched')) {
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    };

    const renderReceivePayments = () => {
        if (receivePayments.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg truncate" title="No record found">No record found</p>
                    <p className="text-sm truncate" title="There are no recieved payments associated with this invoice.">There are no recieved payments associated with this invoice.</p>

                </div>
            );
        }

        return (
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader truncate={false} label="Receive Payment" field="name" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.name} onResize={handleReceiveResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader truncate={false} label="Status" field="status" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.status} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Amount" field="amount" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.amount} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Payment Method" field="paymentMethod" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.method} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Reference No" field="referenceNo" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.reference} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Transaction Date" field="transactionDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.transactionDate} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Scheduled Date" field="scheduledDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.scheduledDate} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Failed Date" field="failedDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.failedDate} onResize={handleReceiveResize} />
                                <SortableHeader truncate={false} label="Posted Date" field="postedDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.postedDate} onResize={handleReceiveResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-3 py-2 text-sm font-medium sticky left-0  text-gray-900 dark:text-white truncate" title={payment.name}>{payment.name}</td>
                                    <td className="px-3 py-2 truncate">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(payment.status)}`} title={payment.status}>{payment.status}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate" title={formatCurrency(payment.amount)}>{formatCurrency(payment.amount)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={payment.paymentMethod}>{displayCell(payment.paymentMethod)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={payment.referenceNo}>{displayCell(payment.referenceNo)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(payment.transactionDate, 'numeric-dash')}>{formatDate(payment.transactionDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(payment.scheduledDate, 'numeric-dash')}>{formatDate(payment.scheduledDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(payment.failedDate, 'numeric-dash')}>{formatDate(payment.failedDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(payment.postedDate, 'numeric-dash')}>{formatDate(payment.postedDate, 'numeric-dash')}</td>
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
                        totalItems={receivePayments.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemName=""
                    />
                </div>
            </div>
        );
    };

    const renderAppliedCredits = () => {
        if (creditMemos.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg truncate" title="No record found">No record found</p>
                    <p className="text-sm truncate" title="These is no applied credit payments associated with this invoice.">These is no applied credit payments associated with this invoice.</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader truncate={false} label="Applied Credit Payment" field="name" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.acpName} onResize={handleAppliedResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10 min-w-[200px]" />
                                <SortableHeader truncate={false} label="Status" field="status" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.status} onResize={handleAppliedResize} />
                                <SortableHeader truncate={false} label="Applied Amount" field="appliedAmount" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.appliedAmount} onResize={handleAppliedResize} />
                                <SortableHeader truncate={false} label="Credit Memo" field="creditMemoName" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.creditMemo} onResize={handleAppliedResize} />
                                <SortableHeader truncate={false} label="Proposal" field="proposalName" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.proposal} onResize={handleAppliedResize} />
                                <SortableHeader truncate={false} label="Posted Date" field="postedDate" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.postedDate} onResize={handleAppliedResize} />
                                <SortableHeader truncate={false} label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.balance} onResize={handleAppliedResize} />
                                <SortableHeader truncate={false} label="Applied Credit Notes" field="notes" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.notes} onResize={handleAppliedResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedMemos.map((memo) => (
                                <tr key={memo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-3 py-2 text-sm font-medium sticky left-0 text-gray-900 dark:text-white truncate" title={memo.name}>{memo.name}</td>
                                    <td className="px-3 py-2 truncate">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(memo.status)}`}>{memo.status}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate" title={formatCurrency(memo.appliedAmount)}>{formatCurrency(memo.appliedAmount)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={memo.creditMemoName}>{displayCell(memo.creditMemoName)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(memo.appliedDate, 'numeric-dash')}>{formatDate(memo.appliedDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(memo.postedDate, 'numeric-dash')}>{formatDate(memo.postedDate, 'numeric-dash')}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(memo.availableCreditBalance)}>{formatCurrency(memo.availableCreditBalance)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                                        <div className="truncate" title={memo.notes}>{displayCell(memo.notes)}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-3 py-2 ">
                    <Pagination
                        currentPage={currentPageMemos}
                        totalPages={totalPagesMemos}
                        onPageChange={setCurrentPageMemos}
                        totalItems={creditMemos.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemName=""
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => setActiveSubTab("receive")}
                    className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${activeSubTab === "receive"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    Receive Payments {receivePayments.length > 0 && `(${receivePayments.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("applied")}
                    className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${activeSubTab === "applied"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    Applied Credit Payments {creditMemos.length > 0 && `(${creditMemos.length})`}
                </button>
            </div>

            <div className="mt-2">
                {activeSubTab === "receive" ? renderReceivePayments() : renderAppliedCredits()}
            </div>
        </div>
    );
}
