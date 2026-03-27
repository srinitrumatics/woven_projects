"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from "@/components/layouts/Sidebar";
import SupplierBillHeader from './components/SupplierBillHeader';
import SupplierBillDetail from './components/SupplierBillDetail';
import SupplierBillNotes from './components/SupplierBillNotes';
import BillingInformation from './components/BillingInformation';
import ShippingInformation from './components/ShippingInformation';
import SupplierBillSummary from './components/SupplierBillSummary';
import SupplierBillTabs from './components/SupplierBillTabs';
import SupplierBillLinesTable from './components/SupplierBillLinesTable';
import SupplierBillFilesTable from './components/SupplierBillFilesTable';
import SupplierBillPaymentsTab from './components/SupplierBillPaymentsTab';
import { SupplierBill, SupplierBillLine, BillPayment, AppliedDebitMemo } from '../types';

export default function SupplierBillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [bill, setBill] = useState<SupplierBill | null>(null);
    const [lines, setLines] = useState<SupplierBillLine[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
    const [appliedDebits, setAppliedDebits] = useState<AppliedDebitMemo[]>([]);
    const [activeTab, setActiveTab] = useState('lines');
    const [isLoading, setIsLoading] = useState(true);

    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

    useEffect(() => {
        if (!id || !SF_ACCOUNT_ID || !SF_CONTACT_ID) return;

        async function fetchData() {
            setIsLoading(true);
            try {
                // 1. Fetch main bill record
                const billRes = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=view&tabName=Supplier_Bill`);
                const billData = await billRes.json();

                if (billData && billData.Supplier_Bill__c && billData.Supplier_Bill__c.length > 0) {
                    const b = billData.Supplier_Bill__c[0];
                    const a = billData.Billing_Information__c?.[0] || {};
                    setBill({
                        id: b.Id,
                        name: b.Name || '',
                        status: b.Status__c || '',
                        apRep: b.Owner_Name || '',
                        purchaseOrderName: b.Purchase_Order_Name || b.Purchase_Order__r?.Name || '',
                        customerQuoteName: b.Customer_Quote_Name || '',
                        customerOrderName: b.Customer_Order_Name || '',
                        proposalName: b.Proposal_Name || '',
                        supplierName: b.Supplier_Name__c || '',
                        supplierDBA: b.Supplier_DBA__c || '',
                        supplierContact: b.Supplier_Contact__c || '',
                        totalLines: b.Total_Lines__c || 0,
                        totalProductAmount: b.Total_Product_Amount__c || 0,
                        totalShippingCharges: b.Total_Shipping_Charges__c || 0,
                        totalAmount: b.TotalAmount__c || b.Total_Amount__c || 0,
                        billedDate: b.Billed_Date__c || b.BillDate__c || b.Bill_Date__c || '',
                        paymentTerms: b.Payment_Terms__c || b.PaymentTerms__c || '',
                        dueDate: b.Due_Date__c || '',
                        remittanceStatus: b.Remittance_Status__c || b.RemittanceStatus__c || '',
                        openBalance: b.Open_Balance__c || b.OpenBalance__c || 0,
                        daysOutstanding: b.Days_Outstanding__c || b.DaysOutstanding__c || 0,
                        settledDate: b.Settled_Date__c || b.SettledDate__c || '',
                        billToAccount: a.Bill_To_Account__c || '',
                        billToLocation: a.Bill_To_Location__c || '',
                        billingAddress: a.Address__c || '',
                        shipToAccount: b.Ship_to_Account_Name || b.Ship_to_Account__c || (b.Ship_to_Account__r as any)?.Name || '',
                        shipToLocation: b.Authorized_Ship_To_Location_Name || b.Authorized_Ship_To_Location__c || (b.Authorized_Ship_To_Location__r as any)?.Name || '',
                        shippingAddress: b.Authorized_Ship_To_Location_Address.street || '',
                        site: b.Site_Name || '',
                        goodsReceiptDate: b.Goods_Receipt_Date__c || '',
                        productsSubtotal: b.Total_Product_Amount__c || 0,
                        servicesSubtotal: b.Total_Service_Amount__c || 0,
                        amountPaid: b.Total_Amount_Paid__c || 0,
                        appliedDebits: b.Total_Applied_Debit_Amount__c || 0,
                        notes: b.Supplier_Bill_Notes__c || '',
                        productLineCount: b.Total_Product_Lines__c || b.Total_Lines__c || 0,
                        serviceLineCount: b.Total_Service_Lines__c || 0,
                    });
                }

                // 2. Fetch lines
                const linesRes = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Products`);
                const linesData = await linesRes.json();
                if (linesData && linesData.Supplier_Bill_Line__c) {
                    const mappedLines = linesData.Supplier_Bill_Line__c.map((l: any) => ({
                        id: l.Id,
                        name: l.Name || '',
                        status: l.Status__c || '',
                        supplierBillName: l.Supplier_Bill_Name || '',
                        customerQuoteLineName: l.Customer_Quote_Line_Name || '',
                        purchaseOrderLineName: l.Purchase_Order_Line_Name || '',
                        productName: l.Product_Name || '',
                        productDescription: l.Product_Description__c || '',
                        manufacturerDBA: l.Manufacturer_DBA__c || '',
                        unitCost: l.Unit_Cost__c || 0,
                        billedQty: l.Billed_Qty__c || 0,
                        billAmount: l.BillAmount__c || 0,
                        shipping: l.Shipping_Charges__c || 0,
                        totalBillAmount: l.Total_Bill_Amount__c || 0,
                        goodsReceiptDate: l.Goods_Receipt_Date__c || '',
                    }));
                    setLines(mappedLines);

                    // Update bill counts only if we actually found lines to count
                    if (mappedLines.length > 0) {
                        setBill(prev => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                productLineCount: Math.ceil(mappedLines.length / 2),
                                serviceLineCount: Math.floor(mappedLines.length / 2)
                            };
                        });
                    }
                }

                // 3. Fetch files
                const filesRes = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&objectName=Supplier_Bill__c&action=files`);
                const filesData = await filesRes.json();
                setFiles(filesData.map((f: any) => ({
                    id: f.ContentVersionId,
                    fileName: f.Title,
                    fileType: f.FileType,
                    sizeInBytes: f.ContentSize,
                    uploadedBy: f.CreatedBy,
                    uploadedDate: f.CreatedDate
                })));

                // 4. Fetch Payments and Debits
                try {
                    let newAppliedDebits: any[] = [];
                    const paymentsRes = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Payments`);
                    if (paymentsRes.ok) {
                        const paymentsData = await paymentsRes.json();
                        if (paymentsData) {
                            if (paymentsData.Bill_Payment__c) {
                                setBillPayments(paymentsData.Bill_Payment__c.map((p: any) => ({
                                    id: p.Id,
                                    name: p.Name || '',
                                    status: p.Status__c || '',
                                    amount: p.Amount__c || 0,
                                    paymentMethod: p.Payment_Method__c || '',
                                    referenceNo: p.Reference_No__c || '',
                                    transactionDate: p.Transaction_Date__c || '',
                                    scheduledDate: p.Scheduled_Date__c || '',
                                    failedDate: p.Failed_Date__c || '',
                                    postedDate: p.Posted_Date__c || '',
                                    supplierBillName: p.Supplier_Bill_Name || '',
                                })));
                            }
                            if (paymentsData.Applied_Debit_Memo__c) {
                                newAppliedDebits = [...newAppliedDebits, ...paymentsData.Applied_Debit_Memo__c.map((d: any) => ({
                                    id: d.Id,
                                    name: d.Name || '',
                                    status: d.Status__c || '',
                                    debitMemoName: d.Debit_Memo_Name || '',
                                    supplierBillName: d.Supplier_Bill_Name || '',
                                    appliedAmount: d.Applied_Amount__c || 0,
                                    availableDebitBalance: d.Available_Debit_Balance__c || 0,
                                    appliedDate: d.Applied_Date__c || '',
                                    postedDate: d.Posted_Date__c || '',
                                    notes: d.Applied_Debit_Memo_Notes__c || '',
                                }))];
                            }
                        }
                    }

                    const returnsRes = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&action=lines&tabName=Returns`);
                    if (returnsRes.ok) {
                        const returnsData = await returnsRes.json();
                        if (returnsData && returnsData.Applied_Debit_Memo__c) {
                            newAppliedDebits = [...newAppliedDebits, ...returnsData.Applied_Debit_Memo__c.map((d: any) => ({
                                id: d.Id,
                                name: d.Name || '',
                                status: d.Status__c || '',
                                debitMemoName: d.Debit_Memo_Name || '',
                                supplierBillName: d.Supplier_Bill_Name || '',
                                appliedAmount: d.Applied_Amount__c || 0,
                                availableDebitBalance: d.Available_Debit_Balance__c || 0,
                                appliedDate: d.Applied_Date__c || '',
                                postedDate: d.Posted_Date__c || '',
                                notes: d.Applied_Debit_Memo_Notes__c || '',
                            }))];
                        }
                    }

                    // Remove duplicates just in case both APIs returned the same records
                    const uniqueDebits = Array.from(new Map(newAppliedDebits.map(item => [item.id, item])).values());
                    setAppliedDebits(uniqueDebits);
                } catch (e) {
                    console.error("Error fetching payments data:", e);
                }

            } catch (error) {
                console.error("Error fetching supplier bill details:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    if (isLoading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center h-screen min-w-0">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Sidebar>
        );
    }

    if (!bill) {
        return (
            <Sidebar>
                <div className="p-4 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white mt-10 mx-6">
                    Supplier Bill not found
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <SupplierBillHeader
                billNumber={bill.name}
                status={bill.status}
                supplierName={bill.supplierName}
                onBack={() => router.push('/supplier-bills')}
            />

            {/* Details grid */}
            <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6">
                {/* Row 1 — Details (7) + Notes (3) */}
                <div className="w1025:col-span-7">
                    <SupplierBillDetail bill={bill} />
                </div>
                <div className="w1025:col-span-3">
                    <SupplierBillNotes bill={bill} />
                </div>

                {/* Row 2 — Billing + Shipping (7) + Summary (3) */}
                <div className="w1025:col-span-7">
                    <div className="flex flex-col gap-6 min-w-0">
                        <BillingInformation bill={bill} />
                        <ShippingInformation bill={bill} />
                    </div>
                </div>
                <div className="w1025:col-span-3">
                    <SupplierBillSummary bill={bill} />
                </div>
            </div>

            {/* Third Row: Tabs and Content */}
            <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <SupplierBillTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            counts={{
                                lines: lines.length,
                                payments: billPayments.length + appliedDebits.length,
                                files: files.length
                            }}
                        />
                    </div>
                    <div className="flex-1 p-6">
                        {activeTab === 'lines' && <SupplierBillLinesTable lines={lines} />}
                        {activeTab === 'payments' && <SupplierBillPaymentsTab billPayments={billPayments} appliedDebits={appliedDebits} />}
                        {activeTab === 'files' && <SupplierBillFilesTable files={files} billId={id} />}
                    </div>
                </div>
            </div>

            {/* Floating action bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] z-40">
                <button
                    onClick={() => router.push('/supplier-bills')}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    Back to Supplier Bills
                </button>
                <div className="flex items-center gap-3 min-w-0">

                </div>
            </div>

            <div className="h-24" />
        </Sidebar>
    );
}
