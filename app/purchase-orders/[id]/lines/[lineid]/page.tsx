"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { PurchaseOrderLine } from "../../../types";
import POSupplierBillLinesTable from "./components/POSupplierBillLinesTable";
import POSerialNumberLogLinesTab from "./components/poserialnumberloglinestab";
import POReturnsTab from "./components/POReturnsTab";

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

    const [activeTab, setActiveTab] = useState<"bills" | "returns" | "serialNumbers" | "files">("bills");
    const [bills, setBills] = useState<any[]>([]);
    const [debitMemos, setDebitMemos] = useState<any[]>([]);
    const [rtv, setRtv] = useState<any[]>([]);
    const [serialNumbers, setSerialNumbers] = useState<any[]>([]);
    const [subTabLoading, setSubTabLoading] = useState(false);

    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

    useEffect(() => {
        async function fetchLines() {
            try {
                setLoading(true);
                const res = await fetch(`/api/salesforce/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Products&objectName=Purchase_Order__c`);
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
                const [billsRes, returnsRes, serialRes] = await Promise.all([
                    fetch(`/api/salesforce/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=bills&objectName=Purchase_Order_Line__c&tabName=Purchases`),
                    fetch(`/api/salesforce/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=returns&objectName=Purchase_Order_Line__c&tabName=Returns`),
                    fetch(`/api/salesforce/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${lineid}&action=serialNumbers&objectName=Purchase_Order_Line__c&tabName=Serial_Numbers`)
                ]);

                const [billsData, returnsData, serialData] = await Promise.all([
                    billsRes.json(),
                    returnsRes.json(),
                    serialRes.json()
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

    if (loading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                        <Link href={`/purchase-orders/${id}`} className="text-primary hover:underline">Back to Purchase Order</Link>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="flex flex-col gap-4">
                {/* Breadcrumb - Compact style from Proposals */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Link href="/purchase-orders" className="hover:text-primary">Purchase Orders</Link>
                        <span>&gt;</span>
                        <Link href={`/purchase-orders/${id}`} className="hover:text-primary">Purchase Order Details</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900 dark:text-white">{line.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {line.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Prev/Next line navigation */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-4">
                                <button
                                    onClick={handlePrevLine}
                                    disabled={!hasPrevLine}
                                    className={`p-1.5 rounded-md transition-colors ${hasPrevLine ? "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-sm" : "text-gray-400 cursor-not-allowed"}`}
                                    title="Previous Line"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={handleNextLine}
                                    disabled={!hasNextLine}
                                    className={`p-1.5 rounded-md transition-colors ${hasNextLine ? "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-sm" : "text-gray-400 cursor-not-allowed"}`}
                                    title="Next Line"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            <Link href={`/purchase-orders/${id}`} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to PO
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            Line {lineNumber} of {totalLines}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded text-[10px] uppercase tracking-wider">
                            {line.status === "Approved" ? "Awarded" : line.status}
                        </span>
                    </div>
                </div>

                {/* Row 1: Image + Line Note + Detailed Information */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
                    {/* Image Carousel (3 of 12) */}
                    <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col min-h-[300px]">
                        <div className="relative flex-1 flex flex-col">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center flex-1">
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    <span className="text-xs text-gray-400 mt-2 block">{productImages[currentImageIndex].label}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 px-2">
                                <button onClick={handlePrevImage} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600">&lt;</button>
                                <div className="flex gap-1.5">
                                    {productImages.map((_, idx) => (
                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`} />
                                    ))}
                                </div>
                                <button onClick={handleNextImage} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600">&gt;</button>
                            </div>
                        </div>
                    </div>

                    {/* Purchase Order Line Note (3 of 12) */}
                    <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Purchase Order Line Note</h2>
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 min-h-[200px] overflow-y-auto italic">
                            {line.poLineNotes || "No notes available for this line item."}
                        </div>
                    </div>

                    {/* Product Information (6 of 12) */}
                    <div className="xl:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Product Information</h3>
                                <p className="text-xs text-gray-500">Detailed Product Specifications</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Column 1 */}
                            <div className="space-y-3">
                                <InfoField label="Product Name" value={line.productName} />
                                <InfoField label="Description" value={line.productDescription} />
                                <InfoField label="Manufacturer DBA" value={line.manufacturerDBA} />
                                <InfoField label="Product Family" value={line.productFamily} />
                            </div>
                            {/* Column 2 */}
                            <div className="space-y-3">
                                <InfoField label="Need by Date" value={formatDate(line.needByDate, 'numeric-dash')} />
                                <InfoField label="Ship by Date" value={formatDate(line.shipByDate, 'numeric-dash')} />
                                <InfoField label="Promise Date" value={formatDate(line.promiseDate, 'numeric-dash')} />
                                <InfoField label="Goods Receipt Date" value={formatDate(line.goodsReceiptDate, 'numeric-dash')} />
                            </div>
                            {/* Column 3 */}
                            <div className="space-y-3">
                                <InfoField label="Tracking Number" value={line.trackingNumber} />
                                <InfoField label="Tracking Status" value={line.trackingStatus} />
                                <InfoField label="Estimated Delivery Date" value={formatDate(line.estimatedDeliveryDate, 'numeric-dash')} />
                                <InfoField label="Actual Delivery Date" value={formatDate(line.actualDeliveryDate, 'numeric-dash')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Standard Styled Table Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary-light dark:bg-gray-900">
                                <th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Unit Price</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Order Qty</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">MOQ</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Total Order Qty</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Total Price</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Shipping</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Taxes</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Grand Total</th><th className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">Qty Shipped</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-gray-900 dark:text-white">
                                <td className="px-4 py-3 text-sm font-medium ">{formatCurrency(line.unitCost)}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{line.orderQty}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{line.moq}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{line.totalOrderQty}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{formatCurrency(line.totalProductCost)}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{formatCurrency(line.shippingCharges)}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{formatCurrency(0)}</td><td className="px-4 py-3 text-sm font-bold text-blue-400">{formatCurrency(line.totalCost)}</td><td className="px-4 py-3 text-sm font-medium text-gray-500">{line.qtyShipped || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Row 3: Related Items Tabs (Supplier Bills, Serial Numbers, Returns, Files) */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    {/* Tabs Header */}
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 mb-6 items-center">
                        {[
                            { id: "bills", label: "Supplier Bill Line", count: bills.length },
                            { id: "serialNumbers", label: "Serial Numbers", count: serialNumbers.length },
                            { id: "returns", label: "Returns", count: debitMemos.length + rtv.length },
                            { id: "files", label: "File", count: 0 }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 text-sm font-medium ${activeTab === tab.id
                                    ? "bg-primary text-white"
                                    : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && ` (${tab.count})`}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {subTabLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg text-gray-400 text-sm italic">No files attached to this line item.</div>
                                )}
                            </>
                        )}
                    </div>
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

function CompactInfoField({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) {
    return (
        <div className="flex flex-col gap-1 min-w-[100px]">
            <label className="text-[10px] font-bold uppercase tracking-tight text-gray-400 whitespace-nowrap">
                {label}
            </label>
            <div className={`text-sm font-semibold truncate ${highlight ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"}`}>
                {value || "-"}
            </div>
        </div>
    );
}
