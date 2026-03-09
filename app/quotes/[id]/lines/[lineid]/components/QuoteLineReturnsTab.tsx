import { useEffect, useMemo, useState } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

interface DebitMemoLine {
    id: string;
    lineName: string;
    status: string;
    debitMemoName: string;
    purchaseOrderLine: string;
    customerQuoteLine: string;
    supplierBillLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    debitQty: number;
    unitCost: number;
    totalCost: number;
    shipping: number;
    grandTotal: number;
}

interface RTVLine {
    id: string;
    lineName: string;
    status: string;
    rtvName: string;
    purchaseOrderLine: string;
    customerQuoteLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    returnQty: number;
    unitCost: number;
    totalCost: number;
    reasonCode: string;
}

interface CreditMemoLine {
    id: string;
    lineName: string;
    status: string;
    creditMemoName: string;
    salesOrderLine: string;
    customerQuoteLine: string;
    invoiceLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    creditQty: number;
    unitPrice: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
}

interface RMALine {
    id: string;
    lineName: string;
    status: string;
    rmaName: string;
    salesOrderLine: string;
    customerQuoteLine: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    returnQty: number;
    unitPrice: number;
    totalPrice: number;
    reasonCode: string;
    openBalanceQty: number;
    trackingNumber: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate: string;
    trackingStatus: string;
    receiptDate: string;
}

interface QuoteLineReturnsTabProps {
    lineId: string;
    loading: boolean;
    accountId?: string;
    contactId?: string;
}

