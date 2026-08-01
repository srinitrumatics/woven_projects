"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatDate, formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../hooks/useResizableColumns";
import { useUserSession } from "@/components/UserSessionContext";
import { usePermissions } from "@/components/PermissionContext";
import Pagination from "@/components/ui/Pagination";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ITEMS_PER_PAGE = 10;

export interface FulfillmentPreloadedData {
    invoices: Invoice[];
    manifests: ShippingManifest[];
    salesOrders: SalesOrder[];
    proposals: Proposal[];
    customerQuotes: CustomerQuote[];
}

interface FulfillmentTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    onCountChange?: (count: number) => void;
    preloadedData?: FulfillmentPreloadedData | null;
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
    Customer_Quote_Id__c: string;
    Sales_Order_Name: string;
    Bill_to_Account_Name: string;
    Authorized_Bill_To_Location_Name: string;
    Bill_to_Contact_Name: string;
    Ship_to_Account_Name: string;
    Purchase_Order_Name: string;
    Proposal__c: string;
    Proposal_Name: string;
    Total_Lines__c: number;
    Settled_Date__c: string;
    Proposal_Number__c: string;
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
    Total_Lines__c: number;
    Customer_Order_Name: string;
    Sales_Order_Name: string;
    Sales_Order__c: string;
    Ship_to_Account_Name: string;
    Authorized_Ship_To_Location_Name: string;
    Ship_to_Contact_Name: string;
    Customer_Quote_Name: string;
    Customer_Quote__c: string;
    Proposal__c: string;
    Proposal_Name: string;
    Drop_Ship__c: boolean;
    Box__c: number;
    Case_Length__c: number;
    Case_Width__c: number;
    Case_Height__c: number;
    Case_Net_Weight__c: number;
    Case_Gross_Weight__c: number;
    Logistics_Partner_Name: string;
    Proposal_Number__c: string;
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
    Total_Lines__c: number;
    Total_Shipping_Charges__c: number;
    Total_Taxes_Amount__c: number;
    Customer_Order_Name: string;
    Customer_Quote_Name: string;
    Customer_Quote__c: string;
    Ship_to_Account_Name: string;
    Authorized_Ship_To_Location_Name: string;
    Ship_to_Contact_Name: string;
    Bill_to_Account_Name: string;
    Authorized_Bill_To_Location_Name: string;
    Bill_to_Contact_Name: string;
    Proposal__c: string;
    Proposal_Name: string;
    Drop_Ship__c: boolean;
    Proposal_Number__c: string;

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
    Authorized_Bill_To_Location_Name: string;
    Bill_to_Contact_Name: string;
    Ship_to_Account_Name: string;
    Authorized_Ship_To_Location_Name: string;
    Ship_to_Contact_Name: string;
    Drop_Ship__c: boolean;
    Total_Lines__c: number;
    Total_Price__c: number;
    Total_Shipping_Charges__c: number;
    Total_Taxes_Amount__c: number;
    Grand_Total__c: number;
    Issued_Date__c: string;
    Expiration_Date__c: string;
    Request_Date__c: string;
}

interface CustomerQuote {
    Id: string;
    Name: string;
    Status__c: string;
    Customer_Order_Name: string;
    Customer_PO__c: string;
    Proposal_Name: string;
    proposal_Number: string;
    Proposal__c: string;
    Bill_to_Account_Name: string;
    Authorized_Bill_To_Location_Name: string;
    Bill_to_Contact_Name: string;
    Ship_to_Account_Name: string;
    Authorized_Ship_To_Location_Name: string;
    Ship_to_Contact_Name: string;
    Drop_Ship__c: boolean;
    Total_Lines__c: number;
    Total_Price__c: number;
    Total_Shipping_Charges__c: number;
    Total_Taxes_Amount__c: number;
    Grand_Total__c: number;
    Issued_Date__c: string;
    Expiration_Date__c: string;
    Request_Date__c: string;
    Ship_Date__c: string;
    Delivered_Date__c: string;
    Proposal_Number__c: string;
}


