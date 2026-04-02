import { useState, useMemo } from "react";
import Link from "next/link";
import { PurchaseOrder, SupplierBill } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "../../../../components/ui/Pagination";

interface PurchasesTabProps {
    purchases: PurchaseOrder[];
    supplierBills: SupplierBill[];
    loading: boolean;
    purchaseWidths: Record<string, number>;
    billWidths: Record<string, number>;
    onPurchaseResize: (field: string, width: number) => void;
    onBillResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

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
    const [currentPageOrders, setCurrentPageOrders] = useState(1);
    const [currentPageBills, setCurrentPageBills] = useState(1);

    // Use separate sort states for each tab to avoid type conflicts and preserve state
    const { items: sortedPurchases, requestSort: requestSortPurchases, sortConfig: sortConfigPurchases } = useSortableData<PurchaseOrder>(purchases);
    const { items: sortedBills, requestSort: requestSortBills, sortConfig: sortConfigBills } = useSortableData<SupplierBill>(supplierBills);

    const paginatedPurchases = useMemo(() => {
        const startIndex = (currentPageOrders - 1) * ITEMS_PER_PAGE;
        return sortedPurchases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPurchases, currentPageOrders]);

    const paginatedBills = useMemo(() => {
        const startIndex = (currentPageBills - 1) * ITEMS_PER_PAGE;
        return sortedBills.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedBills, currentPageBills]);

