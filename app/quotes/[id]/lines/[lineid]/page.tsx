"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { formatDate, formatCurrency, formatNumber, decodeHtmlEntities } from "@/lib/utils/formatting";
import { QuoteLine } from "../../../types";
import QuoteLineFulfillmentsTab from "./components/QuoteLineFulfillmentsTab";
import QuoteLineTaxesTab from "./components/QuoteLineTaxesTab";
import QuoteLinePurchasesTab from "./components/QuoteLinePurchasesTab";
import QuoteLineReturnsTab from "./components/QuoteLineReturnsTab";
import QuoteLineFilesTab from "./components/QuoteLineFilesTab";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/DataTable";

// Interface for quote line item from Salesforce
interface QuoteLineItem {
    Id: string;
    Name: string; // Sku or Line Name
    Product_Name__c?: string;
    Product_Name?: string;
    Status__c?: string;
    Product_Description__c?: string;
    Manufacturer_DBA__c?: string;
    Product_Brand_Name__c?: string;
    Brand_Name__c?: string;
    Lead_Time_Wks__c?: number;
    ShippingDimensions__c?: string;
    Product_Family__c?: string;
    Product_Grouping__c?: string;
    Groupings__c?: string;
    Quote_Line_Notes__c?: string;
    Site__c?: string;
    Site_Name__c?: string;
    Inventory_Account__c?: string;
    Inventory_Account_Name__c?: string;
    Is_Taxable__c?: boolean;
    Available_To_Sell__c?: number;
    Qty_Shipped__c?: number;
    Unit_Cost__c?: number;
    Total_Cost__c?: number;
    Unit_Price__c?: number;
    Total_Order_Qty__c?: number;
    MOQ__c?: number;
    Total_Price__c?: number;
    Shipping_Charges__c?: number;
    Total_Taxes_Amount__c?: number;
    Line_Grand_Total__c?: number;
    Sales_Tax_Rate__c?: number;
    Total_Sales_Tax_Amount__c?: number;
    Use_Tax_Rate__c?: number;
    Total_Use_Tax_Amount__c?: number;
    Local_Tax_Rate__c?: number;
    Total_Local_Tax_Amount__c?: number;
    Excise_Tax_Rate__c?: number;
    Total_Excise_Tax_Amount__c?: number;
    Gross_Receipts_Tax_Rate__c?: number;
    Total_Gross_Receipts_Tax_Amount__c?: number;
    GST_Rate__c?: number;
    Total_GST_Amount__c?: number;
    VAT_Rate__c?: number;
    Total_VAT_Amount__c?: number;

    gtherp__Sales_Tax_Rate__c?: number;
    gtherp__Total_Sales_Tax_Amount__c?: number;
    gtherp__Use_Tax_Rate__c?: number;
    gtherp__Total_Use_Tax_Amount__c?: number;
    gtherp__Local_Tax_Rate__c?: number;
    gtherp__Total_Local_Tax_Amount__c?: number;
    gtherp__Excise_Tax_Rate__c?: number;
    gtherp__Total_Excise_Tax_Amount__c?: number;
    gtherp__Gross_Receipts_Tax_Rate__c?: number;
    gtherp__Total_Gross_Receipts_Tax_Amount__c?: number;
    gtherp__GST_Rate__c?: number;
    gtherp__Total_GST_Amount__c?: number;
    gtherp__VAT_Rate__c?: number;
    gtherp__Total_VAT_Amount__c?: number;
}

// Interface for mapped product data
interface ProductData {
    id: string;
    name: string;
    sku: string;
    status: string;
    lineName: string;
    description: string;
    productFamily: string;
    brand?: string;
    leadTimeWks?: number;
    shippingDimensions?: string;
    productGrouping: string;
    grouping: string;
    notes: string;
    site: string;
    inventoryAccount: string;
    isTaxable: string;
    availableToSell: number;
    qtyShipped: number;
    unitCost: number;
    totalCost: number;
    unitPrice: number;
    orderQty: number;
    moq: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
    manufacturerDBA: string;
    salesTaxRate: number;
    salesTaxAmount: number;
    useTaxRate: number;
    useTaxAmount: number;
    localTaxRate: number;
    localTaxAmount: number;
    exciseTaxRate: number;
    exciseTaxAmount: number;
    grtRate: number;
    grtAmount: number;
    gstRate: number;
    gstAmount: number;
    vatRate: number;
    vatAmount: number;
}

