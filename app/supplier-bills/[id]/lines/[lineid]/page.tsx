"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { SupplierBillLine } from "../../../types";
import SBLFilesTab from "./components/SBLFilesTab";
import SBLDebitMemoLinesTab from "./components/SBLDebitMemoLinesTab";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import ProductGallery from "@/components/ui/ProductGallery";
import { parsePhotoUrls } from "@/lib/utils/product-images";

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

    const { user, selectedAccount } = useUserSession();
    const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
    const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";

    useEffect(() => {
        async function fetchLines() {
            if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
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
                        supplierBillId: item.Supplier_Bill__c,
                        customerQuoteLineName: item.Customer_Quote_Line_Name,
                        customerQuoteId: item.Customer_Quote__c || item.Customer_Quote_Line__r?.Customer_Quote__c,
                        customerQuoteLineId: item.Customer_Quote_Line__c,
                        purchaseOrderLineName: item.Purchase_Order_Line_Name,
                        purchaseOrderId: item.Purchase_Order__c || item.Purchase_Order_Line__r?.Purchase_Order__c,
                        purchaseOrderLineId: item.Purchase_Order_Line__c,
                        customerOrderName: item.Customer_Order_Name,
                        customerOrderId: item.Customer_Order__c,
                        productName: item.Product_Name,
                        productDescription: item.Product_Description__c,
                        manufacturerDBA: item.Manufacturer_DBA__c,
                        brand: item.Brand_Name__c || item.Brand__c,
                        productFamily: item.Product_Family__c || item.Product_Family || item.Family,
                        proposedProduct: item.Proposed_Product_Name,
                        proposedProductId: item.Proposed_Product__c,
                        proposalId: item.Proposal__c || item.Proposed_Product__r?.Proposal__c || item.Customer_Quote_Line__r?.Proposal__c,
                        site: item.Site_Name,
                        siteId: item.Site__c,
                        inventoryAccount: item.Inventory_Account_Name,
                        goodsReceiptDate: item.Goods_Receipt_Date__c,
                        shipmentId: item.Shipping_Manifest__c,
                        shipmentName: item.Shipping_Manifest_Name,
                        supplierBillLineNotes: item.Supplier_Bill_Line_Notes__c,
                        unitCost: item.Unit_Cost__c,
                        billedQty: item.Billed_Qty__c,
                        billAmount: item.BillAmount__c,
                        shipping: item.Shipping_Charges__c,
                        totalBillAmount: item.Total_Bill_Amount__c,
                        images: parsePhotoUrls(item.Image_URL__c),
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
            if (!lineid || !SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
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
                        sizeInBytes: f.FileSize || 0,
                        uploadedBy: f.CreatedBy || f.CreatedByName || '',
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
                    <LoadingSpinner size="md" />
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
                        <Link href={`/supplier-bills/${id}`} className="hover:text-primary truncate">Supplier Bill Details</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900 dark:text-white truncate" title={line.name}>Supplier Bill Line</span>
                    </div>

                    <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white " title={line.name}>
                                {line.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            <Link href={`/supplier-bills/${id}`} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 truncate">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Supplier Bill
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded truncate">
                            Line {lineNumber} of {totalLines}
                        </span>
                        <StatusBadge status={line.status} />
                    </div>
                </div>

                {/* Row 1: Image + Line Note + Detailed Information */}
                <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4 mb-4 items-stretch">
                    {/* Product Image (3 of 12) */}
                    <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                        <ProductGallery images={line.images || []} />
                    </div>

                    {/* Supplier Bill Line Note (3 of 12) */}
                    <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white " title="Supplier Bill Line Notes">Supplier Bill Line Notes</h2>
                            </div>
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-700 min-h-[200px] overflow-y-auto">
                            {line.supplierBillLineNotes || "No notes available for this line item."}
                        </div>
                    </div>

                    {/* Product Information (6 of 12) */}
                    <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                        <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white " title="Product Information">Product Information</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Detailed Product Specifications">Detailed Product Specifications</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3">
                            <InfoField label="Product Name" value={line.productName} />
                            <InfoField label="Description" value={line.productDescription} />
                            <InfoField label="Product Family" value={line.productFamily} />

                            <InfoField label="Brand Name" value={line.brand} />
                            <InfoField label="Inventory Account" value={line.inventoryAccount} />
                            <InfoField label="Site" value={line.site} />

                            <InfoField label="Purchase Order Line" value={line.purchaseOrderLineName} />
                            <InfoField label="Customer Quote Line" value={line.customerQuoteLineName} />
                            <InfoField label="Proposed Product Line" value={line.proposedProduct} />
                        </div>
                    </div>
                </div>

                {/* Row 2: Standard Styled Table Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-4 pb-2 mb-4">
                    <div className="overflow-x-auto">
                        <Table className="text-left border-collapse">
                            <THead>
                                <tr>
                                    <Th className="py-2 font-bold">Unit Cost</Th>
                                    <Th className="py-2 font-bold">Billed Qty</Th>
                                    <Th className="py-2 font-bold">Product Amount</Th>
                                    <Th className="py-2 font-bold">Shipping</Th>
                                    <Th className="py-2 font-bold">Total Bill Amount</Th>
                                    <Th className="py-2 font-bold">Goods Receipt Date</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <Tr>
                                    <Td className="font-medium truncate" title={formatCurrency(line.unitCost)}>{formatCurrency(line.unitCost)}</Td>
                                    <Td className="font-medium truncate" title={String(line.billedQty)}>{line.billedQty}</Td>
                                    <Td className="font-bold truncate" title={formatCurrency(line.billAmount)}>{formatCurrency(line.billAmount)}</Td>
                                    <Td className="font-medium truncate" title={formatCurrency(line.shipping)}>{formatCurrency(line.shipping)}</Td>
                                    <Td className="font-bold text-primary truncate" title={formatCurrency(line.totalBillAmount)}>{formatCurrency(line.totalBillAmount)}</Td>
                                    <Td className="font-medium truncate" title={formatDate(line.goodsReceiptDate, 'numeric-dash')}>{formatDate(line.goodsReceiptDate, 'numeric-dash')}</Td>
                                </Tr>
                            </TBody>
                        </Table>
                    </div>
                </div>

                {/* Row 3: Related Items Tabs (Debit Memo Lines, Files) */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-3">
                    {/* Tabs Header */}
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2  items-center min-w-0">
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

                    <div className="px-6 py-3">
                        {subTabLoading ? (
                            <div className="flex justify-center items-center py-20 min-w-0">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : (
                            <>
                                {activeTab === "debitMemos" && (
                                    <div className="space-y-4">
                                        <SBLDebitMemoLinesTab debitMemos={debitMemoLines} id={id} />
                                    </div>
                                )}
                                {activeTab === "files" && (
                                    <div className="space-y-4">
                                        <SBLFilesTab files={files} />
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

function InfoField({ label, value, highlight = false, href }: { label: string, value: any, highlight?: boolean, href?: string }) {
    const isLink = !!href;
    const commonClasses = `w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none cursor-default truncate ${highlight ? "text-primary font-bold border-primary/20 bg-primary/5" : "text-gray-900 dark:text-white"}`;

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1.5 truncate" title={label}>
                {label}
            </label>
            {isLink ? (
                <Link
                    href={href}
                    className={`${commonClasses} flex items-center bg-gray-50/50 dark:bg-gray-900/50 text-primary hover:underline font-bold transition-all shadow-sm active:scale-[0.98]`}
                    title={String(value || "")}
                >
                    {value || "-"}
                </Link>
            ) : (
                <input
                    type="text"
                    readOnly
                    value={value || "-"}
                    className={`${commonClasses} bg-gray-50/50 dark:bg-gray-900/50 `}
                    title={String(value || "")}
                />
            )}
        </div>
    );
}

