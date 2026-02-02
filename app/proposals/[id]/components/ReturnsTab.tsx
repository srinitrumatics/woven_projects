import { useState } from "react";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../types";
import { useSortableData } from "../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../components/ui/SortableHeader";

interface ReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
    widths: Record<string, any>;
    onResize: (tab: string, field: string, width: number) => void;
}

export default function ReturnsTab({ returnsData, loading, widths, onResize }: ReturnsTabProps) {
    const [activeTab, setActiveTab] = useState<ReturnsTabType>("rma");

    const tabs: { id: ReturnsTabType; label: string; count: number }[] = [
        { id: "rma", label: "RMAs", count: returnsData.rma.length },
        { id: "rtv", label: "RTVs", count: returnsData.rtv.length },
        { id: "credit", label: "Credit Memos", count: returnsData.creditMemos.length },
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
    const { items: sortedData, requestSort, sortConfig } = useSortableData<RMA | RTV | CreditMemo | DebitMemo>(activeData);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
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
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-1.5 py-0.5 text-sm rounded-full ${activeTab === tab.id
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                <table className="w-full table-fixed min-w-[3000px]">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            <SortableHeader label={activeTab === 'rma' ? 'RMA' : 'Number'} field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].name} onResize={(f, w) => onResize(activeTab, f, w)} align="left" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} align="center" />

                            {activeTab === 'rma' ? (
                                <>
                                    <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.salesOrderName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.customerQuoteName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.customerOrderName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="RMA Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.rmaType} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.shipFromAccountName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.shipFromContactName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Return to Account" field="returnToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.returnToAccountName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Return to Contact" field="returnToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.returnToContactName} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.dropShip} onResize={(f, w) => onResize('rma', f, w)} align="center" />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.totalLines} onResize={(f, w) => onResize('rma', f, w)} align="right" />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.totalPrice} onResize={(f, w) => onResize('rma', f, w)} align="right" />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.issuedDate} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.returnByDate} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.shippingMethod} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.logisticsPartner} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.logisticsContact} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.trackingNumber} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.estimatedDeliveryDate} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.trackingStatus} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.actualDeliveryDate} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                    <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.goodsReceiptDate} onResize={(f, w) => onResize('rma', f, w)} align="left" />
                                </>
                            ) : activeTab === 'rtv' ? (
                                <>
                                    <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.purchaseOrderName} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.customerQuoteName} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.customerOrderName} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="RTV Type" field="rtvType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.rtvType} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="RMA Number" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.rmaNumber} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.shipFromAccountName} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.shipFromContactName} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.supplierName} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.supplierContact} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.totalLines} onResize={(f, w) => onResize('rtv', f, w)} align="right" />
                                    <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.totalCost} onResize={(f, w) => onResize('rtv', f, w)} align="right" />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.issuedDate} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.approvalDate} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                    <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.returnByDate} onResize={(f, w) => onResize('rtv', f, w)} align="left" />
                                </>
                            ) : activeTab === 'credit' ? (
                                <>
                                    <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.invoiceName} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.customerQuoteName} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.customerOrderName} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Credit to Account" field="creditToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.creditToAccountName} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Credit to Contact" field="creditToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.creditToContactName} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalLines} onResize={(f, w) => onResize('credit', f, w)} align="right" />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalPrice} onResize={(f, w) => onResize('credit', f, w)} align="right" />
                                    <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalShippingCharges} onResize={(f, w) => onResize('credit', f, w)} align="right" />
                                    <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalTaxesAmount} onResize={(f, w) => onResize('credit', f, w)} align="right" />
                                    <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalCreditAmount} onResize={(f, w) => onResize('credit', f, w)} align="right" />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.issuedDate} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.expirationDate} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                    <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.availableCreditBalance} onResize={(f, w) => onResize('credit', f, w)} align="right" />
                                    <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.settledDate} onResize={(f, w) => onResize('credit', f, w)} align="left" />
                                </>
                            ) : (
                                <>
                                    {activeTab === 'debit' && (
                                        <>
                                            <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.supplierBillName} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.purchaseOrderName} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.customerOrderName} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Supplier Credit Memo" field="supplierCreditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.supplierCreditMemoName} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Debit to Account" field="debitToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.debitToAccountName} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Debit to Contact" field="debitToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.debitToContactName} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalLines} onResize={(f, w) => onResize('debit', f, w)} align="right" />
                                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalCost} onResize={(f, w) => onResize('debit', f, w)} align="right" />
                                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalShippingCharges} onResize={(f, w) => onResize('debit', f, w)} align="right" />
                                            <SortableHeader label="Total Debit Amount" field="totalDebitAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalDebitAmount} onResize={(f, w) => onResize('debit', f, w)} align="right" />
                                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.issuedDate} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.approvalDate} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                            <SortableHeader label="Available Debit Balance" field="availableDebitBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.availableDebitBalance} onResize={(f, w) => onResize('debit', f, w)} align="right" />
                                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.settledDate} onResize={(f, w) => onResize('debit', f, w)} align="left" />
                                        </>
                                    )}
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={activeTab === 'rma' ? 23 : activeTab === 'rtv' || activeTab === 'credit' || activeTab === 'debit' ? 16 : 8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        <p className="text-lg font-medium">No {tabs.find(t => t.id === activeTab)?.label} found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item) => {
                                // Type guards or casting can be used here if needed, or simple property access if common
                                const rma = item as RMA;
                                const rtv = item as RTV;
                                const credit = item as CreditMemo;
                                const debit = item as DebitMemo;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium text-left" title={item.name}><div className="text-sm font-medium font-mono text-gray-900 dark:text-white line-clamp-2 text-left">{item.name}</div></td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        {activeTab === 'rma' ? (
                                            <>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.salesOrderName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.salesOrderName}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.customerQuoteName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.customerQuoteName}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.customerOrderName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.customerOrderName}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.rmaType}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.rmaType}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.shipFromAccountName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.shipFromAccountName}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.shipFromContactName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.shipFromContactName}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.returnToAccountName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.returnToAccountName}</div></td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={rma.returnToContactName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2 text-left">{rma.returnToContactName}</div></td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${rma.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                        {(rma.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    ${rma.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.issuedDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.returnByDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.shippingMethod}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.logisticsPartner}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.logisticsContact}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.trackingNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.estimatedDeliveryDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.trackingStatus}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.actualDeliveryDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rma.goodsReceiptDate}</td>
                                            </>
                                        ) : activeTab === 'rtv' ? (
                                            <>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.purchaseOrderName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.customerQuoteName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.customerOrderName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.rtvType}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.rmaNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.shipFromAccountName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.shipFromContactName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.supplierName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{rtv.supplierContact}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                        {(rtv.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rtv.issuedDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rtv.approvalDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{rtv.returnByDate}</td>
                                            </>
                                        ) : activeTab === 'credit' ? (
                                            <>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{credit.invoiceName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{credit.customerQuoteName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{credit.customerOrderName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{credit.creditToAccountName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{credit.creditToContactName}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                        {(credit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    ${credit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    ${credit.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.totalCreditAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{credit.issuedDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{credit.expirationDate}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    ${credit.availableCreditBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{credit.settledDate}</td>
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === 'debit' && (
                                                    <>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{debit.supplierBillName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{debit.purchaseOrderName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{debit.customerOrderName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{debit.supplierCreditMemoName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{debit.debitToAccountName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{debit.debitToContactName}</td>
                                                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                                            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                                {(debit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                            ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                            ${debit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                            ${debit.totalDebitAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{debit.issuedDate}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{debit.approvalDate}</td>
                                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                            ${debit.availableDebitBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-left">{debit.settledDate}</td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
