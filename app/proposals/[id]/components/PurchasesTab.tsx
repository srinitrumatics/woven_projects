import { useState, useMemo } from "react";
import { PurchaseOrder, SupplierBill } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

interface PurchasesTabProps {
    purchases: PurchaseOrder[];
    supplierBills: SupplierBill[];
    loading: boolean;
}

type TabType = "orders" | "bills";

export default function PurchasesTab({ purchases, supplierBills, loading }: PurchasesTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("orders");

    // Use separate sort states for each tab to avoid type conflicts and preserve state
    const { items: sortedPurchases, requestSort: requestSortPurchases, sortConfig: sortConfigPurchases } = useSortableData<PurchaseOrder>(purchases);
    const { items: sortedBills, requestSort: requestSortBills, sortConfig: sortConfigBills } = useSortableData<SupplierBill>(supplierBills);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "orders"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Purchase Orders
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === "orders" ? "bg-primary-light text-primary-dark" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"}`}>
                            {purchases.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("bills")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "bills"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Supplier Bills
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === "bills" ? "bg-primary-light text-primary-dark" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"}`}>
                            {supplierBills.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Content using existing layout styles */}
            <div className="overflow-x-auto">
                {activeTab === "orders" ? (
                    <table className="w-full min-w-[3200px]">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <SortableHeader label="Purchase Order" field="name" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="180px" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="180px" />
                                <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="180px" />
                                <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="180px" />
                                <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="100px" />
                                <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="100px" />
                                <SortableHeader label="Product Cost" field="productCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Shipping" field="shippingCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Acknowledged Date" field="acknowledgedDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Promise Date" field="promiseDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="120px" />
                                <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="180px" />
                                <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                                <SortableHeader label="Goods Receipts Date" field="goodsReceiptsDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width="150px" />
                            </tr>
                            {/* Force minimum height for header to prevent collapse */}
                            <tr aria-hidden="true" className="h-0 border-none"></tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={28} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <p className="text-lg font-medium">No purchase orders found</p>
                                            <p className="text-xs">There are no purchase orders associated with this proposal.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedPurchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium" title={purchase.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2" title={purchase.name}>{purchase.name}</div></td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${purchase.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                purchase.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    purchase.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.customerQuoteName}>{purchase.customerQuoteName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.customerOrderName}>{purchase.customerOrderName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.customerPO}>{purchase.customerPO}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.supplierName}>{purchase.supplierName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.supplierDBA}>{purchase.supplierDBA}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.supplierContact}>{purchase.supplierContact}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.shipToAccountName}>{purchase.shipToAccountName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.shipToLocationName}>{purchase.shipToLocationName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={purchase.shipToContactName}>{purchase.shipToContactName}</div></td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${purchase.dropShip
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {purchase.dropShip ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                {purchase.totalLines}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${(purchase.productCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${(purchase.shippingCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                            ${purchase.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.issuedDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.acknowledgedDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.requestDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.promiseDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.shippingMethod}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.logisticsPartner}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.logisticsContact}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.trackingNumber}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.estimatedDeliveryDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.trackingStatus}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.actualDeliveryDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{purchase.goodsReceiptsDate}</div></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (

                    <table className="w-full min-w-[2200px]">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <SortableHeader label="Supplier Bill" field="name" sortConfig={sortConfigBills} requestSort={requestSortBills} width="180px" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfigBills} requestSort={requestSortBills} width="180px" />
                                <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfigBills} requestSort={requestSortBills} width="100px" />
                                <SortableHeader label="Total Cost" field="totalProductAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Billed Date" field="billedDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Remittance Status" field="remittanceStatus" sortConfig={sortConfigBills} requestSort={requestSortBills} width="150px" />
                                <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
                                <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width="120px" />
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
                                            <p className="text-xs">There are no supplier bills associated with this proposal.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium" title={bill.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2" title={bill.name}>{bill.name}</div></td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${bill.status === 'Posted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {bill.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={bill.purchaseOrderName}>{bill.purchaseOrderName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={bill.customerQuoteName}>{bill.customerQuoteName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={bill.customerOrderName}>{bill.customerOrderName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={bill.supplierName}>{bill.supplierName}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={bill.supplierDBA}>{bill.supplierDBA}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white"><div className="text-xs text-gray-900 dark:text-white line-clamp-2" title={bill.supplierContact}>{bill.supplierContact}</div></td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                {bill.totalLines}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${bill.totalProductAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${bill.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                            ${bill.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{bill.billedDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{bill.paymentTerms}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{bill.dueDate}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{bill.remittanceStatus}</div></td>
                                        <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                            ${bill.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{bill.daysOutstanding}</div></td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400"><div className="line-clamp-2">{bill.settledDate}</div></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table >
                )
                }
            </div >
        </div >
    );
}
