"use client";

import React, { useEffect, useState } from "react";
import { formatDate, formatCurrency, displayCell } from "@/lib/utils/formatting";
import { useUserSession } from "@/components/UserSessionContext";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../hooks/useResizableColumns";

export interface ReturnsPreloadedData {
    rmaList: RMA[];
    creditMemos: CreditMemo[];
    debitMemos: DebitMemo[];
    rtvList: RTV[];
}

interface ReturnsTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
    preloadedData?: ReturnsPreloadedData | null;
}

interface RMA {
    Id: string;
    Name: string;
    Status__c: string;
    Issued_Date__c: string;
    Return_by_Date__c: string;
    RMA_Type__c: string;
    Shipping_Method__c: string;
    Tracking_Number__c: string;
    Tracking_Status__c: string;
    Estimated_Delivery_Date__c: string;
    Actual_Delivery_Date__c: string;
    Total_Price__c: number;
    Total_Lines__c: number;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Sales_Order_Name: string;
    Ship_from_Account_Name: string;
    Return_to_Account_Name: string;
}

interface CreditMemo {
    Id: string;
    Name: string;
    Status__c: string;
    Issued_Date__c: string;
    Expiration_Date__c: string;
    Total_Credit_Amount__c: number;
    Available_Credit_Balance__c: number;
    Total_Price__c: number;
    Total_Taxes_Amount__c: number;
    Total_Shipping_Charges__c: number;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Invoice_Name: string;
    Credit_to_Account_Name: string;
}

interface DebitMemo {
    Id: string;
    Name: string;
    Status__c: string;
    Issued_Date__c: string;
    Settled_Date__c: string;
    Total_Debit_Amount__c: number;
    Available_Debit_Balance__c: number;
    Total_Cost__c: number;
    Total_Shipping_Charges__c: number;
    Total_Lines__c: number;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Purchase_Order_Name: string;
    Supplier_Bill_Name: string;
    Debit_to_Account_Name: string;
}

interface RTV {
    Id: string;
    Name: string;
    Status__c: string;
    Issued_Date__c: string;
    Return_by_Date__c: string;
    RTV_Type__c: string;
    Total_Cost__c: number;
    Total_Lines__c: number;
    Supplier_RMA_Number__c: string;
    Supplier_Name: string;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Purchase_Order_Name: string;
    Ship_from_Account_Name: string;
}