export default function QuoteLineReturnsTab({
    lineId,
    loading: initialLoading,
    accountId,
    contactId
}: QuoteLineReturnsTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"DebitMemos" | "RTVs" | "CreditMemos" | "RMAs">("DebitMemos");
    const [loading, setLoading] = useState(initialLoading);
    const [dmliData, setDmliData] = useState<DebitMemoLine[]>([]);
    const [rtvlData, setRtvlData] = useState<RTVLine[]>([]);
    const [cmliData, setCmliData] = useState<CreditMemoLine[]>([]);
    const [rmalData, setRmalData] = useState<RMALine[]>([]);

    useEffect(() => {
        async function fetchReturnsData() {
            if (!accountId || !contactId || !lineId) return;

            try {
                setLoading(true);
                const res = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&quoteId=${encodeURIComponent(lineId)}&action=returns&objectName=Customer_Quote_Line__c`);

                if (!res.ok) throw new Error("Failed to fetch returns data");

                const responseData = await res.json();
                console.log("Returns API Response:", responseData);

                if (responseData) {
                    // Map Debit Memo Lines
                    if (responseData.Debit_Memo_Line__c) {
                        setDmliData(responseData.Debit_Memo_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            debitMemoName: item.Debit_Memo_Name,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            supplierBillLine: item.Supplier_Bill_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            debitQty: item.Debit_Qty__c || 0,
                            unitCost: item.Unit_Cost__c || 0,
                            totalCost: item.Total_Cost__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            grandTotal: item.Line_Grand_Total__c || 0
                        })));
                    }

                    // Map RTV Lines
                    if (responseData.RTV_Line__c) {
                        setRtvlData(responseData.RTV_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            rtvName: item.RTV_Name,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            returnQty: item.Return_Qty__c || 0,
                            unitCost: item.Unit_Cost__c || 0,
                            totalCost: item.Total_Cost__c || 0,
                            reasonCode: item.Reason_Code__c
                        })));
                    }

                    // Map Credit Memo Lines
                    if (responseData.Credit_Memo_Line__c) {
                        setCmliData(responseData.Credit_Memo_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            creditMemoName: item.Credit_Memo_Name,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            invoiceLine: item.Invoice_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            creditQty: item.Credit_Qty__c || 0,
                            unitPrice: item.Unit_Price__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            taxes: item.Total_Taxes_Amount__c || 0,
                            grandTotal: item.Line_Grand_Total__c || 0
                        })));
                    }

                    // Map RMA Lines
                    if (responseData.RMA_Line__c) {
                        setRmalData(responseData.RMA_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            rmaName: item.RMA_Name,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            returnQty: item.Return_Qty__c || 0,
                            unitPrice: item.Unit_Price__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            reasonCode: item.Reason_Code__c,
                            openBalanceQty: item.Open_Balance_Qty__c || 0,
                            trackingNumber: item.Tracking_Number__c,
                            estimatedDeliveryDate: item.Estimated_Delivery_Date__c,
                            actualDeliveryDate: item.Actual_Delivery_Date__c,
                            trackingStatus: item.Tracking_Status__c,
                            receiptDate: item.Goods_Receipt_Date__c
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching returns data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchReturnsData();
    }, [lineId, accountId, contactId]);

    const activeData = useMemo(() => {
        if (activeSubTab === "DebitMemos") return dmliData;
        if (activeSubTab === "RTVs") return rtvlData;
        if (activeSubTab === "CreditMemos") return cmliData;
        return rmalData;
    }, [activeSubTab, dmliData, rtvlData, cmliData, rmalData]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData);
    const { widths, handleResize } = useResizableColumns({
        lineName: 180,
        status: 120,
        debitMemoName: 150,
        rtvName: 150,
        creditMemoName: 150,
        rmaName: 150,
        purchaseOrderLine: 180,
        salesOrderLine: 180,
        customerQuoteLine: 180,
        supplierBillLine: 180,
        invoiceLine: 180,
        productName: 150,
        description: 200,
        manufacturerDBA: 150,
        debitQty: 100,
        returnQty: 100,
        creditQty: 100,
        unitCost: 120,
        unitPrice: 120,
        totalCost: 120,
        totalPrice: 120,
        shipping: 100,
        taxes: 100,
        grandTotal: 120,
        reasonCode: 150,
        openBalanceQty: 120,
        trackingNumber: 150,
        estimatedDeliveryDate: 150,
        actualDeliveryDate: 150,
        trackingStatus: 120,
        receiptDate: 150
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
                    { key: "RMAs", label: "RMAs", count: rmalData.length },
                    { key: "CreditMemos", label: "Credit Memos", count: cmliData.length },
                    { key: "RTVs", label: "RTVs", count: rtvlData.length },
                    { key: "DebitMemos", label: "Debit Memos", count: dmliData.length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSubTab(tab.key as any)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSubTab === tab.key
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800">
                <div className="overflow-x-auto">
                    {sortedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium">No records found</p>
                            <p className="text-sm">There are no {
                                activeSubTab === "RMAs" ? "RMAs" :
                                    activeSubTab === "CreditMemos" ? "credit memos" :
                                        activeSubTab === "RTVs" ? "RTVs" : "debit memos"
                            } associated with this quote line.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader
                                        label={
                                            activeSubTab === "DebitMemos" ? "Debit Memo Line" :
                                                activeSubTab === "RTVs" ? "RTV Line" :
                                                    activeSubTab === "CreditMemos" ? "Credit Memo Line" : "RMA Line"
                                        }
                                        field="lineName"
                                        sortConfig={sortConfig}
                                        requestSort={requestSort}
                                        width={widths.lineName}
                                        onResize={handleResize}
                                        className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                    />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />

                                    {activeSubTab === "RMAs" && (
                                        <>
                                            <SortableHeader label="RMA" field="rmaName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaName} onResize={handleResize} />
                                            <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                            <SortableHeader label="Reason Code" field="reasonCode" sortConfig={sortConfig} requestSort={requestSort} width={widths.reasonCode} onResize={handleResize} />
                                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                            <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnQty} onResize={handleResize} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                            <SortableHeader label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalanceQty} onResize={handleResize} />
                                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                                            <SortableHeader label="Goods Receipt Date" field="receiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receiptDate} onResize={handleResize} />
                                        </>
                                    )}
                                    {activeSubTab === "CreditMemos" && (
                                        <>
                                            <SortableHeader label="Credit Memo" field="creditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditMemoName} onResize={handleResize} />
                                            <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                            <SortableHeader label="Invoice Line" field="invoiceLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceLine} onResize={handleResize} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                            <SortableHeader label="Credit Qty" field="creditQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditQty} onResize={handleResize} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                                            <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                        </>
                                    )}

                                    {activeSubTab === "RTVs" && (
                                        <>
                                            <SortableHeader label="RTV" field="rtvName" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvName} onResize={handleResize} />
                                            <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                            <SortableHeader label="Reason Code" field="reasonCode" sortConfig={sortConfig} requestSort={requestSort} width={widths.reasonCode} onResize={handleResize} />
                                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                            <SortableHeader label="Return Qty" field="returnQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnQty} onResize={handleResize} />
                                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                                        </>
                                    )}

                                    {activeSubTab === "DebitMemos" && (
                                        <>
                                            <SortableHeader label="Debit Memo" field="debitMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.debitMemoName} onResize={handleResize} />
                                            <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                                            <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                            <SortableHeader label="Supplier Bill Line" field="supplierBillLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierBillLine} onResize={handleResize} />
                                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                            <SortableHeader label="Debit Qty" field="debitQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.debitQty} onResize={handleResize} />
                                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                            <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800">
                                {sortedData.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate sticky left-0 bg-white dark:bg-gray-800">{item.lineName}</td>
                                        <td className="px-3 py-2 text-sm">
                                            <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {item.status}
                                            </span>
                                        </td>

                                        {activeSubTab === "DebitMemos" && (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.debitMemoName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.purchaseOrderLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.customerQuoteLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.supplierBillLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[160px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[165px]">{item.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.unitCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.debitQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">{formatCurrency(item.totalCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.shipping)}</td>
                                                <td className="px-3 py-2 text-sm text-primary font-bold truncate min-w-[185px]">{formatCurrency(item.grandTotal)}</td>
                                            </>
                                        )}

                                        {activeSubTab === "RTVs" && (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.rtvName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.purchaseOrderLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.customerQuoteLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[180px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[165px]">{item.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.reasonCode}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.unitCost)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[165px]">{item.returnQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(item.totalCost)}</td>
                                            </>
                                        )}

                                        {activeSubTab === "CreditMemos" && (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.creditMemoName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.salesOrderLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.customerQuoteLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.invoiceLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[180px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[165px]">{item.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[165px]">{item.creditQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(item.totalPrice)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.shipping)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.taxes)}</td>
                                                <td className="px-3 py-2 text-sm text-primary font-bold truncate min-w-[165px]">{formatCurrency(item.grandTotal)}</td>
                                            </>
                                        )}

                                        {activeSubTab === "RMAs" && (
                                            <>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.rmaName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.salesOrderLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.customerQuoteLine}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.productName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[180px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[170px]">{item.manufacturerDBA}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.reasonCode}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[115px]">{item.returnQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">{formatCurrency(item.totalPrice)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[190px]">{item.openBalanceQty}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[170px]">{item.trackingNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[211px]">{formatDate(item.estimatedDeliveryDate, 'numeric-dash')}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[145px]">{item.trackingStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[211px]">{formatDate(item.actualDeliveryDate, 'numeric-dash')}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate min-w-[211px]">{formatDate(item.receiptDate, 'numeric-dash')}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
