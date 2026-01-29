import { useState, useMemo } from "react";
import { PurchasesData, PurchaseOrderLine, SupplierBillLine } from "../../../types";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";

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
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 px-6 pt-6">
                <button
                    onClick={() => setActiveTab("purchases")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "purchases"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                >
                    Purchases
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === "purchases"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}>
                        {purchaseOrders.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("supplier_bills")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "supplier_bills"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                >
                    Supplier Bills
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === "supplier_bills"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}>
                        {supplierBills.length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="overflow-x-auto px-6 pb-6">
                {activeTab === "purchases" && (
                    <table className="w-full min-w-[2800px] table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white sticky left-0 bg-primary-light dark:bg-gray-900 z-10 w-[180px]">
                                    <div className="flex items-center justify-start cursor-pointer" onClick={() => requestSortPurchases('name')}>
                                        Purchase Order Line
                                        {sortConfigPurchases?.key === 'name' && (
                                            <span className="ml-1">{sortConfigPurchases.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <SortableHeader label="Status" field="status" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[120px]" />
                                <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[180px]" />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[180px]" />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[180px]" />
                                <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[250px]" />
                                <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                                <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[120px]" />
                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[100px]" />
                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[120px]" />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[120px]" />
                                <SortableHeader label="Line Total Cost" field="lineTotalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                                <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[120px]" />
                                <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[180px]" />
                                <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                                <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                                <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                                <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                                <SortableHeader label="Invoice Status" field="invoiceStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} className="w-[150px]" />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={19} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <p className="text-lg font-medium">No purchases found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedPurchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center" title={purchase.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{purchase.name}</div></td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="line-clamp-2" title={purchase.purchaseOrderName}>{purchase.purchaseOrderName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="line-clamp-2" title={purchase.customerQuoteLineName}>{purchase.customerQuoteLineName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="line-clamp-2" title={purchase.productName}>{purchase.productName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs line-clamp-2" title={purchase.productDescription}>{purchase.productDescription}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="line-clamp-2" title={purchase.manufacturerDBA}>{purchase.manufacturerDBA}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-mono">
                                            ${purchase.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{purchase.totalOrderQty}</td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                            ${purchase.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${purchase.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-primary font-bold">
                                            ${purchase.lineTotalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{purchase.openBalanceQty}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-mono">{purchase.trackingNumber}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{purchase.estimatedDeliveryDate}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-center">{purchase.trackingStatus}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{purchase.actualDeliveryDate}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{purchase.goodsReceiptDate}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-center">{purchase.invoiceStatus}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === "supplier_bills" && (
                    <table className="w-full min-w-[2000px] table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white sticky left-0 bg-primary-light dark:bg-gray-900 z-10 w-[180px]">
                                    <div className="flex items-center justify-start cursor-pointer" onClick={() => requestSortBills('name')}>
                                        Supplier Bill
                                        {sortConfigBills?.key === 'name' && (
                                            <span className="ml-1">{sortConfigBills.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <SortableHeader label="Status" field="status" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[120px]" />
                                <SortableHeader label="Supplier Bill" field="supplierBillName" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[180px]" />
                                <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[180px]" />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[180px]" />
                                <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[250px]" />
                                <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[120px]" />
                                <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[100px]" />
                                <SortableHeader label="Total Cost" field="totalProductAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[120px]" />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[120px]" />
                                <SortableHeader label="Line Grand Total" field="totalBillAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Invoice Date" field="billedDate" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Payment Status" field="remittanceStatus" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[120px]" />
                                <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Hold Status" field="holdStatus" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                                <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfigBills} requestSort={requestSortBills} className="w-[150px]" />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedBills.length === 0 ? (
                                <tr>
                                    <td colSpan={19} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium">No supplier bills found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">
                                            <div className="line-clamp-2" title={bill.name}>{bill.name}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                            <div className="line-clamp-2" title={bill.supplierBillName}>{bill.supplierBillName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                            <div className="line-clamp-2" title={bill.purchaseOrderLineName}>{bill.purchaseOrderLineName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                            <div className="line-clamp-2" title={bill.productName}>{bill.productName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                            <div className="max-w-xs line-clamp-2" title={bill.productDescription}>{bill.productDescription}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                                            <div className="line-clamp-2" title={bill.manufacturerDBA}>{bill.manufacturerDBA}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-mono">
                                            ${bill.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">{bill.billedQty}</td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                            ${bill.totalProductAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${bill.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-red-600 font-bold">
                                            ${bill.totalBillAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{bill.billedDate}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-center">{bill.paymentTerms}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{bill.dueDate}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-center">{bill.remittanceStatus}</td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${bill.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">{bill.daysOutstanding}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-center">{bill.holdStatus}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">{bill.settledDate}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
