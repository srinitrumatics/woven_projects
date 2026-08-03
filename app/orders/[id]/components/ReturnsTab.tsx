"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatDate, formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import { useUserSession } from "@/components/UserSessionContext";
import { usePermissions } from "@/components/PermissionContext";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import SubTabs from "@/components/ui/SubTabs";

const ITEMS_PER_PAGE = 10;

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
    Customer_Quote__c: string;
    Sales_Order_Name: string;
    Ship_from_Account_Name: string;
    Ship_from_Contact_Name: string;
    Return_to_Account_Name: string;
    Return_to_Contact_Name: string;
    Drop_Ship__c: boolean;
    Proposal__c: string;
    Proposal_Name: string;
    Logistics_Partner__c: string;
    Logistics_Contact__c: string;
    Logistics_Partner_Name: string;
    Logistics_Contact_Name: string;
    Goods_Receipt_Date__c: string;
    Proposal_Number__c: string;
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
    Customer_Quote__c: string;
    Invoice_Name: string;
    Sales_Order_Name: string;
    Credit_to_Account_Name: string;
    Proposal_Number__c: string;
    Total_Lines__c: number;
    Settled_Date__c: string;
    Proposal_Name: string;
    Proposal__c: string;

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
    Customer_Order_Id__c?: string;
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
    Customer_Order_Id__c?: string;
    Customer_Quote_Name: string;
    Purchase_Order_Name: string;
    Ship_from_Account_Name: string;
}

