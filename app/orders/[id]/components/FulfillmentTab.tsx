"use client";

import React, { useEffect, useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

interface FulfillmentTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
}

interface Invoice {
    Id: string;
    Name: string;
    Status__c: string;
    Issued_Date__c: string;
    Due_Date__c: string;
    Grand_Total__c: number;
    Open_Balance__c: number;
    Total_Price__c: number;
    Total_Taxes_Amount__c: number;
    Total_Shipping_Charges__c: number;
    Payment_Terms__c: string;
    Collection_Status__c: string;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Sales_Order_Name: string;
    Bill_to_Account_Name: string;
    Ship_to_Account_Name: string;
}

interface ShippingManifest {
    Id: string;
    Name: string;
    Status__c: string;
    Ship_Date__c: string;
    Delivered_Date__c: string;
    Actual_Delivery_Date__c: string;
    Estimated_Delivery_Date__c: string;
    Tracking_Number__c: string;
    Tracking_Status__c: string;
    Tracking_URL__c: string;
    Shipping_Method__c: string;
    Total_Price__c: number;
    Customer_Order_Name: string;
    Sales_Order_Name: string;
    Ship_to_Account_Name: string;
}

interface SalesOrder {
    Id: string;
    Name: string;
    Status__c: string;
    Ship_Date__c: string;
    Delivered_Date__c: string;
    Request_Date__c: string;
    Grand_Total__c: number;
    Total_Price__c: number;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Ship_to_Account_Name: string;
    Bill_to_Account_Name: string;
}

export default function FulfillmentTab({ orderId, accountId, contactId }: FulfillmentTabProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [manifests, setManifests] = useState<ShippingManifest[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"salesOrders" | "manifests" | "invoices">("salesOrders");

    useEffect(() => {
        async function fetchFulfillment() {
            if (!orderId || !accountId) return;
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderId=${encodeURIComponent(orderId)}&action=fulfillment`
                );
                if (!res.ok) return;
                const data = await res.json();
                // API returns the whole data object for Fulfillment tab
                setInvoices(data.Invoice__c || []);
                setManifests(data.Shipping_Manifest__c || []);
                setSalesOrders(data.Sales_Order__c || []);
            } catch (e) {
                console.error("Error fetching fulfillment:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchFulfillment();
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
            s === "delivered" || s === "paid" || s === "allocated"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : s === "shipped" || s === "in progress"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : s === "pending" || s === "open" || s === "draft"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : s === "cancelled" || s === "canceled"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base font-medium">No records found</p>
            <p className="text-sm">There are no {label} associated with this order.</p>
        </div>
    );

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider";
    const tdClass = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 truncate";
    const tdBoldClass = "px-4 py-3 text-sm text-gray-900 dark:text-white font-medium truncate";

    return (
        <div>
            {/* Sub-tabs - underline style */}
            <div className="flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveSubTab("salesOrders")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                        activeSubTab === "salesOrders"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                    Sales Orders {salesOrders.length > 0 && `(${salesOrders.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("manifests")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                        activeSubTab === "manifests"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                    Shipping Manifests {manifests.length > 0 && `(${manifests.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("invoices")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                        activeSubTab === "invoices"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                    Invoices {invoices.length > 0 && `(${invoices.length})`}
                </button>
            </div>

            {/* Sales Orders */}
            {activeSubTab === "salesOrders" && (
                salesOrders.length === 0 ? emptyState("sales orders") : (
                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className={thClass}>Sales Order #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Customer Order</th>
                                    <th className={thClass}>Quote</th>
                                    <th className={thClass}>Ship Date</th>
                                    <th className={thClass}>Ship To Account</th>
                                    <th className={`${thClass} text-right`}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {salesOrders.map((so) => (
                                    <tr key={so.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{so.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(so.Status__c)}</td>
                                        <td className={tdClass}>{so.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{so.Customer_Quote_Name || "—"}</td>
                                        <td className={tdClass}>{formatDate(so.Ship_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{so.Ship_to_Account_Name || "—"}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(so.Total_Price__c ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Shipping Manifests */}
            {activeSubTab === "manifests" && (
                manifests.length === 0 ? emptyState("shipping manifests") : (
                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className={thClass}>Manifest #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Ship Date</th>
                                    <th className={thClass}>Est. Delivery</th>
                                    <th className={thClass}>Actual Delivery</th>
                                    <th className={thClass}>Shipping Method</th>
                                    <th className={thClass}>Tracking #</th>
                                    <th className={thClass}>Tracking Status</th>
                                    <th className={thClass}>Ship To</th>
                                    <th className={`${thClass} text-right`}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {manifests.map((sm) => (
                                    <tr key={sm.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{sm.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(sm.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(sm.Ship_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(sm.Estimated_Delivery_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(sm.Actual_Delivery_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{sm.Shipping_Method__c || "—"}</td>
                                        <td className={tdClass}>
                                            {sm.Tracking_URL__c ? (
                                                <a href={sm.Tracking_URL__c} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {sm.Tracking_Number__c || "Track"}
                                                </a>
                                            ) : (sm.Tracking_Number__c || "—")}
                                        </td>
                                        <td className="px-4 py-3">{sm.Tracking_Status__c ? statusBadge(sm.Tracking_Status__c) : "—"}</td>
                                        <td className={tdClass}>{sm.Ship_to_Account_Name || "—"}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(sm.Total_Price__c ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Invoices */}
            {activeSubTab === "invoices" && (
                invoices.length === 0 ? emptyState("invoices") : (
                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className={thClass}>Invoice #</th>
                                    <th className={thClass}>Status</th>
                                    <th className={thClass}>Issued Date</th>
                                    <th className={thClass}>Due Date</th>
                                    <th className={thClass}>Payment Terms</th>
                                    <th className={thClass}>Collection Status</th>
                                    <th className={thClass}>Customer Order</th>
                                    <th className={thClass}>Sales Order</th>
                                    <th className={`${thClass} text-right`}>Grand Total</th>
                                    <th className={`${thClass} text-right`}>Open Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {invoices.map((inv) => (
                                    <tr key={inv.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{inv.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(inv.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(inv.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(inv.Due_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{inv.Payment_Terms__c || "—"}</td>
                                        <td className="px-4 py-3">{inv.Collection_Status__c ? statusBadge(inv.Collection_Status__c) : "—"}</td>
                                        <td className={tdClass}>{inv.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{inv.Sales_Order_Name || "—"}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(inv.Grand_Total__c ?? 0)}</td>
                                        <td className={`${tdBoldClass} text-right`}>{formatCurrency(inv.Open_Balance__c ?? 0)}</td>
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
