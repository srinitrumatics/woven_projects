import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../../../types";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";
import Pagination from "../../../../../../components/ui/Pagination";
import { useUserSession } from "@/components/UserSessionContext";

const ITEMS_PER_PAGE = 10;

interface LineReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
}

export default function LineReturnsTab({ returnsData, loading }: LineReturnsTabProps) {
    const { selectedAccount } = useUserSession();
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

    const [activeTab, setActiveTab] = useState<ReturnsTabType>("rma");
    const [currentPage, setCurrentPage] = useState(1);

    const tabs = ([
        { id: "rma", label: "RMAs Lines", count: returnsData.rma.length },
        { id: "credit", label: "Credit Memos Lines", count: returnsData.creditMemos.length },
        { id: "rtv", label: "RTVs Lines", count: returnsData.rtv.length },
        { id: "debit", label: "Debit Memos Lines", count: returnsData.debitMemos.length },
    ] as { id: ReturnsTabType; label: string; count: number }[]).filter(tab => {
        if (isRestricted && (tab.id === 'rtv' || tab.id === 'debit')) return false;
        return true;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

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

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

    const { widths: rmaWidths, handleResize: handleRmaResize } = useResizableColumns({
        name: 180,
        status: 120,
        rmaName: 180,
        salesOrderLineName: 180,
        salesOrderLineId: 180,
        customerQuoteLineId: 180,
        customerQuoteLineName: 180,
        customerOrderName: 160,
        customerOrderId: 160,
        customerQuoteName: 160,
        customerPO: 140,
        salesOrderName: 160,
        supplierBillName: 160,
        shipmentName: 150,
        reason: 150,
        productName: 200,
        productDescription: 300,
        manufacturerDBA: 150,
        unitPrice: 120,
        returnQty: 100,
        totalAmount: 120,
        openBalanceQty: 150,
        trackingNumber: 180,
        estimatedDeliveryDate: 150,
        trackingStatus: 150,
        actualDeliveryDate: 150,
        goodsReceiptDate: 150
    });

    const { widths: rtvWidths, handleResize: handleRtvResize } = useResizableColumns({
        name: 180,
        status: 120,
        rtvName: 180,
        purchaseOrderLineName: 180,
        customerQuoteLineName: 180,
        customerOrderName: 160,
        customerQuoteName: 160,
        salesOrderName: 160,
        supplierBillName: 160,
        shipmentName: 150,
        reason: 150,
        productName: 200,
        productDescription: 300,
        manufacturerDBA: 150,
        unitCost: 120,
        returnQty: 100,
        totalCost: 120
    });

    const { widths: creditWidths, handleResize: handleCreditResize } = useResizableColumns({
        name: 180,
        status: 120,
        creditMemoName: 180,
        invoiceLineName: 180,
        salesOrderLineName: 180,
        customerOrderName: 160,
        customerQuoteName: 160,
        salesOrderName: 160,
        supplierBillName: 160,
        shipmentName: 150,
        productName: 200,
        productDescription: 300,
        manufacturerDBA: 150,
        unitPrice: 120,
        creditQty: 100,
        totalPrice: 120,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 150
    });

    const { widths: debitWidths, handleResize: handleDebitResize } = useResizableColumns({
        name: 180,
        status: 120,
        debitMemoName: 180,
        supplierBillLineName: 180,
        purchaseOrderLineName: 180,
        customerOrderName: 160,
        customerQuoteName: 160,
        salesOrderName: 160,
        supplierBillName: 160,
        shipmentName: 150,
        productName: 200,
        productDescription: 300,
        manufacturerDBA: 150,
        unitCost: 120,
        debitQty: 100,
        totalCost: 120,
        shipping: 120,
        lineGrandTotal: 150
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 text-sm font-medium transition-all truncate border-b-2 -mb-[2px] ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                <div className="overflow-x-auto">
                    {activeTab === 'rma' ? (
                        sortedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                <p className="text-lg font-medium" title="No records found">No records found</p>
                                <p className="text-sm" title="There are no RMAs associated with this proposal line.">There are no RMAs associated with this proposal line.</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <SortableHeader
                                                label="RMA Line"
                                                field="name"
                                                sortConfig={sortConfig}
                                                requestSort={requestSort}
                                                width={rmaWidths.name}
                                                onResize={handleRmaResize}
                                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                truncate={false}
                                            />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.status} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="RMA" field="rmaName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.rmaName} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.salesOrderLineName} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.customerQuoteLineName} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Reason Code" field="reason" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.reason} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.productName} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.productDescription} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.manufacturerDBA} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.unitPrice} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.returnQty} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Total Price" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.totalAmount} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.openBalanceQty} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.trackingNumber} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.estimatedDeliveryDate} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.trackingStatus} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.actualDeliveryDate} onResize={handleRmaResize} truncate={false} />
                                            <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.goodsReceiptDate} onResize={handleRmaResize} truncate={false} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((item) => {
                                            const rma = item as RMA;
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={rma.name}>
                                                        <div className="text-sm font-medium font-medium text-gray-900 dark:text-white truncate" title={rma.name}>{rma.name}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-left truncate">
                                                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${rma.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            rma.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {rma.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate">
                                                        <div className="text-sm truncate" title={rma.rmaName}>{rma.rmaName}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {rma.salesOrderLineName}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {rma.customerQuoteLineName}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="text-sm truncate" title={rma.reason}>{rma.reason}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="text-sm truncate" title={rma.productName}>{rma.productName}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="text-sm max-w-xs truncate" title={rma.productDescription}>{rma.productDescription}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px] truncate">
                                                        <div className="text-sm truncate" title={rma.manufacturerDBA}>{rma.manufacturerDBA}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${rma.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[112px] truncate">{rma.returnQty}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${rma.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[160px] truncate">{rma.openBalanceQty}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{rma.trackingNumber}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[203px] truncate">{rma.estimatedDeliveryDate}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{rma.trackingStatus}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[173px] truncate">{rma.actualDeliveryDate}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[192px] truncate">{rma.goodsReceiptDate}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </>
                        )
                    ) : activeTab === 'rtv' ? (
                        sortedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                <p className="text-lg font-medium" title="No records found">No records found</p>
                                <p className="text-sm" title="There are no RTVs associated with this proposal line.">There are no RTVs associated with this proposal line.</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <SortableHeader
                                                label="RTV Line"
                                                field="name"
                                                sortConfig={sortConfig}
                                                requestSort={requestSort}
                                                width={rtvWidths.name}
                                                onResize={handleRtvResize}
                                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                truncate={false}
                                            />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.status} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="RTV" field="rtvName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.rtvName} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.purchaseOrderLineName} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.customerQuoteLineName} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Reason Code" field="reason" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.reason} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.productName} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.productDescription} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.manufacturerDBA} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.unitCost} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.returnQty} onResize={handleRtvResize} truncate={false} />
                                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.totalCost} onResize={handleRtvResize} truncate={false} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((item) => {
                                            const rtv = item as RTV;
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800  truncate" title={rtv.name}>
                                                        <div className="text-sm font-medium font-medium text-gray-900 dark:text-white truncate">{rtv.name}</div></td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${rtv.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {rtv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rtv.rtvName}><div className="text-sm text-gray-900 dark:text-white truncate">{rtv.rtvName}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rtv.purchaseOrderLineName}><div className="text-sm text-gray-900 dark:text-white truncate">{rtv.purchaseOrderLineName}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rtv.customerQuoteLineName}><div className="text-sm text-gray-900 dark:text-white truncate">{rtv.customerQuoteLineName}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rtv.reason}><div className="text-sm text-gray-900 dark:text-white truncate">{rtv.reason}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={rtv.productName}><div className="text-sm text-gray-900 dark:text-white truncate">{rtv.productName}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={rtv.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{rtv.productDescription}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px] truncate" title={rtv.manufacturerDBA}>
                                                        <div className="text-sm text-gray-900 dark:text-white truncate">{rtv.manufacturerDBA}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${rtv.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[111px] truncate">{rtv.returnQty}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </>
                        )
                    ) : activeTab === 'credit' ? (
                        sortedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                <p className="text-lg font-medium" title="No records found">No records found</p>
                                <p className="text-sm" title="There are no Credit Memos associated with this proposal line.">There are no Credit Memos associated with this proposal line.</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <SortableHeader
                                                label="Credit Memo Line"
                                                field="name"
                                                sortConfig={sortConfig}
                                                requestSort={requestSort}
                                                width={creditWidths.name}
                                                onResize={handleCreditResize}
                                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                truncate={false}
                                            />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.status} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Credit Memo" field="creditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.creditMemoName} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Invoice Line" field="invoiceLineName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.invoiceLineName} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.salesOrderLineName} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.productName} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.productDescription} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.manufacturerDBA} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.unitPrice} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Credit Qty" field="creditQty" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.creditQty} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.totalPrice} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.shipping} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.taxes} onResize={handleCreditResize} truncate={false} />
                                            <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.lineGrandTotal} onResize={handleCreditResize} truncate={false} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((item) => {
                                            const credit = item as CreditMemo;
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white  sticky left-0 bg-white dark:bg-gray-800 truncate">{credit.name}</td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${credit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {credit.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{credit.creditMemoName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{credit.invoiceLineName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{credit.salesOrderLineName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{credit.productName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={credit.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{credit.productDescription}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[161px] truncate">{credit.manufacturerDBA}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${credit.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[116px] truncate">{credit.creditQty}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${credit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${credit.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-bold text-primary truncate">
                                                        ${credit.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </>
                        )
                    ) : activeTab === 'debit' ? (
                        sortedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                <p className="text-lg font-medium" title="No records found">No records found</p>
                                <p className="text-sm" title="There are no Debit Memos associated with this proposal line.">There are no Debit Memos associated with this proposal line.</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <SortableHeader
                                                label="Debit Memo Line"
                                                field="name"
                                                sortConfig={sortConfig}
                                                requestSort={requestSort}
                                                width={debitWidths.name}
                                                onResize={handleDebitResize}
                                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                truncate={false}
                                            />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.status} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Debit Memo" field="debitMemoName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.debitMemoName} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Supplier Bill Line" field="supplierBillLineName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.supplierBillLineName} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.purchaseOrderLineName} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.productName} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.productDescription} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.manufacturerDBA} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.unitCost} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Debit Qty" field="debitQty" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.debitQty} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.totalCost} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.shipping} onResize={handleDebitResize} truncate={false} />
                                            <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.lineGrandTotal} onResize={handleDebitResize} truncate={false} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((item) => {
                                            const debit = item as DebitMemo;
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate">{debit.name}</td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${debit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {debit.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{debit.debitMemoName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{debit.supplierBillLineName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{debit.purchaseOrderLineName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{debit.productName}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={debit.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{debit.productDescription}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px] truncate">{debit.manufacturerDBA}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${debit.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">{debit.debitQty}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${debit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-bold text-primary truncate">
                                                        ${debit.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </>
                        )
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white ">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {activeData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-left text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center min-w-0">
                                                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                    </svg>
                                                    <p className="text-lg font-medium">No {tabs.find(t => t.id === activeTab)?.label} found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item) => {
                                            const r = item as Return;
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white font-medium truncate">{item.name}</td>
                                                    <td className="px-3 py-2 text-left truncate">
                                                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{r.requestDate}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${r.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {activeData.length > 0 && (
                    <div className="px-3 py-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={sortedData.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            itemName=""
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
