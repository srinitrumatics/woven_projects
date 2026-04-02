import { useState, useMemo } from "react";
import Link from "next/link";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../types";
import { useSortableData } from "../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";

const ITEMS_PER_PAGE = 10;

interface ReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
    widths: Record<string, any>;
    onResize: (tab: string, field: string, width: number) => void;
}

export default function ReturnsTab({ returnsData, loading, widths, onResize }: ReturnsTabProps) {
    const [activeTab, setActiveTab] = useState<ReturnsTabType>("rma");
    const [currentPage, setCurrentPage] = useState(1);

    const tabs: { id: ReturnsTabType; label: string; count: number }[] = [
        { id: "rma", label: "RMAs", count: returnsData.rma.length },
        { id: "credit", label: "Credit Memos", count: returnsData.creditMemos.length },
        { id: "rtv", label: "RTVs", count: returnsData.rtv.length },
        { id: "debit", label: "Debit Memos", count: returnsData.debitMemos.length },
    ];

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
    const { items: sortedData, requestSort: originalRequestSort, sortConfig } = useSortableData<RMA | RTV | CreditMemo | DebitMemo>(activeData);

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
        return (
            <div className="flex justify-center items-center p-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
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
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                        <p className="text-sm truncate">
                            There are no {activeTab === 'rma' ? 'RMAs' :
                                activeTab === 'credit' ? 'Credit Memos' :
                                    activeTab === 'rtv' ? 'RTVs' :
                                        'Debit Memos'} associated with this proposal.
                        </p>
                    </div>
                ) : (
                    <table className="w-full table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>

                                {activeTab === 'rma' ? (
                                    <>
                                        <SortableHeader label="RMA" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].salesOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerQuoteName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="RMA Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].rmaType} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shipFromAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shipFromContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return to Account" field="returnToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnToAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return to Contact" field="returnToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnToContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].dropShip} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalLines} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].totalPrice} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].issuedDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].returnByDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].shippingMethod} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].logisticsPartner} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].logisticsContact} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].trackingNumber} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].estimatedDeliveryDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].trackingStatus} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].actualDeliveryDate} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].goodsReceiptDate} onResize={(f, w) => onResize(activeTab, f, w)} />
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
                                        <SortableHeader label="Credit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].invoiceName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerQuoteName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].customerOrderName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Credit to Account" field="creditToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].creditToAccountName} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Credit to Contact" field="creditToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].creditToContactName} onResize={(f, w) => onResize(activeTab, f, w)} />
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
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedData.map((item) => {
                                // Type guards or casting can be used here if needed, or simple property access if common
                                const rma = item as RMA;
                                const rtv = item as RTV;
                                const credit = item as CreditMemo;
                                const debit = item as DebitMemo;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate z-10" title={item.name}>
                                            {item.name}
                                        </td>
                                        <td className="px-3 py-2 truncate">
                                            <StatusBadge status={item.status} />
                                        </td>

                                        {activeTab === 'rma' ? (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {rma.salesOrderName && rma.salesOrderId ? (
                                                        <Link href={`/orders/${rma.salesOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.salesOrderName}>{rma.salesOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.salesOrderName}>{rma.salesOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {rma.customerQuoteName && rma.customerQuoteId ? (
                                                        <Link href={`/quotes/${rma.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.customerQuoteName}>{rma.customerQuoteName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.customerQuoteName}>{rma.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {rma.customerOrderName && rma.customerOrderId ? (
                                                        <Link href={`/orders/${rma.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rma.customerOrderName}>{rma.customerOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rma.customerOrderName}>{rma.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rma.rmaType}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.rmaType}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rma.shipFromAccountName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.shipFromAccountName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rma.shipFromContactName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.shipFromContactName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rma.returnToAccountName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.returnToAccountName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rma.returnToContactName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.returnToContactName}</div></td>
                                                <td className="px-3 py-2 min-w-[103px] truncate">
                                                    <span className={`inline-flex text-sm font-medium rounded ${rma.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2  text-sm text-gray-900 dark:text-white min-w-[123px] truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(rma.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${rma.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.issuedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.returnByDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.shippingMethod}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.logisticsPartner}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.logisticsContact}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.trackingNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[198px] truncate">{rma.estimatedDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.trackingStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[173px] truncate">{rma.actualDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[199px] truncate">{rma.goodsReceiptDate}</td>
                                            </>
                                        ) : activeTab === 'rtv' ? (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {rtv.purchaseOrderName && rtv.purchaseOrderId ? (
                                                        <Link href={`/purchase-orders/${rtv.purchaseOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rtv.purchaseOrderName}>{rtv.purchaseOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rtv.purchaseOrderName}>{rtv.purchaseOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {rtv.customerQuoteName && rtv.customerQuoteId ? (
                                                        <Link href={`/quotes/${rtv.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rtv.customerQuoteName}>{rtv.customerQuoteName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rtv.customerQuoteName}>{rtv.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {rtv.customerOrderName && rtv.customerOrderId ? (
                                                        <Link href={`/orders/${rtv.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={rtv.customerOrderName}>{rtv.customerOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={rtv.customerOrderName}>{rtv.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.rtvType}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.rmaNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.shipFromAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.shipFromContactName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.supplierName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.supplierContact}</td>
                                                <td className="px-3 py-2  text-sm text-gray-900 dark:text-white min-w-[115px] truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(rtv.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rtv.issuedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rtv.approvalDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rtv.returnByDate}</td>
                                            </>
                                        ) : activeTab === 'credit' ? (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.invoiceName}>{credit.invoiceName}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {credit.customerQuoteName && credit.customerQuoteId ? (
                                                        <Link href={`/quotes/${credit.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={credit.customerQuoteName}>{credit.customerQuoteName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.customerQuoteName}>{credit.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {credit.customerOrderName && credit.customerOrderId ? (
                                                        <Link href={`/orders/${credit.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={credit.customerOrderName}>{credit.customerOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={credit.customerOrderName}>{credit.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{credit.creditToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{credit.creditToContactName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[125px] truncate">
                                                    <span className="inline-flex items-center justify-center h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(credit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${credit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${credit.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold min-w-[176px] truncate">
                                                    ${credit.totalCreditAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{credit.issuedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{credit.expirationDate}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[201px] truncate">
                                                    ${credit.availableCreditBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{credit.settledDate}</td>
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === 'debit' && (
                                                    <>
                                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                            <div className="text-sm text-gray-900 dark:text-white truncate" title={debit.supplierBillName}>{debit.supplierBillName}</div>
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                            {debit.purchaseOrderName && debit.purchaseOrderId ? (
                                                                <Link href={`/purchase-orders/${debit.purchaseOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={debit.purchaseOrderName}>{debit.purchaseOrderName}</Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 dark:text-white truncate" title={debit.purchaseOrderName}>{debit.purchaseOrderName}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                            {debit.customerOrderName && debit.customerOrderId ? (
                                                                <Link href={`/orders/${debit.customerOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={debit.customerOrderName}>{debit.customerOrderName}</Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 dark:text-white truncate" title={debit.customerOrderName}>{debit.customerOrderName}</div>
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[190px] truncate">{debit.supplierCreditMemoName}</td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{debit.debitToAccountName}</td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{debit.debitToContactName}</td>
                                                        <td className="px-3 py-2  text-sm text-gray-900 dark:text-white min-w-[110px] truncate">
                                                            <span className="inline-flex items-center justify-center min-w-[32px] px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                                {(debit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                            ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                            ${debit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold min-w-[171px] truncate">
                                                            ${debit.totalDebitAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{debit.issuedDate}</td>
                                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{debit.approvalDate}</td>
                                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[199px] truncate">
                                                            ${debit.availableDebitBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{debit.settledDate}</td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                            }
                        </tbody>
                    </table>
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