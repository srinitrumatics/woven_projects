import { useState, useMemo } from "react";
import { PurchaseOrder, SupplierBill } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

interface PurchasesTabProps {
    purchases: PurchaseOrder[];
    supplierBills: SupplierBill[];
    loading: boolean;
    purchaseWidths: Record<string, number>;
    billWidths: Record<string, number>;
    onPurchaseResize: (field: string, width: number) => void;
    onBillResize: (field: string, width: number) => void;
}

type TabType = "orders" | "bills";

export default function PurchasesTab({
    purchases,
    supplierBills,
    loading,
    purchaseWidths,
    billWidths,
    onPurchaseResize,
    onBillResize
}: PurchasesTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("orders");

    // Use separate sort states for each tab to avoid type conflicts and preserve state
    const { items: sortedPurchases, requestSort: requestSortPurchases, sortConfig: sortConfigPurchases } = useSortableData<PurchaseOrder>(purchases);
    const { items: sortedBills, requestSort: requestSortBills, sortConfig: sortConfigBills } = useSortableData<SupplierBill>(supplierBills);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
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
                            truncate py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "orders"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Purchase Orders {purchases.length > 0 && `(${purchases.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab("bills")}
                        className={`
                            truncate py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "bills"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Supplier Bills {supplierBills.length > 0 && `(${supplierBills.length})`}
                    </button>
                </nav>
            </div>

            {/* Content using existing layout styles */}
            <div className="overflow-x-auto">
                {activeTab === "orders" ? (
                    sortedPurchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Purchases Orders associated with this proposal.">There are no Purchases Orders associated with this proposal.</p>
                        </div>
                    ) : (
                        <table className="w-full table-fixed">
                            <thead className="bg-primary-light dark:bg-gray-900">
                                <tr>
                                    <SortableHeader label="Purchase Order" field="name" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.name} onResize={onPurchaseResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.status} onResize={onPurchaseResize} />
                                    <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerQuoteName} onResize={onPurchaseResize} />
                                    <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerOrderName} onResize={onPurchaseResize} />
                                    <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerPO} onResize={onPurchaseResize} />
                                    <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.supplierName} onResize={onPurchaseResize} />
                                    <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.supplierDBA} onResize={onPurchaseResize} />
                                    <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.supplierContact} onResize={onPurchaseResize} />
                                    <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shipToAccountName} onResize={onPurchaseResize} />
                                    <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shipToLocationName} onResize={onPurchaseResize} />
                                    <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shipToContactName} onResize={onPurchaseResize} />
                                    <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.dropShip} onResize={onPurchaseResize} />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.totalLines} onResize={onPurchaseResize} />
                                    <SortableHeader label="Product Cost" field="productCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.productCost} onResize={onPurchaseResize} />
                                    <SortableHeader label="Shipping" field="shippingCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shippingCost} onResize={onPurchaseResize} />
                                    <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.totalCost} onResize={onPurchaseResize} />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.issuedDate} onResize={onPurchaseResize} />
                                    <SortableHeader label="Acknowledged Date" field="acknowledgedDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.acknowledgedDate} onResize={onPurchaseResize} />
                                    <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.requestDate} onResize={onPurchaseResize} />
                                    <SortableHeader label="Promise Date" field="promiseDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.promiseDate} onResize={onPurchaseResize} />
                                    <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shippingMethod} onResize={onPurchaseResize} />
                                    <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.logisticsPartner} onResize={onPurchaseResize} />
                                    <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.logisticsContact} onResize={onPurchaseResize} />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.trackingNumber} onResize={onPurchaseResize} />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.estimatedDeliveryDate} onResize={onPurchaseResize} />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.trackingStatus} onResize={onPurchaseResize} />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.actualDeliveryDate} onResize={onPurchaseResize} />
                                    <SortableHeader label="Goods Receipts Date" field="goodsReceiptsDate" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.goodsReceiptsDate} onResize={onPurchaseResize} />
                                </tr>
                                {/* Force minimum height for header to prevent collapse */}
                                <tr aria-hidden="true" className="h-0 border-none"></tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedPurchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={purchase.name}>
                                            <div className="text-sm font-medium  text-gray-900 dark:text-white truncate " title={purchase.name}>{purchase.name}</div>
                                        </td>
                                        <td className="px-3 py-2  truncate">
                                            <span className={`inline-block  text-sm font-medium rounded ${purchase.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                purchase.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    purchase.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.customerQuoteName}>{purchase.customerQuoteName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.customerOrderName}>{purchase.customerOrderName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.customerPO}>{purchase.customerPO}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.supplierName}>{purchase.supplierName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.supplierDBA}>{purchase.supplierDBA}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.supplierContact}>{purchase.supplierContact}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.shipToAccountName}>{purchase.shipToAccountName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.shipToLocationName}>{purchase.shipToLocationName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={purchase.shipToContactName}>{purchase.shipToContactName}</div></td>
                                        <td className="px-3 py-2 min-w-[122px] truncate">
                                            <span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${purchase.dropShip
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {purchase.dropShip ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2  text-sm text-gray-900 dark:text-white min-w-[122px] truncate">
                                            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                {(purchase.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[132px] truncate">
                                            ${(purchase.productCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                            ${(purchase.shippingCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                            ${purchase.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.issuedDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[172px] truncate"><div className="truncate ">{purchase.acknowledgedDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.requestDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.promiseDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.shippingMethod}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.logisticsPartner}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.logisticsContact}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.trackingNumber}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[199px] truncate"><div className="truncate ">{purchase.estimatedDeliveryDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{purchase.trackingStatus}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[172px] truncate"><div className="truncate ">{purchase.actualDeliveryDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[177px] truncate"><div className="truncate ">{purchase.goodsReceiptsDate}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    sortedBills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Supplier Bills associated with this proposal.">There are no Supplier Bills associated with this proposal.</p>
                        </div>
                    ) : (
                        <table className="w-full ">
                            <thead className="bg-primary-light dark:bg-gray-900">
                                <tr>
                                    <SortableHeader label="Supplier Bill" field="name" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.name} onResize={onBillResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.status} onResize={onBillResize} />
                                    <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.purchaseOrderName} onResize={onBillResize} />
                                    <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.customerQuoteName} onResize={onBillResize} />
                                    <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.customerOrderName} onResize={onBillResize} />
                                    <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.supplierName} onResize={onBillResize} />
                                    <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.supplierDBA} onResize={onBillResize} />
                                    <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.supplierContact} onResize={onBillResize} />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalLines} onResize={onBillResize} />
                                    <SortableHeader label="Total Cost" field="totalProductAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalProductAmount} onResize={onBillResize} />
                                    <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalShippingCharges} onResize={onBillResize} />
                                    <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalAmount} onResize={onBillResize} />
                                    <SortableHeader label="Billed Date" field="billedDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billedDate} onResize={onBillResize} />
                                    <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.paymentTerms} onResize={onBillResize} />
                                    <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.dueDate} onResize={onBillResize} />
                                    <SortableHeader label="Remittance Status" field="remittanceStatus" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.remittanceStatus} onResize={onBillResize} />
                                    <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.openBalance} onResize={onBillResize} />
                                    <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.daysOutstanding} onResize={onBillResize} />
                                    <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.settledDate} onResize={onBillResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={bill.name}><div className="text-sm font-medium  text-gray-900 dark:text-white truncate " title={bill.name}>{bill.name}</div></td>
                                        <td className="px-3 py-2  truncate">
                                            <span className={`inline-block text-sm font-medium rounded ${bill.status === 'Posted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {bill.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={bill.purchaseOrderName}>{bill.purchaseOrderName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={bill.customerQuoteName}>{bill.customerQuoteName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={bill.customerOrderName}>{bill.customerOrderName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={bill.supplierName}>{bill.supplierName}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={bill.supplierDBA}>{bill.supplierDBA}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  truncate"><div className="text-sm text-gray-900 dark:text-white truncate " title={bill.supplierContact}>{bill.supplierContact}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[111px] truncate">
                                            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold truncate">
                                                {(bill.totalLines ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                            ${bill.totalProductAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                            ${bill.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold min-w-[127px] truncate">
                                            ${bill.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{bill.billedDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{bill.paymentTerms}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{bill.dueDate}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[161px] truncate"><div className="truncate ">{bill.remittanceStatus}</div></td>
                                        <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[131px] truncate">
                                            ${bill.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-gray-400 min-w-[162px] truncate"><div className="truncate ">{bill.daysOutstanding}</div></td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400  truncate"><div className="truncate ">{bill.settledDate}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div >
        </div >
    );
}