    const totalPagesOrders = Math.ceil(purchases.length / ITEMS_PER_PAGE);
    const totalPagesBills = Math.ceil(supplierBills.length / ITEMS_PER_PAGE);

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
            <div className="flex-1 min-h-0">
                {activeTab === "orders" ? (
                    sortedPurchases.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Purchases Orders associated with this proposal.">There are no Purchases Orders associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-sm shadow-sm  overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Purchase Order" field="name" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.name} onResize={onPurchaseResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.status} onResize={onPurchaseResize} />
                                            <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerQuoteName} onResize={onPurchaseResize} />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.customerOrderName} onResize={onPurchaseResize} />
                                            <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.salesOrderName} onResize={onPurchaseResize} />
                                            <SortableHeader label="Shipping" field="shipmentName" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.shipmentName} onResize={onPurchaseResize} />
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
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedPurchases.map((purchase) => (
                                            <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={purchase.name}>
                                                    <Link
                                                        href={`/purchase-orders/${purchase.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-semibold text-primary hover:underline truncate"
                                                    >
                                                        {purchase.name}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <StatusBadge status={purchase.status} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {purchase.customerQuoteName && purchase.customerQuoteId ? (
                                                        <Link
                                                            href={`/quotes/${purchase.customerQuoteId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={purchase.customerQuoteName}
                                                        >
                                                            {purchase.customerQuoteName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.customerQuoteName}>{purchase.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {purchase.customerOrderName && purchase.customerOrderId ? (
                                                        <Link
                                                            href={`/orders/${purchase.customerOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={purchase.customerOrderName}
                                                        >
                                                            {purchase.customerOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.customerOrderName}>{purchase.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {purchase.salesOrderName && purchase.salesOrderId ? (
                                                        <Link
                                                            href={`/orders/${purchase.salesOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={purchase.salesOrderName}
                                                        >
                                                            {purchase.salesOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.salesOrderName}>{purchase.salesOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {purchase.shipmentName && purchase.shipmentId ? (
                                                        <Link
                                                            href={`/shipments/${purchase.shipmentId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={purchase.shipmentName}
                                                        >
                                                            {purchase.shipmentName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.shipmentName}>{purchase.shipmentName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {purchase.customerPO && purchase.purchaseOrderId ? (
                                                        <Link
                                                            href={`/purchase-orders/${purchase.purchaseOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={purchase.customerPO}
                                                        >
                                                            {purchase.customerPO}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.customerPO}>{purchase.customerPO}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={purchase.supplierName}>{purchase.supplierName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={purchase.supplierDBA}>{purchase.supplierDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={purchase.supplierContact}>{purchase.supplierContact}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={purchase.shipToAccountName}>{purchase.shipToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={purchase.shipToLocationName}>{purchase.shipToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={purchase.shipToContactName}>{purchase.shipToContactName}</td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${purchase.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {purchase.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {purchase.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${(purchase.productCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${(purchase.shippingCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${purchase.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.issuedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.acknowledgedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.requestDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.promiseDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.shippingMethod}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.logisticsPartner}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.logisticsContact}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.trackingNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.estimatedDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.trackingStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.actualDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{purchase.goodsReceiptsDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-3 py-2">
                                <Pagination
                                    currentPage={currentPageOrders}
                                    totalPages={totalPagesOrders}
                                    onPageChange={setCurrentPageOrders}
                                    totalItems={purchases.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    itemName=""
                                />
                            </div>
                        </div>
                    )
                ) : (
                    sortedBills.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Supplier Bills associated with this proposal.">There are no Supplier Bills associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Supplier Bill" field="name" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.name} onResize={onBillResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.status} onResize={onBillResize} />
                                            <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.purchaseOrderName} onResize={onBillResize} />
                                            <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.customerQuoteName} onResize={onBillResize} />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.customerOrderName} onResize={onBillResize} />
                                            <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.salesOrderName} onResize={onBillResize} />
                                            <SortableHeader label="Shipping" field="shipmentName" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.shipmentName} onResize={onBillResize} />
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
                                        {paginatedBills.map((bill) => (
                                            <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={bill.name}>
                                                    <Link
                                                        href={`/supplier-bills/${bill.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-semibold text-primary hover:underline truncate"
                                                    >
                                                        {bill.name}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <StatusBadge status={bill.status || 'N/A'} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {bill.purchaseOrderName && bill.purchaseOrderId ? (
                                                        <Link
                                                            href={`/purchase-orders/${bill.purchaseOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={bill.purchaseOrderName}
                                                        >
                                                            {bill.purchaseOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.purchaseOrderName}>{bill.purchaseOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {bill.customerQuoteName && bill.customerQuoteId ? (
                                                        <Link
                                                            href={`/quotes/${bill.customerQuoteId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={bill.customerQuoteName}
                                                        >
                                                            {bill.customerQuoteName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.customerQuoteName}>{bill.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {bill.customerOrderName && bill.customerOrderId ? (
                                                        <Link
                                                            href={`/orders/${bill.customerOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={bill.customerOrderName}
                                                        >
                                                            {bill.customerOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.customerOrderName}>{bill.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {bill.salesOrderName && bill.salesOrderId ? (
                                                        <Link
                                                            href={`/orders/${bill.salesOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={bill.salesOrderName}
                                                        >
                                                            {bill.salesOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.salesOrderName}>{bill.salesOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {bill.shipmentName && bill.shipmentId ? (
                                                        <Link
                                                            href={`/shipments/${bill.shipmentId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={bill.shipmentName}
                                                        >
                                                            {bill.shipmentName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.shipmentName}>{bill.shipmentName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={bill.supplierName}>{bill.supplierName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={bill.supplierDBA}>{bill.supplierDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={bill.supplierContact}>{bill.supplierContact}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {bill.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${bill.totalProductAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${bill.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${bill.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{bill.billedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{bill.paymentTerms}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{bill.dueDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{bill.remittanceStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${bill.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-gray-400 truncate">{bill.daysOutstanding}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{bill.settledDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-3 py-2">
                                <Pagination
                                    currentPage={currentPageBills}
                                    totalPages={totalPagesBills}
                                    onPageChange={setCurrentPageBills}
                                    totalItems={supplierBills.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    itemName=""
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Draft":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            case "Submitted":
            case "Open":
            case "Acknowledged":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Approved":
            case "Posted":
            case "Received":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "In Progress":
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Cancelled":
            case "Canceled":
            case "Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
