import { useEffect, useMemo, useState } from "react";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteLineRMALinesSubTab from "./QuoteLineRMALinesSubTab";
import QuoteLineCreditMemoLinesSubTab from "./QuoteLineCreditMemoLinesSubTab";
import QuoteLineRTVLinesSubTab from "./QuoteLineRTVLinesSubTab";
import QuoteLineDebitMemoLinesSubTab from "./QuoteLineDebitMemoLinesSubTab";
import SubTabs from "@/components/ui/SubTabs";

interface DebitMemoLine {
    id: string;
    lineName: string;
    status: string;
    debitMemoName: string;
    debitMemoId: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    supplierBillLine: string;
    supplierBillLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
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
    rtvId: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
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
    creditMemoId: string;
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
    rmaId: string;
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
    returnQty: number;
    unitPrice: number;
    totalPrice: number;
    reasonCode: string;
    openBalanceQty: number;
    receiptDate: string;
}

interface QuoteLineReturnsTabProps {
    lineId: string;
    quoteId: string;
    loading: boolean;
    accountId?: string;
    contactId?: string;
    accountType?: string;
}

export default function QuoteLineReturnsTab({
    lineId,
    quoteId,
    loading: initialLoading,
    accountId,
    contactId,
    accountType
}: QuoteLineReturnsTabProps) {
    const isCustomerOrNSO = accountType?.toLowerCase() === 'customer' || accountType?.toLowerCase() === 'nso';
    const [activeSubTab, setActiveSubTab] = useState<"DebitMemos" | "RTVs" | "CreditMemos" | "RMAs">("RMAs");
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

                if (responseData) {
                    // Map Debit Memo Lines
                    if (responseData.Debit_Memo_Line__c) {
                        setDmliData(responseData.Debit_Memo_Line__c.map((item: any) => ({
                            id: item.Id,
                            lineName: item.Name,
                            status: item.Status__c,
                            debitMemoName: item.Debit_Memo_Name,
                            debitMemoId: item.Debit_Memo__c,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            purchaseOrderLineId: item.Purchase_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            supplierBillLine: item.Supplier_Bill_Line_Name,
                            supplierBillLineId: item.Supplier_Bill_Line__c,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '-',
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
                            rtvId: item.RTV__c,
                            purchaseOrderLine: item.Purchase_Order_Line_Name,
                            purchaseOrderLineId: item.Purchase_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || "-",
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
                            creditMemoId: item.Credit_Memo__c,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            salesOrderLineId: item.Sales_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            proposedProductName: item.Proposed_Product_Name || '-',
                            proposedProductId: item.Proposed_Product__c || '-',
                            proposalId: item.Proposal__c || "-",
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '-',
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
                            rmaId: item.RMA__c,
                            salesOrderLine: item.Sales_Order_Line_Name,
                            salesOrderLineId: item.Sales_Order_Line__c,
                            customerQuoteLine: item.Customer_Quote_Line_Name,
                            customerQuoteLineId: item.Customer_Quote_Line__c,
                            proposedProductName: item.Proposed_Product_Name || '-',
                            proposedProductId: item.Proposed_Product__c || '-',
                            proposalId: item.Proposal__c || "-",
                            productName: item.Product_Name,
                            description: item.Product_Description__c,
                            manufacturerDBA: item.Manufacturer_DBA__c,
                            brand: item.Product_Brand_Name__c || '-',
                            returnQty: item.Return_Qty__c || 0,
                            unitPrice: item.Unit_Price__c || 0,
                            totalPrice: item.Total_Price__c || 0,
                            reasonCode: item.Reason_Code__c,
                            openBalanceQty: item.Open_Balance_Qty__c || 0,
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

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData, { key: 'lineName', direction: 'asc' });
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
        proposedProductName: 180,
        supplierBillLine: 180,
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
        grandTotal: 150,
        reasonCode: 150,
        openBalanceQty: 150,
        receiptDate: 150
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
                tabs={(([
                    { key: "RMAs", label: "RMAs Lines", count: rmalData.length },
                    { key: "CreditMemos", label: "Credit Memos Lines", count: cmliData.length },
                    { key: "RTVs", label: "RTVs Lines", count: rtvlData.length },
                    { key: "DebitMemos", label: "Debit Memos Lines", count: dmliData.length },
                ] as { key: "DebitMemos" | "RTVs" | "CreditMemos" | "RMAs"; label: string; count: number }[]).filter(tab => {
                    if (isCustomerOrNSO && (tab.key === 'RTVs' || tab.key === 'DebitMemos')) return false;
                    return true;
                }))}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as any)}
            />

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800">
                {activeSubTab === "RMAs" && (
                    <QuoteLineRMALinesSubTab
                        data={rmalData}
                        quoteId={quoteId}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
                {activeSubTab === "CreditMemos" && (
                    <QuoteLineCreditMemoLinesSubTab
                        data={cmliData}
                        quoteId={quoteId}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
                {activeSubTab === "RTVs" && (
                    <QuoteLineRTVLinesSubTab
                        data={rtvlData}
                        loading={loading}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        widths={widths}
                        handleResize={handleResize}
                    />
                )}
                {activeSubTab === "DebitMemos" && (
                    <QuoteLineDebitMemoLinesSubTab
                        data={dmliData}
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
