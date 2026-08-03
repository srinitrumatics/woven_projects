import { useState, useMemo } from "react";
import Link from "next/link";
import { PurchaseOrder, SupplierBill } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "../../../../components/ui/Pagination";
import { useUserSession } from "../../../../components/UserSessionContext";
import { displayCell } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge, RemittanceBadge } from "@/components/ui/StatusBadge";
import SubTabs from "@/components/ui/SubTabs";

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
    const { selectedAccount } = useUserSession();
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

    // Use separate sort states for each tab to avoid type conflicts and preserve state
    const { items: sortedPurchases, requestSort: requestSortPurchases, sortConfig: sortConfigPurchases } = useSortableData<PurchaseOrder>(purchases, { key: 'name', direction: 'desc' });
    const { items: sortedBills, requestSort: requestSortBills, sortConfig: sortConfigBills } = useSortableData<SupplierBill>(supplierBills, { key: 'name', direction: 'desc' });

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
        return <TableLoadingState />;
    }

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <SubTabs
                tabs={[
                    { key: "orders", label: "Purchase Orders", count: purchases.length },
                    { key: "bills", label: "Supplier Bills", count: supplierBills.length },
                ]}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as TabType)}
            />

            {/* Content using existing layout styles */}
            <div className="flex-1 min-h-0">
                {activeTab === "orders" ? (
                    sortedPurchases.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <TableEmptyState message="No records found" description="There are no Purchases Orders associated with this proposal." />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Purchase Order" field="name" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.name} onResize={onPurchaseResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
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
                                    </THead>
                                    <TBody>
                                        {paginatedPurchases.map((purchase) => (
                                            <Tr key={purchase.id} className="group transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={purchase.name}>
                                                    {!isRestricted ? (
                                                        <Link
                                                            href={`/purchase-orders/${purchase.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                        >
                                                            {purchase.name}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm font-semibold truncate">{purchase.name}</span>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={purchase.status} variant="pill" />
                                                </Td>
                                                <Td className="truncate">
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.customerQuoteName}>{displayCell(purchase.customerQuoteName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.customerOrderName}>{displayCell(purchase.customerOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={purchase.customerPO}>{displayCell(purchase.customerPO)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={purchase.supplierName}>{displayCell(purchase.supplierName)}</Td>
                                                <Td className="truncate" title={purchase.supplierDBA}>{displayCell(purchase.supplierDBA)}</Td>
                                                <Td className="truncate" title={purchase.supplierContact}>{displayCell(purchase.supplierContact)}</Td>
                                                <Td className="truncate" title={purchase.shipToAccountName}>{displayCell(purchase.shipToAccountName)}</Td>
                                                <Td className="truncate" title={purchase.shipToLocationName}>{displayCell(purchase.shipToLocationName)}</Td>
                                                <Td className="truncate" title={purchase.shipToContactName}>{displayCell(purchase.shipToContactName)}</Td>
                                                <Td className="truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${purchase.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {purchase.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {purchase.totalLines}
                                                    </span>
                                                </Td>
                                                <Td className="truncate font-medium">
                                                    ${(purchase.productCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="truncate">
                                                    ${(purchase.shippingCost ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="truncate font-bold">
                                                    ${purchase.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.issuedDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.acknowledgedDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.requestDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.promiseDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.shippingMethod)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.logisticsPartner)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.logisticsContact)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.trackingNumber)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.estimatedDeliveryDate)}</Td>
                                                <Td className="truncate">{purchase.trackingStatus ? <StatusBadge status={purchase.trackingStatus} variant="pill" /> : "—"}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.actualDeliveryDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(purchase.goodsReceiptsDate)}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <TableEmptyState message="No records found" description="There are no Supplier Bills associated with this proposal." />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Supplier Bill" field="name" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.name} onResize={onBillResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
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
                                    </THead>
                                    <TBody>
                                        {paginatedBills.map((bill) => (
                                            <Tr key={bill.id} className="group transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={bill.name}>
                                                    <Link
                                                        href={`/supplier-bills/${bill.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-semibold text-primary hover:underline truncate"
                                                    >
                                                        {bill.name}
                                                    </Link>
                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={bill.status || 'N/A'} variant="pill" />
                                                </Td>
                                                <Td className="truncate">
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.purchaseOrderName}>{displayCell(bill.purchaseOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.customerQuoteName}>{displayCell(bill.customerQuoteName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={bill.customerOrderName}>{displayCell(bill.customerOrderName)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={bill.supplierName}>{displayCell(bill.supplierName)}</Td>
                                                <Td className="truncate" title={bill.supplierDBA}>{displayCell(bill.supplierDBA)}</Td>
                                                <Td className="truncate" title={bill.supplierContact}>{displayCell(bill.supplierContact)}</Td>
                                                <Td className="truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {bill.totalLines}
                                                    </span>
                                                </Td>
                                                <Td className="truncate font-medium">
                                                    ${bill.totalProductAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${bill.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate font-bold">
                                                    ${bill.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(bill.billedDate)}</Td>
                                                <Td className="truncate">{displayCell(bill.paymentTerms)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(bill.dueDate)}</Td>
                                                <Td className="truncate">{bill.remittanceStatus ? <RemittanceBadge status={bill.remittanceStatus} /> : "—"}</Td>
                                                <Td className="truncate font-medium">
                                                    ${bill.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-center text-gray-600 dark:text-gray-400 truncate">{displayCell(String(bill.daysOutstanding ?? ''))}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(bill.settledDate)}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
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

