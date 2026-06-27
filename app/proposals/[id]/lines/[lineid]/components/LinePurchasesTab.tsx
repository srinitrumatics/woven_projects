import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PurchasesData, PurchaseOrderLine, SupplierBillLine } from "../../../types";
import { formatNumber, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";
import Pagination from "../../../../../../components/ui/Pagination";

const ITEMS_PER_PAGE = 10;

interface LinePurchasesTabProps {
    purchasesData: PurchasesData;
    loading: boolean;
}

type TabType = "purchases" | "supplier_bills";

export default function LinePurchasesTab({ purchasesData, loading }: LinePurchasesTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("purchases");
    const [currentPage, setCurrentPage] = useState(1);
    const { purchaseOrders, supplierBills } = purchasesData;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Use separate sort states for each tab
    const { items: sortedPurchases, requestSort: originalRequestSortPurchases, sortConfig: sortConfigPurchases } = useSortableData<PurchaseOrderLine>(purchaseOrders, { key: 'name', direction: 'desc' });
    const { items: sortedBills, requestSort: originalRequestSortBills, sortConfig: sortConfigBills } = useSortableData<SupplierBillLine>(supplierBills, { key: 'name', direction: 'desc' });

    const requestSortPurchases = (key: string) => {
        originalRequestSortPurchases(key as any);
        setCurrentPage(1);
    };

    const requestSortBills = (key: string) => {
        originalRequestSortBills(key as any);
        setCurrentPage(1);
    };

    const sortedData = activeTab === "purchases" ? sortedPurchases : sortedBills;
    const requestSort = activeTab === "purchases" ? requestSortPurchases : requestSortBills;
    const sortConfig = activeTab === "purchases" ? sortConfigPurchases : sortConfigBills;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

    const { widths: purchaseWidths, handleResize: handlePurchaseResize } = useResizableColumns({
        name: 180,
        status: 120,
        purchaseOrderName: 180,
        customerQuoteLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 150,
        unitCost: 120,
        totalOrderQty: 100,
        totalCost: 120,
        shipping: 120,
        lineTotalCost: 150,
        openBalanceQty: 120,
        trackingNumber: 180,
        estimatedDeliveryDate: 150,
        trackingStatus: 150,
        actualDeliveryDate: 150,
        goodsReceiptDate: 150,
        invoiceStatus: 150
    });

    const { widths: billWidths, handleResize: handleBillResize } = useResizableColumns({
        name: 180,
        status: 120,
        supplierBillName: 180,
        purchaseOrderLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 150,
        unitCost: 120,
        billedQty: 100,
        billAmount: 120,
        shipping: 120,
        totalBillAmount: 160,
        goodsReceiptDate: 170
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
            <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700 px-6 pt-6">
                {[
                    { id: "purchases", label: "Purchases Lines", count: purchaseOrders.length },
                    { id: "supplier_bills", label: "Supplier Bills Lines", count: supplierBills.length }
                ].map((tab) => (
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
                <div className="overflow-x-auto ">
                    {activeTab === "purchases" && (
                        sortedPurchases.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                <p className="text-lg font-medium" title="No records found">No records found</p>
                                <p className="text-sm" title="There are no purchases associated with this proposal line.">There are no purchases associated with this proposal line.</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <SortableHeader
                                                label="Purchase Order Line"
                                                field="name"
                                                sortConfig={sortConfigPurchases}
                                                requestSort={requestSortPurchases}
                                                width={purchaseWidths.name}
                                                onResize={handlePurchaseResize}
                                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                truncate={false}
                                            />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.status} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.purchaseOrderName} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerQuoteLineName} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.productName} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.productDescription} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.manufacturerDBA} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.unitCost} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.totalOrderQty} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.totalCost} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shipping} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Line Total Cost" field="lineTotalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.lineTotalCost} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.openBalanceQty} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.trackingNumber} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.estimatedDeliveryDate} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.trackingStatus} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.actualDeliveryDate} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.goodsReceiptDate} onResize={handlePurchaseResize} truncate={false} />
                                            <SortableHeader label="Invoice Status" field="invoiceStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.invoiceStatus} onResize={handlePurchaseResize} truncate={false} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((purchase) => {
                                            const p = purchase as PurchaseOrderLine;
                                            return (
                                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800  truncate" title={p.name}><div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={p.name}>{displayCell(p.name)}</div></td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 truncate">
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        {p.purchaseOrderName && p.purchaseOrderId ? (
                                                            <Link href={`/purchase-orders/${p.purchaseOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{p.purchaseOrderName}</Link>
                                                        ) : (
                                                            <div className="text-sm truncate" title={p.purchaseOrderName}>{p.purchaseOrderName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        <div className="text-sm truncate" title={p.customerQuoteLineName}>{displayCell(p.customerQuoteLineName)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        <div className="text-sm truncate" title={p.productName}>{displayCell(p.productName)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        <div className="text-sm max-w-xs truncate" title={p.productDescription}>{displayCell(p.productDescription)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 min-w-[174px] truncate">
                                                        <div className="text-sm truncate" title={p.manufacturerDBA}>{displayCell(p.manufacturerDBA)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">
                                                        ${p.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[144px] truncate">{formatNumber(p.totalOrderQty)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate">
                                                        ${p.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        ${p.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-primary font-bold truncate">
                                                        ${p.lineTotalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[171px] truncate">{formatNumber(p.openBalanceQty)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{displayCell(p.trackingNumber)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[201px] truncate">{displayCell(p.estimatedDeliveryDate)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{displayCell(p.trackingStatus)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[174px] truncate">{displayCell(p.actualDeliveryDate)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[177px] truncate">{displayCell(p.goodsReceiptDate)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate">{displayCell(p.invoiceStatus)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </>
                        )
                    )}

                    {activeTab === "supplier_bills" && (
                        sortedBills.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                <p className="text-lg font-medium" title="No records found">No records found</p>
                                <p className="text-sm" title="There are no supplier bills associated with this proposal line.">There are no supplier bills associated with this proposal line.</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <SortableHeader
                                                label="Supplier Bill Line"
                                                field="name"
                                                sortConfig={sortConfigBills}
                                                requestSort={requestSortBills}
                                                width={billWidths.name}
                                                onResize={handleBillResize}
                                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                truncate={false}
                                            />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.status} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.supplierBillName} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.purchaseOrderLineName} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.productName} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.productDescription} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.manufacturerDBA} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.unitCost} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billedQty} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Bill Amount" field="billAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billAmount} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.shipping} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Total Bill Amount" field="totalBillAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalBillAmount} onResize={handleBillResize} truncate={false} />
                                            <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.goodsReceiptDate} onResize={handleBillResize} truncate={false} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((bill) => {
                                            const b = bill as SupplierBillLine;
                                            return (
                                                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800  truncate">
                                                        <div className="text-sm truncate" title={b.name}>{displayCell(b.name)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 truncate">
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {b.supplierBillName && b.supplierBillId ? (
                                                            <Link href={`/supplier-bills/${b.supplierBillId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{b.supplierBillName}</Link>
                                                        ) : (
                                                            <div className="text-sm truncate" title={b.supplierBillName}>{b.supplierBillName}</div>
                                                        )}

                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {b.purchaseOrderLineName && b.purchaseOrderLineId ? (
                                                            <Link href={`/purchase-orders/${b.purchaseOrderLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={b.purchaseOrderLineName}>{b.purchaseOrderLineName}</Link>
                                                        ) : (
                                                            <div className="text-sm truncate" title={b.purchaseOrderLineName}>{b.purchaseOrderLineName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="text-sm truncate" title={b.productName}>{displayCell(b.productName)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="text-sm max-w-xs truncate" title={b.productDescription}>{displayCell(b.productDescription)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[170px] truncate">
                                                        <div className="text-sm truncate" title={b.manufacturerDBA}>{displayCell(b.manufacturerDBA)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${b.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[110px] truncate">{formatNumber(b.billedQty)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold truncate">
                                                        ${b.billAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${b.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-primary font-bold w-min-[158px] truncate">
                                                        ${b.totalBillAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate">{displayCell(b.goodsReceiptDate)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </>
                        )
                    )}
                </div>
                {(sortedBills.length > 0 || sortedPurchases.length > 0) && (
                    <div className="px-3 py-2 ">
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
