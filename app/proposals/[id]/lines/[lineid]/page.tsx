"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import LineFulfillmentsTab from "./components/LineFulfillmentsTab";
import LinePurchasesTab from "./components/LinePurchasesTab";
import LineReturnsTab from "./components/LineReturnsTab";

import LineTaxesTab from "./components/LineTaxesTab";
import { FulfillmentTabType, FulfillmentData, ReturnsData, SalesOrder, CustomerQuote, PurchaseOrderLine, SupplierBillLine, PurchasesData, TaxDetail } from "../../types";

// Interface for proposal product item from Salesforce (matching what we saw in proposal list logic)
interface ProposalProductItem {
    Id: string;
    Product_Name: string;
    Name?: string; // Sku
    Product_Description__c?: string;
    Manufacturer_Name__c?: string;
    Product_Family__c?: string;
    Total_Order_Qty__c: number;
    Unit_Price__c: number;
    Line_Grand_Total__c: number;
    MOQ__c?: number;
    Product_Grouping__c?: string;
    Groupings__c?: string;
    Proposed_Product_Notes__c?: string;
    Site__c?: string;
    Inventory_Account__c?: string;
    Is_Taxable__c?: boolean;
    Available_To_Sell__c?: number;
    Qty_Shipped__c?: number;
    Unit_Cost__c?: number;
    Total_Cost__c?: number;
    Manufacturer_DBA__c?: string;
    // Tax Fields
    Total_VAT_Amount__c?: number;
    VAT_Rate__c?: number;
    GST_Amount__c?: number;
    GST_Rate__c?: number;
    Gross_Receipts_Tax_Amount__c?: number;
    Gross_Receipts_Tax_Rate__c?: number;
    Excise_Tax_Amount__c?: number;
    Excise_Tax_Rate__c?: number;
    Local_Tax_Amount__c?: number;
    Local_Tax_Rate__c?: number;
    Use_Tax_Amount__c?: number;
    Use_Tax_Rate__c?: number;
    Sales_Tax_Amount__c?: number;
    Sales_Tax_Rate__c?: number;
    Site_Name?: string;
    Inventory_Account_Name?: string;
}

// Interface for mapped product data
interface ProductData {
    id: string;
    orderLineId: string; // Salesforce line ID for navigation
    name: string;
    sku: string;
    description: string;
    productFamily: string;
    ProductNotes: string,
    manufacturer: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    productGrouping: string;
    grouping: string;
    site: string;
    inventoryAccount: string;
    isTaxable: string;
    availableToSell: number;
    qtyShipped: number;
    unitCost: string;
    totalCost: string;
    moq: number;
    taxDetail: TaxDetail;
}

