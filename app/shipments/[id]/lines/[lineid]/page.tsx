"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { formatDate } from "@/lib/utils/formatting";

import ProductInformationCard from "./components/ProductInformationCard";
import MetricsTable from "./components/MetricsTable";
import BottomTabs from "./components/BottomTabs";
import { useUserSession } from "@/components/UserSessionContext";

// Interface for shipping manifest line item from Salesforce
interface ManifestLineItem {
    Id: string;
    Name: string;
    Status__c?: string;
    Product_Name?: string;
    Product_Name__c?: string;
    Product_Description__c?: string;
    Manufacturer_DBA__c?: string;
    Product_Family__c?: string;
    HTS_Code__c?: string;
    Proposed_Product_Name?: string;
    Proposed_Product__c?: string;
    Customer_Quote_Line_Name?: string;
    Customer_Quote_Line__c?: string;
    Sales_Order_Line_Name?: string;
    Sales_Order_Line__c?: string;
    Tracking_URL__c?: string;
    Tracking_Number__c?: string;
    Tracking_Status__c?: string;
    Estimated_Delivery_Date__c?: string;
    Shipping_Manifest_Line_Notes__c?: string;

    Unit_Price__c?: number;
    Total_Order_Qty__c?: number;
    Total_Price__c?: number;
    Qty_Shipped__c?: number;
    Box__c?: number;
    Case_Length__c?: number;
    Case_Width__c?: number;
    Case_Height__c?: number;
    Case_Net_Weight__c?: number;
    Case_Gross_Weight__c?: number;
    Case_DW_139__c?: number;
    Case_DW_166__c?: number;
}

