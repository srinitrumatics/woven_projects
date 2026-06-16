"use client";

import React, { useEffect, useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { useUserSession } from "@/components/UserSessionContext";

interface ReturnsTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
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

export default function ReturnsTab({ orderId, accountId, contactId }: ReturnsTabProps) {
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

    useEffect(() => {
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
                setRmaList(data.RMA__c || []);
                setCreditMemos(data.Credit_Memo__c || []);
                setDebitMemos(data.Debit_Memo__c || []);
                setRtvList(data.RTV__c || []);
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

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 ";
    const tdClass = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 truncate";
    const tdBoldClass = "px-4 py-3 text-sm text-gray-900 dark:text-white font-medium truncate";
    const trClass = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
    const tableClass = "w-full text-sm";
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
                                    <th className={thClass}>RMA #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Type</th>
                                    <th className={thClass}>Issued Date</th>
                                    <th className={thClass}>Return By</th>
                                    <th className={thClass}>Shipping Method</th>
                                    <th className={thClass}>Tracking #</th>
                                    <th className={thClass}>Customer Order</th>
                                    <th className={thClass}>Sales Order</th>
                                    <th className={`${thClass} text-right`}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {rmaList.map((rma) => (
                                    <tr key={rma.Id} className={trClass}>
                                        <td className={tdBoldClass}>{rma.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(rma.Status__c)}</td>
                                        <td className={tdClass}>{rma.RMA_Type__c || "—"}</td>
                                        <td className={tdClass}>{formatDate(rma.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(rma.Return_by_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{rma.Shipping_Method__c || "—"}</td>
                                        <td className={tdClass}>{rma.Tracking_Number__c || "—"}</td>
                                        <td className={tdClass}>{rma.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{rma.Sales_Order_Name || "—"}</td>
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
                                    <th className={thClass}>Credit Memo #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Issued Date</th>
                                    <th className={thClass}>Expiry Date</th>
                                    <th className={thClass}>Credit To</th>
                                    <th className={thClass}>Invoice</th>
                                    <th className={thClass}>Customer Order</th>
                                    <th className={`${thClass} text-right`}>Credit Amount</th>
                                    <th className={`${thClass} text-right`}>Available Balance</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {creditMemos.map((cm) => (
                                    <tr key={cm.Id} className={trClass}>
                                        <td className={tdBoldClass}>{cm.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(cm.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(cm.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(cm.Expiration_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{cm.Credit_to_Account_Name || "—"}</td>
                                        <td className={tdClass}>{cm.Invoice_Name || "—"}</td>
                                        <td className={tdClass}>{cm.Customer_Order_Name || "—"}</td>
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
                                    <th className={thClass}>Debit Memo #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Issued Date</th>
                                    <th className={thClass}>Settled Date</th>
                                    <th className={thClass}>Debit To</th>
                                    <th className={thClass}>Customer Order</th>
                                    <th className={thClass}>Purchase Order</th>
                                    <th className={thClass}>Supplier Bill</th>
                                    <th className={`${thClass} text-right`}>Debit Amount</th>
                                    <th className={`${thClass} text-right`}>Available Balance</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {debitMemos.map((dm) => (
                                    <tr key={dm.Id} className={trClass}>
                                        <td className={tdBoldClass}>{dm.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(dm.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(dm.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(dm.Settled_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{dm.Debit_to_Account_Name || "—"}</td>
                                        <td className={tdClass}>{dm.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{dm.Purchase_Order_Name || "—"}</td>
                                        <td className={tdClass}>{dm.Supplier_Bill_Name || "—"}</td>
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
                                    <th className={thClass}>RTV #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Type</th>
                                    <th className={thClass}>Issued Date</th>
                                    <th className={thClass}>Return By</th>
                                    <th className={thClass}>Supplier</th>
                                    <th className={thClass}>Supplier RMA #</th>
                                    <th className={thClass}>Customer Order</th>
                                    <th className={thClass}>Purchase Order</th>
                                    <th className={`${thClass} text-right`}>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {rtvList.map((rtv) => (
                                    <tr key={rtv.Id} className={trClass}>
                                        <td className={tdBoldClass}>{rtv.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(rtv.Status__c)}</td>
                                        <td className={tdClass}>{rtv.RTV_Type__c || "—"}</td>
                                        <td className={tdClass}>{formatDate(rtv.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(rtv.Return_by_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{rtv.Supplier_Name || "—"}</td>
                                        <td className={tdClass}>{rtv.Supplier_RMA_Number__c || "—"}</td>
                                        <td className={tdClass}>{rtv.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{rtv.Purchase_Order_Name || "—"}</td>
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
