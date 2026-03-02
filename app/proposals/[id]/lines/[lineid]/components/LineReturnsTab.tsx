import { useState } from "react";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../../../types";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";

interface LineReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
}

export default function LineReturnsTab({ returnsData, loading }: LineReturnsTabProps) {
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

    const { widths: rmaWidths, handleResize: handleRmaResize } = useResizableColumns({
        name: 180,
        status: 120,
        rmaName: 180,
        salesOrderLineName: 180,
        customerQuoteLineName: 180,
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
        productName: 200,
        productDescription: 300,
        manufacturerDBA: 150,
        unitCost: 120,
        debitQty: 100,
        totalCost: 120,
        shipping: 120,
        lineGrandTotal: 150
    });

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-[2px] ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                {activeTab === 'rma' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
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
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.status} onResize={handleRmaResize} />
                                    <SortableHeader label="RMA" field="rmaName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.rmaName} onResize={handleRmaResize} />
                                    <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.salesOrderLineName} onResize={handleRmaResize} />
                                    <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.customerQuoteLineName} onResize={handleRmaResize} />
                                    <SortableHeader label="Reason Code" field="reason" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.reason} onResize={handleRmaResize} />
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.productName} onResize={handleRmaResize} />
                                    <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.productDescription} onResize={handleRmaResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.manufacturerDBA} onResize={handleRmaResize} />
                                    <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.unitPrice} onResize={handleRmaResize} />
                                    <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.returnQty} onResize={handleRmaResize} />
                                    <SortableHeader label="Total Price" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.totalAmount} onResize={handleRmaResize} />
                                    <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.openBalanceQty} onResize={handleRmaResize} />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.trackingNumber} onResize={handleRmaResize} />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.estimatedDeliveryDate} onResize={handleRmaResize} />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.trackingStatus} onResize={handleRmaResize} />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.actualDeliveryDate} onResize={handleRmaResize} />
                                    <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.goodsReceiptDate} onResize={handleRmaResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={18} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-lg font-medium">No RMAs found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const rma = item as RMA;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 text-center" title={rma.name}><div className="text-sm font-medium font-mono text-gray-900 dark:text-white line-clamp-2" title={rma.name}>{rma.name}</div></td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${rma.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        rma.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-center">
                                                    <div className="text-sm line-clamp-2" title={rma.rmaName}>{rma.rmaName}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                    <div className="text-sm line-clamp-2" title={rma.salesOrderLineName}>{rma.salesOrderLineName}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                    <div className="text-sm line-clamp-2" title={rma.customerQuoteLineName}>{rma.customerQuoteLineName}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                    <div className="text-sm line-clamp-2" title={rma.reason}>{rma.reason}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                    <div className="text-sm line-clamp-2" title={rma.productName}>{rma.productName}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                    <div className="text-sm max-w-xs line-clamp-2" title={rma.productDescription}>{rma.productDescription}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px]">
                                                    <div className="text-sm line-clamp-2" title={rma.manufacturerDBA}>{rma.manufacturerDBA}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                    ${rma.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[112px]">{rma.returnQty}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                    ${rma.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[160px]">{rma.openBalanceQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{rma.trackingNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[203px]">{rma.estimatedDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{rma.trackingStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[173px]">{rma.actualDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[192px]">{rma.goodsReceiptDate}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'rtv' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
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
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.status} onResize={handleRtvResize} />
                                    <SortableHeader label="RTV" field="rtvName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.rtvName} onResize={handleRtvResize} />
                                    <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.purchaseOrderLineName} onResize={handleRtvResize} />
                                    <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.customerQuoteLineName} onResize={handleRtvResize} />
                                    <SortableHeader label="Reason Code" field="reason" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.reason} onResize={handleRtvResize} />
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.productName} onResize={handleRtvResize} />
                                    <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.productDescription} onResize={handleRtvResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.manufacturerDBA} onResize={handleRtvResize} />
                                    <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.unitCost} onResize={handleRtvResize} />
                                    <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.returnQty} onResize={handleRtvResize} />
                                    <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.totalCost} onResize={handleRtvResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-lg font-medium">No RTVs found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const rtv = item as RTV;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 " title={rtv.name}>
                                                    <div className="text-sm font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{rtv.name}</div></td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${rtv.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rtv.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={rtv.rtvName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{rtv.rtvName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={rtv.purchaseOrderLineName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{rtv.purchaseOrderLineName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={rtv.customerQuoteLineName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{rtv.customerQuoteLineName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={rtv.reason}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{rtv.reason}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={rtv.productName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{rtv.productName}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs" title={rtv.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{rtv.productDescription}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px]" title={rtv.manufacturerDBA}>
                                                    <div className="text-sm text-gray-900 dark:text-white line-clamp-2">{rtv.manufacturerDBA}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                    ${rtv.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[111px]">{rtv.returnQty}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
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
                        <table className="w-full">
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
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.status} onResize={handleCreditResize} />
                                    <SortableHeader label="Credit Memo" field="creditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.creditMemoName} onResize={handleCreditResize} />
                                    <SortableHeader label="Invoice Line" field="invoiceLineName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.invoiceLineName} onResize={handleCreditResize} />
                                    <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.salesOrderLineName} onResize={handleCreditResize} />
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.productName} onResize={handleCreditResize} />
                                    <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.productDescription} onResize={handleCreditResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.manufacturerDBA} onResize={handleCreditResize} />
                                    <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.unitPrice} onResize={handleCreditResize} />
                                    <SortableHeader label="Credit Qty" field="creditQty" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.creditQty} onResize={handleCreditResize} />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.totalPrice} onResize={handleCreditResize} />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.shipping} onResize={handleCreditResize} />
                                    <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.taxes} onResize={handleCreditResize} />
                                    <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.lineGrandTotal} onResize={handleCreditResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-lg font-medium">No Credit Memos found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const credit = item as CreditMemo;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white  sticky left-0 bg-white dark:bg-gray-800">{credit.name}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${credit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {credit.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{credit.creditMemoName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{credit.invoiceLineName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{credit.salesOrderLineName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{credit.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs" title={credit.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{credit.productDescription}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[161px]">{credit.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                    ${credit.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[116px]">{credit.creditQty}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                    ${credit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                    ${credit.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
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
                        <table className="w-full">
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
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.status} onResize={handleDebitResize} />
                                    <SortableHeader label="Debit Memo" field="debitMemoName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.debitMemoName} onResize={handleDebitResize} />
                                    <SortableHeader label="Supplier Bill Line" field="supplierBillLineName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.supplierBillLineName} onResize={handleDebitResize} />
                                    <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.purchaseOrderLineName} onResize={handleDebitResize} />
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.productName} onResize={handleDebitResize} />
                                    <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.productDescription} onResize={handleDebitResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.manufacturerDBA} onResize={handleDebitResize} />
                                    <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.unitCost} onResize={handleDebitResize} />
                                    <SortableHeader label="Debit Qty" field="debitQty" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.debitQty} onResize={handleDebitResize} />
                                    <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.totalCost} onResize={handleDebitResize} />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.shipping} onResize={handleDebitResize} />
                                    <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.lineGrandTotal} onResize={handleDebitResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-lg font-medium">No Debit Memos found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedData.map((item) => {
                                        const debit = item as DebitMemo;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">{debit.name}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${debit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {debit.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{debit.debitMemoName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{debit.supplierBillLineName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{debit.purchaseOrderLineName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{debit.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs" title={debit.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{debit.productDescription}</div></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px]">{debit.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-mono">
                                                    ${debit.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">{debit.debitQty}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                    ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                    ${debit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
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
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">Amount</th>
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
                                                <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-white font-medium">{item.name}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{item.requestDate}</td>
                                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
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
