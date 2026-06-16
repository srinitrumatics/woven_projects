"use client";

import React, { useEffect, useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../hooks/useResizableColumns";

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

interface Proposal {
    Id: string;
    Name: string;
    Proposal_Number__c: string;
    Status__c: string;
    Proposal_Name__c: string;
    Customer_Order_Name: string;
    Customer_PO__c: string;
    Bill_to_Account_Name: string;
    Ship_to_Account_Name: string;
    Total_Lines__c: number;
    Total_Price__c: number;
    Expiration_Date__c: string;
    Request_Date__c: string;
}

interface CustomerQuote {
    Id: string;
    Name: string;
    Status__c: string;
    Customer_Order_Name: string;
    Customer_PO__c: string;
    Bill_to_Account_Name: string;
    Bill_to_Location_Name: string;
    Bill_to_Contact_Name: string;
    Ship_to_Account_Name: string;
    Ship_to_Location_Name: string;
    Ship_to_Contact_Name: string;
    Drop_Ship__c: boolean;
    Total_Lines__c: number;
    Total_Price__c: number;
    Total_Shipping_Charges__c: number;
    Total_Taxes_Amount__c: number;
    Grand_Total__c: number;
    Issue_Date__c: string;
    Expiration_Date__c: string;
    Request_Date__c: string;
    Planned_Ship_Date__c: string;
    Ship_Confirmed_Date__c: string;
}


export default function FulfillmentTab({ orderId, accountId, contactId }: FulfillmentTabProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [manifests, setManifests] = useState<ShippingManifest[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [customerQuotes, setCustomerQuotes] = useState<CustomerQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"proposals" | "customerQuotes" | "salesOrders" | "manifests" | "invoices">("proposals");

    const { items: sortedProposals, requestSort: requestSortProposals, sortConfig: sortConfigProposals } = useSortableData(proposals);
    const { items: sortedCustomerQuotes, requestSort: requestSortCustomerQuotes, sortConfig: sortConfigCustomerQuotes } = useSortableData(customerQuotes);
    const { items: sortedSalesOrders, requestSort: requestSortSalesOrders, sortConfig: sortConfigSalesOrders } = useSortableData(salesOrders);
    const { items: sortedManifests, requestSort: requestSortManifests, sortConfig: sortConfigManifests } = useSortableData(manifests);
    const { items: sortedInvoices, requestSort: requestSortInvoices, sortConfig: sortConfigInvoices } = useSortableData(invoices);

    const { widths, handleResize } = useResizableColumns({});

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
                console.log("Fulfillment data:", data);
                // API returns the whole data object for Fulfillment tab
                setInvoices(data.Invoice__c || []);
                setManifests(data.Shipping_Manifest__c || []);
                setSalesOrders(data.Sales_Order__c || []);
                setProposals(data.Proposal__c || []);
                setCustomerQuotes(data.Customer_Quote__c || []);
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

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 ";
    const tdClass = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 truncate";
    const tdBoldClass = "px-4 py-3 text-sm text-gray-900 dark:text-white font-medium truncate";

    return (
        <div>
            {/* Sub-tabs - underline style */}
            <div className="flex gap-6 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <button
                    onClick={() => setActiveSubTab("proposals")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${activeSubTab === "proposals"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                >
                    Proposals {proposals.length > 0 && `(${proposals.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("customerQuotes")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${activeSubTab === "customerQuotes"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                >
                    Customer Quotes {customerQuotes.length > 0 && `(${customerQuotes.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("salesOrders")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${activeSubTab === "salesOrders"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                >
                    Sales Orders {salesOrders.length > 0 && `(${salesOrders.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("manifests")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${activeSubTab === "manifests"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                >
                    Shipping Manifests {manifests.length > 0 && `(${manifests.length})`}
                </button>
                <button
                    onClick={() => setActiveSubTab("invoices")}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${activeSubTab === "invoices"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                >
                    Invoices {invoices.length > 0 && `(${invoices.length})`}
                </button>
            </div>

            {/* Proposals */}
            {activeSubTab === "proposals" && (
                proposals.length === 0 ? emptyState("proposals") : (
                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Proposal Number" field="Proposal_Number__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propName || 150} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Proposal Name" field="Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propProposalName || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer PO" field="Customer_PO__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propCustomerPO || 120} onResize={handleResize} />
                                    <SortableHeader label="Bill to Account" field="Bill_to_Account_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propBillToAccount || 150} onResize={handleResize} />
                                    <SortableHeader label="Ship to Account" field="Ship_to_Account_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propShipToAccount || 150} onResize={handleResize} />
                                    <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propTotalLines || 100} onResize={handleResize} />
                                    <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propTotalPrice || 120} onResize={handleResize} />
                                    <SortableHeader label="Expires" field="Expiration_Date__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propExpires || 120} onResize={handleResize} />
                                    <SortableHeader label="Request Date" field="Request_Date__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propRequestDate || 120} onResize={handleResize} />
                                    <th className={`${thClass} w-20`}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedProposals.map((prop) => (
                                    <tr key={prop.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{prop.Proposal_Number__c || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(prop.Status__c)}</td>
                                        <td className={tdClass}>{prop.Name || "—"}</td>
                                        <td className={tdClass}>{prop.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{prop.Customer_PO__c || "—"}</td>
                                        <td className={tdClass}>{prop.Bill_to_Account_Name || "—"}</td>
                                        <td className={tdClass}>{prop.Ship_to_Account_Name || "—"}</td>
                                        <td className={`${tdClass} `}>{prop.Total_Lines__c || "0"}</td>
                                        <td className={`${tdBoldClass} `}>{formatCurrency(prop.Total_Price__c ?? 0)}</td>
                                        <td className={tdClass}>{formatDate(prop.Expiration_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(prop.Request_Date__c, "numeric-dash") || "—"}</td>
                                        <td className="px-4 py-3 ">
                                            <button className="text-primary hover:underline font-medium text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Customer Quotes */}
            {activeSubTab === "customerQuotes" && (
                customerQuotes.length === 0 ? emptyState("customer quotes") : (
                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Customer Quote" field="Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqName || 150} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer PO" field="Customer_PO__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqCustomerPO || 120} onResize={handleResize} />
                                    <SortableHeader label="Bill to Account" field="Bill_to_Account_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqBillToAccount || 150} onResize={handleResize} />
                                    <SortableHeader label="Bill to Location" field="Bill_to_Location_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqBillToLocation || 150} onResize={handleResize} />
                                    <SortableHeader label="Bill to Contact" field="Bill_to_Contact_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqBillToContact || 150} onResize={handleResize} />
                                    <SortableHeader label="Ship to Account" field="Ship_to_Account_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipToAccount || 150} onResize={handleResize} />
                                    <SortableHeader label="Ship to Location" field="Ship_to_Location_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipToLocation || 150} onResize={handleResize} />
                                    <SortableHeader label="Ship to Contact" field="Ship_to_Contact_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipToContact || 150} onResize={handleResize} />
                                    <SortableHeader label="Drop Ship" field="Drop_Ship__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqDropShip || 100} onResize={handleResize} />
                                    <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqTotalLines || 100} onResize={handleResize} />
                                    <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqTotalPrice || 120} onResize={handleResize} />
                                    <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipping || 120} onResize={handleResize} />
                                    <SortableHeader label="Taxes" field="Total_Taxes_Amount__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqTaxes || 120} onResize={handleResize} />
                                    <SortableHeader label="Grand Total" field="Grand_Total__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqGrandTotal || 120} onResize={handleResize} />
                                    <SortableHeader label="Issue Date" field="Issue_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqIssueDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Expiration Date" field="Expiration_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqExpirationDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Request Date" field="Request_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqRequestDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Planned Ship Date" field="Planned_Ship_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqPlannedShipDate || 150} onResize={handleResize} />
                                    <SortableHeader label="Ship Confirmed Date" field="Ship_Confirmed_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipConfirmedDate || 150} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedCustomerQuotes.map((cq) => (
                                    <tr key={cq.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{cq.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(cq.Status__c)}</td>
                                        <td className={tdClass}>{cq.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Customer_PO__c || "—"}</td>
                                        <td className={tdClass}>{cq.Bill_to_Account_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Bill_to_Location_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Bill_to_Contact_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Ship_to_Account_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Ship_to_Location_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Ship_to_Contact_Name || "—"}</td>
                                        <td className={tdClass}>{cq.Drop_Ship__c ? "Yes" : "No"}</td>
                                        <td className={`${tdClass} `}>{cq.Total_Lines__c || "0"}</td>
                                        <td className={`${tdClass} `}>{formatCurrency(cq.Total_Price__c ?? 0)}</td>
                                        <td className={`${tdClass} `}>{formatCurrency(cq.Total_Shipping_Charges__c ?? 0)}</td>
                                        <td className={`${tdClass} `}>{formatCurrency(cq.Total_Taxes_Amount__c ?? 0)}</td>
                                        <td className={`${tdBoldClass} `}>{formatCurrency(cq.Grand_Total__c ?? 0)}</td>
                                        <td className={tdClass}>{formatDate(cq.Issue_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(cq.Expiration_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(cq.Request_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(cq.Planned_Ship_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(cq.Ship_Confirmed_Date__c, "numeric-dash") || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Sales Orders */}
            {activeSubTab === "salesOrders" && (
                salesOrders.length === 0 ? emptyState("sales orders") : (
                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Sales Order #" field="Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soName || 150} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Quote" field="Customer_Quote_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soQuote || 150} onResize={handleResize} />
                                    <SortableHeader label="Ship Date" field="Ship_Date__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Ship To Account" field="Ship_to_Account_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipToAccount || 150} onResize={handleResize} />
                                    <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soTotalPrice || 120} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedSalesOrders.map((so) => (
                                    <tr key={so.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{so.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(so.Status__c)}</td>
                                        <td className={tdClass}>{so.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{so.Customer_Quote_Name || "—"}</td>
                                        <td className={tdClass}>{formatDate(so.Ship_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{so.Ship_to_Account_Name || "—"}</td>
                                        <td className={`${tdBoldClass} `}>{formatCurrency(so.Total_Price__c ?? 0)}</td>
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
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Manifest #" field="Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smName || 150} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Ship Date" field="Ship_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShipDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Est. Delivery" field="Estimated_Delivery_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smEstDelivery || 120} onResize={handleResize} />
                                    <SortableHeader label="Actual Delivery" field="Actual_Delivery_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smActualDelivery || 120} onResize={handleResize} />
                                    <SortableHeader label="Shipping Method" field="Shipping_Method__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShippingMethod || 150} onResize={handleResize} />
                                    <SortableHeader label="Tracking #" field="Tracking_Number__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTracking || 150} onResize={handleResize} />
                                    <SortableHeader label="Tracking Status" field="Tracking_Status__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTrackingStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Ship To" field="Ship_to_Account_Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShipTo || 150} onResize={handleResize} />
                                    <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTotalPrice || 120} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedManifests.map((sm) => (
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
                                        <td className={`${tdBoldClass} `}>{formatCurrency(sm.Total_Price__c ?? 0)}</td>
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
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="Invoice #" field="Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invName || 150} onResize={handleResize} />
                                    <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invStatus || 120} onResize={handleResize} />
                                    <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invIssuedDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Due Date" field="Due_Date__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invDueDate || 120} onResize={handleResize} />
                                    <SortableHeader label="Payment Terms" field="Payment_Terms__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invPaymentTerms || 150} onResize={handleResize} />
                                    <SortableHeader label="Collection Status" field="Collection_Status__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invCollectionStatus || 150} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invCustomerOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Sales Order" field="Sales_Order_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invSalesOrder || 150} onResize={handleResize} />
                                    <SortableHeader label="Grand Total" field="Grand_Total__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invGrandTotal || 120} onResize={handleResize} />
                                    <SortableHeader label="Open Balance" field="Open_Balance__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invOpenBalance || 120} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedInvoices.map((inv) => (
                                    <tr key={inv.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className={tdBoldClass}>{inv.Name || "—"}</td>
                                        <td className="px-4 py-3">{statusBadge(inv.Status__c)}</td>
                                        <td className={tdClass}>{formatDate(inv.Issued_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{formatDate(inv.Due_Date__c, "numeric-dash") || "—"}</td>
                                        <td className={tdClass}>{inv.Payment_Terms__c || "—"}</td>
                                        <td className="px-4 py-3">{inv.Collection_Status__c ? statusBadge(inv.Collection_Status__c) : "—"}</td>
                                        <td className={tdClass}>{inv.Customer_Order_Name || "—"}</td>
                                        <td className={tdClass}>{inv.Sales_Order_Name || "—"}</td>
                                        <td className={`${tdBoldClass} `}>{formatCurrency(inv.Grand_Total__c ?? 0)}</td>
                                        <td className={`${tdBoldClass} `}>{formatCurrency(inv.Open_Balance__c ?? 0)}</td>
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
