import { useState, useMemo } from "react";
import { ReceivePayment, AppliedCreditMemo } from "../../types";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

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

    const renderReceivePayments = () => {
        if (receivePayments.length === 0) {
            return (
                <TableEmptyState message="No record found" description="There are no recieved payments associated with this invoice." />
            );
        }

        return (
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader label="Receive Payment" field="name" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.name} onResize={handleReceiveResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.status} onResize={handleReceiveResize} />
                                <SortableHeader label="Amount" field="amount" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.amount} onResize={handleReceiveResize} />
                                <SortableHeader label="Payment Method" field="paymentMethod" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.method} onResize={handleReceiveResize} />
                                <SortableHeader label="Reference No" field="referenceNo" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.reference} onResize={handleReceiveResize} />
                                <SortableHeader label="Transaction Date" field="transactionDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.transactionDate} onResize={handleReceiveResize} />
                                <SortableHeader label="Scheduled Date" field="scheduledDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.scheduledDate} onResize={handleReceiveResize} />
                                <SortableHeader label="Failed Date" field="failedDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.failedDate} onResize={handleReceiveResize} />
                                <SortableHeader label="Posted Date" field="postedDate" sortConfig={sortConfigPayments} requestSort={requestSortPayments} width={receiveWidths.postedDate} onResize={handleReceiveResize} />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedPayments.map((payment) => (
                                <Tr key={payment.id} className="transition-colors">
                                    <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={payment.name}>{payment.name}</Td>
                                    <Td className="truncate">
                                        <StatusBadge status={payment.status} variant="compact" />
                                    </Td>
                                    <Td className="font-semibold truncate" title={formatCurrency(payment.amount)}>{formatCurrency(payment.amount)}</Td>
                                    <Td className="truncate" title={payment.paymentMethod}>{displayCell(payment.paymentMethod)}</Td>
                                    <Td className="truncate" title={payment.referenceNo}>{displayCell(payment.referenceNo)}</Td>
                                    <Td className="truncate" title={formatDate(payment.transactionDate, 'numeric-dash')}>{formatDate(payment.transactionDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" title={formatDate(payment.scheduledDate, 'numeric-dash')}>{formatDate(payment.scheduledDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" title={formatDate(payment.failedDate, 'numeric-dash')}>{formatDate(payment.failedDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" title={formatDate(payment.postedDate, 'numeric-dash')}>{formatDate(payment.postedDate, 'numeric-dash')}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
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
                <TableEmptyState message="No record found" description="These is no applied credit payments associated with this invoice." />
            );
        }

        return (
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader label="Applied Credit Payment" field="name" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.acpName} onResize={handleAppliedResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.status} onResize={handleAppliedResize} />
                                <SortableHeader label="Applied Amount" field="appliedAmount" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.appliedAmount} onResize={handleAppliedResize} />
                                <SortableHeader label="Credit Memo" field="creditMemoName" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.creditMemo} onResize={handleAppliedResize} />
                                <SortableHeader label="Proposal" field="proposalName" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.proposal} onResize={handleAppliedResize} />
                                <SortableHeader label="Posted Date" field="postedDate" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.postedDate} onResize={handleAppliedResize} />
                                <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.balance} onResize={handleAppliedResize} />
                                <SortableHeader label="Applied Credit Notes" field="notes" sortConfig={sortConfigMemos} requestSort={requestSortMemos} width={appliedWidths.notes} onResize={handleAppliedResize} />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedMemos.map((memo) => (
                                <Tr key={memo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={memo.name}>{memo.name}</Td>
                                    <Td className="px-3 py-2 truncate">
                                        <StatusBadge status={memo.status} variant="compact" />
                                    </Td>
                                    <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate" title={formatCurrency(memo.appliedAmount)}>{formatCurrency(memo.appliedAmount)}</Td>
                                    <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={memo.creditMemoName}>{displayCell(memo.creditMemoName)}</Td>
                                    <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(memo.appliedDate, 'numeric-dash')}>{formatDate(memo.appliedDate, 'numeric-dash')}</Td>
                                    <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatDate(memo.postedDate, 'numeric-dash')}>{formatDate(memo.postedDate, 'numeric-dash')}</Td>
                                    <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(memo.availableCreditBalance)}>{formatCurrency(memo.availableCreditBalance)}</Td>
                                    <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                                        <div className="truncate" title={memo.notes}>{displayCell(memo.notes)}</div>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
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