export default function ShipmentLineDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [manifestLines, setManifestLines] = useState<ManifestLineItem[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [inventoryCount, setInventoryCount] = useState<number | undefined>(undefined);
    const [serialCount, setSerialCount] = useState<number | undefined>(undefined);
    const [filesCount, setFilesCount] = useState<number | undefined>(undefined);

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";

    useEffect(() => {
        async function fetchLineData() {
            try {
                setLoading(true);
                const [res, inventoryRes, serialRes, filesRes] = await Promise.allSettled([
                    fetch(`/api/salesforce/shipments?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&objectId=${encodeURIComponent(id)}&tabName=Products`),
                    fetch(`/api/salesforce/shipments?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&objectId=${encodeURIComponent(lineid)}&objectName=Shipping_Manifest_Line__c&tabName=Inventory`),
                    fetch(`/api/salesforce/shipments?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&objectId=${encodeURIComponent(lineid)}&objectName=Shipping_Manifest_Line__c&tabName=Serial_Numbers`),
                    fetch(`/api/salesforce/shipments?action=files&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&objectId=${encodeURIComponent(lineid)}&objectName=Shipping_Manifest_Line__c`),
                ]);

                if (res.status === "rejected" || !res.value.ok) {
                    throw new Error(`Failed to fetch shipment lines`);
                }

                const json = await res.value.json();

                let linesData: ManifestLineItem[] = [];
                if (json && json.data && json.data.length > 0) {
                    const firstItem = json.data[0];
                    if (firstItem.Shipping_Manifest_Line__c) {
                        linesData = firstItem.Shipping_Manifest_Line__c;
                    }
                }

                if (linesData.length > 0) {
                    setManifestLines(linesData);
                    const lineIndex = linesData.findIndex(p => p.Id === lineid);
                    if (lineIndex >= 0) {
                        setCurrentLineIndex(lineIndex);
                    }
                }

                // ── Inventory count ───────────────────────────────────────────────
                if (inventoryRes.status === "fulfilled" && inventoryRes.value.ok) {
                    const invJson = await inventoryRes.value.json();
                    const invRows: any[] = invJson?.data?.[0]?.Inventory_Position__c ?? [];
                    setInventoryCount(invRows.length);
                }

                // ── Serial Number count ───────────────────────────────────────────
                if (serialRes.status === "fulfilled" && serialRes.value.ok) {
                    const serialJson = await serialRes.value.json();
                    const serialRows: any[] = serialJson?.data?.[0]?.Serial_Number_Log__c ?? [];
                    setSerialCount(serialRows.length);
                }

                // ── Files count ───────────────────────────────────────────────────
                if (filesRes.status === "fulfilled" && filesRes.value.ok) {
                    const filesJson = await filesRes.value.json();
                    const filesRows: any[] = Array.isArray(filesJson) ? filesJson : [];
                    setFilesCount(filesRows.length);
                }
            } catch (error) {
                console.error("Error fetching shipment line data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchLineData();
        }
    }, [id, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    const product = manifestLines[currentLineIndex];
    const totalLines = manifestLines.length;
    const lineNumber = currentLineIndex + 1;

    const productImages = [
        { id: 1, label: "Image 1" },
        { id: 2, label: "Image 2" },
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [activeTab, setActiveTab] = useState<"inventory" | "serial" | "files">("inventory");

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
                    <p className="text-gray-500 truncate" title="Shipping manifest line not found.">Shipping manifest line not found.</p>
                    <Link href={`/shipments/${id}`} className="text-primary hover:underline mt-4 block truncate">Back to Shipment</Link>
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
                            <span>Shipping Manifest</span>
                            <span>&gt;</span>
                            <Link href={`/shipments/${id}`} className="hover:underline truncate">Shipment Details</Link>
                            <span>&gt;</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">Shipment Line</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white " title={product.Name}>{product.Name}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-0">
                        <button
                            onClick={() => router.push(`/shipments/${id}`)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-[#A7C7E7] text-white rounded shadow-sm hover:bg-[#8FB8DE] transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Shipment
                        </button>
                        <div className="flex items-center pt-6 justify-center bg-[#E5F1E5] text-[#2E7A2E] text-sm font-semibold rounded" style={{ padding: '0.125rem 0.5rem', marginTop: '6px' }}>
                            {product.Status__c || "Draft"}
                        </div>
                    </div>

                </div>
                <div className="flex items-center gap-2 mt-2 min-w-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">
                        (Line {lineNumber} of {totalLines})
                    </span>
                </div>
            </div>

            {/* Row 1: Main Image + Notes + Product Information */}
            <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4 mb-4 items-stretch">
                {/* Main Image with Carousel - 25% width (3 of 12 cols) */}
                <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm  p-4 h-full flex flex-col">
                    <div className="relative flex-1 flex flex-col">
                        {/* Main Image Display */}
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-1 min-h-[180px]">
                            <div className="text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block truncate">
                                    {productImages[currentImageIndex]?.label || "Image"}
                                </span>
                            </div>
                        </div>

                        {/* Carousel Navigation Arrows */}
                        <button
                            onClick={() => setCurrentImageIndex(i => (i - 1 + productImages.length) % productImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => setCurrentImageIndex(i => (i + 1) % productImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Carousel Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {productImages.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notes - 25% width (3 of 12 cols) */}
                <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ">
                    <div className="flex items-center gap-3 mb-6 min-w-0">
                        <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-gray-800 tracking-tight " title="Shipping Manifest Line Notes">Shipping Manifest Line Notes</h2>
                        </div>
                    </div>
                    <div>
                        <div className="w-full min-h-[340px] p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 overflow-y-auto">
                            {product.Shipping_Manifest_Line_Notes__c || "No notes available."}
                        </div>
                    </div>
                </div>

                {/* Product Information Card - 50% width (6 of 12 cols) */}
                <ProductInformationCard product={product} />
            </div>

            {/* Metrics Table */}
            <MetricsTable product={product} />

            {/* Bottom Tabs Card */}
            <BottomTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                accountId={SF_ACCOUNT_ID}
                contactId={SF_CONTACT_ID}
                lineId={lineid}
                initialCounts={{ inventory: inventoryCount, serial: serialCount, files: filesCount }}
            />

            {/* Navigation Buttons - Below Tabs, Right aligned */}
            <div className="flex items-center justify-end gap-2 mt-4 min-w-0">
                {currentLineIndex > 0 ? (
                    <Link
                        href={`/shipments/${id}/lines/${manifestLines[currentLineIndex - 1]?.Id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1 truncate"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Prev
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed truncate">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Prev
                    </span>
                )}

                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 font-medium truncate">
                    {lineNumber}/{totalLines}
                </span>

                {currentLineIndex < totalLines - 1 ? (
                    <Link
                        href={`/shipments/${id}/lines/${manifestLines[currentLineIndex + 1]?.Id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1 truncate"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed truncate">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                )}
            </div>
        </Sidebar>
    );
}
