"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { formatDate } from "@/lib/utils/formatting";
import { QuoteLine } from "../../../types";
import QuoteLineFulfillmentsTab from "./components/QuoteLineFulfillmentsTab";

// Interface for quote line item from Salesforce
interface QuoteLineItem {
    Id: string;
    Name: string; // Sku or Line Name
    Product_Name__c?: string;
    Product_Name?: string;
    Status__c?: string;
    Product_Description__c?: string;
    Manufacturer_DBA__c?: string;
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
}

// Interface for mapped product data
interface ProductData {
    id: string;
    name: string;
    sku: string;
    status: string;
    description: string;
    productFamily: string;
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

    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

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
                        sku: item.Name || "",
                        status: item.Status__c || "Draft",
                        description: item.Product_Description__c || "",
                        productFamily: item.Product_Family__c || "-",
                        productGrouping: item.Product_Grouping__c || "-",
                        grouping: item.Groupings__c || "-",
                        notes: item.Customer_Quote_Line_Notes__c || "",
                        site: item.Site_Name || item.Site__c || "-",
                        inventoryAccount: item.Inventory_Account_Name || item.Inventory_Account__c || "-",
                        isTaxable: item.Is_Taxable__c ? "Yes" : "No",
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
                        manufacturerDBA: item.Manufacturer_DBA__c || "-"
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
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Sidebar>
        );
    }

    if (!product) {
        return (
            <Sidebar>
                <div className="p-8 text-center">
                    <p className="text-gray-500">Quote line not found.</p>
                    <Link href={`/quotes/${id}`} className="text-primary hover:underline mt-4 block">Back to Quote</Link>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            {/* Header / Breadcrumbs */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>Quotes</span>
                        <span>&gt;</span>
                        <Link href={`/quotes/${id}`} className="hover:underline">Quote Details</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900 font-medium">Product Details</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        <span className="text-sm text-gray-500 mt-1">Line {lineNumber} of {totalLines}</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                {/* Images Card */}
                <div className="lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col min-h-[380px]">
                    <div className="flex-1 bg-gray-50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="flex flex-col items-center gap-4">
                            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-gray-400 text-sm">Image {currentImageIndex + 1}</span>
                        </div>

                        <button onClick={() => setCurrentImageIndex(i => (i - 1 + productImages.length) % productImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600">
                            &lt;
                        </button>
                        <button onClick={() => setCurrentImageIndex(i => (i + 1) % productImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600">
                            &gt;
                        </button>

                        <div className="absolute bottom-4 flex gap-1.5">
                            {productImages.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-primary' : 'bg-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Proposal Notes Card */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[380px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Proposal Note</h2>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Notes</label>
                        <div className="w-full h-[240px] p-4 bg-gray-50/50 border border-gray-100 rounded-lg text-sm text-gray-500 overflow-y-auto italic">
                            {product.notes || "No notes available."}
                        </div>
                    </div>
                </div>

                {/* Product Information Card */}
                <div className="lg:col-span-5 bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[380px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Product Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Product Name</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.name}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Product Grouping</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.productGrouping}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Site</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.site}</div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Description</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate" title={product.description}>{product.description}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Grouping</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.grouping}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Inventory Account</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.inventoryAccount}</div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Manufacturer DBA</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.manufacturerDBA}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">IsTaxable</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.isTaxable}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Unit Cost</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">${product.unitCost.toFixed(2)}</div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Product Family</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">{product.productFamily}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Available to Sell</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate font-semibold text-green-600">{product.availableToSell}</div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">Total Cost</label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 truncate">${product.totalCost.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Metrics Row */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-8">
                    {/* Unit Price */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Unit Price</label>
                        <div className="text-sm text-gray-600 leading-none">
                            ${product.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    {/* Order Qty */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Order Qty</label>
                        <div className="text-sm text-gray-600 leading-none">
                            {product.orderQty}
                        </div>
                    </div>
                    {/* MCQ (MOQ) */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">MCQ</label>
                        <div className="text-sm text-gray-600 leading-none">
                            {product.moq}
                        </div>
                    </div>
                    {/* Total Qty */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Total Qty</label>
                        <div className="text-sm text-gray-600 leading-none">
                            {product.totalOrderQty}
                        </div>
                    </div>
                    {/* Total Price */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Total Price</label>
                        <div className="text-sm text-gray-600 leading-none">
                            ${product.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    {/* Shipping */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Shipping</label>
                        <div className="text-sm text-gray-600 leading-none">
                            ${product.shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    {/* Taxes */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Taxes</label>
                        <div className="text-sm text-gray-600 leading-none">
                            ${product.taxes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    {/* Grand Total */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Grand Total</label>
                        <div className="text-sm text-blue-400 font-bold leading-none">
                            ${product.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    {/* Shipped */}
                    <div>
                        <label className="text-sm text-gray-900 font-bold block mb-3 whitespace-nowrap">Shipped</label>
                        <div className="text-sm text-gray-600 leading-none">
                            {product.qtyShipped}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
                    {["taxes", "fulfillment", "purchases", "returns"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === tab
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div>
                    {activeTab === 'taxes' && (
                        <div className="bg-white p-6 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Tax Breakdown</h4>
                                <span className="text-[10px] text-gray-400">Is Taxable: {product.isTaxable}</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafc] text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Tax Name</th>
                                        <th className="px-4 py-3 font-semibold text-right uppercase tracking-wider">Rate</th>
                                        <th className="px-4 py-3 font-semibold text-right uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-4 py-3 text-gray-600 font-medium">Sales Tax</td>
                                        <td className="px-4 py-3 text-right text-gray-600">8.25%</td>
                                        <td className="px-4 py-3 text-right text-gray-900 font-bold">${product.taxes.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'fulfillment' && (
                        <QuoteLineFulfillmentsTab lineId={lineid} loading={false} />
                    )}

                    {(activeTab === 'purchases' || activeTab === 'returns') && (
                        <div className="flex flex-col items-center justify-center py-24 bg-gray-50/30 rounded-lg border border-dashed border-gray-200">
                            <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-400 text-sm italic">No related records found for this {activeTab.slice(0, -1)}.</p>
                        </div>
                    )}
                </div>
            </div>
        </Sidebar>
    );
}
