import { useEffect, useMemo, useState } from "react";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteLineSalesOrderLinesSubTab from "./QuoteLineSalesOrderLinesSubTab";
import QuoteLineInvoiceLinesSubTab from "./QuoteLineInvoiceLinesSubTab";
import QuoteLineShippingManifestLinesSubTab from "./QuoteLineShippingManifestLinesSubTab";
import SubTabs from "@/components/ui/SubTabs";

interface SOLI {
    id: string;
    lineName: string;
    status: string;
    salesOrderName: string;
    salesOrderId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    proposedProductName?: string;
    proposedProductId?: string;
    proposalId?: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
    qtyShipped: number;
}

interface SMLI {
    id: string;
    lineName: string;
    status: string;
    manifestName: string;
    manifestId: string;
    salesOrderLine: string;
    salesOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    proposedProductName?: string;
    proposedProductId?: string;
    proposalId?: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    boxCount: number;
    boxLength?: number;
    boxWidth?: number;
    boxHeight?: number;
    boxNetWeight: number;
    boxGrossWeight: number;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
}

interface INLI {
    id: string;
    lineName: string;
    status: string;
    invoiceName: string;
    invoiceId: string;
    salesOrderLine: string;
    salesOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    proposedProductName?: string;
    proposedProductId?: string;
    proposalId?: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
}

interface QuoteLineFulfillmentTabProps {
    lineId: string;
    quoteId: string;
    loading: boolean;
    accountId?: string;
    contactId?: string;
    currentProduct?: any;
}

export default function QuoteLineFulfillmentsTab({
    lineId,
    quoteId,
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

                if (responseData) {
                    // Map Sales Order Lines
                    if (responseData.Sales_Order_Line__c) {
                        setSoliData(responseData.Sales_Order_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            salesOrderName: item.Sales_Order_Name,
                            salesOrderId: item.Sales_Order__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            proposedProductName: item.Proposed_Product_Name || '',
                            proposedProductId: item.Proposed_Product__c || '',
                            proposalId: item.Proposal__c || "",
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '',
                            unitPrice: item.Unit_Price__c || 0,
                            totalOrderQty: item.Total_Order_Qty__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            taxes: item.Total_Taxes_Amount__c || 0,
                            grandTotal: item.Line_Grand_Total__c || 0,
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
                            invoiceId: item.Invoice__c,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            salesOrderLineId: item.Sales_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            proposedProductName: item.Proposed_Product_Name || '',
                            proposedProductId: item.Proposed_Product__c || '',
                            proposalId: item.Proposal__c || "",
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            purchaseOrderLineId: item.Purchase_Order_Line__c,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '',
                            unitPrice: item.Unit_Price__c || 0,
                            totalOrderQty: item.Total_Order_Qty__c || 0,
                            totalPrice: item.Invoiced_Amount__c ?? item.Total_Price__c ?? 0,
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
                            manifestId: item.Shipping_Manifest__c,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            salesOrderLineId: item.Sales_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            proposedProductName: item.Proposed_Product_Name || '',
                            proposedProductId: item.Proposed_Product__c || '',
                            proposalId: item.Proposal__c || "",
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '',
                            boxCount: item.Box__c || 0,
                            boxLength: item.Case_Length__c || 0,
                            boxWidth: item.Case_Width__c || 0,
                            boxHeight: item.Case_Height__c || 0,
                            boxNetWeight: item.Case_Net_Weight__c || 0,
                            boxGrossWeight: item.Case_Gross_Weight__c || 0,
                            unitPrice: item.Unit_Price__c || 0,
                            totalOrderQty: item.Total_Order_Qty__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            qtyShipped: item.Qty_Shipped__c || 0
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

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData, { key: 'lineName', direction: 'asc' });
    const { widths, handleResize } = useResizableColumns({
        lineName: 180,
        status: 120,
        quoteNumber: 150,
        salesOrderName: 150,
        salesOrderLine: 180,
        customerQuoteLine: 180,
        proposedProductName: 180,
        purchaseOrderLine: 180,
        invoiceName: 150,
        manifestName: 150,
        productName: 150,
        description: 200,
        manufacturerDBA: 150,
        boxCount: 100,
        boxLength: 120,
        boxWidth: 120,
        boxHeight: 120,
        boxNetWeight: 120,
        boxGrossWeight: 120,
        unitPrice: 120,
        totalOrderQty: 120,
        totalPrice: 120,
        shipping: 100,
        taxes: 100,
        grandTotal: 120,
        qtyShipped: 120
    });

    if (loading && activeData.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Sub Tabs */}
            <SubTabs
                tabs={[
                    { key: "Orders", label: "Sales Orders Lines", count: soliData.length },
                    { key: "Manifests", label: "Shipping Manifests Lines", count: smliData.length },
                    { key: "Invoices", label: "Invoices Lines", count: inliData.length },
                ]}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as any)}
            />

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800">
                {activeSubTab === "Orders" && (
                    <QuoteLineSalesOrderLinesSubTab
                        data={soliData}
                        quoteId={quoteId}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
                {activeSubTab === "Invoices" && (
                    <QuoteLineInvoiceLinesSubTab
                        data={inliData}
                        quoteId={quoteId}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
                {activeSubTab === "Manifests" && (
                    <QuoteLineShippingManifestLinesSubTab
                        data={smliData}
                        quoteId={quoteId}
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