export default function FulfillmentTab({ orderId, accountId, contactId, onCountChange, preloadedData }: FulfillmentTabProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [manifests, setManifests] = useState<ShippingManifest[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [customerQuotes, setCustomerQuotes] = useState<CustomerQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"proposals" | "customerQuotes" | "salesOrders" | "manifests" | "invoices">("proposals");

    // Pagination state per sub-table
    const [proposalPage, setProposalPage] = useState(1);
    const [cqPage, setCqPage] = useState(1);
    const [soPage, setSoPage] = useState(1);
    const [smPage, setSmPage] = useState(1);
    const [invPage, setInvPage] = useState(1);

    // Reset page to 1 when switching sub-tabs
    useEffect(() => {
        setProposalPage(1);
        setCqPage(1);
        setSoPage(1);
        setSmPage(1);
        setInvPage(1);
    }, [activeSubTab]);

    const { selectedAccount } = useUserSession();
    const { isSuperAdmin } = usePermissions();
    const accountType = selectedAccount?.Account_Record_Type__c || '';
    const canLinkProposals = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';
    const canLinkQuotes = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';
    const canLinkSalesOrders = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';
    const canLinkShipments = isSuperAdmin || accountType === 'Customer' || accountType === 'Hybrid';
    const canLinkInvoices = isSuperAdmin || accountType === 'Customer' || accountType === 'Hybrid';

    const { items: sortedProposals, requestSort: requestSortProposals, sortConfig: sortConfigProposals } = useSortableData(proposals, { key: 'Proposal_Number__c', direction: 'desc' });
    const { items: sortedCustomerQuotes, requestSort: requestSortCustomerQuotes, sortConfig: sortConfigCustomerQuotes } = useSortableData(customerQuotes, { key: 'Name', direction: 'desc' });
    const { items: sortedSalesOrders, requestSort: requestSortSalesOrders, sortConfig: sortConfigSalesOrders } = useSortableData(salesOrders, { key: 'Name', direction: 'desc' });
    const { items: sortedManifests, requestSort: requestSortManifests, sortConfig: sortConfigManifests } = useSortableData(manifests, { key: 'Name', direction: 'desc' });
    const { items: sortedInvoices, requestSort: requestSortInvoices, sortConfig: sortConfigInvoices } = useSortableData(invoices, { key: 'Name', direction: 'desc' });

    // Paged slices
    const pagedProposals = useMemo(() => sortedProposals.slice((proposalPage - 1) * ITEMS_PER_PAGE, proposalPage * ITEMS_PER_PAGE), [sortedProposals, proposalPage]);
    const pagedCustomerQuotes = useMemo(() => sortedCustomerQuotes.slice((cqPage - 1) * ITEMS_PER_PAGE, cqPage * ITEMS_PER_PAGE), [sortedCustomerQuotes, cqPage]);
    const pagedSalesOrders = useMemo(() => sortedSalesOrders.slice((soPage - 1) * ITEMS_PER_PAGE, soPage * ITEMS_PER_PAGE), [sortedSalesOrders, soPage]);
    const pagedManifests = useMemo(() => sortedManifests.slice((smPage - 1) * ITEMS_PER_PAGE, smPage * ITEMS_PER_PAGE), [sortedManifests, smPage]);
    const pagedInvoices = useMemo(() => sortedInvoices.slice((invPage - 1) * ITEMS_PER_PAGE, invPage * ITEMS_PER_PAGE), [sortedInvoices, invPage]);

    const { widths, handleResize } = useResizableColumns({});

    // Sticky column class constants
    const stickyThClass = "sticky left-0 z-20 bg-primary-light dark:bg-gray-900";
    const stickyTdClass = "sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700";

    // When preloadedData arrives from the parent, populate state without fetching again
    useEffect(() => {
        if (preloadedData == null) return;
        setInvoices(preloadedData.invoices);
        setManifests(preloadedData.manifests);
        setSalesOrders(preloadedData.salesOrders);
        setProposals(preloadedData.proposals);
        setCustomerQuotes(preloadedData.customerQuotes);
        setLoading(false);
    }, [preloadedData]);

    // Self-fetch only when no parent is providing preloadedData (preloadedData === undefined)
    useEffect(() => {
        if (preloadedData !== undefined) return;
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
                const invoiceData = data.Invoice__c || [];
                const manifestData = data.Shipping_Manifest__c || [];
                const salesOrderData = data.Sales_Order__c || [];
                const proposalData = data.Proposal__c || [];
                const customerQuoteData = data.Customer_Quote__c || [];
                setInvoices(invoiceData);
                setManifests(manifestData);
                setSalesOrders(salesOrderData);
                setProposals(proposalData);
                setCustomerQuotes(customerQuoteData);
                onCountChange?.(invoiceData.length + manifestData.length + salesOrderData.length + proposalData.length + customerQuoteData.length);
            } catch (e) {
                console.error("Error fetching fulfillment:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchFulfillment();
    }, [orderId, accountId, contactId]);

    if (loading) {
        return <TableLoadingState />;
    }

    const emptyState = (label: string) => (
        <TableEmptyState message="No records found" description={`There are no ${label} associated with this order.`} />
    );

    const tdClass = "text-gray-700 dark:text-gray-300 truncate";
    const tdBoldClass = "font-medium truncate";

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
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className="table-fixed text-sm">
                                <THead>
                                    <tr>
                                        <SortableHeader label="Proposal#" field="Proposal_Number__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propNum || 160} onResize={handleResize} className={stickyThClass} />
                                        <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propStatus || 120} onResize={handleResize} />
                                        <SortableHeader label="Proposal Name" field="Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propProposalName || 160} onResize={handleResize} />
                                        <SortableHeader label="Bill to Account" field="Bill_to_Account_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propBillToAccount || 150} onResize={handleResize} />
                                        <SortableHeader label="Bill to Location" field="Bill_to_Location_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propBillToLocation || 150} onResize={handleResize} />
                                        <SortableHeader label="Bill to Contact" field="Bill_to_Contact_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propBillToContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Account" field="Ship_to_Account_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propShipToAccount || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Location" field="Ship_to_Location_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propShipToLocation || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Contact" field="Ship_to_Contact_Name" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propShipToContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Drop Ship" field="Drop_Ship__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propDropShip || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propTotalLines || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propTotalPrice || 120} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propShipping || 110} onResize={handleResize} />
                                        <SortableHeader label="Taxes" field="Total_Taxes_Amount__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propTaxes || 110} onResize={handleResize} />
                                        <SortableHeader label="Grand Total" field="Grand_Total__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propGrandTotal || 120} onResize={handleResize} />
                                        <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propIssuedDate || 130} onResize={handleResize} />
                                        <SortableHeader label="Expiration Date" field="Expiration_Date__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propExpirationDate || 140} onResize={handleResize} />
                                        <SortableHeader label="Request Date" field="Request_Date__c" sortConfig={sortConfigProposals} requestSort={requestSortProposals} width={widths.propRequestDate || 130} onResize={handleResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {pagedProposals.map((prop) => (
                                        <Tr key={prop.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>
                                                {canLinkProposals && prop.Id ? (
                                                    <Link href={`/proposals/${prop.Id}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {prop.Proposal_Number__c || "—"}
                                                    </Link>
                                                ) : (prop.Proposal_Number__c || "—")}
                                            </Td>
                                            <Td><StatusBadge status={prop.Status__c || "—"} variant="compact" /></Td>
                                            <Td className={tdClass}>{displayCell(prop.Name)}</Td>
                                            <Td className={tdClass}>{displayCell(prop.Bill_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(prop.Authorized_Bill_To_Location_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(prop.Bill_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(prop.Ship_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(prop.Authorized_Ship_To_Location_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(prop.Ship_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{prop.Drop_Ship__c ? "Yes" : "No"}</Td>
                                            <Td className={tdClass}>{formatNumber(prop.Total_Lines__c)}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(prop.Total_Price__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(prop.Total_Shipping_Charges__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(prop.Total_Taxes_Amount__c ?? 0)}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(prop.Grand_Total__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatDate(prop.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(prop.Expiration_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(prop.Request_Date__c, "numeric-dash") || "—"}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={proposalPage}
                            totalPages={Math.ceil(sortedProposals.length / ITEMS_PER_PAGE)}
                            totalItems={sortedProposals.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setProposalPage}
                            itemName="proposals"
                        />
                    </div>
                )
            )}

            {/* Customer Quotes */}
            {activeSubTab === "customerQuotes" && (
                customerQuotes.length === 0 ? emptyState("customer quotes") : (
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className="table-fixed text-sm">
                                <THead>
                                    <tr>
                                        <SortableHeader label="Customer Quote" field="Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqName || 180} onResize={handleResize} className={stickyThClass} />
                                        <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqStatus || 120} onResize={handleResize} />
                                        <SortableHeader label="Proposal#" field="Proposal_Number__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqProposalNum || 140} onResize={handleResize} />
                                        <SortableHeader label="Proposal Name" field="Proposal_Name__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqProposalName || 160} onResize={handleResize} />
                                        <SortableHeader label="Bill to Account" field="Bill_to_Account_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqBillToAccount || 150} onResize={handleResize} />
                                        <SortableHeader label="Bill to Location" field="Bill_to_Location_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqBillToLocation || 150} onResize={handleResize} />
                                        <SortableHeader label="Bill to Contact" field="Bill_to_Contact_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqBillToContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Account" field="Ship_to_Account_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipToAccount || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Location" field="Ship_to_Location_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipToLocation || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Contact" field="Ship_to_Contact_Name" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipToContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Drop Ship" field="Drop_Ship__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqDropShip || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqTotalLines || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqTotalPrice || 120} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipping || 110} onResize={handleResize} />
                                        <SortableHeader label="Taxes" field="Total_Taxes_Amount__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqTaxes || 110} onResize={handleResize} />
                                        <SortableHeader label="Grand Total" field="Grand_Total__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqGrandTotal || 120} onResize={handleResize} />
                                        <SortableHeader label="Issued Date" field="Issue_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqIssuedDate || 130} onResize={handleResize} />
                                        <SortableHeader label="Expiration Date" field="Expiration_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqExpirationDate || 140} onResize={handleResize} />
                                        <SortableHeader label="Request Date" field="Request_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqRequestDate || 130} onResize={handleResize} />
                                        <SortableHeader label="Planned Ship Date" field="Planned_Ship_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqPlannedShipDate || 160} onResize={handleResize} />
                                        <SortableHeader label="Ship Confirmed Date" field="Ship_Confirmed_Date__c" sortConfig={sortConfigCustomerQuotes} requestSort={requestSortCustomerQuotes} width={widths.cqShipConfirmedDate || 170} onResize={handleResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {pagedCustomerQuotes.map((cq) => (
                                        <Tr key={cq.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>
                                                {canLinkQuotes && cq.Id ? (
                                                    <Link href={`/quotes/${cq.Id}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {cq.Name || "—"}
                                                    </Link>
                                                ) : (cq.Name || "—")}
                                            </Td>
                                            <Td><StatusBadge status={cq.Status__c || "—"} variant="compact" /></Td>
                                            <Td title={displayCell(cq.Proposal_Number__c)} className={tdClass}>
                                                {canLinkProposals && cq.Proposal__c ? (
                                                    <Link href={`/proposals/${cq.Proposal__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {cq.Proposal_Number__c || "—"}
                                                    </Link>
                                                ) : (cq.Proposal_Number__c || "—")}
                                            </Td>
                                            <Td title={displayCell(cq.Proposal_Name)} className={tdClass}>{displayCell(cq.Proposal_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cq.Bill_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cq.Authorized_Bill_To_Location_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cq.Bill_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cq.Ship_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cq.Authorized_Ship_To_Location_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cq.Ship_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{cq.Drop_Ship__c ? "Yes" : "No"}</Td>
                                            <Td className={tdClass}>{formatNumber(cq.Total_Lines__c)}</Td>
                                            <Td className={tdClass}>{formatCurrency(cq.Total_Price__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(cq.Total_Shipping_Charges__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(cq.Total_Taxes_Amount__c ?? 0)}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(cq.Grand_Total__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatDate(cq.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(cq.Expiration_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(cq.Request_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(cq.Ship_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(cq.Delivered_Date__c, "numeric-dash") || "—"}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={cqPage}
                            totalPages={Math.ceil(sortedCustomerQuotes.length / ITEMS_PER_PAGE)}
                            totalItems={sortedCustomerQuotes.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCqPage}
                            itemName="customer quotes"
                        />
                    </div>
                )
            )}

            {/* Sales Orders */}
            {activeSubTab === "salesOrders" && (
                salesOrders.length === 0 ? emptyState("sales orders") : (
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className="table-fixed text-sm">
                                <THead>
                                    <tr>
                                        <SortableHeader label="Sales Order" field="Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soName || 160} onResize={handleResize} className={stickyThClass} />
                                        <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soStatus || 120} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote" field="Customer_Quote_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soCustomerQuote || 170} onResize={handleResize} />
                                        <SortableHeader label="Proposal#" field="Proposal_Number__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soProposalNum || 140} onResize={handleResize} />
                                        <SortableHeader label="Proposal Name" field="Proposal_Name__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soProposalName || 160} onResize={handleResize} />
                                        <SortableHeader label="Bill to Account" field="Bill_to_Account_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soBillToAccount || 150} onResize={handleResize} />
                                        <SortableHeader label="Bill to Location" field="Bill_to_Location_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soBillToLocation || 150} onResize={handleResize} />
                                        <SortableHeader label="Bill to Contact" field="Bill_to_Contact_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soBillToContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Account" field="Ship_to_Account_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipToAccount || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Location" field="Ship_to_Location_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipToLocation || 150} onResize={handleResize} />
                                        <SortableHeader label="Ship to Contact" field="Ship_to_Contact_Name" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipToContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Drop Ship" field="Drop_Ship__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soDropShip || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soTotalLines || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soTotalPrice || 120} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipping || 110} onResize={handleResize} />
                                        <SortableHeader label="Taxes" field="Total_Taxes_Amount__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soTaxes || 110} onResize={handleResize} />
                                        <SortableHeader label="Grand Total" field="Grand_Total__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soGrandTotal || 120} onResize={handleResize} />
                                        <SortableHeader label="Request Date" field="Request_Date__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soRequestDate || 130} onResize={handleResize} />
                                        <SortableHeader label="Planned Ship Date" field="Ship_Date__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soPlannedShipDate || 160} onResize={handleResize} />
                                        <SortableHeader label="Ship Confirmed Date" field="Delivered_Date__c" sortConfig={sortConfigSalesOrders} requestSort={requestSortSalesOrders} width={widths.soShipConfirmedDate || 170} onResize={handleResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {pagedSalesOrders.map((so) => (
                                        <Tr key={so.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>{displayCell(so.Name)}</Td>
                                            <Td><StatusBadge status={so.Status__c || "—"} variant="compact" /></Td>
                                            <Td className={tdClass}>
                                                {canLinkQuotes && so.Customer_Quote__c ? (
                                                    <Link href={`/quotes/${so.Customer_Quote__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {so.Customer_Quote_Name || "—"}
                                                    </Link>
                                                ) : (so.Customer_Quote_Name || "—")}
                                            </Td>
                                            <Td title={displayCell(so.Proposal_Number__c)} className={tdClass}>
                                                {canLinkProposals && so.Proposal__c ? (
                                                    <Link href={`/proposals/${so.Proposal__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {so.Proposal_Number__c || "—"}
                                                    </Link>
                                                ) : (so.Proposal_Number__c || "—")}
                                            </Td>
                                            <Td title={displayCell(so.Proposal_Name)} className={tdClass}>{displayCell(so.Proposal_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(so.Bill_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(so.Authorized_Bill_To_Location_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(so.Bill_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(so.Ship_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(so.Authorized_Ship_To_Location_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(so.Ship_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{so.Drop_Ship__c ? "Yes" : "No"}</Td>
                                            <Td className={tdClass}>{formatNumber(so.Total_Lines__c)}</Td>
                                            <Td className={tdClass}>{formatCurrency(so.Total_Price__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(so.Total_Shipping_Charges__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(so.Total_Taxes_Amount__c ?? 0)}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(so.Grand_Total__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatDate(so.Request_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(so.Ship_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(so.Delivered_Date__c, "numeric-dash") || "—"}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={soPage}
                            totalPages={Math.ceil(sortedSalesOrders.length / ITEMS_PER_PAGE)}
                            totalItems={sortedSalesOrders.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setSoPage}
                            itemName="sales orders"
                        />
                    </div>
                )
            )
            }

            {/* Shipping Manifests */}
            {
                activeSubTab === "manifests" && (
                    manifests.length === 0 ? emptyState("shipping manifests") : (
                        <div className="rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-auto">
                                <Table className="table-fixed text-sm">
                                    <THead>
                                        <tr>
                                            <SortableHeader label="Shipping Manifest" field="Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smName || 190} onResize={handleResize} className={stickyThClass} />
                                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smStatus || 120} onResize={handleResize} />
                                            <SortableHeader label="Sales Order" field="Sales_Order_Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smSalesOrder || 150} onResize={handleResize} />
                                            <SortableHeader label="Customer Quote " field="Customer_Quote_Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smCustomerQuote || 170} onResize={handleResize} />
                                            <SortableHeader label="Proposal#" field="Proposal_Number__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smProposalNum || 140} onResize={handleResize} />
                                            <SortableHeader label="Proposal Name" field="Proposal_Name__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smProposalName || 160} onResize={handleResize} />
                                            <SortableHeader label="Ship to Account" field="Ship_to_Account_Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShipToAccount || 150} onResize={handleResize} />
                                            <SortableHeader label="Ship to Location" field="Ship_to_Location_Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShipToLocation || 150} onResize={handleResize} />
                                            <SortableHeader label="Ship to Contact" field="Ship_to_Contact_Name" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShipToContact || 150} onResize={handleResize} />
                                            <SortableHeader label="Drop Ship" field="Drop_Ship__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smDropShip || 110} onResize={handleResize} />
                                            <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTotalLines || 110} onResize={handleResize} />
                                            <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTotalPrice || 120} onResize={handleResize} />
                                            <SortableHeader label="Box Count" field="Box__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smBoxCount || 110} onResize={handleResize} />
                                            <SortableHeader label="Box Length" field="Case_Length__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smBoxLength || 110} onResize={handleResize} />
                                            <SortableHeader label="Box Width" field="Case_Width__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smBoxWidth || 110} onResize={handleResize} />
                                            <SortableHeader label="Box Height" field="Case_Height__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smBoxHeight || 110} onResize={handleResize} />
                                            <SortableHeader label="Box Net Weight" field="Case_Net_Weight__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smBoxNetWeight || 140} onResize={handleResize} />
                                            <SortableHeader label="Box Gross Weight" field="Case_Gross_Weight__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smBoxGrossWeight || 150} onResize={handleResize} />
                                            <SortableHeader label="Logistics Partner" field="Logistics_Partner__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smLogisticsPartner || 150} onResize={handleResize} />
                                            <SortableHeader label="Planned Ship Date" field="Ship_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smPlannedShipDate || 160} onResize={handleResize} />
                                            <SortableHeader label="Ship Confirmed Date" field="Delivered_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smShipConfirmedDate || 170} onResize={handleResize} />
                                            <SortableHeader label="Tracking Number" field="Tracking_Number__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTrackingNumber || 150} onResize={handleResize} />
                                            <SortableHeader label="Tracking Status" field="Tracking_Status__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smTrackingStatus || 140} onResize={handleResize} />
                                            <SortableHeader label="Estimated Delivery Date" field="Estimated_Delivery_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smEstDelivery || 190} onResize={handleResize} />
                                            <SortableHeader label="Actual Delivery Date" field="Actual_Delivery_Date__c" sortConfig={sortConfigManifests} requestSort={requestSortManifests} width={widths.smActualDelivery || 170} onResize={handleResize} />
                                        </tr>
                                    </THead>
                                    <TBody>
                                        {pagedManifests.map((sm) => (
                                            <Tr key={sm.Id} className="group transition-colors">
                                                <Td className={`${tdBoldClass} ${stickyTdClass}`}>

                                                    {canLinkShipments && sm.Id ? (
                                                        <Link href={`/shipments/${sm.Id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()} target="_blank">
                                                            {sm.Name || "—"}
                                                        </Link>
                                                    ) : (sm.Name || "—")}
                                                </Td>
                                                <Td><StatusBadge status={sm.Status__c || "—"} variant="compact" /></Td>
                                                <Td className={tdClass}>{displayCell(sm.Sales_Order_Name)}</Td>
                                                <Td className={tdClass}>
                                                    {canLinkQuotes && sm.Customer_Quote__c ? (
                                                        <Link href={`/quotes/${sm.Customer_Quote__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                            {sm.Customer_Quote_Name || "—"}
                                                        </Link>
                                                    ) : (sm.Customer_Quote_Name || "—")}
                                                </Td>
                                                <Td title={displayCell(sm.Proposal_Number__c)} className={tdClass}>
                                                    {canLinkProposals && sm.Proposal__c ? (
                                                        <Link href={`/proposals/${sm.Proposal__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                            {sm.Proposal_Number__c || "—"}
                                                        </Link>
                                                    ) : (sm.Proposal_Number__c || "—")}
                                                </Td>
                                                <Td title={sm.Proposal_Name} className={tdClass}>{displayCell(sm.Proposal_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Ship_to_Account_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Authorized_Ship_To_Location_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Ship_to_Contact_Name)}</Td>
                                                <Td className={tdClass}>{sm.Drop_Ship__c ? "Yes" : "No"}</Td>
                                                <Td className={tdClass}>{formatNumber(sm.Total_Lines__c)}</Td>
                                                <Td className={tdBoldClass}>{formatCurrency(sm.Total_Price__c ?? 0)}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Box__c?.toString())}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Case_Length__c?.toString())}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Case_Width__c?.toString())}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Case_Height__c?.toString())}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Case_Net_Weight__c?.toString())}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Case_Gross_Weight__c?.toString())}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Logistics_Partner_Name)}</Td>
                                                <Td className={tdClass}>{formatDate(sm.Ship_Date__c, "numeric-dash") || "—"}</Td>
                                                <Td className={tdClass}>{formatDate(sm.Delivered_Date__c, "numeric-dash") || "—"}</Td>
                                                <Td className={tdClass}>{displayCell(sm.Tracking_Number__c)}</Td>
                                                <Td>{sm.Tracking_Status__c ? <StatusBadge status={sm.Tracking_Status__c} variant="compact" /> : "—"}</Td>
                                                <Td className={tdClass}>{formatDate(sm.Estimated_Delivery_Date__c, "numeric-dash") || "—"}</Td>
                                                <Td className={tdClass}>{formatDate(sm.Actual_Delivery_Date__c, "numeric-dash") || "—"}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
                            </div>
                            <Pagination
                                currentPage={smPage}
                                totalPages={Math.ceil(sortedManifests.length / ITEMS_PER_PAGE)}
                                totalItems={sortedManifests.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setSmPage}
                                itemName="shipping manifests"
                            />
                        </div>
                    )
                )
            }

            {/* Invoices */}
            {
                activeSubTab === "invoices" && (
                    invoices.length === 0 ? emptyState("invoices") : (
                        <div className="rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-auto">
                                <Table className="table-fixed text-sm">
                                    <THead>
                                        <tr>
                                            <SortableHeader label="Invoice" field="Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invName || 150} onResize={handleResize} className={stickyThClass} />
                                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invStatus || 120} onResize={handleResize} />
                                            <SortableHeader label="Sales Order" field="Sales_Order_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invSalesOrder || 150} onResize={handleResize} />
                                            <SortableHeader label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invPurchaseOrder || 150} onResize={handleResize} />
                                            <SortableHeader label="Customer Quote" field="Customer_Quote_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invCustomerQuote || 170} onResize={handleResize} />
                                            <SortableHeader label="Proposal#" field="Proposal_Number__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invProposalNum || 140} onResize={handleResize} />
                                            <SortableHeader label="Proposal Name" field="Proposal_Name__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invProposalName || 160} onResize={handleResize} />
                                            <SortableHeader label="Bill to Account" field="Bill_to_Account_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invBillToAccount || 150} onResize={handleResize} />
                                            <SortableHeader label="Bill to Location" field="Bill_to_Location_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invBillToLocation || 150} onResize={handleResize} />
                                            <SortableHeader label="Bill to Contact" field="Bill_to_Contact_Name" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invBillToContact || 150} onResize={handleResize} />
                                            <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invTotalLines || 110} onResize={handleResize} />
                                            <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invTotalPrice || 120} onResize={handleResize} />
                                            <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invShipping || 110} onResize={handleResize} />
                                            <SortableHeader label="Taxes" field="Total_Taxes_Amount__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invTaxes || 110} onResize={handleResize} />
                                            <SortableHeader label="Grand Total" field="Grand_Total__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invGrandTotal || 120} onResize={handleResize} />
                                            <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invIssuedDate || 130} onResize={handleResize} />
                                            <SortableHeader label="Payment Terms" field="Payment_Terms__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invPaymentTerms || 140} onResize={handleResize} />
                                            <SortableHeader label="Due Date" field="Due_Date__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invDueDate || 120} onResize={handleResize} />
                                            <SortableHeader label="Collection Status" field="Collection_Status__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invCollectionStatus || 160} onResize={handleResize} />
                                            <SortableHeader label="Open Balance" field="Open_Balance__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invOpenBalance || 130} onResize={handleResize} />
                                            <SortableHeader label="Settled Date" field="Settled_Date__c" sortConfig={sortConfigInvoices} requestSort={requestSortInvoices} width={widths.invSettledDate || 130} onResize={handleResize} />
                                        </tr>
                                    </THead>
                                    <TBody>
                                        {pagedInvoices.map((inv) => (
                                            <Tr key={inv.Id} className="group transition-colors">
                                                <Td className={`${tdBoldClass} ${stickyTdClass}`}>
                                                    {canLinkInvoices && inv.Id ? (
                                                        <Link href={`/invoices/${inv.Id}`} target="_blank" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                            {inv.Name || "—"}
                                                        </Link>
                                                    ) : (inv.Name || "—")}
                                                </Td>
                                                <Td><StatusBadge status={inv.Status__c || "—"} variant="compact" /></Td>
                                                <Td className={tdClass}>{displayCell(inv.Sales_Order_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(inv.Purchase_Order_Name)}</Td>
                                                <Td className={tdClass}>
                                                    {canLinkQuotes && inv.Customer_Quote_Id__c ? (
                                                        <Link href={`/quotes/${inv.Customer_Quote_Id__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                            {inv.Customer_Quote_Name || "—"}
                                                        </Link>
                                                    ) : (inv.Customer_Quote_Name || "—")}
                                                </Td>
                                                <Td title={displayCell(inv.Proposal_Number__c)} className={tdClass}>
                                                    {canLinkProposals && inv.Proposal__c ? (
                                                        <Link href={`/proposals/${inv.Proposal__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                            {inv.Proposal_Number__c || "—"}
                                                        </Link>
                                                    ) : (inv.Proposal_Number__c || "—")}
                                                </Td>
                                                <Td title={displayCell(inv.Proposal_Name)} className={tdClass}>{displayCell(inv.Proposal_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(inv.Bill_to_Account_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(inv.Authorized_Bill_To_Location_Name)}</Td>
                                                <Td className={tdClass}>{displayCell(inv.Bill_to_Contact_Name)}</Td>
                                                <Td className={tdClass}>{formatNumber(inv.Total_Lines__c)}</Td>
                                                <Td className={tdClass}>{formatCurrency(inv.Total_Price__c ?? 0)}</Td>
                                                <Td className={tdClass}>{formatCurrency(inv.Total_Shipping_Charges__c ?? 0)}</Td>
                                                <Td className={tdClass}>{formatCurrency(inv.Total_Taxes_Amount__c ?? 0)}</Td>
                                                <Td className={tdBoldClass}>{formatCurrency(inv.Grand_Total__c ?? 0)}</Td>
                                                <Td className={tdClass}>{formatDate(inv.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                                <Td className={tdClass}>{displayCell(inv.Payment_Terms__c)}</Td>
                                                <Td className={tdClass}>{formatDate(inv.Due_Date__c, "numeric-dash") || "—"}</Td>
                                                <Td>{inv.Collection_Status__c ? <StatusBadge status={inv.Collection_Status__c} variant="compact" /> : "—"}</Td>
                                                <Td className={tdBoldClass}>{formatCurrency(inv.Open_Balance__c ?? 0)}</Td>
                                                <Td className={tdClass}>{formatDate(inv.Settled_Date__c, "numeric-dash") || "—"}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
                            </div>
                            <Pagination
                                currentPage={invPage}
                                totalPages={Math.ceil(sortedInvoices.length / ITEMS_PER_PAGE)}
                                totalItems={sortedInvoices.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setInvPage}
                                itemName="invoices"
                            />
                        </div>
                    )
                )
            }
        </div >
    );
}
