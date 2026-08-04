import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PurchasesData, PurchaseOrderLine, SupplierBillLine } from "../../../types";
import { formatNumber, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";
import Pagination from "../../../../../../components/ui/Pagination";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import SubTabs from "@/components/ui/SubTabs";

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
        return <TableLoadingState />;
    }

    return (
        <div>
            {/* Sub-tabs */}
            <SubTabs
                tabs={[
                    { key: "purchases", label: "Purchases Lines", count: purchaseOrders.length },
                    { key: "supplier_bills", label: "Supplier Bills Lines", count: supplierBills.length },
                ]}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as any)}
                className="px-6 pt-6"
            />

            {/* Content */}
            <div>
                <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto ">
                    {activeTab === "purchases" && (
                        sortedPurchases.length === 0 ? (
                            <TableEmptyState message="No records found" description="There are no purchases associated with this proposal line." />
                        ) : (
                            <Table className="table-fixed">
                                <THead>
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
                                        <SortableHeader label="Brand" field="brand" sortConfig={sortConfigPurchases} requestSort={requestSortPurchases} width={purchaseWidths.manufacturerDBA} onResize={handlePurchaseResize} />
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
                                </THead>
                                <TBody>
                                    {paginatedData.map((purchase) => {
                                        const p = purchase as PurchaseOrderLine;
                                        return (
                                            <Tr key={p.id}>
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" title={p.name}><div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={p.name}>{displayCell(p.name)}</div></Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={p.status} variant="compact" />
                                                </Td>
                                                <Td className="truncate">
                                                    {p.purchaseOrderName && p.purchaseOrderId ? (
                                                        <Link href={`/purchase-orders/${p.purchaseOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{p.purchaseOrderName}</Link>
                                                    ) : (
                                                        <div className="text-sm truncate" title={p.purchaseOrderName}>{p.purchaseOrderName}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm truncate" title={p.customerQuoteLineName}>{displayCell(p.customerQuoteLineName)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm truncate" title={p.productName}>{displayCell(p.productName)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm max-w-xs truncate" title={p.productDescription}>{displayCell(p.productDescription)}</div>
                                                </Td>
                                                <Td className="min-w-[174px] truncate">
                                                    <div className="text-sm truncate" title={p.brand}>{displayCell(p.brand)}</div>
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${p.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[144px] truncate">{formatNumber(p.totalOrderQty)}</Td>
                                                <Td className="font-semibold truncate">
                                                    ${p.totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${p.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="text-primary font-bold truncate">
                                                    ${p.lineTotalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[171px] truncate">{formatNumber(p.openBalanceQty)}</Td>
                                                <Td className="font-medium truncate">{displayCell(p.trackingNumber)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[201px] truncate">{displayCell(p.estimatedDeliveryDate)}</Td>
                                                <Td className="truncate">{p.trackingStatus ? <StatusBadge status={p.trackingStatus} variant="compact" /> : "—"}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[174px] truncate">{displayCell(p.actualDeliveryDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 min-w-[177px] truncate">{displayCell(p.goodsReceiptDate)}</Td>
                                                <Td className="truncate">{displayCell(p.invoiceStatus)}</Td>
                                            </Tr>
                                        );
                                    })}
                                </TBody>
                            </Table>
                        )
                    )}

                    {activeTab === "supplier_bills" && (
                        sortedBills.length === 0 ? (
                            <TableEmptyState message="No records found" description="There are no supplier bills associated with this proposal line." />
                        ) : (
                            <Table className="table-fixed">
                                <THead>
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
                                        <SortableHeader label="Brand" field="brand" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.manufacturerDBA} onResize={handleBillResize} />
                                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.unitCost} onResize={handleBillResize} />
                                        <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billedQty} onResize={handleBillResize} />
                                        <SortableHeader label="Bill Amount" field="billAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.billAmount} onResize={handleBillResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.shipping} onResize={handleBillResize} />
                                        <SortableHeader label="Total Bill Amount" field="totalBillAmount" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.totalBillAmount} onResize={handleBillResize} />
                                        <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfigBills} requestSort={requestSortBills} width={billWidths.goodsReceiptDate} onResize={handleBillResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedData.map((bill) => {
                                        const b = bill as SupplierBillLine;
                                        return (
                                            <Tr key={b.id}>
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate">
                                                    <div className="text-sm truncate" title={b.name}>{displayCell(b.name)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={b.status} variant="compact" />
                                                </Td>
                                                <Td className="truncate">
                                                    {b.supplierBillName && b.supplierBillId ? (
                                                        <Link href={`/supplier-bills/${b.supplierBillId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{b.supplierBillName}</Link>
                                                    ) : (
                                                        <div className="text-sm truncate" title={b.supplierBillName}>{b.supplierBillName}</div>
                                                    )}

                                                </Td>
                                                <Td className="truncate">
                                                    {b.purchaseOrderLineName && b.purchaseOrderLineId ? (
                                                        <Link href={`/purchase-orders/${b.purchaseOrderLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={b.purchaseOrderLineName}>{b.purchaseOrderLineName}</Link>
                                                    ) : (
                                                        <div className="text-sm truncate" title={b.purchaseOrderLineName}>{b.purchaseOrderLineName}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm truncate" title={b.productName}>{displayCell(b.productName)}</div>
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm max-w-xs truncate" title={b.productDescription}>{displayCell(b.productDescription)}</div>
                                                </Td>
                                                <Td className="min-w-[170px] truncate">
                                                    <div className="text-sm truncate" title={b.brand}>{displayCell(b.brand)}</div>
                                                </Td>
                                                <Td className="font-medium truncate">
                                                    ${b.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="min-w-[110px] truncate">{formatNumber(b.billedQty)}</Td>
                                                <Td className="font-semibold truncate">
                                                    ${b.billAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${b.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="text-primary font-bold w-min-[158px] truncate">
                                                    ${b.totalBillAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400  truncate">{displayCell(b.goodsReceiptDate)}</Td>
                                            </Tr>
                                        );
                                    })}
                                </TBody>
                            </Table>
                        )
                    )}
                </div>
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
