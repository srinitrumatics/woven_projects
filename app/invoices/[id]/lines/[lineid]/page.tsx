"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { formatCurrency } from "@/lib/utils/formatting";
import InvoiceLineTaxesTab from "./components/InvoiceLineTaxesTab";
import InvoiceLineCreditMemoTab from "./components/InvoiceLineCreditMemoTab";
import InvoiceLineFilesTab from "./components/InvoiceLineFilesTab";
import { InvoiceStatus } from "@/app/invoices/types";
import { useUserSession } from "@/components/UserSessionContext";

interface InvoiceLineData {
    id: string;
    lineName: string;
    status: InvoiceStatus;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    productFamily: string;
    site: string;
    siteId?: string;
    inventoryAccount: string;
    inventoryAccountId?: string;
    isTaxable: string;
    proposedProduct: string;
    customerQuoteLine: string;
    customerQuoteLineId?: string;
    customerQuoteId?: string;
    salesOrderLine: string;
    salesOrderLineId?: string;
    salesOrderId?: string;
    purchaseOrderLine: string;
    purchaseOrderLineId?: string;
    purchaseOrderId?: string;
    unitPrice: number;
    orderQty: number;
    moq: number;
    totalOrderQty: number;
    totalPrice: number;
    shipping: number;
    taxes: number;
    grandTotal: number;
    // Tax breakdown
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
    inventoryLineNotes: string;
}

