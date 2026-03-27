"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { SupplierBillLine } from "../../../types";
import SBLFilesTab from "./components/SBLFilesTab";
import SBLDebitMemoLinesTab from "./components/SBLDebitMemoLinesTab";

export default function SupplierBillLineDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [lines, setLines] = useState<SupplierBillLine[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    const [activeTab, setActiveTab] = useState<"debitMemos" | "files">("debitMemos");
    const [debitMemoLines, setDebitMemoLines] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [subTabLoading, setSubTabLoading] = useState(false);

    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

    useEffect(() => {
        async function fetchLines() {
            try {
                setLoading(true);
                const res = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Products&objectName=Supplier_Bill__c`);
                if (!res.ok) throw new Error("Failed to fetch lines");
                const data = await res.json();

                if (data && data.Supplier_Bill_Line__c) {
                    const mappedLines: SupplierBillLine[] = data.Supplier_Bill_Line__c.map((item: any) => ({
                        id: item.Id,
                        name: item.Name,
                        status: item.Status__c,
                        supplierBillName: item.Supplier_Bill_Name,
                        customerQuoteLineName: item.Customer_Quote_Line_Name,
                        purchaseOrderLineName: item.Purchase_Order_Line_Name,
                        productName: item.Product_Name,
                        productDescription: item.Product_Description__c,
                        manufacturerDBA: item.Manufacturer_DBA__c,
                        proposedProduct: item.Proposed_Product_Name,
                        site: item.Site_Name,
                        inventoryAccount: item.Inventory_Account_Name,
                        goodsReceiptDate: item.Goods_Receipt_Date__c,
                        supplierBillLineNotes: item.Supplier_Bill_Line_Notes__c,
                        unitCost: item.Unit_Cost__c,
                        billedQty: item.Billed_Qty__c,
                        billAmount: item.BillAmount__c,
                        shipping: item.Shipping_Charges__c,
                        totalBillAmount: item.Total_Bill_Amount__c,
                    }));

                    setLines(mappedLines);
                    const index = mappedLines.findIndex(l => l.id === lineid);
                    if (index !== -1) setCurrentLineIndex(index);
                }
            } catch (err) {
                console.error("Error fetching lines:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLines();
    }, [id, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    useEffect(() => {
        async function fetchSubTabData() {
            if (!lineid) return;
            try {
                setSubTabLoading(true);
                const [filesRes, debitMemosRes] = await Promise.all([
                    fetch(`/api/salesforce/orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&orderId=${lineid}&action=files&objectName=Supplier_Bill_Line__c`),
                    fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=returns&objectName=Supplier_Bill_Line__c&tabName=Returns`)
                ]);

                const [filesRaw, debitMemosRaw] = await Promise.all([
                    filesRes.json(),
                    debitMemosRes.ok ? debitMemosRes.json() : null
                ]);

                if (filesRaw) {
                    const filesData = Array.isArray(filesRaw) ? filesRaw : (filesRaw.data || []);
                    const mappedFiles = filesData.map((f: any) => ({
                        id: f.ContentVersionId || f.Id,
                        fileName: f.Title || f.Name || '',
                        fileType: (f.FileExtension || f.FileType || '').toUpperCase(),
                        sizeInBytes: f.ContentSize || 0,
                        uploadedBy: f.OwnerName || f.CreatedByName || '',
                        uploadedDate: f.CreatedDate || ''
                    }));
                    setFiles(mappedFiles);
                } else {
                    setFiles([]);
                }

                if (debitMemosRaw && debitMemosRaw.Debit_Memo_Line__c) {
                    setDebitMemoLines(debitMemosRaw.Debit_Memo_Line__c);
                } else {
                    setDebitMemoLines([]);
                }

            } catch (err) {
                console.error("Error fetching sub-tab data:", err);
            } finally {
                setSubTabLoading(false);
            }
        }
        fetchSubTabData();
    }, [lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    const line = lines[currentLineIndex];
    const totalLines = lines.length;
    const lineNumber = currentLineIndex + 1;

    // Navigation helpers
    const hasPrevLine = currentLineIndex > 0;
    const hasNextLine = currentLineIndex < totalLines - 1;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const productImages = [
        { id: 1, label: "Image 1" },
        { id: 2, label: "Image 2" }
    ];

    const handlePrevLine = () => {
        if (hasPrevLine) {
            const prevLine = lines[currentLineIndex - 1];
            router.push(`/supplier-bills/${id}/lines/${prevLine.id}`);
        }
    };

    const handleNextLine = () => {
        if (hasNextLine) {
            const nextLine = lines[currentLineIndex + 1];
            router.push(`/supplier-bills/${id}/lines/${nextLine.id}`);
        }
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center min-h-[400px] min-w-0">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Sidebar>
        );
    }

    if (!line) {
        return (
            <Sidebar>
                <div className="p-8 text-center text-gray-500">
                    Supplier Bill Line not found.
                    <div className="mt-4">
                        <Link href={`/supplier-bills/${id}`} className="text-primary hover:underline truncate">Back to Supplier Bill</Link>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="flex flex-col gap-4 min-w-0">
                {/* Breadcrumb */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1 min-w-0">
                        <Link href="/supplier-bills" className="hover:text-primary truncate">Supplier Bills</Link>
                        <span>&gt;</span>
                        <Link href={`/supplier-bills/${id}`} className="hover:text-primary truncate">Supplier Bill Line</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900 dark:text-white truncate" title={line.name}>{line.name}</span>
                    </div>

                    <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={line.name}>
                                {line.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            <Link href={`/supplier-bills/${id}`} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 truncate">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to SB
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded truncate">
                            Line {lineNumber} of {totalLines}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded text-[10px] uppercase tracking-wider truncate" title={line.status === "Approved" ? "Awarded" : line.status}>
                            {line.status === "Approved" ? "Awarded" : line.status}
                        </span>
                    </div>
                </div>

                {/* Row 1: Image + Line Note + Detailed Information */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
                    {/* Image Carousel (3 of 12) */}
                    <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                        <div className="relative flex-1 flex flex-col">
                            {/* Main Image Display */}
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
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block truncate">
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

                    {/* Supplier Bill Line Note (3 of 12) */}
                    <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate" title="Supplier Bill Line Notes">Supplier Bill Line Notes</h2>
                            </div>
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-700 min-h-[200px] overflow-y-auto">
                            {line.supplierBillLineNotes || "No notes available for this line item."}
                        </div>
                    </div>

                    {/* Product Information (6 of 12) */}
                    <div className="xl:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                        <div className="flex items-center gap-2 mb-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate" title="Product Information">Product Information</h3>
                                <p className="text-xs text-gray-500 truncate" title="Detailed Product Specifications">Detailed Product Specifications</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Column 1 */}
                            <div className="space-y-3">
                                <InfoField label="Product Name" value={line.productName} />
                                <InfoField label="Description" value={line.productDescription} />
                                <InfoField label="Manufacturer DBA" value={line.manufacturerDBA} />
                            </div>
                            {/* Column 2 */}
                            <div className="space-y-3">
                                <InfoField label="Proposed Product" value={line.proposedProduct} />
                                <InfoField label="Customer Quote Line" value={line.customerQuoteLineName} />
                                <InfoField label="Purchase Order Lines" value={line.purchaseOrderLineName} />
                            </div>
                            {/* Column 3 */}
                            <div className="space-y-3">
                                <InfoField label="Site" value={line.site} />
                                <InfoField label="Inventory Account" value={line.inventoryAccount} />
                                <InfoField label="Goods Receipt Date" value={formatDate(line.goodsReceiptDate, 'numeric-dash')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Standard Styled Table Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary-light dark:bg-gray-900">
                                <th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Unit Cost">Unit Cost</th>
                                <th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Billed Qty">Billed Qty</th>
                                <th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Product Amount">Product Amount</th>
                                <th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Shipping">Shipping</th>
                                <th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title="Total Bill Amount">Total Bill Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-gray-900 dark:text-white">
                                <td className="px-4 py-3 text-sm font-medium border-t border-gray-100 dark:border-gray-700 truncate" title={formatCurrency(line.unitCost)}>{formatCurrency(line.unitCost)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 truncate" title={String(line.billedQty)}>{line.billedQty}</td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 truncate" title={formatCurrency(line.billAmount)}>{formatCurrency(line.billAmount)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 truncate" title={formatCurrency(line.shipping)}>{formatCurrency(line.shipping)}</td>
                                <td className="px-4 py-3 text-sm font-bold text-primary border-t border-gray-100 dark:border-gray-700 truncate" title={formatCurrency(line.totalBillAmount)}>{formatCurrency(line.totalBillAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Row 3: Related Items Tabs (Debit Memo Lines, Files) */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    {/* Tabs Header */}
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 mb-6 items-center min-w-0">
                        {[
                            { id: "debitMemos", label: "Debit Memo Lines", count: debitMemoLines.length },
                            { id: "files", label: "Files", count: files.length }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 text-sm font-medium ${activeTab === tab.id
                                    ? "bg-primary text-white"
                                    : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                                title={`${tab.label}${tab.count > 0 ? ` (${tab.count})` : ''}`}
                            >
                                {tab.label}
                                {tab.count > 0 && ` (${tab.count})`}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {subTabLoading ? (
                            <div className="flex justify-center items-center py-20 min-w-0">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === "debitMemos" && (
                                    <div className="space-y-4">
                                        <SBLDebitMemoLinesTab debitMemos={debitMemoLines} />
                                    </div>
                                )}
                                {activeTab === "files" && (
                                    <div className="space-y-4">
                                        <SBLFilesTab files={files} poId={lineid} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons - Below Detail Tabs Card, Right aligned */}
                <div className="flex items-center justify-end gap-2 mt-4 min-w-0">
                    <button
                        onClick={handlePrevLine}
                        disabled={!hasPrevLine}
                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors inline-flex items-center gap-1 truncate ${hasPrevLine
                            ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            : "border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            }`}
                        title="Previous Line"
                    >
                        <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Prev
                    </button>

                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium truncate">
                        {lineNumber}/{totalLines}
                    </span>

                    <button
                        onClick={handleNextLine}
                        disabled={!hasNextLine}
                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors inline-flex items-center gap-1 truncate ${hasNextLine
                            ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            : "border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            }`}
                        title="Next Line"
                    >
                        Next
                        <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </Sidebar>
    );
}

function InfoField({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-500 mb-1.5 truncate" title={label}>
                {label}
            </label>
            <input
                type="text"
                readOnly
                value={value || "-"}
                className={`w-full px-3 py-1.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none cursor-default truncate ${highlight ? "text-primary font-bold border-primary/20 bg-primary/5" : "text-gray-900 dark:text-white"}`}
                title={String(value || "")}
            />
        </div>
    );
}
