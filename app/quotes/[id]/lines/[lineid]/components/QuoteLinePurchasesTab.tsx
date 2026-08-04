import { useEffect, useMemo, useState } from "react";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteLinePurchaseOrderLinesSubTab from "./QuoteLinePurchaseOrderLinesSubTab";
import QuoteLineSupplierBillLinesSubTab from "./QuoteLineSupplierBillLinesSubTab";
import SubTabs from "@/components/ui/SubTabs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface POLI {
    id: string;
    name: string;
    status: string;
    purchaseOrder: string;
    purchaseOrderId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
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
    supplierBillId: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
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

                if (responseData) {
                    // Map Purchase Order Lines
                    if (responseData.Purchase_Order_Line__c) {
                        setPoliData(responseData.Purchase_Order_Line__c.map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c,
                            purchaseOrder: item.Purchase_Order_Name,
                            purchaseOrderId: item.Purchase_Order__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '-',
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
                            supplierBillId: item.Supplier_Bill__c,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            purchaseOrderLineId: item.Purchase_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '-',
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

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData, { key: 'name', direction: 'desc' });
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

    if (loading && activeData.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full py-4 min-w-0">
            {/* Sub Tabs */}
            <SubTabs
                tabs={[
                    { key: "Orders", label: "Purchase Order Lines", count: poliData.length },
                    { key: "Bills", label: "Supplier Bill Lines", count: sbliData.length },
                ]}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as any)}
            />

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800">
                {activeSubTab === "Orders" && (
                    <QuoteLinePurchaseOrderLinesSubTab
                        data={poliData}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
                {activeSubTab === "Bills" && (
                    <QuoteLineSupplierBillLinesSubTab
                        data={sbliData}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
            </div>
        </div>
    );
}