export default function InvoiceLineDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [invoiceLines, setInvoiceLines] = useState<InvoiceLineData[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [creditMemoCount, setCreditMemoCount] = useState(0);
    const [filesCount, setFilesCount] = useState(0);

    const { user, selectedAccount } = useUserSession();
    const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
    const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || user?.Id || "";

    useEffect(() => {
        async function fetchInvoiceLineData() {
            if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/salesforce/invoices?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&invoiceId=${encodeURIComponent(id)}&action=lines`
                );

                if (!res.ok) throw new Error(`Failed to fetch invoice lines: ${res.status}`);

                const data = await res.json();

                if (data?.Invoice_Line__c && data.Invoice_Line__c.length > 0) {
                    const mappedLines: InvoiceLineData[] = data.Invoice_Line__c.map((item: any) => ({
                        id: item.Id,
                        lineName: item.Name || "",
                        status: item.Status__c || "Draft",
                        productName: item.Product_Name || "Unknown Product",
                        description: item.Product_Description__c || "",
                        manufacturerDBA: item.Manufacturer_DBA__c || "",
                        brand: item.Product_Brand_Name__c,
                        productFamily: item.Product_Family__c || "",
                        site: item.Site_Name || item.Site__c || "",
                        siteId: item.Site__c || "",
                        inventoryAccount: item.Inventory_Account_Name || item.Inventory_Account__c || "",
                        inventoryAccountId: item.Inventory_Account__c || "",
                        isTaxable: item.IsTaxable__c ? "Yes" : "No",
                        proposedProduct: item.Proposed_Product_Name || "",
                        customerQuoteLine: item.Customer_Quote_Line_Name || item.Customer_Quote_Line__c || "",
                        customerQuoteLineId: item.Customer_Quote_Line__c || "",
                        customerQuoteId: item.Customer_Quote__c || item.Customer_Quote_Line_r?.Customer_Quote__c || "",
                        salesOrderLine: item.Sales_Order_Line_Name || item.Sales_Order_Line__c || "",
                        salesOrderLineId: item.Sales_Order_Line__c || "",
                        salesOrderId: item.Sales_Order__c || item.Sales_Order_Line_r?.Sales_Order__c || "",
                        purchaseOrderLine: item.Purchase_Order_Line_Name || item.Purchase_Order_Line__c || "",
                        purchaseOrderLineId: item.Purchase_Order_Line__c || "",
                        purchaseOrderId: item.Purchase_Order__c || item.Purchase_Order_Line_r?.Purchase_Order__c || "",
                        unitPrice: item.Unit_Price__c || 0,
                        orderQty: item.Total_Order_Qty__c || 0,
                        moq: item.MOQ__c || 1,
                        totalOrderQty: item.Total_Order_Qty__c || 0,
                        totalPrice: item.Total_Price__c || 0,
                        shipping: item.Shipping_Charges__c || 0,
                        taxes: item.Total_Taxes_Amount__c || 0,
                        grandTotal: item.Line_Grand_Total__c || 0,
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
                        gstAmount: item.Total_GST_Amount__c || 0,
                        vatRate: item.VAT_Rate__c || 0,
                        vatAmount: item.Total_VAT_Amount__c || 0,
                        inventoryLineNotes: item.Invoice_Line_Notes__c || "",
                    }));

                    setInvoiceLines(mappedLines);

                    const lineIndex = mappedLines.findIndex((l) => l.id === lineid);
                    if (lineIndex >= 0) setCurrentLineIndex(lineIndex);
                }
            } catch (error) {
                console.error("Error fetching invoice line data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchInvoiceLineData();
    }, [id, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Fetch credit memo line count and files count
    useEffect(() => {
        async function fetchCounts() {
            if (!SF_ACCOUNT_ID || !SF_CONTACT_ID || !lineid) return;
            try {
                const [creditRes, filesRes] = await Promise.all([
                    fetch(`/api/salesforce/invoices?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&invoiceId=${encodeURIComponent(lineid)}&action=creditmemolines&objectName=Invoice_Line__c`),
                    fetch(`/api/salesforce/invoices?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&invoiceId=${encodeURIComponent(lineid)}&action=files&objectName=Invoice_Line__c`),
                ]);
                const creditData = creditRes.ok ? await creditRes.json() : null;
                setCreditMemoCount(creditData?.Credit_Memo_Line__c?.length || 0);
                const filesData = filesRes.ok ? await filesRes.json() : null;
                const rawFiles = Array.isArray(filesData) ? filesData : filesData?.files || filesData?.ContentVersion || [];
                setFilesCount(rawFiles.length);
            } catch (err) {
                console.error("Error fetching counts:", err);
            }
        }
        fetchCounts();
    }, [lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    const product = invoiceLines[currentLineIndex];
    const totalLines = invoiceLines.length;
    const lineNumber = currentLineIndex + 1;

    const productImages = [{ id: 1, label: "Image 1" }, { id: 2, label: "Image 2" }];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"taxes" | "creditmemolines" | "files">("taxes");

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
                    <p className="text-gray-500 truncate" title="Invoice line not found.">Invoice line not found.</p>
                    <Link href={`/invoices/${id}`} className="text-primary hover:underline mt-4 block truncate">
                        Back to Invoice
                    </Link>
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
                            <span>Invoices</span>
                            <span>&gt;</span>
                            <Link href={`/invoices/${id}`} className="hover:underline truncate">
                                Invoice Details
                            </Link>
                            <span>&gt;</span>
                            <span className="text-gray-900 font-medium truncate">{product.lineName}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white " title={product.lineName}>{product.lineName}</h1>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-0">
                        <button
                            onClick={() => router.push(`/invoices/${id}`)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-[#A7C7E7] text-white rounded shadow-sm hover:bg-[#8FB8DE] transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Invoice
                        </button>
                        {product.status && (
                            <StatusBadge status={product.status} />
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-1 min-w-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">
                        Line {lineNumber} of {totalLines}
                    </span>
                </div>
            </div>

            {/* Row 1: Product Images + Invoice Line Notes + Product Information */}
            <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4 mb-4 items-stretch">
                {/* Product Images Carousel - 3/12 cols */}
                <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                    <div className="relative flex-1 flex flex-col">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide truncate" title="Product Images">Product Images</p>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-1 min-h-[200px]">
                            <div className="text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block truncate">
                                    {productImages[currentImageIndex].label}
                                </span>
                            </div>
                        </div>

                        {/* Carousel Navigation */}
                        <button
                            onClick={() => setCurrentImageIndex((i) => (i - 1 + productImages.length) % productImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentImageIndex((i) => (i + 1) % productImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {productImages.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Invoice Line Notes - 3/12 cols */}
                <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm  p-6 ">
                    <div className="flex items-center gap-3 mb-6 min-w-0">
                        <div className="w-10 h-10 rounded  bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center ">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight ">Invoice Line Notes</h2>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-sm text-gray-800 dark:text-white min-h-[300px]">
                        {product.inventoryLineNotes || ""}
                    </div>
                </div>

                {/* Product Information - 6/12 cols */}
                <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 min-w-0">
                        <div className="w-10 h-10 rounded  bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center ">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">
                                Product Information
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Product Name">Product Name</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.productName} value={product.productName} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Proposed Product">Proposed Product</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.proposedProduct} value={product.proposedProduct} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Site">Site</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.site} value={product.site} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Description">Description</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.description} value={product.description} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Customer Quote Line">Customer Quote Line</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.customerQuoteLine} value={product.customerQuoteLine} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Inventory Account">Inventory Account</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.inventoryAccount} value={product.inventoryAccount} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Manufacturer DBA">Manufacturer DBA</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.manufacturerDBA} value={product.manufacturerDBA} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Sales Order Line">Sales Order Line</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.salesOrderLine} value={product.salesOrderLine} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Purchase Order Line">Purchase Order Line</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.purchaseOrderLine} value={product.purchaseOrderLine} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Product Family">Product Family</label>
                            <input readOnly type="text" className="w-full  bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded  px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.productFamily} value={product.productFamily} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1 truncate" title="Is Taxable">Is Taxable</label>
                            <input readOnly type="text" className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.isTaxable} value={product.isTaxable} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Line Details Table */}
            <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left table-fixed">
                            <thead className="bg-primary-light dark:bg-gray-900">
                                <tr>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Unit Price</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Order Qty</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">MOQ</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Total Order Qty</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Total Price</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Shipping</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Taxes</th>
                                    <th className="px-3 py-2 font-bold text-gray-900 ">Grand Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-3 py-2 text-gray-600 font-medium truncate">{formatCurrency(product.unitPrice)}</td>
                                    <td className="px-3 py-2 text-gray-600 truncate">{product.orderQty}</td>
                                    <td className="px-3 py-2 text-gray-600 truncate">{product.moq}</td>
                                    <td className="px-3 py-2 text-gray-600 truncate">{product.totalOrderQty}</td>
                                    <td className="px-3 py-2 text-gray-600 font-bold truncate">{formatCurrency(product.totalPrice)}</td>
                                    <td className="px-3 py-2 text-gray-600 truncate">{formatCurrency(product.shipping)}</td>
                                    <td className="px-3 py-2 text-gray-600 truncate">{formatCurrency(product.taxes)}</td>
                                    <td className="px-3 py-2 text-primary font-bold truncate">{formatCurrency(product.grandTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Tabs */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                {/* Tab Header */}
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 mb-6 items-center min-w-0">
                    {[
                        {
                            id: "taxes",
                            label: "Taxes",
                            count: (product.isTaxable === "Yes") ? 1 : 0,
                        },
                        { id: "creditmemolines", label: "Credit Memo Lines", count: creditMemoCount },
                        { id: "files", label: "Files", count: filesCount },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 ${activeTab === tab.id
                                ? "bg-primary text-white"
                                : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && ` (${tab.count})`}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === "taxes" && <InvoiceLineTaxesTab product={product} />}
                    {activeTab === "creditmemolines" && (
                        <InvoiceLineCreditMemoTab
                            lineId={lineid}
                            accountId={SF_ACCOUNT_ID}
                            contactId={SF_CONTACT_ID}
                        />
                    )}
                    {activeTab === "files" && (
                        <InvoiceLineFilesTab
                            lineId={lineid}
                            accountId={SF_ACCOUNT_ID}
                            contactId={SF_CONTACT_ID}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-end gap-2 mt-4 min-w-0">
                {currentLineIndex > 0 ? (
                    <Link
                        href={`/invoices/${id}/lines/${invoiceLines[currentLineIndex - 1]?.id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1 truncate"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed truncate">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                    </span>
                )}

                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium truncate">
                    {lineNumber}/{totalLines}
                </span>

                {currentLineIndex < totalLines - 1 ? (
                    <Link
                        href={`/invoices/${id}/lines/${invoiceLines[currentLineIndex + 1]?.id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1 truncate"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed truncate">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                )}
            </div>
        </Sidebar>
    );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
    const getStyles = () => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Partial":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Sent":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "Viewed":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "Overdue":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Draft":
                return "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-400";
            case "Cancelled":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Shipped":
                return "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
            case "Settled":
            case "Approved":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