export default function ProposalProductDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    // State for proposal data
    const [loading, setLoading] = useState(true);
    const [proposalProducts, setProposalProducts] = useState<ProductData[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    // Salesforce credentials
    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? ""; // override with real value
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "" //TODO: Get this from session / auth context


    // Fetch proposal data from Salesforce
    useEffect(() => {
        async function fetchProposalData() {
            try {
                setLoading(true);
                // Using the existing API endpoint logic for products
                // Note: This action=products corresponds to tabName=Products which includes tax fields
                const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(id)}&action=products`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch proposal products: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                console.log("Fetched proposal products for details:", data);

                if (data && data.length > 0) {
                    const products = data;

                    // Map Proposal Products
                    const mappedProducts: ProductData[] = products.map((item: ProposalProductItem) => ({
                        id: item.Id,
                        orderLineId: item.Id,
                        name: item.Product_Name || "Unknown Product",
                        sku: item.Name || "", // Assuming Name is SKU based on list page logic
                        description: item.Product_Description__c || "",
                        productFamily: item.Product_Family__c || "General",
                        manufacturer: item.Manufacturer_Name__c || "Unknown",
                        quantity: item.Total_Order_Qty__c || 0,
                        unitPrice: item.Unit_Price__c || 0,
                        subtotal: item.Line_Grand_Total__c || 0,
                        productGrouping: item.Product_Grouping__c || "-",
                        grouping: item.Groupings__c || "-",
                        ProductNotes: item.Proposed_Product_Notes__c,
                        site: item.Site_Name || "-",
                        inventoryAccount: item.Inventory_Account_Name || "-",
                        isTaxable: item.Is_Taxable__c === true ? "Yes" : "No",
                        availableToSell: item.Available_To_Sell__c || 0,
                        qtyShipped: item.Qty_Shipped__c || 0,
                        unitCost: item.Unit_Cost__c != null ? `$${item.Unit_Cost__c.toFixed(2)}` : "Hide",
                        totalCost: item.Total_Cost__c != null ? `$${item.Total_Cost__c.toFixed(2)}` : "Hide",
                        moq: item.MOQ__c || 1,

                        taxDetail: {
                            id: item.Id,
                            salesTaxRate: item.Sales_Tax_Rate__c || 0,
                            salesTaxAmount: item.Sales_Tax_Amount__c || 0,
                            useTaxRate: item.Use_Tax_Rate__c || 0,
                            useTaxAmount: item.Use_Tax_Amount__c || 0,
                            localTaxRate: item.Local_Tax_Rate__c || 0,
                            localTaxAmount: item.Local_Tax_Amount__c || 0,
                            exciseTaxRate: item.Excise_Tax_Rate__c || 0,
                            exciseTaxAmount: item.Excise_Tax_Amount__c || 0,
                            grossReceiptsTaxRate: item.Gross_Receipts_Tax_Rate__c || 0,
                            grossReceiptsTaxAmount: item.Gross_Receipts_Tax_Amount__c || 0,
                            gstRate: item.GST_Rate__c || 0,
                            gstAmount: item.GST_Amount__c || 0,
                            vatRate: item.VAT_Rate__c || 0,
                            vatAmount: item.Total_VAT_Amount__c || 0,
                        }
                    }));

                    setProposalProducts(mappedProducts);

                    // Find the index of the current line by matching lineid
                    const lineIndex = mappedProducts.findIndex((product) => {
                        return product.id === lineid;
                    });

                    // If found, set the current index; otherwise default to first line
                    if (lineIndex >= 0) {
                        setCurrentLineIndex(lineIndex);
                    } else {
                        setCurrentLineIndex(0);
                    }
                }
            } catch (error) {
                console.error("Error fetching proposal product data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchProposalData();
        }
    }, [id, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Get current product
    const product = proposalProducts[currentLineIndex];
    const totalLines = proposalProducts.length;
    const lineNumber = currentLineIndex + 1;

    // Navigation helpers
    const hasPrevLine = currentLineIndex > 0;
    const hasNextLine = currentLineIndex < totalLines - 1;
    const prevLineId = hasPrevLine ? proposalProducts[currentLineIndex - 1]?.id : "";
    const nextLineId = hasNextLine ? proposalProducts[currentLineIndex + 1]?.id : "";

    // Mock multiple images for carousel
    const productImages = [
        { id: 1, label: "Image 1" },
        { id: 2, label: "Image 2" },
        { id: 3, label: "Image 3" },
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Totals & Mock Fields
    const quantity = product?.quantity || 0;
    const unitPrice = product?.unitPrice || 0;
    const subtotal = product?.subtotal || (quantity * unitPrice);
    const shippingCharges = 0;
    const taxes = 0;
    const grandTotal = subtotal + shippingCharges + taxes;

    // Tabs State
    const [activeTab, setActiveTab] = useState<"fulfillment" | "purchases" | "returns" | "taxes">("taxes");
    const [fulfillmentActiveTab, setFulfillmentActiveTab] = useState<FulfillmentTabType>("quotes");
    const [fulfillmentData, setFulfillmentData] = useState<FulfillmentData>({
        invoices: [],
        shippingManifests: [],
        salesOrders: [],
        customerQuotes: []
    });
    const [fulfillmentLoading, setFulfillmentLoading] = useState(false);

    const [purchasesData, setPurchasesData] = useState<PurchasesData>({
        purchaseOrders: [],
        supplierBills: []
    });
    const [purchasesLoading, setPurchasesLoading] = useState(false);

    const [returnsData, setReturnsData] = useState<ReturnsData>({
        rma: [],
        rtv: [],
        creditMemos: [],
        debitMemos: []
    });
    const [returnsLoading, setReturnsLoading] = useState(false);

    // Fetch Fulfillment Data
    useEffect(() => {
        async function fetchFulfillmentData() {
            if (activeTab === "fulfillment" && lineid) {
                try {
                    setFulfillmentLoading(true);
                    // Use the generic tab API via our proxy
                    // key params: proposalId -> objectId (lineid), action -> fulfillments, objectName -> Proposed_Product__c
                    const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(lineid)}&action=fulfillments&objectName=Proposed_Product__c`);

                    if (!res.ok) {
                        throw new Error(`Failed to fetch fulfillments: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log("Fetched line fulfillments:", data);

                    if (data) {
                        // Map the API response to our FulfillmentData structure
                        // The API returns distinct arrays for each type, map them accordingly.
                        // Based on potential API structure (deduced from previous patterns):
                        // data.Invoice_Line__c -> invoices
                        // data.Shipping_Manifest_Line__c -> shippingManifests
                        // data.Sales_Order_Line__c -> salesOrders
                        // data.Customer_Quote_Line__c -> customerQuotes

                        // NOTE: The user provided example output shows:
                        // { "data": [ { "Invoice_Line__c": [...], ... } ] }
                        // But our route proxy returns `getGenericTabDataFromSalesforce`, which returns `result.data[0]` for 'Fulfillments'.
                        // So `data` here should be that inner object { Invoice_Line__c: [], ... }

                        const mappedData: FulfillmentData = {
                            invoices: (data.Invoice_Line__c || []).map((inv: any) => ({
                                id: inv.Id,
                                name: inv.Name,
                                status: inv.Status__c || "Draft",
                                invoiceName: inv.Invoice_Name || inv.Invoice__c || "",
                                salesOrderLineName: inv.Sales_Order_Line_Name || inv.Sales_Order_Line__c || "",
                                customerQuoteLineName: inv.Customer_Quote_Line_Name || inv.Customer_Order_Line__c || "", // API likely Customer_Order_Line__c based on screenshot
                                purchaseOrderLineName: inv.Purchase_Order_Line_Name || inv.Purchase_Order_Line__c || "",
                                productName: inv.Product_Name || "",
                                productDescription: inv.Product_Description__c || "",
                                manufacturerDBA: inv.Manufacturer_DBA__c || "",
                                unitPrice: inv.Unit_Price__c || 0,
                                invoiceQty: inv.Invoiced_Qty__c || 0,
                                totalPrice: inv.Invoiced_Amount__c || 0,
                                shipping: inv.Shipping_Charges__c || 0,
                                taxes: inv.Total_Taxes_Amount__c || 0,
                                lineGrandTotal: inv.Line_Grand_Total__c || 0,
                            })),
                            shippingManifests: (data.Shipping_Manifest_Line__c || []).map((sm: any) => ({
                                id: sm.Id,
                                name: sm.Name,
                                status: sm.Status__c || "Draft",
                                shippingManifestName: sm.Shipping_Manifest_Name || sm.Shipping_Manifest__c || "",
                                salesOrderLineName: sm.Sales_Order_Line_Name || sm.Sales_Order_Line__c || "",
                                customerQuoteLineName: sm.Customer_Quote_Line_Name || sm.Customer_Order_Line__c || "",
                                productName: sm.Product_Name || "",
                                productDescription: sm.Product_Description__c || "",
                                manufacturerDBA: sm.Manufacturer_DBA__c || "",
                                boxCount: sm.Box__c || 0,
                                boxNetWeight: sm.Case_Net_Weight__c || 0,
                                boxGrossWeight: sm.Case_Gross_Weight__c || 0,
                                unitPrice: sm.Unit_Price__c || 0,
                                totalOrderQty: sm.Total_Order_Qty__c || 0,
                                totalPrice: sm.Total_Price__c || 0,
                                qtyShipped: sm.Qty_Shipped__c || 0,
                                trackingNumber: sm.Tracking_Number__c || "",
                                estimatedDeliveryDate: sm.Estimated_Delivery_Date__c || "",
                                trackingStatus: sm.Tracking_Status__c || "",
                                actualDeliveryDate: sm.Actual_Delivery_Date__c || ""
                            })),
                            salesOrders: (data.Sales_Order_Line__c || []).map((so: any) => ({
                                id: so.Id,
                                name: so.Name,
                                status: so.Status__c || "Draft",
                                salesOrderName: so.Sales_Order_Name || so.Sales_Order__c || "",
                                customerQuoteLineName: so.Customer_Quote_Line_Name || so.Customer_Order_Line__c || "",
                                productName: so.Product_Name || "",
                                productDescription: so.Product_Description__c || "",
                                manufacturerDBA: so.Manufacturer_DBA__c || "",
                                unitPrice: so.Unit_Price__c || 0,
                                totalOrderQty: so.Total_Order_Qty__c || 0,
                                totalPrice: so.Total_Price__c || 0,
                                shipping: so.Shipping_Charges__c || 0,
                                taxes: so.Total_Taxes_Amount__c || 0,
                                lineGrandTotal: so.Line_Grand_Total__c || 0,
                                qtyPicked: so.Qty_Picked__c || 0,
                                backOrderQty: so.Back_Order_Qty__c || 0,
                                qtyShipped: so.Qty_Shipped__c || 0,
                            })),
                            customerQuotes: (data.Customer_Quote_Line__c || []).map((cq: any) => ({
                                id: cq.Id,
                                name: cq.Name,
                                status: cq.Status__c || "Draft",
                                customerQuoteName: cq.Customer_Quote_Name || cq.Customer_Quote__c || "",
                                productName: cq.Product_Name || "",
                                productDescription: cq.Product_Description__c || "",
                                manufacturerDBA: cq.Manufacturer_DBA__c || "",
                                unitPrice: cq.Unit_Price__c || 0,
                                totalOrderQty: cq.Total_Order_Qty__c || 0,
                                totalPrice: cq.Total_Price__c || 0,
                                shipping: cq.Shipping_Charges__c || 0,
                                taxes: cq.Total_Taxes_Amount__c || 0,
                                lineGrandTotal: cq.Line_Grand_Total__c || 0,
                                qtyShipped: cq.Qty_Shipped__c || 0,
                            }))
                        };
                        setFulfillmentData(mappedData);
                    }
                } catch (err) {
                    console.error("Error fetching line fulfillments:", err);
                } finally {
                    setFulfillmentLoading(false);
                }
            }
        }

        fetchFulfillmentData();
        fetchFulfillmentData();
    }, [activeTab, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Fetch Purchases Data
    useEffect(() => {
        async function fetchPurchasesData() {
            if (activeTab === "purchases" && lineid) {
                try {
                    setPurchasesLoading(true);
                    // Use the generic tab API via our proxy
                    const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(lineid)}&action=purchases&objectName=Proposed_Product__c`);

                    if (!res.ok) {
                        throw new Error(`Failed to fetch purchases: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log("Fetched line purchases:", data);

                    if (data) {
                        const mappedPurchases: PurchaseOrderLine[] = (data.Purchase_Order_Line__c || []).map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c || "Draft",
                            purchaseOrderName: item.Purchase_Order_Name || item.Purchase_Order__c || "",
                            customerQuoteLineName: item.Customer_Quote_Line_Name || item.Customer_Quote_Line__c || "",
                            productName: item.Product_Name || "",
                            productDescription: item.Product_Description__c || "",
                            manufacturerDBA: item.Manufacturer_DBA__c || "",
                            unitCost: item.Unit_Cost__c || 0,
                            totalOrderQty: item.Total_Order_Qty__c || 0,
                            totalCost: item.Total_Product_Cost__c || 0,
                            shipping: item.Shipping_Charges__c || 0,
                            lineTotalCost: item.Total_Cost__c || 0,
                            openBalanceQty: item.Open_Balance_Qty__c || 0,
                            trackingNumber: item.Tracking_Number__c || "",
                            estimatedDeliveryDate: item.Estimated_Delivery_Date__c || "",
                            trackingStatus: item.Tracking_Status__c || "",
                            actualDeliveryDate: item.Actual_Delivery_Date__c || "",
                            goodsReceiptDate: item.Goods_Receipt_Date__c || "",
                            invoiceStatus: item.Invoice_Status__c || ""
                        }));

                        const mappedSupplierBills: SupplierBillLine[] = (data.Supplier_Bill_Line__c || []).map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c || "Draft",
                            supplierBillName: item.Supplier_Bill_Name || "", // gtherp__Supplier_Bill__c
                            purchaseOrderLineName: item.Purchase_Order_Line_Name || "", // gtherp__Purchase_Order_Line__c
                            productName: item.Product_Name || "", // gtherp__Product_Name__c
                            productDescription: item.Product_Description__c || "", // gtherp__Product_Description__c
                            manufacturerDBA: item.Manufacturer_DBA__c || "Unknown", // gtherp__Manufacturer_DBA__c
                            unitCost: item.Unit_Cost__c || 0, // gtherp__Unit_Cost__c
                            billedQty: item.Billed_Qty__c || 0, // gtherp__Billed_Qty__c
                            billAmount: item.BillAmount__c || 0, // gtherp__BillAmount__c
                            shipping: item.Shipping_Charges__c || 0, // gtherp__Shipping_Charges__c
                            totalBillAmount: item.Total_Bill_Amount__c || 0, // gtherp__Total_Bill_Amount__c
                            billedDate: new Date(item.Billed_Date__c).toLocaleDateString() === 'Invalid Date' ? (item.Billed_Date__c || "") : new Date(item.Billed_Date__c).toLocaleDateString(), // gtherp__Billed_Date__c
                            remittanceStatus: item.Remittance_Status__c || "", // gtherp__Remittance_Status__c
                            holdStatus: item.Hold_Status__c || "", // gtherp__Hold_Status__c
                            goodsReceiptDate: item.Goods_Receipt_Date__c || "" // gtherp__Goods_Receipt_Date__c
                        }));

                        setPurchasesData({
                            purchaseOrders: mappedPurchases,
                            supplierBills: mappedSupplierBills
                        });
                    }
                } catch (err) {
                    console.error("Error fetching line purchases:", err);
                } finally {
                    setPurchasesLoading(false);
                }
            }
        }

        fetchPurchasesData();
    }, [activeTab, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Fetch Returns Data
    useEffect(() => {
        async function fetchReturnsData() {
            if (activeTab === "returns" && lineid) {
                try {
                    setReturnsLoading(true);
                    // Use the generic tab API via our proxy
                    const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(lineid)}&action=returns&objectName=Proposed_Product__c`);

                    if (!res.ok) {
                        throw new Error(`Failed to fetch returns: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log("Fetched line returns:", data);

                    if (data) {
                        // Map the API response to ReturnsData structure
                        const mappedData: ReturnsData = {
                            rma: (data.RMA_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // RMA Line Name
                                status: item.Status__c || "Draft",
                                rmaName: item.RMA_Name || "", // gtherp__RMA__c
                                salesOrderLineName: item.Sales_Order_Line_Name || "", // gtherp__Sales_Order_Line__c
                                customerQuoteLineName: item.Customer_Quote_Line_Name || item.Customer_Order_Line__c || "", // gtherp__Customer_Quote_Line__c
                                reason: item.Reason_Code__c || "", // gtherp__Reason_Code__c
                                productName: item.Product_Name || "", // gtherp__Product_Name__c
                                productDescription: item.Product_Description__c || "", // gtherp__Product_Description__c
                                manufacturerDBA: item.Manufacturer_DBA__c || "Unknown", // gtherp__Manufacturer_DBA__c
                                unitPrice: item.Unit_Price__c || 0, // gtherp__Unit_Price__c
                                returnQty: item.Return_Qty__c || 0, // gtherp__Return_Qty__c
                                totalAmount: item.Total_Price__c || 0, // gtherp__Total_Price__c
                                openBalanceQty: item.Open_Balance_Qty__c || 0, // gtherp__Open_Balance_Qty__c
                                trackingNumber: item.Tracking_Number__c || "", // gtherp__Tracking_Number__c
                                estimatedDeliveryDate: item.Estimated_Delivery_Date__c || "", // gtherp__Estimated_Delivery_Date__c
                                trackingStatus: item.Tracking_Status__c || "", // gtherp__Tracking_Status__c
                                actualDeliveryDate: item.Actual_Delivery_Date__c || "", // gtherp__Actual_Delivery_Date__c
                                goodsReceiptDate: item.Goods_Receipt_Date__c || "", // gtherp__Goods_Receipts_Date__c
                                type: "RMA",
                                requestDate: "",
                                description: item.Reason_Code__c || "",
                                shipFromAccountName: "N/A"
                            })),
                            rtv: (data.RTV_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // RTV Line Name
                                status: item.Status__c || "Draft",
                                rtvName: item.RTV_Name || "", // gtherp__RTV__c
                                purchaseOrderLineName: item.Purchase_Order_Line_Name || "", // gtherp__Purchase_Order_Line__c
                                customerQuoteLineName: item.Customer_Quote_Line_Name || item.Customer_Order_Line__c || "", // gtherp__Customer_Order_Line__c
                                reason: item.Reason_Code__c || "", // gtherp__Reason_Code__c
                                productName: item.Product_Name_Formula_Field__c || item.Product_Name__c || "", // gtherp__Product_Name__c (checking formula field first as fallback or vice versa, stick to Product_Name__c usually but check screenshots/data) -> Screenshot says gtherp__Product_Name__c
                                productDescription: item.Product_Description__c || "", // gtherp__Product_Description__c
                                manufacturerDBA: item.Manufacturer_DBA__c || "Unknown", // gtherp__Manufacturer_DBA__c
                                unitCost: item.Unit_Cost__c || 0, // gtherp__Unit_Cost__c
                                returnQty: item.Return_Qty__c || 0, // gtherp__Return_Qty__c
                                totalCost: item.Total_Cost__c || 0, // gtherp__Total_Cost__c
                                type: "RTV",
                                requestDate: "",
                                description: item.Product_Description__c || "",
                                supplierName: item.Manufacturer_DBA__c || "Unknown",
                                rtvType: "Return"
                            })),
                            creditMemos: (data.Credit_Memo_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // Credit Memo Line Name
                                status: item.Status__c || "Draft",
                                creditMemoName: item.Credit_Memo_Name || "", // gtherp__Credit_Memo__c
                                invoiceLineName: item.Invoice_Line_Name || item.Invoice_Line__c || "", // gtherp__Invoice_Line__c
                                salesOrderLineName: item.Sales_Order_Line_Name || item.Sales_Order_Line__c || "", // gtherp__Sales_Order_Line__c
                                productName: item.Product_Name || "", // gtherp__Product_Name__c
                                productDescription: item.Product_Description__c || "", // gtherp__Product_Description__c
                                manufacturerDBA: item.Manufacturer_DBA__c || "Unknown", // gtherp__Manufacturer_DBA__c
                                unitPrice: item.Unit_Price__c || 0, // gtherp__Unit_Price__c
                                creditQty: item.Credit_Qty__c || 0, // gtherp__Credit_Qty__c
                                totalPrice: item.Total_Price__c || 0, // gtherp__Total_Price__c
                                shipping: item.Shipping_Charges__c || 0, // gtherp__Shipping_Charges__c
                                taxes: item.Total_Taxes_Amount__c || 0, // gtherp__Total_Taxes_Amount__c
                                lineGrandTotal: item.Line_Grand_Total__c || 0, // gtherp__Line_Grand_Total__c
                                type: "Credit Memo",
                                requestDate: "",
                                description: item.Product_Description__c || "",
                                creditToAccountName: "N/A",
                                invoiceName: item.Invoice_Line_Name || ""
                            })),
                            debitMemos: (data.Debit_Memo_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // Debit Memo Line Name
                                status: item.Status__c || "Draft",
                                debitMemoName: item.Debit_Memo_Name || "", // gtherp__Debit_Memo__c
                                supplierBillLineName: item.Supplier_Bill_Line_Name || item.Supplier_Bill_Line__c || "", // gtherp__Supplier_Bill_Line__c
                                purchaseOrderLineName: item.Purchase_Order_Line_Name || item.Purchase_Order_Line__c || "", // gtherp__Purchase_Order_Line__c
                                productName: item.Product_Name || "", // gtherp__Product_Name__c
                                productDescription: item.Product_Description__c || "", // gtherp__Product_Description__c
                                manufacturerDBA: item.Manufacturer_DBA__c || "Unknown", // gtherp__Manufacturer_DBA__c
                                unitCost: item.Unit_Cost__c || 0, // gtherp__Unit_Cost__c
                                debitQty: item.Debit_Qty__c || 0, // gtherp__Debit_Qty__c
                                totalCost: item.Total_Cost__c || 0, // gtherp__Total_Cost__c
                                shipping: item.Shipping_Charges__c || 0, // gtherp__Shipping_Charges__c
                                lineGrandTotal: item.Line_Grand_Total__c || 0, // gtherp__Line_Grand_Total__c
                                type: "Debit Memo",
                                requestDate: "",
                                description: item.Product_Description__c || "",
                                reason: "",
                                totalAmount: item.Line_Grand_Total__c || 0,
                                debitToAccountName: "N/A"
                            }))
                        };
                        setReturnsData(mappedData);
                    }
                } catch (err) {
                    console.error("Error fetching line returns:", err);
                } finally {
                    setReturnsLoading(false);
                }
            }
        }

        fetchReturnsData();
    }, [activeTab, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // New Fields from Screenshot (Mocked)


    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? productImages.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === productImages.length - 1 ? 0 : prev + 1
        );
    };

    // Loading state
    if (loading) {
        return (
            <Sidebar>
                {/* Breadcrumb - Compact (Skeleton) */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <button className="hover:text-gray-700 dark:hover:text-gray-300">Proposals</button>
                        <span>&gt;</span>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300">Proposal Details</button>
                        <span>&gt;</span>
                        <span className="text-gray-900 dark:text-white">Product Details</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/proposals/${id}`} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Proposal
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading product details...</p>
                    </div>
                </div>
            </Sidebar>
        );
    }

    // No data state (only if not loading and no product)
    if (!loading && !product) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Product not found</p>
                        <Link
                            href={`/proposals/${id}`}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Back to Proposal
                        </Link>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            {/* Breadcrumb - Compact */}
            <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <button
                        onClick={() => router.push("/proposals")}
                        className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Proposals
                    </button>
                    <span>&gt;</span>
                    <button
                        onClick={() => router.push(`/proposals/${id}`)}
                        className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Proposal Details
                    </button>
                    <span>&gt;</span>
                    <span className="text-gray-900 dark:text-white">Product Details</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h1>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Line {lineNumber} of {totalLines}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Back to Proposal Button */}
                        <Link
                            href={`/proposals/${id}`}
                            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Back to Proposal
                        </Link>
                    </div>
                </div>
            </div>

            {/* Row 1: Main Image + Proposal Note + Product Information */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch">
                {/* Main Image with Carousel - 25% width (3 of 12 cols) */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                    <div className="relative flex-1 flex flex-col">
                        {/* Main Image Display - Reduced height */}
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-1 min-h-[200px]">
                            <div className="text-center">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                                    {productImages[currentImageIndex].label}
                                </span>
                            </div>
                        </div>

                        {/* Carousel Navigation Arrows */}
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>

                        {/* Carousel Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {productImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex
                                        ? "bg-primary"
                                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Proposal Note - 25% width (3 of 12 cols) */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Proposal Note
                        </h2>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                            Notes
                        </label>
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-sm text-gray-900 dark:text-white min-h-[200px]">
                            <p className="text-gray-400 italic">{product.ProductNotes}</p>
                        </div>
                    </div>
                </div>

                {/* Product Information Card - 50% width (6 of 12 cols) */}
                <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Product Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                        {/* Column 1 */}
                        <div className="space-y-3">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.name}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.description || "No description available"}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                    title={product.description}
                                />
                            </div>
                            {/* Manufacturer DBA */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Manufacturer DBA
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.manufacturer}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Product Family */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Product Family
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.productFamily}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-primary font-medium focus:outline-none cursor-default"
                                />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-3">
                            {/* Product Grouping */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Product Grouping
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.productGrouping}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Grouping */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Grouping
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.grouping}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* IsTaxable */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    IsTaxable
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.isTaxable}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Available to Sell */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Available to Sell
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.availableToSell?.toLocaleString() || "0"}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white font-mono focus:outline-none cursor-default"
                                />
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-3">
                            {/* Site */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Site
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.site}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Inventory Account */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Inventory Account
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.inventoryAccount}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Unit Cost */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Unit Cost
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.unitCost}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                            {/* Total Cost */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                                    Total Cost
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.totalCost}
                                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Thumbnail Images + Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">


                {/* Details Card - Full width */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Order Qty</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">MOQ</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Qty</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Price</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Shipping</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Taxes</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Grand Total</th>
                                    <th className=" py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Shipped</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-2 text-sm text-gray-900 dark:text-white">
                                        ${unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">{quantity}</td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">{product.moq}</td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">{product.quantity}</td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">
                                        ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">
                                        ${shippingCharges.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">
                                        ${taxes.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 text-sm  text-gray-900 font-bold text-primary">
                                        ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-2 text-sm  text-gray-900 dark:text-white">{product.qtyShipped}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Row 3: Related Items Tabs (Fulfillments, Purchases, Returns) */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                {/* Tabs Header */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab("taxes")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "taxes"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}>
                        Taxes
                    </button>
                    <button
                        onClick={() => setActiveTab("fulfillment")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "fulfillment"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`} >
                        Fulfillment
                    </button>
                    <button
                        onClick={() => setActiveTab("purchases")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "purchases"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`} >
                        Purchases
                    </button>
                    <button
                        onClick={() => setActiveTab("returns")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "returns"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Returns
                    </button>

                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "fulfillment" && (
                        <LineFulfillmentsTab
                            fulfillmentData={fulfillmentData}
                            loading={fulfillmentLoading}
                            activeTab={fulfillmentActiveTab}
                            onTabChange={setFulfillmentActiveTab}
                        />
                    )}
                    {activeTab === "purchases" && (
                        <LinePurchasesTab
                            purchasesData={purchasesData}
                            loading={purchasesLoading}
                        />
                    )}
                    {activeTab === "returns" && (
                        <LineReturnsTab
                            returnsData={returnsData}
                            loading={returnsLoading}
                        />
                    )}
                    {activeTab === "taxes" && (
                        <LineTaxesTab
                            taxData={product.taxDetail}
                            loading={loading}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Buttons - Below Order Details, Right aligned */}
            <div className="flex items-center justify-end gap-2 mt-4">
                {/* Previous Line Button */}
                {hasPrevLine ? (
                    <Link
                        href={`/proposals/${id}/lines/${prevLineId}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Prev
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Prev
                    </span>
                )}

                {/* Line indicator */}
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    {lineNumber}/{totalLines}
                </span>

                {/* Next Line Button */}
                {hasNextLine ? (
                    <Link
                        href={`/proposals/${id}/lines/${nextLineId}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                    >
                        Next
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
                        Next
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </span>
                )}
            </div>
        </Sidebar>
    );
}