export default function ReturnsTab({ orderId, accountId, contactId, onCountChange, preloadedData }: ReturnsTabProps) {
    const { user, selectedAccount } = useUserSession();
    const isCustomerOrNSO = (
        selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'customer' ||
        selectedAccount?.Account_Type__c?.toLowerCase() === 'customer' ||
        user?.role?.toLowerCase() === 'customer' ||
        selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'nso' ||
        selectedAccount?.Account_Type__c?.toLowerCase() === 'nso' ||
        user?.role?.toLowerCase() === 'nso'
    );

    const [rmaList, setRmaList] = useState<RMA[]>([]);
    const [creditMemos, setCreditMemos] = useState<CreditMemo[]>([]);
    const [debitMemos, setDebitMemos] = useState<DebitMemo[]>([]);
    const [rtvList, setRtvList] = useState<RTV[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"rma" | "credits" | "debits" | "rtv">("rma");

    const { items: sortedRmaList, requestSort: requestSortRma, sortConfig: sortConfigRma } = useSortableData(rmaList, { key: 'Name', direction: 'desc' });
    const { items: sortedCreditMemos, requestSort: requestSortCm, sortConfig: sortConfigCm } = useSortableData(creditMemos, { key: 'Name', direction: 'desc' });
    const { items: sortedDebitMemos, requestSort: requestSortDm, sortConfig: sortConfigDm } = useSortableData(debitMemos, { key: 'Name', direction: 'desc' });
    const { items: sortedRtvList, requestSort: requestSortRtv, sortConfig: sortConfigRtv } = useSortableData(rtvList, { key: 'Name', direction: 'desc' });

    const { widths, handleResize } = useResizableColumns({});

    // When preloadedData arrives from the parent, populate state without fetching again
    useEffect(() => {
        if (preloadedData == null) return;
        setRmaList(preloadedData.rmaList);
        setCreditMemos(preloadedData.creditMemos);
        setDebitMemos(preloadedData.debitMemos);
        setRtvList(preloadedData.rtvList);
        setLoading(false);
    }, [preloadedData]);

    // Self-fetch only when no parent is providing preloadedData (preloadedData === undefined)
    useEffect(() => {
        if (preloadedData !== undefined) return;
        async function fetchReturns() {
            if (!orderId || !accountId) return;
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderId=${encodeURIComponent(orderId)}&action=returns`
                );
                if (!res.ok) return;
                const data = await res.json();
                // API returns the whole data object for Returns tab
                const rmaData = data.RMA__c || [];
                const creditData = data.Credit_Memo__c || [];
                const debitData = data.Debit_Memo__c || [];
                const rtvData = data.RTV__c || [];
                setRmaList(rmaData);
                setCreditMemos(creditData);
                setDebitMemos(debitData);
                setRtvList(rtvData);
                onCountChange?.(rmaData.length + creditData.length + (isCustomerOrNSO ? 0 : debitData.length + rtvData.length));
            } catch (e) {
                console.error("Error fetching returns:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchReturns();
    }, [orderId, accountId, contactId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const statusBadge = (status: string) => {
        const s = (status || "").toLowerCase();
        const color =
            s === "approved" || s === "completed"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : s === "pending" || s === "submitted" || s === "draft"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : s === "rejected" || s === "cancelled" || s === "canceled"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                {status || "—"}
            </span>
        );
    };

    const emptyState = (label: string) => (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
            <p className="text-base font-medium">No records found</p>
            <p className="text-sm">There are no {label} associated with this order.</p>
        </div>
    );

    const thClass = "px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 ";
    const tdClass = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 truncate";
    const tdBoldClass = "px-4 py-3 text-sm text-gray-900 dark:text-white font-medium truncate";
    const trClass = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
    const tableClass = "w-full text-sm table-fixed";
    const theadClass = "bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700";
    const tbodyClass = "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700";
    const wrapClass = "overflow-auto rounded-lg border border-gray-200 dark:border-gray-700";


    const tabs = [
        { id: "rma" as const, label: "RMA", count: rmaList.length },
        { id: "credits" as const, label: "Credit Memos", count: creditMemos.length },
        ...(!isCustomerOrNSO ? [
            { id: "debits" as const, label: "Debit Memos", count: debitMemos.length },
            { id: "rtv" as const, label: "RTV", count: rtvList.length },
        ] : []),
    ];

    return (
        <div>
            {/* Sub-tabs - underline style */}
            <div className="flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${activeSubTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* RMA */}
            {activeSubTab === "rma" && (
                rmaList.length === 0 ? emptyState("RMAs") : (
                    <div className={wrapClass}>
                        <table className={tableClass}>
                            <thead className={theadClass}>
                                <tr>
                                    <SortableHeader label="RMA #" field="Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaName || 160} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Type" field="RMA_Type__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaType || 120} onResize={handleResize} />
                                    <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaIssuedDate || 130} onResize={handleResize} />
                                    <SortableHeader label="Return By" field="Return_by_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaReturnBy || 130} onResize={handleResize} />
                                    <SortableHeader label="Shipping Method" field="Shipping_Method__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaShippingMethod || 150} onResize={handleResize} />
                                    <SortableHeader label="Tracking #" field="Tracking_Number__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaTracking || 130} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Sales Order" field="Sales_Order_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaSalesOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaTotal || 120} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {sortedRmaList.map((rma) => (
                                    <tr key={rma.Id} className={trClass}>
                                        <td className={tdBoldClass}>{displayCell(rma.Name)}</td>
                                        <td className="px-4 py-3">{statusBadge(rma.Status__c)}</td>
                                        <td className={tdClass}>{displayCell(rma.RMA_Type__c)}</td>
                                        <td className={tdClass}>{formatDate(rma.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(rma.Return_by_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{displayCell(rma.Shipping_Method__c)}</td>
                                        <td className={tdClass}>{displayCell(rma.Tracking_Number__c)}</td>
                                        <td className={tdClass}>{displayCell(rma.Customer_Order_Name)}</td>
                                        <td className={tdClass}>{displayCell(rma.Sales_Order_Name)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(rma.Total_Price__c ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Credit Memos */}
            {activeSubTab === "credits" && (
                creditMemos.length === 0 ? emptyState("credit memos") : (
                    <div className={wrapClass}>
                        <table className={tableClass}>
                            <thead className={theadClass}>
                                <tr>
                                    <SortableHeader label="Credit Memo #" field="Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmName || 160} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmIssuedDate || 130} onResize={handleResize} />
                                    <SortableHeader label="Expiry Date" field="Expiration_Date__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmExpiry || 130} onResize={handleResize} />
                                    <SortableHeader label="Credit To" field="Credit_to_Account_Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmCreditTo || 150} onResize={handleResize} />
                                    <SortableHeader label="Invoice" field="Invoice_Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmInvoice || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Credit Amount" field="Total_Credit_Amount__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmCreditAmount || 130} onResize={handleResize} />
                                    <SortableHeader label="Available Balance" field="Available_Credit_Balance__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmAvailBalance || 140} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {sortedCreditMemos.map((cm) => (
                                    <tr key={cm.Id} className={trClass}>
                                        <td className={tdBoldClass}>{displayCell(cm.Name)}</td>
                                        <td className="px-4 py-3">{statusBadge(cm.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(cm.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(cm.Expiration_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{displayCell(cm.Credit_to_Account_Name)}</td>
                                        <td className={tdClass}>{displayCell(cm.Invoice_Name)}</td>
                                        <td className={tdClass}>{displayCell(cm.Customer_Order_Name)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(cm.Total_Credit_Amount__c ?? 0)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(cm.Available_Credit_Balance__c ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Debit Memos */}
            {activeSubTab === "debits" && (
                debitMemos.length === 0 ? emptyState("debit memos") : (
                    <div className={wrapClass}>
                        <table className={tableClass}>
                            <thead className={theadClass}>
                                <tr>
                                    <SortableHeader label="Debit Memo #" field="Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmName || 160} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmIssuedDate || 130} onResize={handleResize} />
                                    <SortableHeader label="Settled Date" field="Settled_Date__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmSettled || 130} onResize={handleResize} />
                                    <SortableHeader label="Debit To" field="Debit_to_Account_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmDebitTo || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmPurchaseOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Supplier Bill" field="Supplier_Bill_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmSupplierBill || 150} onResize={handleResize} />
                                    <SortableHeader label="Debit Amount" field="Total_Debit_Amount__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmDebitAmount || 130} onResize={handleResize} />
                                    <SortableHeader label="Available Balance" field="Available_Debit_Balance__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmAvailBalance || 140} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {sortedDebitMemos.map((dm) => (
                                    <tr key={dm.Id} className={trClass}>
                                        <td className={tdBoldClass}>{displayCell(dm.Name)}</td>
                                        <td className="px-4 py-3">{statusBadge(dm.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(dm.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(dm.Settled_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{displayCell(dm.Debit_to_Account_Name)}</td>
                                        <td className={tdClass}>{displayCell(dm.Customer_Order_Name)}</td>
                                        <td className={tdClass}>{displayCell(dm.Purchase_Order_Name)}</td>
                                        <td className={tdClass}>{displayCell(dm.Supplier_Bill_Name)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(dm.Total_Debit_Amount__c ?? 0)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(dm.Available_Debit_Balance__c ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* RTV */}
            {activeSubTab === "rtv" && (
                rtvList.length === 0 ? emptyState("RTVs") : (
                    <div className={wrapClass}>
                        <table className={tableClass}>
                            <thead className={theadClass}>
                                <tr>
                                    <SortableHeader label="RTV #" field="Name" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvName || 160} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Type" field="RTV_Type__c" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvType || 120} onResize={handleResize} />
                                    <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvIssuedDate || 130} onResize={handleResize} />
                                    <SortableHeader label="Return By" field="Return_by_Date__c" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvReturnBy || 130} onResize={handleResize} />
                                    <SortableHeader label="Supplier" field="Supplier_Name" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvSupplier || 150} onResize={handleResize} />
                                    <SortableHeader label="Supplier RMA #" field="Supplier_RMA_Number__c" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvSupplierRma || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvPurchaseOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Total Cost" field="Total_Cost__c" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvTotal || 120} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {sortedRtvList.map((rtv) => (
                                    <tr key={rtv.Id} className={trClass}>
                                        <td className={tdBoldClass}>{displayCell(rtv.Name)}</td>
                                        <td className="px-4 py-3">{statusBadge(rtv.Status__c)}</td>
                                        <td className={tdClass}>{displayCell(rtv.RTV_Type__c)}</td>
                                        <td className={tdClass}>{formatDate(rtv.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(rtv.Return_by_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{displayCell(rtv.Supplier_Name)}</td>
                                        <td className={tdClass}>{displayCell(rtv.Supplier_RMA_Number__c)}</td>
                                        <td className={tdClass}>{displayCell(rtv.Customer_Order_Name)}</td>
                                        <td className={tdClass}>{displayCell(rtv.Purchase_Order_Name)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(rtv.Total_Cost__c ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
