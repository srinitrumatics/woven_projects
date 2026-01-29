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

    const SortableHeader = ({ label, field, className = "", align = "center" }: { label: string, field: string, className?: string, align?: "left" | "right" | "center" }) => {
        const isSorted = sortConfig?.key === field;
        return (
            <th
                className={`px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none ${className}`}
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
                        <table className="w-full min-w-[2800px] table-fixed">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="RMA Line" field="name" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10 w-[180px]" />
                                    <SortableHeader label="Status" field="status" className="w-[120px]" />
                                    <SortableHeader label="RMA" field="rmaName" className="w-[180px]" />
                                    <SortableHeader label="Sales Order Line" field="salesOrderLineName" className="w-[180px]" />
                                    <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" className="w-[180px]" />
                                    <SortableHeader label="Reason Code" field="reason" className="w-[150px]" />
                                    <SortableHeader label="Product Name" field="productName" className="w-[200px]" />
                                    <SortableHeader label="Product Description" field="productDescription" className="w-[300px]" />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" className="w-[150px]" />
                                    <SortableHeader label="Unit Price" field="unitPrice" />
                                    <SortableHeader label="Return Qty" field="returnQty" />
                                    <SortableHeader label="Total Price" field="totalAmount" />
                                    <SortableHeader label="Open Balance Qty" field="openBalanceQty" />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" className="w-[180px]" />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" className="w-[150px]" />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" className="w-[150px]" />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" className="w-[150px]" />
                                    <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" className="w-[150px]" />
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
                                                <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center" title={rma.name}><div className="line-clamp-2" title={rma.name}>{rma.name}</div></td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${rma.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        rma.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-center">
                                                    <div className="line-clamp-2" title={rma.rmaName}>{rma.rmaName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                                    <div className="line-clamp-2" title={rma.salesOrderLineName}>{rma.salesOrderLineName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                                    <div className="line-clamp-2" title={rma.customerQuoteLineName}>{rma.customerQuoteLineName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                                    <div className="line-clamp-2" title={rma.reason}>{rma.reason}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                                    <div className="line-clamp-2" title={rma.productName}>{rma.productName}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                                    <div className="max-w-xs line-clamp-2" title={rma.productDescription}>{rma.productDescription}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                                    <div className="line-clamp-2" title={rma.manufacturerDBA}>{rma.manufacturerDBA}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-mono">
                                                    ${rma.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{rma.returnQty}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${rma.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{rma.openBalanceQty}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{rma.trackingNumber}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{rma.estimatedDeliveryDate}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{rma.trackingStatus}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{rma.actualDeliveryDate}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{rma.goodsReceiptDate}</td>
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
                                    <SortableHeader label="Unit Cost" field="unitCost" />
                                    <SortableHeader label="Return Qty" field="returnQty" />
                                    <SortableHeader label="Total Cost" field="totalCost" />
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
                                                <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center" title={rtv.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{rtv.name}</div></td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${rtv.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rtv.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={rtv.rtvName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{rtv.rtvName}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={rtv.purchaseOrderLineName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{rtv.purchaseOrderLineName}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={rtv.customerQuoteLineName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{rtv.customerQuoteLineName}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={rtv.reason}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{rtv.reason}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={rtv.productName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{rtv.productName}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white max-w-xs" title={rtv.productDescription}><div className="text-xs text-gray-900 dark:text-white max-w-xs line-clamp-2">{rtv.productDescription}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={rtv.manufacturerDBA}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{rtv.manufacturerDBA}</div></td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-mono">
                                                    ${rtv.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{rtv.returnQty}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
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
                                    <SortableHeader label="Unit Price" field="unitPrice" />
                                    <SortableHeader label="Credit Qty" field="creditQty" />
                                    <SortableHeader label="Total Price" field="totalPrice" />
                                    <SortableHeader label="Shipping" field="shipping" />
                                    <SortableHeader label="Taxes" field="taxes" />
                                    <SortableHeader label="Line Grand Total" field="lineGrandTotal" />
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
                                                <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">{credit.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${credit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {credit.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{credit.creditMemoName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{credit.invoiceLineName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{credit.salesOrderLineName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{credit.productName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white max-w-xs" title={credit.productDescription}><div className="text-xs text-gray-900 dark:text-white max-w-xs line-clamp-2">{credit.productDescription}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{credit.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-mono">
                                                    ${credit.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{credit.creditQty}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${credit.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
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
                                    <SortableHeader label="Unit Cost" field="unitCost" />
                                    <SortableHeader label="Debit Qty" field="debitQty" />
                                    <SortableHeader label="Total Cost" field="totalCost" />
                                    <SortableHeader label="Shipping" field="shipping" />
                                    <SortableHeader label="Line Grand Total" field="lineGrandTotal" />
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
                                                <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">{debit.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${debit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {debit.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{debit.debitMemoName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{debit.supplierBillLineName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{debit.purchaseOrderLineName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{debit.productName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white max-w-xs" title={debit.productDescription}><div className="text-xs text-gray-900 dark:text-white max-w-xs line-clamp-2">{debit.productDescription}</div></td>
                                                <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{debit.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-mono">
                                                    ${debit.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{debit.debitQty}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${debit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">Amount</th>
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
                                                <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium text-center">{item.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{item.requestDate}</td>
                                                <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                    ${item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}
