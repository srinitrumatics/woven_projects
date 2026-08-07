"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Tabs from "@/components/ui/Tabs";
import { PurchaseOrderLine } from "../../../types";
import POSupplierBillLinesTable from "./components/POSupplierBillLinesTable";
import POSerialNumberLogLinesTab from "./components/POSerialNumberLogLinesTab";
import POReturnsTab from "./components/POReturnsTab";
import FileTabsLines from "./components/FileTabsLines";
import { useUserSession } from "@/components/UserSessionContext";

export default function POLineDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    const [promiseDate, setPromiseDate] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [savedPromiseDate, setSavedPromiseDate] = useState("");
    const [savedTrackingNumber, setSavedTrackingNumber] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const [activeTab, setActiveTab] = useState<"bills" | "returns" | "serialNumbers" | "files">("bills");
    const [bills, setBills] = useState<any[]>([]);
    const [debitMemos, setDebitMemos] = useState<any[]>([]);
    const [rtv, setRtv] = useState<any[]>([]);
    const [serialNumbers, setSerialNumbers] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [subTabLoading, setSubTabLoading] = useState(false);

    const { user, selectedAccount } = useUserSession();
    const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
    const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";

    useEffect(() => {
        if (lines[currentLineIndex]) {
            const currentLine = lines[currentLineIndex];
            const loadedPromiseDate = currentLine.promiseDate ? currentLine.promiseDate.split("T")[0] : "";
            const loadedTrackingNumber = currentLine.trackingNumber || "";
            setPromiseDate(loadedPromiseDate);
            setTrackingNumber(loadedTrackingNumber);
            setSavedPromiseDate(loadedPromiseDate);
            setSavedTrackingNumber(loadedTrackingNumber);
            setSaveError("");
            setIsEditing(false);
        }
    }, [lines, currentLineIndex]);

    useEffect(() => {
        async function fetchLines() {
            if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
            try {
                setLoading(true);
                const res = await fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Products&objectName=Purchase_Order__c`);
                if (!res.ok) throw new Error("Failed to fetch lines");
                const data = await res.json();

                if (data && data.Purchase_Order_Line__c) {
                    const mappedLines: PurchaseOrderLine[] = data.Purchase_Order_Line__c.map((item: any) => ({
                        id: item.Id,
                        name: item.Name,
                        status: item.Status__c,
                        purchaseOrderName: item.Purchase_Order_Name,
                        purchaseOrder: item.Purchase_Order__c,
                        productName: item.Product_Name,
                        productDescription: item.Product_Description__c,
                        productFamily: item.Product_Family,
                        productRecordType: item.Product_Record_Type__c,
                        manufacturerDBA: item.Manufacturer_DBA__c,
                        brand: item.Brand_Name__c || "-",
                        unitCost: item.Unit_Cost__c,
                        totalProductCost: item.Total_Product_Cost__c,
                        shippingCharges: item.Shipping_Charges__c,
                        totalCost: item.Total_Cost__c,
                        totalOrderQty: item.Total_Order_Qty__c,
                        orderQty: item.Order_Qty__c,
                        openBalanceQty: item.Open_Balance_Qty__c,
                        moq: item.MOQ__c,
                        leadTimeWks: item.Lead_Time_Wks__c,
                        transitLTDays: item.Transit_LT_Days__c,
                        promiseDate: item.Promise_Date__c,
                        shipByDate: item.Ship_by_Date__c,
                        needByDate: item.Need_By_Date__c,
                        goodsReceiptDate: item.Goods_Receipt_Date__c,
                        actualDeliveryDate: item.Actual_Delivery_Date__c,
                        estimatedDeliveryDate: item.Estimated_Delivery_Date__c,
                        trackingNumber: item.Tracking_Number__c,
                        trackingStatus: item.Tracking_Status__c,
                        invoiceStatus: item.Invoice_Status__c,
                        poLineNotes: item.Purchase_Order_Line_Notes__c,
                        customerQuoteLineName: item.Customer_Quote_Line_Name,
                        customerQuoteLine: item.Customer_Quote_Line__c,
                        customerQuoteId: item.Customer_Quote__c,
                        customerOrderId: item.Customer_Order__c,
                        customerOrderName: item.Customer_Order_Name,
                        customerPO: item.Customer_PO__c,
                        shipmentId: item.Shipping_Manifest__c,
                        shipmentName: item.Shipping_Manifest_Name || item.Shipping_Manifest__r?.Name,
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
                const [billsRes, returnsRes, serialRes, filesRes] = await Promise.all([
                    fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=bills&objectName=Purchase_Order_Line__c&tabName=Purchases`),
                    fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=returns&objectName=Purchase_Order_Line__c&tabName=Returns`),
                    fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=serialNumbers&objectName=Purchase_Order_Line__c&tabName=Serial_Numbers`),
                    fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=files&objectName=Purchase_Order_Line__c`)
                ]);

                const [billsData, returnsData, serialData, filesRaw] = await Promise.all([
                    billsRes.json(),
                    returnsRes.json(),
                    serialRes.json(),
                    filesRes.json()
                ]);

                if (billsData && billsData.Supplier_Bill_Line__c) {
                    setBills(billsData.Supplier_Bill_Line__c);
                } else {
                    setBills([]);
                }

                if (returnsData) {
                    setDebitMemos(returnsData.Debit_Memo_Line__c || []);
                    setRtv(returnsData.RTV_Line__c || []);
                } else {
                    setDebitMemos([]);
                    setRtv([]);
                }

                setSerialNumbers(serialData.Serial_Number_Log__c || []);

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

            } catch (err) {
                console.error("Error fetching sub-tab data:", err);
            } finally {
                setSubTabLoading(false);
            }
        }
        fetchSubTabData();
    }, [lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    const line = lines[currentLineIndex];
    const isLineEditable = line ? (line.status === "Draft" || line.status === "Approved") : false;
    const totalLines = lines.length;
    const lineNumber = currentLineIndex + 1;

    // Navigation helpers
    const hasPrevLine = currentLineIndex > 0;
    const hasNextLine = currentLineIndex < totalLines - 1;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const productImages = [
        { id: 1, label: "Image 1" },
        { id: 2, label: "Image 2" },
        { id: 3, label: "Image 3" },
    ];

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => prev === 0 ? productImages.length - 1 : prev - 1);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => prev === productImages.length - 1 ? 0 : prev + 1);
    };

    const handlePrevLine = () => {
        if (hasPrevLine) {
            const prevLine = lines[currentLineIndex - 1];
            router.push(`/purchase-orders/${id}/lines/${prevLine.id}`);
        }
    };

    const handleNextLine = () => {
        if (hasNextLine) {
            const nextLine = lines[currentLineIndex + 1];
            router.push(`/purchase-orders/${id}/lines/${nextLine.id}`);
        }
    };

    const hasUnsavedLineChanges = trackingNumber !== savedTrackingNumber || promiseDate !== savedPromiseDate;

    const handleCancelEdit = () => {
        setTrackingNumber(savedTrackingNumber);
        setPromiseDate(savedPromiseDate);
        setSaveError("");
        setIsEditing(false);
    };

    const handleSaveLine = async () => {
        if (!line || !hasUnsavedLineChanges) return;

        setSaving(true);
        setSaveError("");
        try {
            const body: Record<string, string> = {
                accountId: SF_ACCOUNT_ID,
                contactId: SF_CONTACT_ID,
            };
            if (trackingNumber !== savedTrackingNumber) body.trackingNumber = trackingNumber;
            if (promiseDate !== savedPromiseDate) body.promiseDate = promiseDate;

            const res = await fetch(`/api/purchase-orders?lineId=${line.id}&purchaseOrderId=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.error || "Failed to save changes");
            }

            const updatedTrackingNumber = data.trackingNumber ?? trackingNumber;
            const updatedPromiseDate = data.promiseDate ? String(data.promiseDate).split("T")[0] : promiseDate;

            setTrackingNumber(updatedTrackingNumber);
            setPromiseDate(updatedPromiseDate);
            setSavedTrackingNumber(updatedTrackingNumber);
            setSavedPromiseDate(updatedPromiseDate);
            setLines((prevLines) => prevLines.map((l, idx) =>
                idx === currentLineIndex ? { ...l, trackingNumber: updatedTrackingNumber, promiseDate: updatedPromiseDate } : l
            ));
            setIsEditing(false);
        } catch (err: any) {
            console.error("Error saving purchase order line:", err);
            setSaveError(err?.message || "Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
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
                    Purchase Order Line not found.
                    <div className="mt-4">
                        <Link href={`/purchase-orders/${id}`} className="text-primary hover:underline truncate">Back to Purchase Order</Link>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="flex flex-col gap-4 min-w-0">
                {/* Breadcrumb - Compact style from Proposals */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1 min-w-0">
                        <Link href="/purchase-orders" className="hover:text-primary truncate">Purchase Orders</Link>
                        <span>&gt;</span>
                        <Link href={`/purchase-orders/${id}`} className="hover:text-primary truncate">Purchase Order Details</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900 dark:text-white truncate" title={line.name}>Purchase Order Line</span>
                    </div>

                    <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white " title={line.name}>
                                {line.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                            {isLineEditable && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1.5 text-sm rounded-lg transition-colors inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 truncate"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit
                                </button>
                            )}
                            {isEditing && (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="px-3 py-1.5 text-sm rounded-lg transition-colors inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 truncate disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveLine}
                                        disabled={!hasUnsavedLineChanges || saving}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors inline-flex items-center gap-2 font-bold truncate ${hasUnsavedLineChanges && !saving
                                            ? "bg-primary text-white hover:bg-primary/90"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </>
                            )}
                            <Link href={`/purchase-orders/${id}`} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 font-bold truncate">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Purchase Order
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded truncate">
                            Line {lineNumber} of {totalLines}
                        </span>
                        <StatusBadge status={line.status} />
                        {isEditing && saveError && (
                            <span className="text-xs text-red-600 dark:text-red-400 truncate" title={saveError}>
                                {saveError}
                            </span>
                        )}
                    </div>
                </div>

                {/* Row 1: Image + Line Note + Detailed Information */}
                <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4 mb-4 items-stretch">
                    {/* Image Carousel (3 of 12) */}
                    <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
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
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors truncate"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors truncate"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

                    {/* Purchase Order Line Note (3 of 12) */}
                    <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white " title="Purchase Order Line Notes">Purchase Order Line Notes</h2>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-sm text-gray-800 dark:text-white min-h-[200px]">
                                <p className="text-gray-700 truncate">{line.poLineNotes || "No notes available."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Information (6 of 12) */}
                    <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                        <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white " title="Product Information">Product Information</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Detailed Product Specifications">Detailed Product Specifications</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Product Name">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={line.productName || ""}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={line.productName || ""}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Description">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={line.productDescription || "No description available"}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={line.productDescription || "No description available"}
                                />
                            </div>

                            {/* Brand Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Brand Name">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={line.brand || "—"}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={line.brand || "—"}
                                />
                            </div>

                            {/* Need by Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Need by Date">
                                    Need by Date
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formatDate(line.needByDate, 'numeric-dash') || "—"}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={formatDate(line.needByDate, 'numeric-dash') || "—"}
                                />
                            </div>

                            {/* Ship by Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Ship by Date">
                                    Ship by Date
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formatDate(line.shipByDate, 'numeric-dash') || "—"}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={formatDate(line.shipByDate, 'numeric-dash') || "—"}
                                />
                            </div>

                            {/* Promise Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Promise Date">
                                    Promise Date
                                </label>
                                {(isLineEditable && isEditing) ? (
                                    <input
                                        type="date"
                                        value={promiseDate}
                                        onChange={(e) => { setPromiseDate(e.target.value); setSaveError(""); }}
                                        className="w-full h-11 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none truncate"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        value={formatDate(line.promiseDate, 'numeric-dash') || "—"}
                                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                        title={formatDate(line.promiseDate, 'numeric-dash') || "—"}
                                    />
                                )}
                            </div>

                            {/* Tracking Number */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Tracking Number">
                                    Tracking Number
                                </label>
                                {(isLineEditable && isEditing) ? (
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => { setTrackingNumber(e.target.value); setSaveError(""); }}
                                        placeholder="Enter tracking #"
                                        className="w-full h-11 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none truncate"
                                        title={trackingNumber}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        value={line.trackingNumber || "—"}
                                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                        title={line.trackingNumber || "—"}
                                    />
                                )}
                            </div>

                            {/* Tracking Status */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Tracking Status">
                                    Tracking Status
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={line.trackingStatus || "—"}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={line.trackingStatus || "—"}
                                />
                            </div>

                            {/* Estimated Delivery Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Estimated Delivery Date">
                                    Estimated Delivery Date
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formatDate(line.estimatedDeliveryDate, 'numeric-dash') || "—"}
                                    className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-text focus:outline-none truncate"
                                    title={formatDate(line.estimatedDeliveryDate, 'numeric-dash') || "—"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Standard Styled Table Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto p-4 mb-4">
                    <Table className="text-left border-collapse text-sm">
                        <THead>
                            <tr>
                                <Th className="py-2 font-bold">Unit Cost</Th>
                                <Th className="py-2 font-bold">Total Order Qty</Th>
                                <Th className="py-2 font-bold">Total Product Cost</Th>
                                <Th className="py-2 font-bold">Shipping</Th>
                                <Th className="py-2 font-bold">Total Cost</Th>
                                <Th className="py-2 font-bold">LT (Wks)</Th>
                                <Th className="py-2 font-bold">Transit LT (Days)</Th>
                                <Th className="py-2 font-bold">Open Balance Qty</Th>
                                <Th className="py-2 font-bold">Goods Receipt Date</Th>
                            </tr>
                        </THead>
                        <TBody>
                            <Tr>
                                <Td className="font-medium truncate">{formatCurrency(line.unitCost)}</Td>
                                <Td className="font-medium truncate" title={`${line.totalOrderQty ?? line.orderQty ?? 0} (MOQ:${line.moq ?? 1})`}>
                                    {line.totalOrderQty ?? line.orderQty ?? 0} (MOQ:{line.moq ?? 1})
                                </Td>
                                <Td className="font-bold truncate">{formatCurrency(line.totalProductCost)}</Td>
                                <Td className="font-medium truncate">{formatCurrency(line.shippingCharges)}</Td>
                                <Td className="font-bold text-primary truncate">{formatCurrency(line.totalCost)}</Td>
                                <Td className="font-medium truncate">{line.leadTimeWks ?? "-"}</Td>
                                <Td className="font-medium truncate">{line.transitLTDays || 0} days</Td>
                                <Td className="font-medium truncate">{line.openBalanceQty || 0}</Td>
                                <Td className="font-medium truncate" title={line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : '-'}>
                                    {line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : '-'}
                                </Td>
                            </Tr>
                        </TBody>
                    </Table>
                </div>


                {/* Row 3: Related Items Tabs (Supplier Bills, Serial Numbers, Returns, Files) */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    {/* Tabs Header */}
                    <Tabs
                        tabs={[
                            { key: "bills", label: "Supplier Bill Line", count: bills.length },
                            { key: "serialNumbers", label: "Serial Numbers", count: serialNumbers.length },
                            { key: "returns", label: "Returns", count: debitMemos.length + rtv.length },
                            { key: "files", label: "File", count: files.length },
                        ]}
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as typeof activeTab)}
                        className="pb-2 items-center min-w-0"
                    />

                    <div className="py-2">
                        {subTabLoading ? (
                            <div className="flex justify-center items-center py-20 min-w-0">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : (
                            <>
                                {activeTab === "bills" && (
                                    <div className="space-y-4">

                                        <POSupplierBillLinesTable lines={bills} />
                                    </div>
                                )}
                                {activeTab === "serialNumbers" && (
                                    <div className="space-y-4">
                                        <POSerialNumberLogLinesTab serialNumbers={serialNumbers} />
                                    </div>
                                )}
                                {activeTab === "returns" && (
                                    <div className="space-y-4">
                                        <POReturnsTab debitMemos={debitMemos} rtv={rtv} />
                                    </div>
                                )}
                                {activeTab === "files" && (
                                    <div className="space-y-4">
                                        <FileTabsLines files={files} poLineId={lineid} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons - Below Detail Tabs Card, Right aligned */}
                <div className="flex items-center justify-end gap-2 mt-4 min-w-0">
                    {/* Previous Line Button */}
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

                    {/* Line indicator */}
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium truncate">
                        {lineNumber}/{totalLines}
                    </span>

                    {/* Next Line Button */}
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
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-500 mb-1.5 " title={label}>
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