interface QuoteLineFile {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    sizeInBytes: number;
    uploadedDate: string;
    uploadedBy: string;
    contentDocumentId: string;
}

export default function QuoteLineDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [quoteLines, setQuoteLines] = useState<ProductData[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    // Dynamic counts state
    const [counts, setCounts] = useState({
        fulfillment: 0,
        purchases: 0,
        returns: 0,
        files: 0
    });

    const [quoteFiles, setQuoteFiles] = useState<QuoteLineFile[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);

    const { user, selectedAccount } = useUserSession();
    const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
    const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";

    useEffect(() => {
        async function fetchQuoteLineData() {
            try {
                setLoading(true);
                const res = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&quoteId=${encodeURIComponent(id)}&action=quotelines`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch quote lines: ${res.status}`);
                }

                const data = await res.json();
                if (data && data.length > 0) {
                    const mappedLines: ProductData[] = data.map((item: any) => ({
                        id: item.Id,
                        name: item.Product_Name || "Unknown Product",
                        sku: item.sku || "",
                        lineName: item.Name || "",
                        status: item.Status__c || "Draft",
                        description: item.Product_Description__c || "",
                        productFamily: item.Product_Family__c || "",
                        brand: item.Product_Brand_Name__c || item.Brand_Name__c || item.Brand__c || "-",
                        leadTimeWks: item.Lead_Time_Wks__c,
                        shippingDimensions: item.ShippingDimensions__c || "-",
                        productGrouping: item.Product_Grouping__c || "",
                        grouping: item.Grouping__c || "",
                        notes: item.Customer_Quote_Line_Notes__c || "",
                        site: item.Site_Name || item.Site__c || "",
                        inventoryAccount: item.Inventory_Account_Name || item.Inventory_Account__c || "",
                        isTaxable: item.IsTaxable__c ? "Yes" : "No",
                        availableToSell: item.Available_To_Sell__c || 0,
                        qtyShipped: item.Qty_Shipped__c || 0,
                        unitCost: item.Unit_Cost__c || 0,
                        totalCost: item.Total_Cost__c || 0,
                        unitPrice: item.Unit_Price__c || 0,
                        orderQty: item.Total_Order_Qty__c || 0,
                        moq: item.MOQ__c || 1,
                        totalOrderQty: item.Total_Order_Qty__c || 0,
                        totalPrice: item.Total_Price__c || 0,
                        shipping: item.Shipping_Charges__c || 0,
                        taxes: item.Total_Taxes_Amount__c || 0,
                        grandTotal: item.Line_Grand_Total__c || 0,
                        manufacturerDBA: item.Manufacturer_DBA__c || "",
                        salesTaxRate: item.Sales_Tax_Rate__c || 0,
                        salesTaxAmount: item.Sales_Tax_Amount__c || 0,
                        useTaxRate: item.Use_Tax_Rate__c || 0,
                        useTaxAmount: item.Use_Tax_Amount__c || 0,
                        localTaxRate: item.Local_Tax_Rate__c || 0,
                        localTaxAmount: item.Local_Tax_Amount__c || 0,
                        exciseTaxRate: item.Excise_Tax_Rate__c || 0,
                        exciseTaxAmount: item.Excise_Tax_Amount__c || 0,
                        grtRate: item.Gross_Receipts_Tax_Rate__c || 0,
                        grtAmount: item.Gross_Receipts_Tax_Amount__c || 0,
                        gstRate: item.GST_Rate__c || 0,
                        gstAmount: item.GST_Amount__c || 0,
                        vatRate: item.VAT_Rate__c || 0,
                        vatAmount: item.Total_VAT_Amount__c || 0
                    }));

                    setQuoteLines(mappedLines);

                    const lineIndex = mappedLines.findIndex(p => p.id === lineid);
                    if (lineIndex >= 0) {
                        setCurrentLineIndex(lineIndex);
                    }
                }
            } catch (error) {
                console.error("Error fetching quote line data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchQuoteLineData();
        }
    }, [id, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Fetch counts and files for tabs
    useEffect(() => {
        async function fetchCountsAndFiles() {
            if (!SF_ACCOUNT_ID || !SF_CONTACT_ID || !lineid) return;

            try {
                // Fetch fulfillment count
                const fulfillRes = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&quoteId=${encodeURIComponent(lineid)}&action=fulfillment&objectName=Customer_Quote_Line__c`);
                const fulfillData = fulfillRes.ok ? await fulfillRes.json() : null;
                const fulfillCount = fulfillData ?
                    (fulfillData.Sales_Order_Line__c?.length || 0) +
                    (fulfillData.Invoice_Line__c?.length || 0) +
                    (fulfillData.Shipping_Manifest_Line__c?.length || 0) : 0;

                // Fetch purchases count
                const purchaseRes = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&quoteId=${encodeURIComponent(lineid)}&action=purchases&objectName=Customer_Quote_Line__c`);
                const purchaseData = purchaseRes.ok ? await purchaseRes.json() : null;
                const purchaseCount = purchaseData ?
                    (purchaseData.Purchase_Order_Line__c?.length || 0) +
                    (purchaseData.Supplier_Bill_Line__c?.length || 0) : 0;

                // Fetch returns count
                const returnRes = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&quoteId=${encodeURIComponent(lineid)}&action=returns&objectName=Customer_Quote_Line__c`);
                const returnData = returnRes.ok ? await returnRes.json() : null;
                const returnCount = returnData ?
                    (returnData.Debit_Memo_Line__c?.length || 0) +
                    (returnData.RMA_Line__c?.length || 0) +
                    (returnData.Credit_Memo_Line__c?.length || 0) +
                    (returnData.RTV_Line__c?.length || 0) : 0;

                // Fetch files
                setFilesLoading(true);
                const filesRes = await fetch(`/api/salesforce/quotes?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&quoteId=${encodeURIComponent(lineid)}&action=files&objectName=Customer_Quote_Line__c`);
                const filesData = filesRes.ok ? await filesRes.json() : [];
                const mappedFiles = (filesData || []).map((f: any) => ({
                    id: f.Id,
                    fileName: f.Title,
                    fileType: f.FileExtension,
                    fileSize: f.ContentSize ? (f.ContentSize / 1024 / 1024).toFixed(2) + ' MB' : '0 MB',
                    sizeInBytes: f.ContentSize || 0,
                    uploadedDate: f.CreatedDate,
                    uploadedBy: f.CreatedBy || "",
                    contentDocumentId: f.ContentDocumentId
                }));
                setQuoteFiles(mappedFiles);

                setCounts({
                    fulfillment: fulfillCount,
                    purchases: purchaseCount,
                    returns: returnCount,
                    files: mappedFiles.length
                });
            } catch (error) {
                console.error("Error fetching tab counts and files:", error);
            } finally {
                setFilesLoading(false);
            }
        }

        fetchCountsAndFiles();
    }, [lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    const product = quoteLines[currentLineIndex];
    const totalLines = quoteLines.length;
    const lineNumber = currentLineIndex + 1;

    const productImages = [
        { id: 1, label: "Image 1" },
        { id: 2, label: "Image 2" },
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [activeTab, setActiveTab] = useState<"taxes" | "fulfillment" | "purchases" | "returns" | "files">("taxes");

    if (loading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center h-64 min-w-0">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Sidebar>
        );
    }

    if (!product) {
        return (
            <Sidebar>
                <div className="p-8 text-center">
                    <p className="text-gray-500" title="Quote line not found.">Quote line not found.</p>
                    <Link href={`/quotes/${id}`} className="text-primary hover:underline mt-4 block">Back to Quote</Link>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            {/* Header / Breadcrumbs */}
            <div className="mb-4">
                <div className="flex items-center justify-between min-w-0">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1 min-w-0">
                            <span>Quotes</span>
                            <span>&gt;</span>
                            <Link href={`/quotes/${id}`} className="hover:underline">Quote Details</Link>
                            <span>&gt;</span>
                            <span className="text-gray-900 font-medium">Quote Line</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white" title={product.lineName}>{product.lineName}</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/quotes/${id}`)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-[#A7C7E7] text-white rounded shadow-sm hover:bg-[#8FB8DE] transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Quote
                    </button>

                </div>
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Line {lineNumber} of {totalLines}
                    </span>
                </div>
            </div>
            {/* Row 1: Main Image + Proposal Note + Product Information */}
            <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4 mb-4 items-stretch">
                {/* Main Image with Carousel - 25% width (3 of 12 cols) */}
                <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
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
                            onClick={() => setCurrentImageIndex(i => (i - 1 + productImages.length) % productImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentImageIndex(i => (i + 1) % productImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
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
                            {productImages.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex
                                    ? "bg-primary"
                                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                                    }`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quotes Note - 25% width (3 of 12 cols) */}
                <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white ">
                            Quote Line Note
                        </h2>
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-sm text-gray-800 dark:text-white min-h-[200px]">
                            <p className="text-gray-700 truncate">{decodeHtmlEntities(product.notes) || "No notes available."}</p>
                        </div>
                    </div>
                </div>

                {/* Product Information Card - 50% width (6 of 12 cols) */}
                <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                    <div className="flex items-center gap-2 mb-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white " title="Product Information">
                                Product Information
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Detailed Product Specifications">Detailed Product Specifications</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Product Name">
                                Product Name
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.name}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.name}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Description">
                                Description
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.description || "No description available"}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.description || "No description available"}
                            />
                        </div>

                        {/* Product Family */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Product Family">
                                Product Family
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.productFamily}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.productFamily}
                            />
                        </div>

                        {/* Brand Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Brand Name">
                                Brand Name
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.brand || "—"}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.brand || "—"}
                            />
                        </div>

                        {/* Grouping */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Grouping">
                                Grouping
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.grouping || "—"}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.grouping || "—"}
                            />
                        </div>

                        {/* Taxable */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Taxable">
                                Taxable
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.isTaxable || "No"}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.isTaxable || "No"}
                            />
                        </div>

                        {/* MOQ */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="MOQ">
                                MOQ
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={formatNumber(product.moq, 0)}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={formatNumber(product.moq, 0)}
                            />
                        </div>

                        {/* Lead-Time (Wks) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Lead-Time (Wks)">
                                Lead-Time (Wks)
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.leadTimeWks != null ? formatNumber(product.leadTimeWks, 0) : "-"}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.leadTimeWks != null ? String(product.leadTimeWks) : "-"}
                            />
                        </div>

                        {/* Shipping Dimensions */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Shipping Dimensions">
                                Shipping Dimensions
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={product.shippingDimensions || "—"}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                                title={product.shippingDimensions || "—"}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* quotes Details Table */}
            <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-4">
                    <div className="overflow-x-auto">
                        <Table className="text-sm text-left">
                            <THead>
                                <tr>
                                    <Th className="py-2 font-bold">Unit Price</Th>
                                    <Th className="py-2 font-bold">Order Qty</Th>
                                    <Th className="py-2 font-bold">MOQ</Th>
                                    <Th className="py-2 font-bold">Total Order Qty</Th>
                                    <Th className="py-2 font-bold">Total Price</Th>
                                    <Th className="py-2 font-bold">Shipping</Th>
                                    <Th className="py-2 font-bold">Taxes</Th>
                                    <Th className="py-2 font-bold">Grand Total</Th>
                                    <Th className="py-2 font-bold">Qty Shipped</Th>
                                </tr>
                            </THead>
                            <TBody className="divide-y divide-gray-100 dark:divide-gray-700">
                                <Tr>
                                    <Td className="text-gray-600 dark:text-gray-300 font-medium truncate">{formatCurrency(product.unitPrice)}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{product.orderQty}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{product.moq}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{product.totalOrderQty}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{formatCurrency(product.totalPrice)}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{formatCurrency(product.shipping)}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{formatCurrency(product.taxes)}</Td>
                                    <Td className="font-bold text-primary truncate">{formatCurrency(product.grandTotal)}</Td>
                                    <Td className="text-gray-600 dark:text-gray-300 truncate">{product.qtyShipped}</Td>
                                </Tr>
                            </TBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Bottom Tabs */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                {/* Tabs Header */}
                <div className="flex flex-nowrap gap-2 overflow-x-auto items-center min-w-0">
                    {(([
                        {
                            id: "taxes",
                            label: "Taxes",
                            count: (product?.salesTaxAmount > 0 ||
                                product?.useTaxAmount > 0 ||
                                product?.localTaxAmount > 0 ||
                                product?.exciseTaxAmount > 0 ||
                                product?.grtAmount > 0 ||
                                product?.gstAmount > 0 ||
                                product?.vatAmount > 0) ? 1 : 0
                        },
                        { id: "fulfillment", label: "Fulfillment", count: counts.fulfillment },
                        { id: "purchases", label: "Purchases", count: counts.purchases },
                        { id: "returns", label: "Returns", count: counts.returns },
                        { id: "files", label: "Files", count: counts.files }
                    ] as { id: string; label: string; count: number }[]).filter(tab => {
                        const isCustomerOrNSO = selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'customer' || selectedAccount?.Account_Type__c?.toLowerCase() === 'customer' || user?.role?.toLowerCase() === 'customer' || selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'nso' || selectedAccount?.Account_Type__c?.toLowerCase() === 'nso' || user?.role?.toLowerCase() === 'nso';
                        if (isCustomerOrNSO && tab.id === 'purchases') return false;
                        return true;
                    })).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg transition-colors  flex-shrink-0 ${activeTab === tab.id
                                ? "bg-primary text-white"
                                : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                "(" + tab.count + ")"
                            )}
                        </button>
                    ))}
                </div>
                <div className="mt-4 py-4">
                    {activeTab === 'taxes' && (
                        <QuoteLineTaxesTab product={product} />
                    )}

                    {activeTab === 'fulfillment' && (
                        <QuoteLineFulfillmentsTab
                            lineId={lineid}
                            quoteId={id}
                            loading={false}
                            accountId={SF_ACCOUNT_ID}
                            contactId={SF_CONTACT_ID}
                            currentProduct={product}
                        />
                    )}

                    {activeTab === 'purchases' &&
                        (selectedAccount?.Account_Record_Type__c?.toLowerCase() !== 'customer' && selectedAccount?.Account_Type__c?.toLowerCase() !== 'customer' && user?.role?.toLowerCase() !== 'customer') &&
                        (selectedAccount?.Account_Record_Type__c?.toLowerCase() !== 'nso' && selectedAccount?.Account_Type__c?.toLowerCase() !== 'nso' && user?.role?.toLowerCase() !== 'nso') && (
                            <QuoteLinePurchasesTab
                                lineId={lineid}
                                loading={false}
                                accountId={SF_ACCOUNT_ID}
                                contactId={SF_CONTACT_ID}
                            />
                        )}

                    {activeTab === 'returns' && (
                        <QuoteLineReturnsTab
                            lineId={lineid}
                            quoteId={id}
                            loading={false}
                            accountId={SF_ACCOUNT_ID}
                            contactId={SF_CONTACT_ID}
                            accountType={selectedAccount?.Account_Record_Type__c || selectedAccount?.Account_Type__c || user?.role}
                        />
                    )}

                    {activeTab === 'files' && (
                        <QuoteLineFilesTab
                            lineId={lineid}
                            accountId={SF_ACCOUNT_ID}
                            contactId={SF_CONTACT_ID}
                            files={quoteFiles}
                            loading={filesLoading}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Buttons - Below Tabs, Right aligned */}
            <div className="flex items-center justify-end gap-2 mt-4 min-w-0">
                {/* Previous Line Button */}
                {currentLineIndex > 0 ? (
                    <Link
                        href={`/quotes/${id}/lines/${quoteLines[currentLineIndex - 1]?.id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                    </span>
                )}

                {/* Line indicator */}
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium">
                    {lineNumber}/{totalLines}
                </span>

                {/* Next Line Button */}
                {currentLineIndex < totalLines - 1 ? (
                    <Link
                        href={`/quotes/${id}/lines/${quoteLines[currentLineIndex + 1]?.id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                )}
            </div>
        </Sidebar >
    );
}
