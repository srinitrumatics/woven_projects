import { useEffect, useMemo, useState } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

interface POLI {
    id: string;
    name: string;
    status: string;
    purchaseOrder: string;
    customerQuoteLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    unitCost: number;
    orderQty: number;
    productCost: number;
    shipping: number;
    totalCost: number;
    openBalanceQty: number;
    estimatedDeliveryDate: string;
    actualDeliveryDate: string;
    trackingNumber: string;
    trackingStatus: string;
    receiptDate: string;
    invoiceStatus: string;
}

interface SBLI {
    id: string;
    name: string;
    status: string;
    supplierBill: string;
    purchaseOrderLine: string;
    customerQuoteLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    unitCost: number;
    billedQty: number;
    billAmount: number;
    shipping: number;
    totalBillAmount: number;
    receiptDate: string;
}

interface QuoteLinePurchasesTabProps {
    lineId: string;
    loading: boolean;
    accountId?: string;
    contactId?: string;
}

export default function QuoteLinePurchasesTab({
    lineId,
    loading: initialLoading,
    accountId,
    contactId
}: QuoteLinePurchasesTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"Orders" | "Bills">("Orders");
    const [loading, setLoading] = useState(initialLoading);
    const [poliData, setPoliData] = useState<POLI[]>([]);
    const [sbliData, setSbliData] = useState<SBLI[]>([]);

    useEffect(() => {
        async function fetchPurchasesData() {
            if (!accountId || !contactId || !lineId) return;

            try {
                setLoading(true);
                const res = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&quoteId=${encodeURIComponent(lineId)}&action=purchases&objectName=Customer_Quote_Line__c`);

                if (!res.ok) throw new Error("Failed to fetch purchases data");

                const responseData = await res.json();
                console.log("Purchases API Response:", responseData);

                if (responseData) {
                    // Map Purchase Order Lines
                    if (responseData.Purchase_Order_Line__c) {
                        setPoliData(responseData.Purchase_Order_Line__c.map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c,
                            purchaseOrder: item.Purchase_Order_Name,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            unitCost: item.Unit_Cost__c || 0,
                            orderQty: item.Total_Order_Qty__c || 0,
                            productCost: item.Total_Product_Cost__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            totalCost: item.Total_Cost__c || 0,
                            openBalanceQty: item.Open_Balance_Qty__c || 0,
                            estimatedDeliveryDate: item.Estimated_Delivery_Date__c,
                            actualDeliveryDate: item.Actual_Delivery_Date__c,
                            trackingNumber: item.Tracking_Number__c,
                            trackingStatus: item.Tracking_Status__c,
                            receiptDate: item.Goods_Receipt_Date__c,
                            invoiceStatus: item.Invoice_Status__c
                        })));
                    }

                    // Map Supplier Bill Lines
                    if (responseData.Supplier_Bill_Line__c) {
                        setSbliData(responseData.Supplier_Bill_Line__c.map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c,
                            supplierBill: item.Supplier_Bill_Name,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            customerQuoteLine: item.Customer_Order_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            unitCost: item.Unit_Cost__c || 0,
                            billedQty: item.Billed_Qty__c || 0,
                            billAmount: item.BillAmount__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            totalBillAmount: item.Total_Bill_Amount__c || 0,
                            receiptDate: item.Goods_Receipt_Date__c
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching purchases data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchPurchasesData();
    }, [lineId, accountId, contactId]);

    const activeData = useMemo(() => {
        return activeSubTab === "Orders" ? poliData : sbliData;
    }, [activeSubTab, poliData, sbliData]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData);
    const { widths, handleResize } = useResizableColumns({
        name: 180,
        status: 120,
        purchaseOrder: 150,
        supplierBill: 150,
        purchaseOrderLine: 180,
        customerQuoteLine: 180,
        productName: 150,
        description: 200,
        manufacturerDBA: 150,
        unitCost: 120,
        orderQty: 120,
        productCost: 120,
        shipping: 100,
        totalCost: 120,
        openBalanceQty: 120,
        estimatedDeliveryDate: 150,
        actualDeliveryDate: 150,
        trackingNumber: 150,
        trackingStatus: 120,
        receiptDate: 150,
        invoiceStatus: 120,
        billedQty: 120,
        billAmount: 120,
        totalBillAmount: 120
    });

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full py-4">
            {/* Sub Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
                {[
                    { key: "Orders", label: "Purchase Order Lines ", count: poliData.length },
                    { key: "Bills", label: "Supplier Bill Lines", count: sbliData.length }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSubTab(tab.key as any)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSubTab === tab.key
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <SortableHeader
                                    label={activeSubTab === "Orders" ? "Purchase Order Line" : "Supplier Bill Line"}
                                    field="name"
                                    sortConfig={sortConfig}
                                    requestSort={requestSort}
                                    width={widths.name}
                                    onResize={handleResize}
                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />

                                {activeSubTab === "Orders" && (
                                    <>
                                        <SortableHeader label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                        <SortableHeader label="Total Order Qty" field="orderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.orderQty} onResize={handleResize} />
                                        <SortableHeader label="Total Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                        <SortableHeader label="Line Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                                        <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalanceQty} onResize={handleResize} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                                        <SortableHeader label="Goods Receipt Date" field="receiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receiptDate} onResize={handleResize} />
                                        <SortableHeader label="Invoice Status" field="invoiceStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceStatus} onResize={handleResize} />
                                    </>
                                )}

                                {activeSubTab === "Bills" && (
                                    <>
                                        <SortableHeader label="Supplier Bill" field="supplierBill" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierBill} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                        <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                        <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.billedQty} onResize={handleResize} />
                                        <SortableHeader label="Bill Amount" field="billAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.billAmount} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                        <SortableHeader label="Total Bill Amount" field="totalBillAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalBillAmount} onResize={handleResize} />
                                        <SortableHeader label="Goods Receipt Date" field="receiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receiptDate} onResize={handleResize} />
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={20} className="py-12 text-center text-gray-500 dark:text-gray-400 italic">No records found.</td>
                                </tr>
                            ) : (
                                sortedData.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800">{item.name}</td>
                                        <td className="px-3 py-2 text-sm">
                                            <span className="inline-block px-2 py-1  text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {item.status}
                                            </span>
                                        </td>
                                        {activeSubTab === "Orders" && (
                                            <>
                                                <td className="px-3 py-2 text-sm text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.purchaseOrder}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.customerQuoteLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-[200px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.unitCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[160px]">{item.orderQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.productCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.shipping)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold whitespace-nowrap min-w-[160px]">{formatCurrency(item.totalCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[170px]">{item.openBalanceQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.trackingNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[205px]">{formatDate(item.estimatedDeliveryDate, 'numeric-dash')}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[175px]">{item.trackingStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[195px]">{formatDate(item.actualDeliveryDate, 'numeric-dash')}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[195px]">{formatDate(item.receiptDate, 'numeric-dash')}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[175px]">{item.invoiceStatus}</td>
                                            </>
                                        )}
                                        {activeSubTab === "Bills" && (
                                            <>
                                                <td className="px-3 py-2 text-sm text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.supplierBill}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.customerQuoteLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.purchaseOrderLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-[200px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[160px]">{item.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.unitCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.billedQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.billAmount)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.shipping)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold whitespace-nowrap min-w-[175px]">{formatCurrency(item.totalBillAmount)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[195px]">{formatDate(item.receiptDate, 'numeric-dash')}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
