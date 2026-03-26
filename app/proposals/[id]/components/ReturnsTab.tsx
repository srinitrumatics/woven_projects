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
    const { items: sortedData, requestSort, sortConfig } = useSortableData<RMA | RTV | CreditMemo | DebitMemo>(activeData);

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
                        onClick={() => setActiveTab(tab.id)}
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
                                        <SortableHeader label="RMA" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.name} onResize={(f, w) => onResize('rma', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.salesOrderName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.customerQuoteName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.customerOrderName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="RMA Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.rmaType} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.shipFromAccountName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.shipFromContactName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Return to Account" field="returnToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.returnToAccountName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Return to Contact" field="returnToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.returnToContactName} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.dropShip} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.totalLines} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.totalPrice} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.issuedDate} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.returnByDate} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.shippingMethod} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.logisticsPartner} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.logisticsContact} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.trackingNumber} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.estimatedDeliveryDate} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.trackingStatus} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.actualDeliveryDate} onResize={(f, w) => onResize('rma', f, w)} />
                                        <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rma.goodsReceiptDate} onResize={(f, w) => onResize('rma', f, w)} />
                                    </>
                                ) : activeTab === 'rtv' ? (
                                    <>
                                        <SortableHeader label="RTV" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.name} onResize={(f, w) => onResize('rtv', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.purchaseOrderName} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.customerQuoteName} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.customerOrderName} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="RTV Type" field="rtvType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.rtvType} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="RMA Number" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.rmaNumber} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Ship from Account" field="shipFromAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.shipFromAccountName} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Ship from Contact" field="shipFromContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.shipFromContactName} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.supplierName} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.supplierContact} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.totalLines} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.totalCost} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.issuedDate} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.approvalDate} onResize={(f, w) => onResize('rtv', f, w)} />
                                        <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtv.returnByDate} onResize={(f, w) => onResize('rtv', f, w)} />
                                    </>
                                ) : activeTab === 'credit' ? (
                                    <>
                                        <SortableHeader label="Credit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.name} onResize={(f, w) => onResize('credit', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.invoiceName} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.customerQuoteName} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.customerOrderName} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Credit to Account" field="creditToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.creditToAccountName} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Credit to Contact" field="creditToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.creditToContactName} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalLines} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalPrice} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalShippingCharges} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalTaxesAmount} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Total Credit Amount" field="totalCreditAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.totalCreditAmount} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.issuedDate} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.expirationDate} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Available Credit Balance" field="availableCreditBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.availableCreditBalance} onResize={(f, w) => onResize('credit', f, w)} />
                                        <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.credit.settledDate} onResize={(f, w) => onResize('credit', f, w)} />
                                    </>
                                ) : (
                                    <>
                                        {activeTab === 'debit' && (
                                            <>
                                                <SortableHeader label="Debit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.name} onResize={(f, w) => onResize('debit', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths[activeTab].status} onResize={(f, w) => onResize(activeTab, f, w)} />
                                                <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.supplierBillName} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.purchaseOrderName} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.customerOrderName} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Supplier Credit Memo" field="supplierCreditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.supplierCreditMemoName} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Debit to Account" field="debitToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.debitToAccountName} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Debit to Contact" field="debitToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.debitToContactName} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalLines} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalCost} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalShippingCharges} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Total Debit Amount" field="totalDebitAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.totalDebitAmount} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.issuedDate} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.approvalDate} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Available Debit Balance" field="availableDebitBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.availableDebitBalance} onResize={(f, w) => onResize('debit', f, w)} />
                                                <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.debit.settledDate} onResize={(f, w) => onResize('debit', f, w)} />
                                            </>
                                        )}
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedData.map((item) => {
                                // Type guards or casting can be used here if needed, or simple property access if common
                                const rma = item as RMA;
                                const rtv = item as RTV;
                                const credit = item as CreditMemo;
                                const debit = item as DebitMemo;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={item.name}><div className="text-sm font-medium text-gray-900 dark:text-white truncate ">{item.name}</div></td>
                                        <td className="px-3 px-2  truncate">
                                            <span className={`inline-blocktext-sm font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        {activeTab === 'rma' ? (
                                            <>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.salesOrderName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.salesOrderName}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.customerQuoteName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.customerQuoteName}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.customerOrderName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.customerOrderName}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.rmaType}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.rmaType}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.shipFromAccountName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.shipFromAccountName}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.shipFromContactName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.shipFromContactName}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.returnToAccountName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.returnToAccountName}</div></td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white truncate" title={rma.returnToContactName}><div className="text-sm text-gray-900 dark:text-white truncate ">{rma.returnToContactName}</div></td>
                                                <td className="px-3 px-2 min-w-[103px] truncate">
                                                    <span className={`inline-flex text-sm font-medium rounded ${rma.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 px-2  text-sm text-gray-900 dark:text-white min-w-[123px] truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(rma.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${rma.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.issuedDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.returnByDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.shippingMethod}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.logisticsPartner}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.logisticsContact}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.trackingNumber}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400 min-w-[198px] truncate">{rma.estimatedDeliveryDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rma.trackingStatus}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400 min-w-[173px] truncate">{rma.actualDeliveryDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400 min-w-[199px] truncate">{rma.goodsReceiptDate}</td>
                                            </>
                                        ) : activeTab === 'rtv' ? (
                                            <>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.purchaseOrderName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.customerQuoteName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.customerOrderName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.rtvType}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.rmaNumber}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.shipFromAccountName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.shipFromContactName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.supplierName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{rtv.supplierContact}</td>
                                                <td className="px-3 px-2  text-sm text-gray-900 dark:text-white min-w-[115px] truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(rtv.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rtv.issuedDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rtv.approvalDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{rtv.returnByDate}</td>
                                            </>
                                        ) : activeTab === 'credit' ? (
                                            <>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{credit.invoiceName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{credit.customerQuoteName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{credit.customerOrderName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{credit.creditToAccountName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{credit.creditToContactName}</td>
                                                <td className="px-3 px-2 text-sm text-gray-900 dark:text-white min-w-[125px] truncate">
                                                    <span className="inline-flex items-center justify-center h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                        {(credit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${credit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                    ${credit.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white font-semibold min-w-[176px] truncate">
                                                    ${credit.totalCreditAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{credit.issuedDate}</td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{credit.expirationDate}</td>
                                                <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white min-w-[201px] truncate">
                                                    ${credit.availableCreditBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{credit.settledDate}</td>
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === 'debit' && (
                                                    <>
                                                        <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{debit.supplierBillName}</td>
                                                        <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{debit.purchaseOrderName}</td>
                                                        <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{debit.customerOrderName}</td>
                                                        <td className="px-3 px-2 text-sm text-gray-900 dark:text-white min-w-[190px] truncate">{debit.supplierCreditMemoName}</td>
                                                        <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{debit.debitToAccountName}</td>
                                                        <td className="px-3 px-2 text-sm text-gray-900 dark:text-white  truncate">{debit.debitToContactName}</td>
                                                        <td className="px-3 px-2  text-sm text-gray-900 dark:text-white min-w-[110px] truncate">
                                                            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                                {(debit.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                            ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white truncate">
                                                            ${debit.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white font-semibold min-w-[171px] truncate">
                                                            ${debit.totalDebitAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{debit.issuedDate}</td>
                                                        <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{debit.approvalDate}</td>
                                                        <td className="px-3 px-2 text-sm  text-gray-900 dark:text-white min-w-[199px] truncate">
                                                            ${debit.availableDebitBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                        </td>
                                                        <td className="px-3 px-2 text-sm text-gray-600 dark:text-gray-400  truncate">{debit.settledDate}</td>
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
        </div>
    );
}
