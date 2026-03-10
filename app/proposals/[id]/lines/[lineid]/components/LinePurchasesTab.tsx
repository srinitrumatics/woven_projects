import { useState, useMemo } from "react";
import { PurchasesData, PurchaseOrderLine, SupplierBillLine } from "../../../types";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";

interface LinePurchasesTabProps {
    purchasesData: PurchasesData;
    loading: boolean;
}

type TabType = "purchases" | "supplier_bills";

export default function LinePurchasesTab({ purchasesData, loading }: LinePurchasesTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("purchases");

    const { purchaseOrders, supplierBills } = purchasesData;

    // Use separate sort states for each tab
    const { items: sortedPurchases, requestSort: requestSortPurchases, sortConfig: sortConfigPurchases } = useSortableData<PurchaseOrderLine>(purchaseOrders);
    const { items: sortedBills, requestSort: requestSortBills, sortConfig: sortConfigBills } = useSortableData<SupplierBillLine>(supplierBills);

    const sortedData = activeTab === "purchases" ? sortedPurchases : sortedBills;
    const requestSort = activeTab === "purchases" ? requestSortPurchases : requestSortBills;
    const sortConfig = activeTab === "purchases" ? sortConfigPurchases : sortConfigBills;

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
            <div className="flex justify-center items-center py-12">
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
            <div className="overflow-x-auto ">
                {activeTab === "purchases" && (
                    sortedPurchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium">No records found</p>
                            <p className="text-sm">There are no purchases associated with this proposal line.</p>
                        </div>
                    ) : (
                        <table className="w-full">
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
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.status} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.purchaseOrderName} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerQuoteLineName} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.productName} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.productDescription} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.manufacturerDBA} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.unitCost} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.totalOrderQty} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.totalCost} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shipping} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Line Total Cost" field="lineTotalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.lineTotalCost} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.openBalanceQty} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.trackingNumber} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.estimatedDeliveryDate} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.trackingStatus} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.actualDeliveryDate} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.goodsReceiptDate} onResize={handlePurchaseResize} />
                                    <SortableHeader label="Invoice Status" field="invoiceStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.invoiceStatus} onResize={handlePurchaseResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedPurchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 " title={purchase.name}><div className="text-sm font-medium font-medium text-gray-900 dark:text-white truncate" title={purchase.name}>{purchase.name}</div></td>
                                        <td className="px-3 py-2">
                                            <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-sm truncate" title={purchase.purchaseOrderName}>{purchase.purchaseOrderName}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-sm truncate" title={purchase.customerQuoteLineName}>{purchase.customerQuoteLineName}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-sm truncate" title={purchase.productName}>{purchase.productName}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-sm max-w-xs truncate" title={purchase.productDescription}>{purchase.productDescription}</div>
                                        </td>
                                        <td className="px-3 py-2 min-w-[174px]">
                                            <div className="text-sm truncate" title={purchase.manufacturerDBA}>{purchase.manufacturerDBA}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">
                                            ${purchase.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[144px]">{purchase.totalOrderQty}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-semibold">
                                            ${purchase.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            ${purchase.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-primary font-bold">
                                            ${purchase.lineTotalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[171px]">{purchase.openBalanceQty}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">{purchase.trackingNumber}</td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[201px]">{purchase.estimatedDeliveryDate}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white ">{purchase.trackingStatus}</td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[174px]">{purchase.actualDeliveryDate}</td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[177px]">{purchase.goodsReceiptDate}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white ">{purchase.invoiceStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {activeTab === "supplier_bills" && (
                    sortedBills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium">No records found</p>
                            <p className="text-sm">There are no supplier bills associated with this proposal line.</p>
                        </div>
                    ) : (
                        <table className="w-full">
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
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.status} onResize={handleBillResize} />
                                    <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.supplierBillName} onResize={handleBillResize} />
                                    <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.purchaseOrderLineName} onResize={handleBillResize} />
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.productName} onResize={handleBillResize} />
                                    <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.productDescription} onResize={handleBillResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.manufacturerDBA} onResize={handleBillResize} />
                                    <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.unitCost} onResize={handleBillResize} />
                                    <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billedQty} onResize={handleBillResize} />
                                    <SortableHeader label="Bill Amount" field="billAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billAmount} onResize={handleBillResize} />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.shipping} onResize={handleBillResize} />
                                    <SortableHeader label="Total Bill Amount" field="totalBillAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalBillAmount} onResize={handleBillResize} />
                                    <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.goodsReceiptDate} onResize={handleBillResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 ">
                                            <div className="text-sm truncate" title={bill.name}>{bill.name}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            <div className="text-sm truncate" title={bill.supplierBillName}>{bill.supplierBillName}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            <div className="text-sm truncate" title={bill.purchaseOrderLineName}>{bill.purchaseOrderLineName}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            <div className="text-sm truncate" title={bill.productName}>{bill.productName}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            <div className="text-sm max-w-xs truncate" title={bill.productDescription}>{bill.productDescription}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[170px]">
                                            <div className="text-sm truncate" title={bill.manufacturerDBA}>{bill.manufacturerDBA}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                            ${bill.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[110px]">{bill.billedQty}</td>
                                        <td className="px-3 py-2 text-sm px-3 py-2 text-gray-900 dark:text-white font-semibold">
                                            ${bill.billAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                            ${bill.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-primary font-bold w-min-[158px]">
                                            ${bill.totalBillAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 ">{bill.goodsReceiptDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}
