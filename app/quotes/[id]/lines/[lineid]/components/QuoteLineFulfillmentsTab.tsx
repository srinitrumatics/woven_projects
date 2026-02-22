import { useEffect, useMemo, useState } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";


interface SOLI {
    id: string;
    lineName: string;
    status: string;
    salesOrderName: string;
    customerQuoteLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
    qtyPicked: number;
    backOrderQty: number;
    qtyShipped: number;
}

interface SMLI {
    id: string;
    lineName: string;
    status: string;
    manifestName: string;
    salesOrderLine: string;
    customerQuoteLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    boxCount: number;
    boxNetWeight: number;
    boxGrossWeight: number;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    trackingStatus: string;
    actualDeliveryDate: string;
}

interface INLI {
    id: string;
    lineName: string;
    status: string;
    invoiceName: string;
    salesOrderLine: string;
    customerQuoteLine: string;
    purchaseOrderLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    unitPrice: number;
    invoiceQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
}

interface QuoteLineFulfillmentTabProps {
    lineId: string;
    loading: boolean;
    accountId?: string;
    contactId?: string;
    currentProduct?: any;
}

export default function QuoteLineFulfillmentsTab({
    lineId,
    loading: initialLoading,
    accountId,
    contactId,
    currentProduct
}: QuoteLineFulfillmentTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"Orders" | "Invoices" | "Manifests">("Orders");
    const [loading, setLoading] = useState(initialLoading);
    const [soliData, setSoliData] = useState<SOLI[]>([]);
    const [inliData, setInliData] = useState<INLI[]>([]);
    const [smliData, setSmliData] = useState<SMLI[]>([]);


    useEffect(() => {
        async function fetchFulfillmentData() {
            if (!accountId || !contactId || !lineId) return;

            try {
                setLoading(true);
                const res = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&quoteId=${encodeURIComponent(lineId)}&action=fulfillment&objectName=Customer_Quote_Line__c`);

                if (!res.ok) throw new Error("Failed to fetch fulfillment data");

                const responseData = await res.json();
                console.log("Fulfillment API Response:", responseData);

                if (responseData) {
                    // Map Sales Order Lines
                    if (responseData.Sales_Order_Line__c) {
                        setSoliData(responseData.Sales_Order_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            salesOrderName: item.Sales_Order_Name,
                            customerQuoteLine: item.Customer_Order_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            unitPrice: item.Unit_Price__c || 0,
                            totalOrderQty: item.Total_Order_Qty__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            taxes: item.Total_Taxes_Amount__c || 0,
                            grandTotal: item.Line_Grand_Total__c || 0,
                            qtyPicked: item.Qty_Picked__c || 0,
                            backOrderQty: item.Back_Order_Qty__c || 0,
                            qtyShipped: item.Qty_Shipped__c || 0
                        })));
                    }

                    // Map Invoice Lines
                    if (responseData.Invoice_Line__c) {
                        setInliData(responseData.Invoice_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            invoiceName: item.Invoice_Name,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            customerQuoteLine: item.Customer_Order_Line_Name,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            unitPrice: item.Unit_Price__c || 0,
                            invoiceQty: item.Invoiced_Qty__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            taxes: item.Total_Taxes_Amount__c || 0,
                            grandTotal: item.Line_Grand_Total__c || 0
                        })));
                    }

                    // Map Shipping Manifest Lines
                    if (responseData.Shipping_Manifest_Line__c) {
                        setSmliData(responseData.Shipping_Manifest_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            manifestName: item.Shipping_Manifest_Name,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            customerQuoteLine: item.Customer_Order_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            boxCount: item.Box__c || 0,
                            boxNetWeight: item.Case_Net_Weight__c || 0,
                            boxGrossWeight: item.Case_Gross_Weight__c || 0,
                            unitPrice: item.Unit_Price__c || 0,
                            totalOrderQty: item.Total_Order_Qty__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            qtyShipped: item.Qty_Shipped__c || 0,
                            trackingNumber: item.Tracking_Number__c,
                            estimatedDeliveryDate: item.Estimated_Delivery_Date__c,
                            trackingStatus: item.Tracking_Status__c,
                            actualDeliveryDate: item.Actual_Delivery_Date__c
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching orchestration data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchFulfillmentData();
    }, [lineId, accountId, contactId]);

    const activeData = useMemo(() => {
        if (activeSubTab === "Orders") return soliData;
        if (activeSubTab === "Invoices") return inliData;
        return smliData;
    }, [activeSubTab, soliData, inliData, smliData]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData);
    const { widths, handleResize } = useResizableColumns({
        lineName: 180,
        status: 120,
        quoteNumber: 150,
        salesOrderName: 150,
        salesOrderLine: 180,
        customerQuoteLine: 180,
        purchaseOrderLine: 180,
        invoiceName: 150,
        manifestName: 150,
        productName: 150,
        description: 200,
        manufacturerDBA: 150,
        boxCount: 100,
        boxNetWeight: 120,
        boxGrossWeight: 120,
        unitPrice: 120,
        totalOrderQty: 120,
        totalPrice: 120,
        shipping: 100,
        taxes: 100,
        grandTotal: 120,
        qtyPicked: 120,
        backOrderQty: 120,
        qtyShipped: 120,
        invoiceQty: 120,
        trackingNumber: 150,
        estimatedDeliveryDate: 150,
        trackingStatus: 120,
        actualDeliveryDate: 150
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
                    { key: "Orders", label: "Sales Orders", count: soliData.length },
                    { key: "Invoices", label: "Invoices", count: inliData.length },
                    { key: "Manifests", label: "Shipping Manifests", count: smliData.length }
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
            <div className="bg-white dark:bg-gray-800  border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm ">
                        <thead className="bg-primary-light dark:bg-gray-900 ">
                            <tr>


                                {activeSubTab === "Orders" && (
                                    <>
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderName} onResize={handleResize} />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                        <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                        <SortableHeader label="Qty Picked" field="qtyPicked" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyPicked} onResize={handleResize} />
                                        <SortableHeader label="Back Order Qty" field="backOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.backOrderQty} onResize={handleResize} />
                                    </>
                                )}

                                {activeSubTab === "Invoices" && (
                                    <>
                                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceName} onResize={handleResize} />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                        <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Invoice Qty" field="invoiceQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceQty} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                        <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                    </>
                                )}

                                {activeSubTab === "Manifests" && (
                                    <>
                                        <SortableHeader label="Shipping Manifest" field="manifestName" sortConfig={sortConfig} requestSort={requestSort} width={widths.manifestName} onResize={handleResize} />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                        <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxCount} onResize={handleResize} />
                                        <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxNetWeight} onResize={handleResize} />
                                        <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxGrossWeight} onResize={handleResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-gray-500 dark:text-gray-400 italic">No records found.</td>
                                </tr>
                            ) : (
                                sortedData.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        {activeSubTab === "Orders" && (
                                            <>
                                                <td className="px-4 py-3 text-sm text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.salesOrderName}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.customerQuoteLine}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white min-w-[180px] line-clamp-1" title={item.description}>{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[160px]">{item.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[145px]">{item.totalOrderQty}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.totalPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.taxes)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.shipping)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[155px]">{formatCurrency(item.grandTotal)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.qtyPicked}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[155px]">{item.backOrderQty}</td>
                                            </>
                                        )}
                                        {activeSubTab === "Invoices" && (
                                            <>
                                                <td className="px-4 py-3 text-sm text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.invoiceName}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.salesOrderLine}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.customerQuoteLine}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.purchaseOrderLine}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white min-w-[180px] line-clamp-1" title={item.description}>{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[160px]">{item.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.invoiceQty}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.totalPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.taxes)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.shipping)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[155px]">{formatCurrency(item.grandTotal)}</td>
                                            </>
                                        )}
                                        {activeSubTab === "Manifests" && (
                                            <>
                                                <td className="px-4 py-3 text-sm text-blue-500 hover:underline cursor-pointer whitespace-nowrap min-w-[165px]">{item.manifestName}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.salesOrderLine}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.customerQuoteLine}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-[200px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.boxCount}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.boxNetWeight}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.boxGrossWeight}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[145px]">{item.totalOrderQty}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.totalPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.trackingNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[205px]">{formatDate(item.estimatedDeliveryDate, 'numeric-dash')}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[165px]">{item.trackingStatus}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap min-w-[175px]">{formatDate(item.actualDeliveryDate, 'numeric-dash')}</td>
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
