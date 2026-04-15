"use client";

import { use, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { PurchaseOrder } from "../types";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

// Component Imports
import POHeader from "./components/POHeader";
import POKeyDates from "./components/POKeyDates";
import POSupplierInfo from "./components/POSupplierInfo";
import POShipToInfo from "./components/POShipToInfo";
import POSummary from "./components/POSummary";
import POTabs from "./components/POTabs";
import POLinesTable from "./components/POLinesTable";
import POFilesTable from "./components/POFilesTable";
import POSupplierBillsTable from "./components/POSupplierBillsTable";
import POSerialNumbersTable from "./components/POSerialNumbersTable";
import POReturnsTab from "./components/POReturnsTab";
import TrackingInformationTab from "./components/TrackingInformationTab";
import { useUserSession } from "@/components/UserSessionContext";

type POTabType = "lines" | "bills" | "serialNumbers" | "returns" | "tracking" | "files";

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [po, setPo] = useState<PurchaseOrder | null>(null);
    const [poLines, setPoLines] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [serialNumbers, setSerialNumbers] = useState<any[]>([]);
    const [debitMemos, setDebitMemos] = useState<any[]>([]);
    const [rtv, setRtv] = useState<any[]>([]);
    const [tracking, setTracking] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<POTabType>("lines");

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";

    const fetchPOData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=view&tabName=Purchase_Order`);
            if (!res.ok) throw new Error('Failed to fetch PO data');
            const data = await res.json();

            if (data?.Purchase_Order__c?.[0]) {
                const p = data.Purchase_Order__c[0];
                setPo({
                    id: p.Id,
                    name: p.Name || '',
                    status: p.Status__c || '',
                    customerQuoteName: p.Customer_Quote_Name || '',
                    customerOrderName: p.Customer_Order_Name || '',
                    customerPO: p.Customer_PO__c || '',
                    supplierName: p.Supplier_Name || p.Supplier__r?.Name || p.Supplier_Name__c || '',
                    supplierDBA: p.Supplier_DBA__c || '',
                    supplierContact: p.Supplier_Contact_Name || p.Supplier_Contact__c || '',
                    billToAccountName: p.Bill_to_Account_Name || '',
                    shipToAccountName: p.Ship_to_Account_Name || '',
                    shipToLocationName: p.Authorized_Ship_To_Location_Name || '',
                    shipToContactName: p.Ship_to_Contact_Name || '',
                    dropShip: p.Drop_Ship__c || false,
                    totalLines: p.Total_Lines__c || 0,
                    productCost: p.Total_Product_Cost__c || 0,
                    shippingCost: p.Total_Shipping_Charges__c || 0,
                    totalCost: p.Total_Cost__c || 0,
                    issuedDate: p.Issued_Date__c || '',
                    acknowledgedDate: p.Acknowledged_Date__c || '',
                    requestDate: p.Request_Date__c || '',
                    promiseDate: p.Promise_Date__c || '',
                    shippingMethod: p.Shipping_Method__c || '',
                    logisticsPartner: p.Logistics_Partner_Name || '',
                    logisticsContact: p.Logistics_Contact_Name || '',
                    trackingNumber: p.Tracking_Number__c || '',
                    serviceLevel: p.Service_Level__c || '',
                    trackingUrl: p.Tracking_URL__c || '',
                    estimatedDeliveryDate: p.Estimated_Delivery_Date__c || '',
                    trackingStatus: p.Tracking_Status__c || '',
                    actualDeliveryDate: p.Actual_Delivery_Date__c || '',
                    goodsReceiptsDate: p.Goods_Receipt_Date__c || '',
                    poNotes: p.PO_Notes__c || '',
                    proposalName: p.Proposal_Name || '',
                    billingAddress: p.Bill_to_Account_Address || null,
                    shippingAddress: p.Authorized_Ship_To_Location_Address || null,
                    paymentTerms: p.Payment_Terms__c || '',
                    siteName: p.Site_Name || '',
                    buyerName: p.Owner_Name || ''
                });
            }

            const [linesRes, billsRes, returnsRes, filesRes, serialRes] = await Promise.all([
                fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Products`),
                fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=bills&tabName=Purchases&objectName=Purchase_Order__c`),
                fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=returns&tabName=Returns&objectName=Purchase_Order__c`),
                fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=files&objectName=Purchase_Order__c`),
                fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=serialNumbers&tabName=Serial_Numbers&objectName=Purchase_Order__c`)
            ]);

            if (linesRes.ok) {
                const linesData = await linesRes.json();
                console.log('PO Lines Raw Response:', linesData);
                setPoLines(linesData?.Purchase_Order_Line__c || []);
            }
            if (billsRes.ok) {
                const billsData = await billsRes.json();
                console.log('PO Bills Raw Response:', billsData);
                setBills(billsData?.Supplier_Bill__c || []);
            }
            if (returnsRes.ok) {
                const returnsData = await returnsRes.json();
                console.log('PO Returns Raw Response:', returnsData);
                setDebitMemos(returnsData?.Debit_Memo_Line__c || returnsData?.Debit_Memo__c || []);
                setRtv(returnsData?.RTV_Line__c || returnsData?.RTV__c || []);
            }
            if (filesRes.ok) {
                const filesResponse = await filesRes.json();
                console.log('PO Files Raw Response:', filesResponse);
                // Files could be directly the array or wrapped in a data property
                const filesData = Array.isArray(filesResponse) ? filesResponse : (filesResponse.data || []);
                const mappedFiles = filesData.map((f: any) => ({
                    id: f.ContentVersionId || f.Id,
                    fileName: f.Title || f.Name || '',
                    fileType: (f.FileExtension || f.FileType || '').toUpperCase(),
                    sizeInBytes: f.FileSize || 0,
                    uploadedBy: f.CreatedBy || '',
                    uploadedDate: f.CreatedDate || ''
                }));
                setFiles(mappedFiles);
            }
            if (serialRes.ok) {
                const serialData = await serialRes.json();
                console.log('PO Serial Numbers Raw Response:', serialData);
                setSerialNumbers(serialData?.Serial_Number_Log__c || []);
            }

            // For Tracking
            if (data?.Tracking_Information__c) {
                setTracking(data.Tracking_Information__c || []);
            } else if (data?.Purchase_Order__c?.[0]) {
                const p = data.Purchase_Order__c[0];
                setTracking([{
                    Logistics_Partner__c: p.Logistics_Partner_Name || '',
                    Logistics_Contact__c: p.Logistics_Contact_Name || '',
                    Shipping_Method__c: p.Shipping_Method__c || '',
                    Service_Level__c: p.Service_Level__c || '',
                    Tracking_URL__c: p.Tracking_URL__c || '',
                    Tracking_Number__c: p.Tracking_Number__c || '',
                    Tracking_Status__c: p.Tracking_Status__c || '',
                    Estimated_Delivery_Date__c: p.Estimated_Delivery_Date__c || '',
                    Actual_Delivery_Date__c: p.Actual_Delivery_Date__c || ''
                }]);
            } else {
                setTracking([]);
            }

        } catch (error) {
            console.error("Error fetching PO data:", error);
        } finally {
            setLoading(false);
        }
    }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    useEffect(() => {
        fetchPOData();
    }, [fetchPOData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setIsUploading(true);
        // Reuse upload logic (conceptual here)
        setTimeout(() => setIsUploading(false), 2000);
    };

    const handleDownloadPDF = () => {
        alert("Downloading Purchase Order PDF...");
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex h-[80vh] items-center justify-center min-w-0">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg truncate" title="Loading PO Details...">Loading PO Details...</p>
                    </div>
                </div>
            </Sidebar>
        );
    }

    if (!po) {
        return (
            <Sidebar>
                <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 ">Purchase Order Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 truncate" title="The purchase order you're looking for doesn't exist or you don't have access.">The purchase order you're looking for doesn't exist or you don't have access.</p>
                    <button onClick={() => router.push("/purchase-orders")} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Back to List</button>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <POHeader poNumber={po.name} status={po.status} supplierName={po.supplierName} onBack={() => router.push("/purchase-orders")} />

            <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6">
                {/* Left Column (Details, Billing, Shipping) */}
                <div className="w1025:col-span-7 flex flex-col gap-6">
                    <POKeyDates po={po} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <POSupplierInfo po={po} />
                        <POShipToInfo po={po} />
                    </div>
                </div>

                {/* Right Column (Notes, Summary) */}
                <div className="w1025:col-span-3 flex flex-col gap-6 h-full">
                    {/* PO Notes */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-fit min-h-[180px]">
                        <div className="flex items-center gap-3 mb-6 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Purchase Order Notes">Purchase Order Notes</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Special Instructions or Notes">Special Instructions or Notes</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <textarea
                                readOnly
                                className="w-full  p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:ring-0"
                                value={po.poNotes || "No special notes for this purchase order."}
                                placeholder="No special notes."
                            />
                        </div>
                    </div>

                    <POSummary
                        po={po}
                        poLines={poLines}
                        isUploading={isUploading}
                        handleFileUpload={handleFileUpload}
                        handleDownloadPDF={handleDownloadPDF}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Tab section Matched to Proposal */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 min-w-0">
                    <div className="w-full lg:flex-1 min-w-0">
                        <POTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            counts={{
                                lines: poLines.length,
                                bills: bills.length,
                                serialNumbers: serialNumbers.length,
                                returns: debitMemos.length + rtv.length,
                                tracking: tracking.length,
                                files: files.length
                            }}
                        />
                    </div>
                </div>

                <div className="p-4">
                    {activeTab === "lines" && <POLinesTable lines={poLines} poId={id} />}
                    {activeTab === "bills" && <POSupplierBillsTable bills={bills} />}
                    {activeTab === "serialNumbers" && <POSerialNumbersTable serialNumbers={serialNumbers} />}
                    {activeTab === "returns" && <POReturnsTab debitMemos={debitMemos} rtv={rtv} />}
                    {activeTab === "tracking" && <TrackingInformationTab data={tracking} />}
                    {activeTab === "files" && <POFilesTable files={files} poId={id} />}
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] gap-4 sm:gap-0 z-40">
                <button
                    onClick={() => router.push("/purchase-orders")}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
            </div>

            <div className="h-20" />
        </Sidebar>
    );
}