export default function ReturnsTab({ orderId, accountId, contactId, onCountChange, preloadedData }: ReturnsTabProps) {
    const { user, selectedAccount } = useUserSession();
    const { isSuperAdmin } = usePermissions();

    const accountType = selectedAccount?.Account_Record_Type__c || '';
    const canLinkProposals = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';
    const canLinkQuotes = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';
    const canLinkOrders = isSuperAdmin || accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';

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

    // Pagination state
    const [rmaPage, setRmaPage] = useState(1);
    const [cmPage, setCmPage] = useState(1);
    const [dmPage, setDmPage] = useState(1);
    const [rtvPage, setRtvPage] = useState(1);

    // Reset pages when switching sub-tabs
    useEffect(() => {
        setRmaPage(1);
        setCmPage(1);
        setDmPage(1);
        setRtvPage(1);
    }, [activeSubTab]);

    const { items: sortedRmaList, requestSort: requestSortRma, sortConfig: sortConfigRma } = useSortableData(rmaList, { key: 'Name', direction: 'desc' });
    const { items: sortedCreditMemos, requestSort: requestSortCm, sortConfig: sortConfigCm } = useSortableData(creditMemos, { key: 'Name', direction: 'desc' });
    const { items: sortedDebitMemos, requestSort: requestSortDm, sortConfig: sortConfigDm } = useSortableData(debitMemos, { key: 'Name', direction: 'desc' });
    const { items: sortedRtvList, requestSort: requestSortRtv, sortConfig: sortConfigRtv } = useSortableData(rtvList, { key: 'Name', direction: 'desc' });

    // Paged slices
    const pagedRmaList = useMemo(() => sortedRmaList.slice((rmaPage - 1) * ITEMS_PER_PAGE, rmaPage * ITEMS_PER_PAGE), [sortedRmaList, rmaPage]);
    const pagedCreditMemos = useMemo(() => sortedCreditMemos.slice((cmPage - 1) * ITEMS_PER_PAGE, cmPage * ITEMS_PER_PAGE), [sortedCreditMemos, cmPage]);
    const pagedDebitMemos = useMemo(() => sortedDebitMemos.slice((dmPage - 1) * ITEMS_PER_PAGE, dmPage * ITEMS_PER_PAGE), [sortedDebitMemos, dmPage]);
    const pagedRtvList = useMemo(() => sortedRtvList.slice((rtvPage - 1) * ITEMS_PER_PAGE, rtvPage * ITEMS_PER_PAGE), [sortedRtvList, rtvPage]);

    const { widths, handleResize } = useResizableColumns({});

    // Sticky column class constants
    const stickyThClass = "sticky left-0 z-20 bg-primary-light dark:bg-gray-900";
    const stickyTdClass = "sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700";

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
        return <TableLoadingState />;
    }

    const emptyState = (label: string) => (
        <TableEmptyState message="No records found" description={`There are no ${label} associated with this order.`} />
    );

    const tdClass = "text-gray-700 dark:text-gray-300 truncate";
    const tdBoldClass = "font-medium truncate";
    const tableClass = "text-sm table-fixed";

    const tabs = [
        { id: "rma" as const, label: "RMAs", count: rmaList.length },
        { id: "credits" as const, label: "Credit Memos", count: creditMemos.length },
        ...(!isCustomerOrNSO ? [
            { id: "debits" as const, label: "Debit Memos", count: debitMemos.length },
            { id: "rtv" as const, label: "RTV", count: rtvList.length },
        ] : []),
    ];

    return (
        <div>
            {/* Sub-tabs - underline style */}
            <SubTabs
                tabs={tabs.map((tab) => ({ key: tab.id, label: tab.label, count: tab.count }))}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as typeof activeSubTab)}
            />

            {/* RMAs */}
            {activeSubTab === "rma" && (
                rmaList.length === 0 ? emptyState("RMAs") : (
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className={tableClass}>
                                <THead>
                                    <tr>
                                        <SortableHeader label="RMA #" field="Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaName || 160} onResize={handleResize} className={stickyThClass} />
                                        <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaStatus || 120} onResize={handleResize} />
                                        <SortableHeader label="Type" field="RMA_Type__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaType || 120} onResize={handleResize} />
                                        <SortableHeader label="Sales Order" field="Sales_Order_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaSalesOrder || 150} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote #" field="Customer_Quote_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaCustomerQuote || 170} onResize={handleResize} />
                                        <SortableHeader label="Proposal #" field="Proposal_Number__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaProposalNum || 140} onResize={handleResize} />
                                        <SortableHeader label="Proposal Name" field="Proposal_Name__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaProposalName || 160} onResize={handleResize} />
                                        <SortableHeader label="Ship from Account" field="Ship_from_Account_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaShipFromAccount || 160} onResize={handleResize} />
                                        <SortableHeader label="Ship from Contact" field="Ship_from_Contact_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaShipFromContact || 160} onResize={handleResize} />
                                        <SortableHeader label="Return to Account" field="Return_to_Account_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaReturnToAccount || 160} onResize={handleResize} />
                                        <SortableHeader label="Return to Contact" field="Return_to_Contact_Name" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaReturnToContact || 160} onResize={handleResize} />
                                        <SortableHeader label="Drop Ship" field="Drop_Ship__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaDropShip || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaTotalLines || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaTotalPrice || 120} onResize={handleResize} />
                                        <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaIssued || 120} onResize={handleResize} />
                                        <SortableHeader label="Return By" field="Return_by_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaReturnBy || 130} onResize={handleResize} />
                                        <SortableHeader label="Shipping Method" field="Shipping_Method__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaShippingMethod || 150} onResize={handleResize} />
                                        <SortableHeader label="Logistics Partner" field="Logistics_Partner__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaLogisticsPartner || 150} onResize={handleResize} />
                                        <SortableHeader label="Logistics Contact" field="Logistics_Contact__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaLogisticsContact || 150} onResize={handleResize} />
                                        <SortableHeader label="Tracking Number" field="Tracking_Number__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaTrackingNumber || 150} onResize={handleResize} />
                                        <SortableHeader label="Tracking Status" field="Tracking_Status__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaTrackingStatus || 140} onResize={handleResize} />
                                        <SortableHeader label="Estimated Delivery Date" field="Estimated_Delivery_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaEstDelivery || 190} onResize={handleResize} />
                                        <SortableHeader label="Actual Delivery Date" field="Actual_Delivery_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaActualDelivery || 170} onResize={handleResize} />
                                        <SortableHeader label="Goods Receipt Date" field="Goods_Receipt_Date__c" sortConfig={sortConfigRma} requestSort={requestSortRma} width={widths.rmaGoodsReceipt || 170} onResize={handleResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {pagedRmaList.map((rma) => (
                                        <Tr key={rma.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>{displayCell(rma.Name)}</Td>
                                            <Td><StatusBadge status={rma.Status__c || "—"} variant="compact" /></Td>
                                            <Td className={tdClass}>{displayCell(rma.RMA_Type__c)}</Td>
                                            <Td className={tdClass}>{displayCell(rma.Sales_Order_Name)}</Td>
                                            <Td className={tdClass}>
                                                {canLinkQuotes && rma.Customer_Quote__c ? (
                                                    <Link href={`/quotes/${rma.Customer_Quote__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {rma.Customer_Quote_Name || "—"}
                                                    </Link>
                                                ) : (rma.Customer_Quote_Name || "—")}
                                            </Td>
                                            <Td className={tdClass}>
                                                {canLinkProposals && rma.Proposal__c ? (
                                                    <Link href={`/proposals/${rma.Proposal__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title={displayCell(rma.Proposal_Name)}>
                                                        {rma.Proposal_Number__c || "—"}
                                                    </Link>
                                                ) : (rma.Proposal_Number__c || "—")}
                                            </Td>
                                            <Td title={displayCell(rma.Proposal_Name)} className={tdClass}>{displayCell(rma.Proposal_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(rma.Ship_from_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(rma.Ship_from_Contact_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(rma.Return_to_Account_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(rma.Return_to_Contact_Name)}</Td>
                                            <Td className={tdClass}>{rma.Drop_Ship__c ? "Yes" : "No"}</Td>
                                            <Td className={tdClass}>{formatNumber(rma.Total_Lines__c)}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(rma.Total_Price__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatDate(rma.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(rma.Return_by_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{displayCell(rma.Shipping_Method__c)}</Td>
                                            <Td title={rma.Logistics_Partner_Name} className={tdClass}>{displayCell(rma.Logistics_Partner_Name)}</Td>
                                            <Td title={rma.Logistics_Contact_Name} className={tdClass}>{displayCell(rma.Logistics_Contact_Name)}</Td>
                                            <Td title={rma.Tracking_Number__c} className={tdClass}>{displayCell(rma.Tracking_Number__c)}</Td>
                                            <Td title={rma.Tracking_Status__c} className={tdClass}>{rma.Tracking_Status__c ? rma.Tracking_Status__c : "—"}</Td>
                                            <Td className={tdClass}>{formatDate(rma.Estimated_Delivery_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(rma.Actual_Delivery_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(rma.Goods_Receipt_Date__c, "numeric-dash") || "—"}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={rmaPage}
                            totalPages={Math.ceil(sortedRmaList.length / ITEMS_PER_PAGE)}
                            totalItems={sortedRmaList.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setRmaPage}
                            itemName="RMAs"
                        />
                    </div>
                )
            )}

            {/* Credit Memos */}
            {activeSubTab === "credits" && (
                creditMemos.length === 0 ? emptyState("credit memos") : (
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className={tableClass}>
                                <THead>
                                    <tr>
                                        <SortableHeader label="Credit Memo #" field="Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmName || 160} onResize={handleResize} className={stickyThClass} />
                                        <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmStatus || 120} onResize={handleResize} />
                                        <SortableHeader label="Invoice" field="Invoice_Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmInvoice || 150} onResize={handleResize} />
                                        <SortableHeader label="Sales Order" field="Sales_Order_Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmSalesOrder || 150} onResize={handleResize} />
                                        <SortableHeader label="Customer Quote #" field="Customer_Quote_Name" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmCustomerQuote || 170} onResize={handleResize} />
                                        <SortableHeader label="Proposal #" field="Proposal_Number__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmProposalNum || 140} onResize={handleResize} />
                                        <SortableHeader label="Proposal Name" field="Proposal_Name__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmProposalName || 160} onResize={handleResize} />
                                        <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmTotalLines || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="Total_Price__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmTotalPrice || 120} onResize={handleResize} />
                                        <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmShipping || 110} onResize={handleResize} />
                                        <SortableHeader label="Taxes" field="Total_Taxes_Amount__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmTaxes || 110} onResize={handleResize} />
                                        <SortableHeader label="Total Credit Amount" field="Total_Credit_Amount__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmCreditAmount || 170} onResize={handleResize} />
                                        <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmIssuedDate || 130} onResize={handleResize} />
                                        <SortableHeader label="Expiration Date" field="Expiration_Date__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmExpirationDate || 140} onResize={handleResize} />
                                        <SortableHeader label="Available Credit Balance" field="Available_Credit_Balance__c" sortConfig={sortConfigCm} requestSort={requestSortCm} width={widths.cmAvailBalance || 190} onResize={handleResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {pagedCreditMemos.map((cm) => (
                                        <Tr key={cm.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>{displayCell(cm.Name)}</Td>
                                            <Td><StatusBadge status={cm.Status__c || "—"} variant="compact" /></Td>
                                            <Td className={tdClass}>{displayCell(cm.Invoice_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(cm.Sales_Order_Name)}</Td>
                                            <Td className={tdClass}>
                                                {canLinkQuotes && cm.Customer_Quote__c ? (
                                                    <Link href={`/quotes/${cm.Customer_Quote__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {cm.Customer_Quote_Name || "—"}
                                                    </Link>
                                                ) : (cm.Customer_Quote_Name || "—")}
                                            </Td>
                                            <Td className={tdClass}>
                                                {canLinkProposals && cm.Proposal__c ? (
                                                    <Link href={`/proposals/${cm.Proposal__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {cm.Proposal_Number__c || "—"}
                                                    </Link>
                                                ) : (cm.Proposal_Number__c || "—")}
                                            </Td>
                                            <Td className={tdClass}>{displayCell(cm.Proposal_Name)}</Td>
                                            <Td className={tdClass}>{formatNumber(cm.Total_Lines__c)}</Td>
                                            <Td className={tdClass}>{formatCurrency(cm.Total_Price__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(cm.Total_Shipping_Charges__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatCurrency(cm.Total_Taxes_Amount__c ?? 0)}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(cm.Total_Credit_Amount__c ?? 0)}</Td>
                                            <Td className={tdClass}>{formatDate(cm.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(cm.Expiration_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdBoldClass}>{formatCurrency(cm.Available_Credit_Balance__c ?? 0)}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={cmPage}
                            totalPages={Math.ceil(sortedCreditMemos.length / ITEMS_PER_PAGE)}
                            totalItems={sortedCreditMemos.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCmPage}
                            itemName="credit memos"
                        />
                    </div>
                )
            )}

            {/* Debit Memos (non-Customer/NSO accounts only — kept unchanged per spec) */}
            {activeSubTab === "debits" && (
                debitMemos.length === 0 ? emptyState("debit memos") : (
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className={tableClass}>
                                <THead>
                                    <tr>
                                        <SortableHeader label="Debit Memo #" field="Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmName || 160} onResize={handleResize} className={stickyThClass} />
                                        <SortableHeader label="Status" field="Status__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmStatus || 120} onResize={handleResize} />
                                        <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmIssuedDate || 130} onResize={handleResize} />
                                        <SortableHeader label="Settled Date" field="Settled_Date__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmSettled || 130} onResize={handleResize} />
                                        <SortableHeader label="Debit To" field="Debit_to_Account_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmDebitTo || 150} onResize={handleResize} />
                                        <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmCustomerOrder || 150} onResize={handleResize} />
                                        <SortableHeader label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmPurchaseOrder || 150} onResize={handleResize} />
                                        <SortableHeader label="Supplier Bill" field="Supplier_Bill_Name" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmSupplierBill || 150} onResize={handleResize} />
                                        <SortableHeader label="Debit Amount" field="Total_Debit_Amount__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmDebitAmount || 130} onResize={handleResize} />
                                        <SortableHeader label="Available Balance" field="Available_Debit_Balance__c" sortConfig={sortConfigDm} requestSort={requestSortDm} width={widths.dmAvailBalance || 160} onResize={handleResize} />
                                    </tr>
                                </THead>
                                <TBody>
                                    {pagedDebitMemos.map((dm) => (
                                        <Tr key={dm.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>{displayCell(dm.Name)}</Td>
                                            <Td><StatusBadge status={dm.Status__c || "—"} variant="compact" /></Td>
                                            <Td className={tdClass}>{formatDate(dm.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(dm.Settled_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{displayCell(dm.Debit_to_Account_Name)}</Td>
                                            <Td className={tdClass}>
                                                {canLinkOrders && dm.Customer_Order_Id__c ? (
                                                    <Link href={`/orders/${dm.Customer_Order_Id__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {dm.Customer_Order_Name || "—"}
                                                    </Link>
                                                ) : (dm.Customer_Order_Name || "—")}
                                            </Td>
                                            <Td className={tdClass}>{displayCell(dm.Purchase_Order_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(dm.Supplier_Bill_Name)}</Td>
                                            <Td className={`${tdBoldClass} text-right`}>{formatCurrency(dm.Total_Debit_Amount__c ?? 0)}</Td>
                                            <Td className={`${tdBoldClass} text-right`}>{formatCurrency(dm.Available_Debit_Balance__c ?? 0)}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={dmPage}
                            totalPages={Math.ceil(sortedDebitMemos.length / ITEMS_PER_PAGE)}
                            totalItems={sortedDebitMemos.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setDmPage}
                            itemName="debit memos"
                        />
                    </div>
                )
            )}

            {/* RTV (non-Customer/NSO accounts only — kept unchanged per spec) */}
            {activeSubTab === "rtv" && (
                rtvList.length === 0 ? emptyState("RTVs") : (
                    <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-auto">
                            <Table className={tableClass}>
                                <THead>
                                    <tr>
                                        <SortableHeader label="RTV #" field="Name" sortConfig={sortConfigRtv} requestSort={requestSortRtv} width={widths.rtvName || 160} onResize={handleResize} className={stickyThClass} />
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
                                </THead>
                                <TBody>
                                    {pagedRtvList.map((rtv) => (
                                        <Tr key={rtv.Id} className="group transition-colors">
                                            <Td className={`${tdBoldClass} ${stickyTdClass}`}>{displayCell(rtv.Name)}</Td>
                                            <Td><StatusBadge status={rtv.Status__c || "—"} variant="compact" /></Td>
                                            <Td className={tdClass}>{displayCell(rtv.RTV_Type__c)}</Td>
                                            <Td className={tdClass}>{formatDate(rtv.Issued_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{formatDate(rtv.Return_by_Date__c, "numeric-dash") || "—"}</Td>
                                            <Td className={tdClass}>{displayCell(rtv.Supplier_Name)}</Td>
                                            <Td className={tdClass}>{displayCell(rtv.Supplier_RMA_Number__c)}</Td>
                                            <Td className={tdClass}>
                                                {canLinkOrders && rtv.Customer_Order_Id__c ? (
                                                    <Link href={`/orders/${rtv.Customer_Order_Id__c}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        {rtv.Customer_Order_Name || "—"}
                                                    </Link>
                                                ) : (rtv.Customer_Order_Name || "—")}
                                            </Td>
                                            <Td className={tdClass}>{displayCell(rtv.Purchase_Order_Name)}</Td>
                                            <Td className={`${tdBoldClass} text-right`}>{formatCurrency(rtv.Total_Cost__c ?? 0)}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                        <Pagination
                            currentPage={rtvPage}
                            totalPages={Math.ceil(sortedRtvList.length / ITEMS_PER_PAGE)}
                            totalItems={sortedRtvList.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setRtvPage}
                            itemName="RTVs"
                        />
                    </div>
                )
            )}
        </div>
    );
}
