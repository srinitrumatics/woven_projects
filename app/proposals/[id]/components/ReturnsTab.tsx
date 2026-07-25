import { useState, useMemo } from "react";
import Link from "next/link";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../types";
import { useSortableData } from "../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";
import { useUserSession } from "@/components/UserSessionContext";
import { displayCell } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

const ITEMS_PER_PAGE = 10;

interface ReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
    widths: Record<string, any>;
    onResize: (tab: string, field: string, width: number) => void;
}

export default function ReturnsTab({ returnsData, loading, widths, onResize }: ReturnsTabProps) {
    const { selectedAccount } = useUserSession();
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

    const [activeTab, setActiveTab] = useState<ReturnsTabType>("rma");
    const [currentPage, setCurrentPage] = useState(1);

    const tabs = ([
        { id: "rma", label: "RMAs", count: returnsData.rma.length },
        { id: "credit", label: "Credit Memos", count: returnsData.creditMemos.length },
        { id: "rtv", label: "RTVs", count: returnsData.rtv.length },
        { id: "debit", label: "Debit Memos", count: returnsData.debitMemos.length },
    ] as { id: ReturnsTabType; label: string; count: number }[]).filter(tab => {
        if (isRestricted && (tab.id === 'rtv' || tab.id === 'debit')) return false;
        return true;
    });

    const getActiveData = () => {
        switch (activeTab) {
            case "rma": return returnsData.rma;
            case "rtv": return returnsData.rtv;
            case "credit": return returnsData.creditMemos;
            case "debit": return returnsData.debitMemos;
            default: return [];
        }
    };

    const activeData = getActiveData();
    const { items: sortedData, requestSort: originalRequestSort, sortConfig } = useSortableData<RMA | RTV | CreditMemo | DebitMemo>(activeData, { key: 'name', direction: 'asc' });

    const requestSort = (key: string) => {
        originalRequestSort(key as any);
        setCurrentPage(1);
    };

    const handleTabChange = (tab: ReturnsTabType) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-1 truncate">
                                ({tab.count})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                {sortedData.length === 0 ? (
                    <TableEmptyState
                        message="No records found"
                        description={`There are no ${activeTab === 'rma' ? 'RMAs' :
                            activeTab === 'credit' ? 'Credit Memos' :
                                activeTab === 'rtv' ? 'RTVs' :
                                    'Debit Memos'} associated with this proposal.`}
                    />
                ) : (
                    <Table className="table-fixed">
                        <THead>
                            <tr>

                                {activeTab === 'rma' ? (
                                    <>
                                        <SortableHeader label="RMA #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].rmaType} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].salesOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerQuoteName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].proposalId} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].proposalName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shipFromAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shipFromContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return to Account" field="returnToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnToAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return to Contact" field="returnToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnToContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].dropShip} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalLines} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalPrice} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].issuedDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return By Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnByDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shippingMethod} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].logisticsPartner} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].logisticsContact} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].trackingNumber} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].trackingStatus} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].estimatedDeliveryDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].actualDeliveryDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].goodsReceiptDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                    </>
                                ) : activeTab === 'rtv' ? (
                                    <>
                                        <SortableHeader label="RTV" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].purchaseOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerQuoteName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="RTV Type" field="rtvType" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].rtvType} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="RMA Number" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].rmaNumber} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shipFromAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shipFromContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].supplierName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].supplierContact} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalLines} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalCost} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].issuedDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].approvalDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnByDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                    </>
                                ) : activeTab === 'credit' ? (
                                    <>
                                        <SortableHeader label="Credit Memo #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Invoice #" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].invoiceName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].salesOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerQuoteName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].proposalId} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].proposalName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalLines} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalPrice} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalShippingCharges} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalTaxesAmount} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalCreditAmount} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].issuedDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].expirationDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].availableCreditBalance} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].settledDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                    </>
                                ) : (
                                    <>
                                        {activeTab === 'debit' && (
                                            <>
                                                <SortableHeader label="Debit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].supplierBillName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].purchaseOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Supplier Credit Memo" field="supplierCreditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].supplierCreditMemoName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Debit to Account" field="debitToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].debitToAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Debit to Contact" field="debitToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].debitToContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalLines} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalCost} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalShippingCharges} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Total Debit Amount" field="totalDebitAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalDebitAmount} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].issuedDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].approvalDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Available Debit Balance" field="availableDebitBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].availableDebitBalance} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].settledDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                            </>
                                        )}
                                    </>
                                )}
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedData.map((item) => {
                                // Type guards or casting can be used here if needed, or simple property access if common
                                const rma = item as RMA;
                                const rtv = item as RTV;
                                const credit = item as CreditMemo;
                                const debit = item as DebitMemo;

                                return (
                                    <Tr key={item.id} className="transition-colors">
                                        <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate z-10" title={item.name}>
                                            {displayCell(item.name)}
                                        </Td>
                                        <Td className="truncate">
                                            <StatusBadge status={item.status} />
                                        </Td>

                                        {activeTab === 'rma' ? (
                                            <>
                                                <Td className="truncate" title={rma.rmaType}><div className="text-sm text-gray-900 dark:text-white truncate ">{displayCell(rma.rmaType)}</div></Td>
                                                <Td className="truncate">
                                                    {rma.salesOrderName && rma.salesOrderId && !isRestricted ? (
                                                        <Link href={`/orders/${rma.salesOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.salesOrderName}>{rma.salesOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.salesOrderName}>{displayCell(rma.salesOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    {rma.customerQuoteName && rma.customerQuoteId ? (
                                                        <Link href={`/quotes/${rma.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.customerQuoteName}>{rma.customerQuoteName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.customerQuoteName}>{displayCell(rma.customerQuoteName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    {rma.proposalNumber && rma.proposalId ? (
                                                        <Link href={`/proposals/${rma.proposalId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.proposalNumber}>{rma.proposalNumber}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.proposalNumber}>{displayCell(rma.proposalNumber)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={rma.proposalName}>{displayCell(rma.proposalName)}</Td>
                                                <Td className="truncate">
                                                    {rma.customerOrderName && rma.customerOrderId ? (
                                                        <Link href={`/orders/${rma.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.customerOrderName}>{rma.customerOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.customerOrderName}>{displayCell(rma.customerOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={rma.shipFromAccountName}><div className="text-sm text-gray-900 dark:text-white truncate ">{displayCell(rma.shipFromAccountName)}</div></Td>
                                                <Td className="truncate" title={rma.shipFromContactName}><div className="text-sm text-gray-900 dark:text-white truncate ">{displayCell(rma.shipFromContactName)}</div></Td>
                                                <Td className="truncate" title={rma.returnToAccountName}><div className="text-sm text-gray-900 dark:text-white truncate ">{displayCell(rma.returnToAccountName)}</div></Td>
                                                <Td className="truncate" title={rma.returnToContactName}><div className="text-sm text-gray-900 dark:text-white truncate ">{displayCell(rma.returnToContactName)}</div></Td>
                                                <Td className="min-w-[103px] truncate">
                                                    <span className={`inline-flex text-sm font-medium rounded ${rma.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </Td>
                                                <Td className="min-w-[123px] truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(rma.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    ${rma.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.issuedDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.returnByDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.shippingMethod)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.logisticsPartner)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.logisticsContact)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.trackingNumber)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rma.trackingStatus)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[198px] truncate">{displayCell(rma.estimatedDeliveryDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[173px] truncate">{displayCell(rma.actualDeliveryDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[199px] truncate">{displayCell(rma.goodsReceiptDate)}</Td>
                                            </>
                                        ) : activeTab === 'rtv' ? (
                                            <>
                                                <Td className="truncate">
                                                    {rtv.purchaseOrderName && rtv.purchaseOrderId ? (
                                                        <Link href={`/purchase-orders/${rtv.purchaseOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rtv.purchaseOrderName}>{rtv.purchaseOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rtv.purchaseOrderName}>{displayCell(rtv.purchaseOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    {rtv.customerQuoteName && rtv.customerQuoteId ? (
                                                        <Link href={`/quotes/${rtv.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rtv.customerQuoteName}>{rtv.customerQuoteName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rtv.customerQuoteName}>{displayCell(rtv.customerQuoteName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    {rtv.customerOrderName && rtv.customerOrderId ? (
                                                        <Link href={`/orders/${rtv.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rtv.customerOrderName}>{rtv.customerOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rtv.customerOrderName}>{displayCell(rtv.customerOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">{displayCell(rtv.rtvType)}</Td>
                                                <Td className="truncate">{displayCell(rtv.rmaNumber)}</Td>
                                                <Td className="truncate">{displayCell(rtv.shipFromAccountName)}</Td>
                                                <Td className="truncate">{displayCell(rtv.shipFromContactName)}</Td>
                                                <Td className="truncate">{displayCell(rtv.supplierName)}</Td>
                                                <Td className="truncate">{displayCell(rtv.supplierContact)}</Td>
                                                <Td className="min-w-[115px] truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(rtv.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rtv.issuedDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rtv.approvalDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(rtv.returnByDate)}</Td>
                                            </>
                                        ) : activeTab === 'credit' ? (
                                            <>
                                                <Td className="truncate">
                                                    {credit.invoiceName && credit.invoiceId ? (
                                                        <Link href={`/invoices/${credit.invoiceId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={credit.invoiceName}>{credit.invoiceName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.invoiceName}>{displayCell(credit.invoiceName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={credit.salesOrderName}>{displayCell(credit.salesOrderName)}</Td>
                                                <Td className="truncate">
                                                    {credit.customerQuoteName && credit.customerQuoteId ? (
                                                        <Link href={`/quotes/${credit.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={credit.customerQuoteName}>{credit.customerQuoteName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.customerQuoteName}>{displayCell(credit.customerQuoteName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    {credit.proposalNumber && credit.proposalId ? (
                                                        <Link href={`/proposals/${credit.proposalId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={credit.proposalNumber}>{credit.proposalNumber}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.proposalNumber}>{displayCell(credit.proposalNumber)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={credit.proposalName}>{displayCell(credit.proposalName)}</Td>
                                                <Td className="truncate">
                                                    {credit.customerOrderName && credit.customerOrderId ? (
                                                        <Link href={`/orders/${credit.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={credit.customerOrderName}>{credit.customerOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.customerOrderName}>{displayCell(credit.customerOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="min-w-[125px] truncate">
                                                    <span className="inline-flex items-center justify-center h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(credit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${credit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${credit.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="font-semibold min-w-[176px] truncate">
                                                    ${credit.totalCreditAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(credit.issuedDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(credit.expirationDate)}</Td>
                                                <Td className="min-w-[201px] truncate">
                                                    ${credit.availableCreditBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(credit.settledDate)}</Td>
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === 'debit' && (
                                                    <>
                                                        <Td className="truncate">
                                                            {debit.supplierBillName && debit.supplierBillId ? (
                                                                <Link href={`/supplier-bills/${debit.supplierBillId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={debit.supplierBillName}>{debit.supplierBillName}</Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 dark:text-white truncate" title={debit.supplierBillName}>{displayCell(debit.supplierBillName)}</div>
                                                            )}
                                                        </Td>
                                                        <Td className="truncate">
                                                            {debit.purchaseOrderName && debit.purchaseOrderId ? (
                                                                <Link href={`/purchase-orders/${debit.purchaseOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={debit.purchaseOrderName}>{debit.purchaseOrderName}</Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 dark:text-white truncate" title={debit.purchaseOrderName}>{displayCell(debit.purchaseOrderName)}</div>
                                                            )}
                                                        </Td>
                                                        <Td className="truncate">
                                                            {debit.customerOrderName && debit.customerOrderId ? (
                                                                <Link href={`/orders/${debit.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={debit.customerOrderName}>{debit.customerOrderName}</Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 dark:text-white truncate" title={debit.customerOrderName}>{displayCell(debit.customerOrderName)}</div>
                                                            )}
                                                        </Td>

                                                        <Td className="min-w-[190px] truncate">{displayCell(debit.supplierCreditMemoName)}</Td>
                                                        <Td className="truncate">{displayCell(debit.debitToAccountName)}</Td>
                                                        <Td className="truncate">{displayCell(debit.debitToContactName)}</Td>
                                                        <Td className="min-w-[110px] truncate">
                                                            <span className="inline-flex items-center justify-center min-w-[32px] px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                                {(debit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </Td>
                                                        <Td className="truncate">
                                                            ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </Td>
                                                        <Td className="truncate">
                                                            ${debit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </Td>
                                                        <Td className="font-semibold min-w-[171px] truncate">
                                                            ${debit.totalDebitAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </Td>
                                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(debit.issuedDate)}</Td>
                                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(debit.approvalDate)}</Td>
                                                        <Td className="min-w-[199px] truncate">
                                                            ${debit.availableDebitBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </Td>
                                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(debit.settledDate)}</Td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Tr>
                                );
                            })
                            }
                        </TBody>
                    </Table>
                )}
            </div>
            <div className="px-4 py-3">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={activeData.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Shipped":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Accepted":
            case "Draft":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Pending Review":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Under Review":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "Rejected":
            case "Partial Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Quote Requested":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "Quote Ready":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Proposal Sent":
                return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
            case "Negotiation":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "Awarded":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}