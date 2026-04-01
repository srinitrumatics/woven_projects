"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { SupplierBill } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

const ITEMS_PER_PAGE = 10;

export default function SupplierBillsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize resizable columns
    const { widths, handleResize } = useResizableColumns({
        name: 180,
        status: 120,
        purchaseOrderName: 160,
        customerQuoteName: 160,
        proposalName: 180,
        customerOrderName: 160,
        supplierName: 200,
        totalLines: 150,
        totalAmount: 140,
        billedDate: 140,
        paymentTerms: 140,
        dueDate: 140,
        remittanceStatus: 160,
        openBalance: 140,
        actions: 100
    });

    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

    useEffect(() => {
        async function fetchSupplierBills() {
            try {
                const res = await fetch(`/api/supplier-bills?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectName=Supplier_Bill__c&tabName=Supplier_Bill`);
                if (!res.ok) throw new Error('Failed to fetch supplier bills');
                const data = await res.json();

                const rawItems = data?.Supplier_Bill__c || [];

                const mappedBills: SupplierBill[] = rawItems.map((b: any) => ({
                    id: b.Id,
                    name: b.Name || '',
                    status: b.Status__c || '',
                    purchaseOrderName: b.Purchase_Order_Name || b.Purchase_Order__r?.Name || '',
                    purchaseOrderId: b.Purchase_Order__c || '',
                    customerQuoteName: b.Customer_Quote_Name || '',
                    customerQuoteId: b.Customer_Quote__c || '',
                    customerOrderName: b.Customer_Order_Name || '',
                    customerOrderId: b.Customer_Order__c || '',
                    proposalName: b.Proposal_Name || '',
                    proposalId: b.Proposal__c || '',
                    supplierName: b.Supplier_Name || b.Supplier__r?.Name || '',
                    supplierDBA: b.Supplier_DBA__c || '',
                    supplierContact: b.Supplier_Contact_Name || '',
                    totalLines: b.Total_Lines__c || 0,
                    totalProductAmount: b.Total_Product_Amount__c || 0,
                    totalShippingCharges: b.Total_Shipping_Charges__c || 0,
                    totalAmount: b.TotalAmount__c || 0,
                    billedDate: b.Billed_Date__c || '',
                    paymentTerms: b.Payment_Terms__c || '',
                    dueDate: b.Due_Date__c || '',
                    remittanceStatus: b.Remittance_Status__c || '',
                    openBalance: b.Open_Balance__c || 0,
                    daysOutstanding: b.Days_Outstanding__c || 0,
                    settledDate: b.Settled_Date__c || ''
                }));

                setSupplierBills(mappedBills);
            } catch (error) {
                console.error("Error fetching supplier bills:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSupplierBills();
    }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Stats calculation
    const stats = useMemo(() => {
        const cardOneRecords = supplierBills.filter(b =>
            ["Approved", "Closed"].includes(b.status) &&
            ["Pending", "Past Due", "Paid"].includes(b.remittanceStatus)
        );
        const totalCount = cardOneRecords.length;
        const totalValue = cardOneRecords.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const pending = supplierBills.filter(b => b.status === "Approved" && b.remittanceStatus === "Pending");
        const pendingCount = pending.length;
        const pendingValue = pending.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const pastDue = supplierBills.filter(b => b.status === "Approved" && b.remittanceStatus === "Past Due");
        const pastDueCount = pastDue.length;
        const pastDueValue = pastDue.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const paid = supplierBills.filter(b => b.status === "Closed" && b.remittanceStatus === "Paid");
        const paidCount = paid.length;
        const paidValue = paid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
            totalCount, totalValue,
            pendingCount, pendingValue,
            pastDueCount, pastDueValue,
            paidCount, paidValue
        };
    }, [supplierBills]);

    // Filter and search
    const filteredBills = useMemo(() => {
        let filtered = supplierBills;

        if (activeTab === "Pending") {
            filtered = filtered.filter(b => b.status === "Approved" && b.remittanceStatus === "Pending");
        } else if (activeTab === "Past Due") {
            filtered = filtered.filter(b => b.status === "Approved" && b.remittanceStatus === "Past Due");
        } else if (activeTab === "Paid") {
            filtered = filtered.filter(b => b.status === "Closed" && b.remittanceStatus === "Paid");
        } else if (activeTab !== "All") {
            filtered = filtered.filter(b => b.remittanceStatus === activeTab);
        } else {
            // "All" tab filters by specific Status and Remittance Status
            filtered = filtered.filter(b =>
                ["Approved", "Closed"].includes(b.status) &&
                ["Pending", "Past Due", "Paid"].includes(b.remittanceStatus)
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(query) ||
                b.supplierName.toLowerCase().includes(query) ||
                (b.purchaseOrderName || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [supplierBills, activeTab, searchQuery]);

    const { items: sortedBills, requestSort, sortConfig } = useSortableData<SupplierBill>(filteredBills, { key: 'name', direction: 'desc' });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedBills.length / ITEMS_PER_PAGE));
    const paginatedBills = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedBills.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedBills, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const handleCardClick = (status: string) => {
        setActiveTab(status);
    };

    return (
        <Sidebar>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">Supplier Bills</h1>
                <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Manage and Track Supplier Invoices and Payments">Manage and Track Supplier Invoices and Payments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="All Bills"
                    count={stats.totalCount}
                    value={stats.totalValue}
                    isActive={activeTab === "All"}
                    onClick={() => handleCardClick("All")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    color="primary"
                />
                <StatCard
                    label="Pending"
                    count={stats.pendingCount}
                    value={stats.pendingValue}
                    isActive={activeTab === "Pending"}
                    onClick={() => handleCardClick("Pending")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="amber"
                />
                <StatCard
                    label="Past Due"
                    count={stats.pastDueCount}
                    value={stats.pastDueValue}
                    isActive={activeTab === "Past Due"}
                    onClick={() => handleCardClick("Past Due")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    color="red"
                />
                <StatCard
                    label="Paid"
                    count={stats.paidCount}
                    value={stats.paidValue}
                    isActive={activeTab === "Paid"}
                    onClick={() => handleCardClick("Paid")}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="green"
                />
            </div>

            {/* Main Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative min-w-[220px] max-w-xs transition-all duration-200">
                        <input
                            type="text"
                            placeholder="Search supplier bills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {["All", "Pending", "Past Due", "Paid"].map(status => (
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

                <div className="overflow-x-auto ">
                    {loading ? (
                        <LoadingState />
                    ) : (
                        <table className="w-full border-collapse">
                            <thead className="bg-primary-light dark:bg-gray-900">
                                <tr>
                                    <SortableHeader label="Supplier Bill" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                    <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderName} onResize={handleResize} />
                                    <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteName} onResize={handleResize} />
                                    <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                                    <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrderName} onResize={handleResize} />
                                    <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={handleResize} />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                                    <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} />
                                    <SortableHeader label="Billed Date" field="billedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.billedDate} onResize={handleResize} />
                                    <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={handleResize} />
                                    <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={handleResize} />
                                    <SortableHeader label="Remittance Status" field="remittanceStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.remittanceStatus} onResize={handleResize} />
                                    <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalance} onResize={handleResize} />
                                    <SortableHeader label="Action" field="actions" sortConfig={sortConfig} requestSort={requestSort} width={widths.actions} onResize={handleResize} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {paginatedBills.length === 0 ? (
                                    <EmptyState query={searchQuery} />
                                ) : (
                                    paginatedBills.map(bill => (
                                        <tr key={bill.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer" onClick={() => router.push(`/supplier-bills/${bill.id}`)}>
                                            <td className="px-2 py-2 text-sm font-semibold text-primary group-hover:underline truncate" title={bill.name}>{bill.name}</td>
                                            <td className="px-2 py-2 text-sm truncate" title={bill.status}><StatusBadge status={bill.status} /></td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={bill.purchaseOrderName}>
                                                {bill.purchaseOrderId && bill.purchaseOrderId !== 'N/A' && bill.purchaseOrderId !== '' ? (
                                                    <Link href={`/purchase-orders/${bill.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                        {bill.purchaseOrderName || bill.purchaseOrderId}
                                                    </Link>
                                                ) : (
                                                    bill.purchaseOrderName || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={bill.customerQuoteName}>
                                                {bill.customerQuoteId && bill.customerQuoteId !== 'N/A' && bill.customerQuoteId !== '' ? (
                                                    <Link href={`/quotes/${bill.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                        {bill.customerQuoteName || bill.customerQuoteId}
                                                    </Link>
                                                ) : (
                                                    bill.customerQuoteName || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]" title={bill.proposalName}>
                                                {bill.proposalId && bill.proposalId !== 'N/A' && bill.proposalId !== '' ? (
                                                    <Link href={`/proposals/${bill.proposalId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                        {bill.proposalName || bill.proposalId}
                                                    </Link>
                                                ) : (
                                                    bill.proposalName || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={bill.customerOrderName}>
                                                {bill.customerOrderId && bill.customerOrderId !== 'N/A' && bill.customerOrderId !== '' ? (
                                                    <Link href={`/orders/${bill.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                                        {bill.customerOrderName || bill.customerOrderId}
                                                    </Link>
                                                ) : (
                                                    bill.customerOrderName || '-'
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={bill.supplierName}>{bill.supplierName || '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400 font-medium truncate" >{bill.totalLines}</td>
                                            <td className="px-2 py-2 text-sm text-gray-900 dark:text-white font-bold truncate">{formatCurrency(bill.totalAmount)}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={bill.billedDate}>{bill.billedDate ? formatDate(bill.billedDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={bill.paymentTerms || '-'}>{bill.paymentTerms || '-'}</td>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate" title={bill.dueDate ? formatDate(bill.dueDate, 'numeric-dash') : '-'}>{bill.dueDate ? formatDate(bill.dueDate, 'numeric-dash') : '-'}</td>
                                            <td className="px-2 py-2 text-sm truncate" title={bill.remittanceStatus}><RemittanceBadge status={bill.remittanceStatus} /></td>
                                            <td className="px-2 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">{formatCurrency(bill.openBalance)}</td>
                                            <td className="px-2 py-2 text-sm truncate">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <button className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg truncate" title="View Supplier Bill">
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
                    totalItems={filteredBills.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="supplier bills"
                />
            </div>
        </Sidebar>
    );
}

function StatCard({ label, count, value, isActive, onClick, icon, color }: any) {
    const colorClasses: any = {
        primary: "from-primary to-primary-dark",
        gray: "from-gray-400 to-gray-500",
        blue: "from-blue-400 to-blue-600",
        green: "from-emerald-400 to-emerald-600",
        red: "from-red-400 to-red-600",
        amber: "from-amber-400 to-amber-600",
    };

    const activeBorderClasses: any = {
        primary: "border-primary ring-2 ring-primary/20",
        gray: "border-gray-500 ring-2 ring-gray-500/20",
        blue: "border-blue-500 ring-2 ring-blue-500/20",
        green: "border-emerald-500 ring-2 ring-emerald-500/20",
        red: "border-red-500 ring-2 ring-red-500/20",
        amber: "border-amber-500 ring-2 ring-amber-500/20",
    };

    const textColors: any = {
        primary: "text-primary",
        gray: "text-gray-600 dark:text-gray-300",
        blue: "text-blue-600 dark:text-blue-400",
        green: "text-emerald-600 dark:text-emerald-400",
        red: "text-red-600 dark:text-red-400",
        amber: "text-amber-600 dark:text-amber-400",
    };

    const iconClasses: any = {
        primary: isActive ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
        gray: isActive ? "bg-gray-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-600 group-hover:text-white",
        blue: isActive ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
        green: isActive ? "bg-emerald-600 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
        red: isActive ? "bg-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white",
        amber: isActive ? "bg-amber-600 text-white" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white",

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
                                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Bills</span>
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
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
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
                </div>
            </div>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Paid":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "Pending":
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

function RemittanceBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Paid":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "Partially Paid":
                return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
            case "Unpaid":
            case "Not Payable":
            case "Past Due":
                return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            case "Pending":
                return "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
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
            <td colSpan={14} className="px-6 py-4 text-center truncate">
                <div className="flex flex-col items-center max-w-sm mx-auto min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate" title="No Supplier Bills Found">No Supplier Bills Found</p>
                    <p className="text-gray-500 dark:text-gray-400 truncate">
                        {query ? `We couldn't find any results matching "${query}". Try a different search term.` : "There are currently no supplier bills in the system."}
                    </p>
                </div>
            </td>
        </tr>
    );
}
