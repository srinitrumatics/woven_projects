import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../../../types";
import { formatNumber, displayCell } from "@/lib/utils/formatting";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";
import Pagination from "../../../../../../components/ui/Pagination";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

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
    const { items: sortedData, requestSort: originalRequestSort, sortConfig } = useSortableData<RMA | RTV | CreditMemo | DebitMemo>(activeData, { key: 'name', direction: 'asc' });

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
        salesOrderLineName: 180,
        customerQuoteLineName: 180,
        customerQuoteLineId: 180,
        customerOrderName: 160,
        customerQuoteName: 160,
        salesOrderName: 160,
        supplierBillName: 160,
        shipmentName: 150,
        productName: 200,
        productDescription: 300,
        manufacturerDBA: 150,
        unitPrice: 120,
        creditQty: 120,
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
        return <TableLoadingState />;
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
                <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'rma' ? (
                        sortedData.length === 0 ? (
                            <TableEmptyState message="No records found" description="There are no RMAs associated with this proposal line." />
                        ) : (
                            <Table className="table-fixed">
                                <THead>
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
                                        <SortableHeader label="RMA #" field="rmaName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.rmaName} onResize={handleRmaResize} />
                                        <SortableHeader label="Sales Order Lines" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.salesOrderLineName} onResize={handleRmaResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.customerQuoteLineName} onResize={handleRmaResize} />
                                        <SortableHeader label="Reason Code" field="reason" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.reason} onResize={handleRmaResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.productName} onResize={handleRmaResize} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.productDescription} onResize={handleRmaResize} />
                                        <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.manufacturerDBA} onResize={handleRmaResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.unitPrice} onResize={handleRmaResize} />
                                        <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.returnQty} onResize={handleRmaResize} />
                                        <SortableHeader label="Total Price" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.totalAmount} onResize={handleRmaResize} />
                                        <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.openBalanceQty} onResize={handleRmaResize} />
                                        <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={rmaWidths.goodsReceiptDate} onResize={handleRmaResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedData.map((item) => {
                                        const rma = item as RMA;
                                        return (
                                            <Tr key={item.id} className="transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={rma.name}>
                                                    <div className="text-sm font-medium font-medium text-gray-900 dark:text-white truncate" title={rma.name}>{displayCell(rma.name)}</div>
                                                </Td>
                                                <Td className="text-left truncate">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${rma.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        rma.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rma.status}
                                                    </span>
                                                </Td>
                                                <Td className="text-left truncate">
                                                    <div className="text-sm truncate" title={rma.rmaName}>{displayCell(rma.rmaName)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    {displayCell(rma.salesOrderLineName)}
                                                </Td>
                                                <Td className="truncate">
                                                    {rma.customerQuoteLineName && rma.customerQuoteLineId ? (
                                                        <Link href={`/quotes/${rma.customerQuoteId}/lines/${rma.customerQuoteLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{rma.customerQuoteLineName}</Link>
                                                    ) : displayCell(rma.customerQuoteLineName)}
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm truncate" title={rma.reason}>{displayCell(rma.reason)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm truncate" title={rma.productName}>{displayCell(rma.productName)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm max-w-xs truncate" title={rma.productDescription}>{displayCell(rma.productDescription)}</div>
                                                </Td>
                                                <Td className="min-w-[167px] truncate">
                                                    <div className="text-sm truncate" title={rma.brand}>{displayCell(rma.brand)}</div>
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${rma.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[112px] truncate">{formatNumber(rma.returnQty)}</Td>
                                                <Td className="font-semibold truncate">
                                                    ${rma.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[160px] truncate">{formatNumber(rma.openBalanceQty)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[192px] truncate">{displayCell(rma.goodsReceiptDate)}</Td>
                                            </Tr>
                                        );
                                    })}
                                </TBody>
                            </Table>
                        )
                    ) : activeTab === 'rtv' ? (
                        sortedData.length === 0 ? (
                            <TableEmptyState message="No records found" description="There are no RTVs associated with this proposal line." />
                        ) : (
                            <Table className="table-fixed">
                                <THead>
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
                                        <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.manufacturerDBA} onResize={handleRtvResize} />
                                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.unitCost} onResize={handleRtvResize} />
                                        <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.returnQty} onResize={handleRtvResize} />
                                        <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={rtvWidths.totalCost} onResize={handleRtvResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedData.map((item) => {
                                        const rtv = item as RTV;
                                        return (
                                            <Tr key={item.id} className="transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" title={rtv.name}>
                                                    <div className="text-sm font-medium font-medium text-gray-900 dark:text-white truncate">{displayCell(rtv.name)}</div></Td>
                                                <Td className="truncate">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${rtv.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {rtv.status}
                                                    </span>
                                                </Td>
                                                <Td className="truncate" title={rtv.rtvName}><div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(rtv.rtvName)}</div></Td>
                                                <Td className="truncate" title={rtv.purchaseOrderLineName}><div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(rtv.purchaseOrderLineName)}</div></Td>
                                                <Td className="truncate" title={rtv.customerQuoteLineName}><div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(rtv.customerQuoteLineName)}</div></Td>
                                                <Td className="truncate" title={rtv.reason}><div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(rtv.reason)}</div></Td>
                                                <Td className="truncate" title={rtv.productName}><div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(rtv.productName)}</div></Td>
                                                <Td className="max-w-xs truncate" title={rtv.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{displayCell(rtv.productDescription)}</div></Td>
                                                <Td className="min-w-[167px] truncate" title={rtv.brand}>
                                                    <div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(rtv.brand)}
                                                    </div>
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${rtv.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[111px] truncate">{formatNumber(rtv.returnQty)}</Td>
                                                <Td className="font-semibold truncate">
                                                    ${rtv.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </TBody>
                            </Table>
                        )
                    ) : activeTab === 'credit' ? (
                        sortedData.length === 0 ? (
                            <TableEmptyState message="No records found" description="There are no Credit Memos associated with this proposal line." />
                        ) : (
                            <Table className="table-fixed">
                                <THead>
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
                                        <SortableHeader label="Credit Memo #" field="creditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.creditMemoName} onResize={handleCreditResize} />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.salesOrderLineName} onResize={handleCreditResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.customerQuoteLineName} onResize={handleCreditResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.productName} onResize={handleCreditResize} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.productDescription} onResize={handleCreditResize} />
                                        <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.manufacturerDBA} onResize={handleCreditResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.unitPrice} onResize={handleCreditResize} />
                                        <SortableHeader label="Credited Qty" field="creditQty" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.creditQty} onResize={handleCreditResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.totalPrice} onResize={handleCreditResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.shipping} onResize={handleCreditResize} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.taxes} onResize={handleCreditResize} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={creditWidths.lineGrandTotal} onResize={handleCreditResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedData.map((item) => {
                                        const credit = item as CreditMemo;
                                        return (
                                            <Tr key={item.id} className="transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate">{displayCell(credit.name)}</Td>
                                                <Td className="truncate">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${credit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {credit.status}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">{displayCell(credit.creditMemoName)}</Td>
                                                <Td className="truncate">{displayCell(credit.salesOrderLineName)}</Td>
                                                <Td className="truncate">
                                                    {credit.customerQuoteLineName && credit.customerQuoteLineId ? (
                                                        <Link href={`/quotes/${credit.customerQuoteId}/lines/${credit.customerQuoteLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{credit.customerQuoteLineName}</Link>
                                                    ) : displayCell(credit.customerQuoteLineName)}
                                                </Td>
                                                <Td className="truncate">{displayCell(credit.productName)}</Td>
                                                <Td className="max-w-xs truncate" title={credit.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{displayCell(credit.productDescription)}</div></Td>
                                                <Td className="min-w-[161px] truncate">{displayCell(credit.brand)}</Td>
                                                <Td className="font-medium truncate">
                                                    ${credit.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[116px] truncate">{formatNumber(credit.creditQty)}</Td>
                                                <Td className="font-semibold truncate">
                                                    ${credit.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${credit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${credit.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                </Td>
                                                <Td className="font-bold text-primary truncate">
                                                    ${credit.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </TBody>
                            </Table>
                        )
                    ) : activeTab === 'debit' ? (
                        sortedData.length === 0 ? (
                            <TableEmptyState message="No records found" description="There are no Debit Memos associated with this proposal line." />
                        ) : (
                            <Table className="table-fixed">
                                <THead>
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
                                        <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.manufacturerDBA} onResize={handleDebitResize} />
                                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.unitCost} onResize={handleDebitResize} />
                                        <SortableHeader label="Debit Qty" field="debitQty" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.debitQty} onResize={handleDebitResize} />
                                        <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.totalCost} onResize={handleDebitResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.shipping} onResize={handleDebitResize} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={debitWidths.lineGrandTotal} onResize={handleDebitResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedData.map((item) => {
                                        const debit = item as DebitMemo;
                                        return (
                                            <Tr key={item.id} className="transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate">{displayCell(debit.name)}</Td>
                                                <Td className="truncate">
                                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${debit.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {debit.status}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">{displayCell(debit.debitMemoName)}</Td>
                                                <Td className="truncate">{displayCell(debit.supplierBillLineName)}</Td>
                                                <Td className="truncate">{displayCell(debit.purchaseOrderLineName)}</Td>
                                                <Td className="truncate">{displayCell(debit.productName)}</Td>
                                                <Td className="max-w-xs truncate" title={debit.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{displayCell(debit.productDescription)}</div></Td>
                                                <Td className="min-w-[167px] truncate">{displayCell(debit.brand)}</Td>
                                                <Td className="font-medium truncate">
                                                    ${debit.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="truncate">{formatNumber(debit.debitQty)}</Td>
                                                <Td className="font-semibold truncate">
                                                    ${debit.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${debit.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="font-bold text-primary truncate">
                                                    ${debit.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </TBody>
                            </Table>
                        )
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="table-fixed">
                                <THead>
                                    <tr>
                                        <Th>Amount</Th>
                                    </tr>
                                </THead>
                                <TBody>
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
                                                <Tr key={item.id} className="transition-colors">
                                                    <Td className="font-medium truncate">{displayCell(item.name)}</Td>
                                                    <Td className="text-left truncate">
                                                        <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </Td>
                                                    <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(r.requestDate)}</Td>
                                                    <Td className="font-semibold truncate">
                                                        ${r.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Td>
                                                </Tr>
                                            );
                                        })
                                    )}
                                </TBody>
                            </Table>

                        </div>
                    )}
                </div>
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
