import { useState } from "react";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../../../types";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";

interface LineReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
}

export default function LineReturnsTab({ returnsData, loading }: LineReturnsTabProps) {
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

    const SortableHeader = ({ label, field, className = "", align = "left" }: { label: string, field: string, className?: string, align?: "left" | "right" | "center" }) => {
        const isSorted = sortConfig?.key === field;
        return (
            <th
                className={`px-4 py-3 text-${align} text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none ${className}`}
                onClick={() => requestSort(field as any)}
            >
                <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
                    {label}
                    <span className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 w-4">
                        {isSorted ? (
                            sortConfig?.direction === 'asc' ? '↑' : '↓'
                        ) : (
                            <span className="opacity-0 group-hover:opacity-100 text-[10px]">↕</span>
                        )}
                    </span>
                </div>
            </th>
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
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
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
                {activeTab === 'rma' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[2800px]">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="RMA Line" field="name" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" />
                                    <SortableHeader label="RMA" field="rmaName" />
                                    <SortableHeader label="Sales Order Line" field="salesOrderLineName" />
                                    <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" />
                                    <SortableHeader label="Reason Code" field="reason" />
                                    <SortableHeader label="Product Name" field="productName" />
                                    <SortableHeader label="Product Description" field="productDescription" />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" />
                                    <SortableHeader label="Unit Price" field="unitPrice" align="right" />
                                    <SortableHeader label="Return Qty" field="returnQty" align="right" />
                                    <SortableHeader label="Total Price" field="totalAmount" align="right" />
                                    <SortableHeader label="Open Balance Qty" field="openBalanceQty" align="right" />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" />
                                    <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={18} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                <p className="text-lg font-medium">No RMAs found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const rma = item as RMA;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800">{rma.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${rma.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        rma.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.rmaName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.salesOrderLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.customerQuoteLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.reason}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={rma.productDescription}>{rma.productDescription}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                    ${rma.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{rma.returnQty}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${rma.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{rma.openBalanceQty}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.trackingNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{rma.estimatedDeliveryDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.trackingStatus}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{rma.actualDeliveryDate}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{rma.goodsReceiptDate}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'rtv' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[2000px]">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="RTV Line" field="name" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" />
                                    <SortableHeader label="RTV" field="rtvName" />
                                    <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" />
                                    <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" />
                                    <SortableHeader label="Reason Code" field="reason" />
                                    <SortableHeader label="Product Name" field="productName" />
                                    <SortableHeader label="Product Description" field="productDescription" />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" />
                                    <SortableHeader label="Unit Cost" field="unitCost" align="right" />
                                    <SortableHeader label="Return Qty" field="returnQty" align="right" />
                                    <SortableHeader label="Total Cost" field="totalCost" align="right" />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                <p className="text-lg font-medium">No RTVs found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const rtv = item as RTV;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800">{rtv.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${rtv.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rtv.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.rtvName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.purchaseOrderLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.customerQuoteLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.reason}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={rtv.productDescription}>{rtv.productDescription}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                    ${rtv.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{rtv.returnQty}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'credit' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[2400px]">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Credit Memo Line" field="name" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" />
                                    <SortableHeader label="Credit Memo" field="creditMemoName" />
                                    <SortableHeader label="Invoice Line" field="invoiceLineName" />
                                    <SortableHeader label="Sales Order Line" field="salesOrderLineName" />
                                    <SortableHeader label="Product Name" field="productName" />
                                    <SortableHeader label="Product Description" field="productDescription" />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" />
                                    <SortableHeader label="Unit Price" field="unitPrice" align="right" />
                                    <SortableHeader label="Credit Qty" field="creditQty" align="right" />
                                    <SortableHeader label="Total Price" field="totalPrice" align="right" />
                                    <SortableHeader label="Shipping" field="shipping" align="right" />
                                    <SortableHeader label="Taxes" field="taxes" align="right" />
                                    <SortableHeader label="Line Grand Total" field="lineGrandTotal" align="right" />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                <p className="text-lg font-medium">No Credit Memos found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const credit = item as CreditMemo;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800">{credit.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${credit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {credit.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.creditMemoName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.invoiceLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.salesOrderLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={credit.productDescription}>{credit.productDescription}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                    ${credit.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{credit.creditQty}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.taxes?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'debit' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[2400px]">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Debit Memo Line" field="name" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" />
                                    <SortableHeader label="Debit Memo" field="debitMemoName" />
                                    <SortableHeader label="Supplier Bill Line" field="supplierBillLineName" />
                                    <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" />
                                    <SortableHeader label="Product Name" field="productName" />
                                    <SortableHeader label="Product Description" field="productDescription" />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" />
                                    <SortableHeader label="Unit Cost" field="unitCost" align="right" />
                                    <SortableHeader label="Debit Qty" field="debitQty" align="right" />
                                    <SortableHeader label="Total Cost" field="totalCost" align="right" />
                                    <SortableHeader label="Shipping" field="shipping" align="right" />
                                    <SortableHeader label="Line Grand Total" field="lineGrandTotal" align="right" />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                <p className="text-lg font-medium">No Debit Memos found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const debit = item as DebitMemo;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800">{debit.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${debit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {debit.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{debit.debitMemoName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{debit.supplierBillLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{debit.purchaseOrderLineName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{debit.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={debit.productDescription}>{debit.productDescription}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{debit.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                    ${debit.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{debit.debitQty}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${debit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                    ${debit.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Number</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {activeData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            <p className="text-lg font-medium">No {tabs.find(t => t.id === activeTab)?.label} found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                activeData.map((item) => {
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{item.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                    item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.requestDate}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
