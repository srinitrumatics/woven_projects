"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import { PurchaseOrder, POStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useUserSession } from "@/components/UserSessionContext";

const ITEMS_PER_PAGE = 10;

export default function PurchaseOrdersPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize resizable columns to match Proposals
    const { widths, handleResize } = useResizableColumns({
        name: 220,
        status: 120,
        customerQuoteName: 180,
        proposalNumber: 150,
        proposalName: 180,
        customerOrderName: 180,
        customerPO: 180,
        shipToAccountName: 180,
        shipToLocationName: 180,
        shipToContactName: 180,
        dropShip: 110,
        totalLines: 120,
        productCost: 150,
        shippingCost: 150,
        grandTotal: 150,
        paymentTerms: 160,
        issuedDate: 150,
        acknowledgedDate: 190,
        requestDate: 150,
        promiseDate: 150,
        trackingNumber: 170,
        trackingStatus: 170,
        estimatedDeliveryDate: 200,
        actualDeliveryDate: 190,
        goodsReceiptDate: 190,
        actions: 100
    });

    const { user, selectedAccount } = useUserSession();
    const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
    const SF_CONTACT_ID = user?.Id || user?.contact?.Id || "";

    useEffect(() => {
        async function fetchPurchaseOrders() {
            try {
                const res = await fetch(`/api/purchase-orders?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectName=Purchase_Order__c&tabName=Purchase_Order`);
                if (!res.ok) throw new Error('Failed to fetch purchase orders');
                const data = await res.json();

                const rawItems = data?.Purchase_Order__c || [];

                const mappedPOs: PurchaseOrder[] = rawItems.map((p: any) => ({
                    id: p.Id,
                    name: p.Name || '',
                    status: p.Status__c || '',
                    proposalName: p.Proposal_Name || p.Proposal__r?.Name || p.Proposal__c || '',
                    proposalNumber: p.Proposal_Number || p.Proposal_Name || p.Proposal__r?.Name || p.Proposal__c || '',
                    customerQuoteName: p.Customer_Quote_Name || '',
                    customerOrderName: p.Customer_Order_Name || '',
                    customerPO: p.Customer_PO__c || '',
                    supplierName: p.Supplier_Name || p.Supplier__r?.Name || p.Supplier_Name__c || '',
                    supplierDBA: p.Supplier_DBA__c || '',
                    supplierContact: p.Supplier_Contact_Name || p.Supplier_Contact__c || '',
                    shipToAccountName: p.Ship_to_Account_Name || '',
                    shipToLocationName: p.Authorized_Ship_To_Location_Name || '',
                    shipToContactName: p.Ship_to_Contact_Name || '',
                    dropShip: p.Drop_Ship__c || false,
                    totalLines: p.Total_Lines__c || 0,
                    productCost: p.Total_Product_Cost__c || p.gtherp__Total_Product_Cost__c || 0,
                    shippingCost: p.Total_Shipping_Charges__c || p.gtherp__Total_Shipping_Charges__c || 0,
                    totalCost: p.Total_Cost__c || p.gtherp__Total_Cost__c || 0,
                    issuedDate: p.Issued_Date__c || '',
                    acknowledgedDate: p.Acknowledged_Date__c || '',
                    requestDate: p.Request_Date__c || '',
                    promiseDate: p.Promise_Date__c || '',
                    shippingMethod: p.Shipping_Method__c || '',
                    logisticsPartner: p.Logistics_Partner_Name || '',
                    logisticsContact: p.Logistics_Contact_Name || '',
                    trackingNumber: p.Tracking_Number__c || '',
                    estimatedDeliveryDate: p.Estimated_Delivery_Date__c || '',
                    trackingStatus: p.Tracking_Status__c || '',
                    actualDeliveryDate: p.Actual_Delivery_Date__c || '',
                    goodsReceiptsDate: p.Goods_Receipt_Date__c || '',
                    paymentTerms: p.Payment_Terms__c || '',
                    proposalId: p.Proposal__c || '',
                    customerOrderId: p.Customer_Order__c || '',
                    customerQuoteId: p.Customer_Quote__c || ''
                }));

                setPurchaseOrders(mappedPOs);
            } catch (error) {
                console.error("Error fetching purchase orders:", error);
            } finally {
                setLoading(false);
            }
        }

        if (SF_ACCOUNT_ID && SF_CONTACT_ID) {
            fetchPurchaseOrders();
        }
    }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Stats calculation matching Proposal style
    const stats = useMemo(() => {
        const cardOneRecords = purchaseOrders.filter(po => ["Approved", "Partial", "Closed"].includes(po.status));
        const totalCount = cardOneRecords.length;
        const totalValue = cardOneRecords.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        const issued = purchaseOrders.filter(po => po.status === "Issued");
        const issuedCount = issued.length;
        const issuedValue = issued.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        const acknowledged = purchaseOrders.filter(po => po.status === "Acknowledged");
        const acknowledgedCount = acknowledged.length;
        const acknowledgedValue = acknowledged.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        const received = purchaseOrders.filter(po => po.status === "Received");
        const receivedCount = received.length;
        const receivedValue = received.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        const approved = purchaseOrders.filter(po => po.status === "Approved");
        const approvedCount = approved.length;
        const approvedValue = approved.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        const partial = purchaseOrders.filter(po => po.status === "Partial");
        const partialCount = partial.length;
        const partialValue = partial.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        const closed = purchaseOrders.filter(po => po.status === "Closed");
        const closedCount = closed.length;
        const closedValue = closed.reduce((sum, po) => sum + (po.totalCost || 0), 0);

        return {
            totalCount, totalValue,
            issuedCount, issuedValue,
            acknowledgedCount, acknowledgedValue,
            receivedCount, receivedValue,
            approvedCount, approvedValue,
            partialCount, partialValue,
            closedCount, closedValue
        };
    }, [purchaseOrders]);

    // Filter and search
    const filteredPOs = useMemo(() => {
        let filtered = purchaseOrders;

        if (activeTab !== "All") {
            filtered = filtered.filter(po => po.status === activeTab);
        } else {
            filtered = filtered.filter(po => ["Approved", "Partial", "Closed"].includes(po.status));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(po =>
                po.name.toLowerCase().includes(query) ||
                po.supplierName.toLowerCase().includes(query) ||
                (po.customerPO || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [purchaseOrders, activeTab, searchQuery]);

    const { items: sortedPOs, requestSort, sortConfig } = useSortableData<PurchaseOrder>(filteredPOs, { key: 'name', direction: 'desc' });

    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedPOs.length / ITEMS_PER_PAGE));
    const paginatedPOs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedPOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPOs, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const handleCardClick = (status: string) => {
        setActiveTab(status);
    };

    return (
        <Sidebar>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Purchase Orders</h1>
                <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Manage and Track Supplier Purchase Orders">Manage and Track Supplier Purchase Orders</p>
            </div>

            {/* Stats Cards - Compact & Engaging Design (Matched to Proposal) */}
            <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="All Purchase Orders"
                    count={stats.totalCount}
                    value={stats.totalValue}
                    isActive={activeTab === "All"}
                    onClick={() => handleCardClick("All")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    color="primary"

                />
                <StatCard
                    label="Approved"
                    count={stats.approvedCount}
                    value={stats.approvedValue}
                    isActive={activeTab === "Approved"}
                    onClick={() => handleCardClick("Approved")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="green"

                />
                <StatCard
                    label="Partial"
                    count={stats.partialCount}
                    value={stats.partialValue}
                    isActive={activeTab === "Partial"}
                    onClick={() => handleCardClick("Partial")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    color="amber"
                />
                <StatCard
                    label="Closed"
                    count={stats.closedCount}
                    value={stats.closedValue}
                    isActive={activeTab === "Closed"}
                    onClick={() => handleCardClick("Closed")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    color="red"

                />
            </div>

            {/* Main Table Section (Matched to Proposal) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-3 px-2 pb-4">
                        <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search purchase orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {["All", "Draft", "Approved", "Issued", "Acknowledged", "Received", "Partial", "Closed"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm ${activeTab === status
                                        ? "bg-primary text-white scale-105"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto shadow-sm">
                    {loading ? (
                        <LoadingState />
                    ) : (
                        <table className="w-full">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader truncate={false} label="Purchase Order #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader truncate={false} label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteName} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrderName} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccountName} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocationName} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContactName} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Total Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Shipping" field="shippingCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingCost} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Grand Total" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Acknowledgement Date" field="acknowledgedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.acknowledgedDate} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Promise Date" field="promiseDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.promiseDate} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                                    <SortableHeader truncate={false} label="Goods Receipt Date" field="goodsReceiptsDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={handleResize} />
                                    <th className="text-sm px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 ">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedPOs.length === 0 ? (
                                    <EmptyState query={searchQuery} />
                                ) : (
                                    paginatedPOs.map(po => (
                                        <tr key={po.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors group" >
                                            <td className="px-2 py-2 text-sm font-semibold text-primary group-hover:underline truncate max-w-[200px] sticky left-0 bg-white dark:bg-gray-800 z-10 " title={po.name}>
                                                <Link href={`/purchase-orders/${po.id}`} className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                                                    {po.name}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-2 truncate" title={po.status}><StatusBadge status={po.status} /></td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={po.customerQuoteName || '-'}>
                                                {po.customerQuoteId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/quotes/${po.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                            {po.customerQuoteName || 'View Quote'}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-medium">{po.customerQuoteName || '-'}</span>
                                                    )
                                                ) : (
                                                    po.customerQuoteName || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={po.proposalNumber || '-'}>
                                                {po.proposalId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/proposals/${po.proposalId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                                            {po.proposalNumber || 'View Proposal'}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-medium">{po.proposalNumber || '-'}</span>
                                                    )
                                                ) : (
                                                    po.proposalNumber || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={displayCell(po.proposalName)}>{displayCell(po.proposalName)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={po.customerOrderName || '-'}>
                                                {po.customerOrderId ? (
                                                    !isManufacturer ? (
                                                        <Link href={`/orders/${po.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                            {po.customerOrderName || 'View Order'}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-medium">{po.customerOrderName || '-'}</span>
                                                    )
                                                ) : (
                                                    po.customerOrderName || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={displayCell(po.customerPO)}>{displayCell(po.customerPO)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={displayCell(po.shipToAccountName)}>{displayCell(po.shipToAccountName)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={displayCell(po.shipToLocationName)}>{displayCell(po.shipToLocationName)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={displayCell(po.shipToContactName)}>{displayCell(po.shipToContactName)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{po.dropShip ? "Yes" : "No"}</td>
                                            <td className="px-2 py-2 text-sm text-gray-900 dark:text-white font-medium truncate" title={String(po.totalLines || 0)}>{po.totalLines || 0}</td>
                                            <td className="px-2 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(po.productCost)}>{formatCurrency(po.productCost)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(po.shippingCost)}>{formatCurrency(po.shippingCost)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" title={formatCurrency(po.totalCost)}>{formatCurrency(po.totalCost)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={displayCell(po.paymentTerms)}>{displayCell(po.paymentTerms)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.issuedDate ? formatDate(po.issuedDate, 'numeric-dash') : '-'}>{po.issuedDate ? formatDate(po.issuedDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.acknowledgedDate ? formatDate(po.acknowledgedDate, 'numeric-dash') : '-'}>{po.acknowledgedDate ? formatDate(po.acknowledgedDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.requestDate ? formatDate(po.requestDate, 'numeric-dash') : '-'}>{po.requestDate ? formatDate(po.requestDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.promiseDate ? formatDate(po.promiseDate, 'numeric-dash') : '-'}>{po.promiseDate ? formatDate(po.promiseDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={displayCell(po.trackingNumber)}>{displayCell(po.trackingNumber)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={displayCell(po.trackingStatus)}>{displayCell(po.trackingStatus)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.estimatedDeliveryDate ? formatDate(po.estimatedDeliveryDate, 'numeric-dash') : '-'}>{po.estimatedDeliveryDate ? formatDate(po.estimatedDeliveryDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.actualDeliveryDate ? formatDate(po.actualDeliveryDate, 'numeric-dash') : '-'}>{po.actualDeliveryDate ? formatDate(po.actualDeliveryDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={po.goodsReceiptsDate ? formatDate(po.goodsReceiptsDate, 'numeric-dash') : '-'}>{po.goodsReceiptsDate ? formatDate(po.goodsReceiptsDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm truncate">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <button className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg truncate">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredPOs.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="purchase orders"
                />
            </div>
        </Sidebar>
    );
}

function StatCard({ label, count, value, isActive, onClick, icon, color, customFooter }: any) {
    const colorClasses: any = {
        primary: "from-primary to-primary-dark",
        gray: "from-gray-400 to-gray-500",
        amber: "from-amber-400 to-amber-500",
        blue: "from-blue-400 to-blue-600",
        green: "from-emerald-400 to-emerald-600",
        red: "from-red-400 to-red-600",
    };

    const activeBorderClasses: any = {
        primary: "border-primary ring-2 ring-primary/20",
        gray: "border-gray-500 ring-2 ring-gray-500/20",
        amber: "border-amber-500 ring-2 ring-amber-500/20",
        blue: "border-blue-500 ring-2 ring-blue-500/20",
        green: "border-emerald-500 ring-2 ring-emerald-500/20",
        red: "border-red-500 ring-2 ring-red-500/20",
    };

    const textColors: any = {
        primary: "text-primary",
        gray: "text-gray-600 dark:text-gray-300",
        amber: "text-amber-600 dark:text-amber-300",
        blue: "text-blue-600 dark:text-blue-400",
        green: "text-emerald-600 dark:text-emerald-400",
        red: "text-red-600 dark:text-red-400",
    };

    const iconClasses: any = {
        primary: isActive ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
        gray: isActive ? "bg-gray-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-600 group-hover:text-white",
        amber: isActive ? "bg-amber-600 text-white" : "bg-amber-100 dark:bg-amber-700 text-amber-500 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white",
        blue: isActive ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
        green: isActive ? "bg-emerald-600 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
        red: isActive ? "bg-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white",
    };

    return (
        <button
            onClick={onClick}
            className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${isActive ? activeBorderClasses[color] : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                }`}
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses[color]}`}></div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <Link
                            href="#"
                            onClick={(e) => { e.preventDefault(); onClick(); }}
                            className="hover:underline block"
                        >
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate">{label}</p>
                        </Link>
                        <Link
                            href="#"
                            onClick={(e) => { e.preventDefault(); onClick(); }}
                            className="hover:underline block"
                        >
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{count}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">POs</span>
                            </div>
                        </Link>
                        <p className={`text-lg font-semibold mt-1 ${textColors[color]}`}>
                            {formatCurrency(value)}
                        </p>
                    </div>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${iconClasses[color]}`}>
                        {icon}
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 z-10 relative">
                    {customFooter ? customFooter : (
                        <span className={`inline-flex items-center text-xs font-medium ${color === 'primary' ? 'text-primary' : textColors[color]} group-hover:underline`}>
                            <Link
                                href="#"
                                onClick={(e) => { e.preventDefault(); onClick(); }}
                                className="hover:underline block">
                                View {label.toLowerCase()}</Link>
                            <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Acknowledged":
            case "Received":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "Issued":
            case "Pending Approval":
                return "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
            case "Draft":
                return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
            case "Cancelled":
            case "Closed":
                return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            default:
                return "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`}>
            {status}
        </span>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse min-w-0">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide truncate" title="Synchronizing data from Salesforce...">Synchronizing data from Salesforce...</p>
        </div>
    );
}

function EmptyState({ query }: { query: string }) {
    return (
        <tr>
            <td colSpan={26} className="px-6 py-4 text-center truncate">
                <div className="flex flex-col items-center max-w-sm mx-auto min-w-0">

                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate" title="No Purchase Orders Found">No Purchase Orders Found</p>
                    <p className="text-gray-500 dark:text-gray-400 truncate">
                        {query ? `We couldn't find any results matching "${query}". Try a different search term.` : "There are currently no purchase orders in the system."}
                    </p>
                </div>
            </td>
        </tr>
    );
}
