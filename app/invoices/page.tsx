"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { Invoice, InvoiceStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useSortableData } from "@/hooks/useSortableData";

const ITEMS_PER_PAGE = 10;

export default function InvoicesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<InvoiceStatus | "All" | "Outstanding">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableStatuses, setAvailableStatuses] = useState<{ value: string, label: string }[]>([]);

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    invoiceNumber: 160,
    status: 120,
    salesOrder: 150,
    purchaseOrder: 150,
    proposalName: 200,
    customerOrder: 150,
    customerPO: 180,
    accountName: 200,
    totalLines: 120,
    totalAmount: 140,
    invoiceDate: 140,
    paymentTerms: 160,
    collectionStatus: 160,
    amountDue: 140,
    actions: 100
  });

  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&action=list`);
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();

        // Based on API: { data: [{ Status__c: [...], Invoice__c: [...] }] }
        const rawItems = data?.Invoice__c || [];
        const statuses = data?.Status__c || [];
        setAvailableStatuses(statuses);

        const mappedInvoices: Invoice[] = rawItems.map((item: any) => ({
          id: item.Id,
          invoiceNumber: item.Name || 'N/A',
          accountName: item.Bill_to_Account_Name || 'N/A',
          status: (item.Status__c || 'Draft') as InvoiceStatus,
          totalAmount: item.Grand_Total__c || 0,
          amountPaid: item.Total_Amount_Collected__c || 0,
          amountDue: item.Open_Balance__c || 0,
          invoiceDate: item.Issued_Date__c || item.CreatedDate?.split('T')[0] || '',
          dueDate: item.Due_Date__c || '',
          salesOrderNumber: item.Sales_Order_Name || 'N/A',
          purchaseOrderNumber: item.Purchase_Order_Name || 'N/A',
          proposalName: item.Proposal_Name || 'N/A',
          customerOrder: item.Customer_Order_Name || 'N/A',
          customerPO: item.Customer_PO__c || 'N/A',
          lineItemCount: item.Total_Lines__c || 0,
          paymentTerms: item.Payment_Terms__c || 'N/A',
          collectionStatus: item.Collection_Status__c || 'N/A',
          description: item.Invoice_Notes__c || '',
          contactName: item.Bill_to_Contact_Name || 'N/A'
        }));

        setInvoices(mappedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Calculate stats from fetched data
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const overdue = invoices.filter(inv => inv.status === "Overdue");
    const overdueCount = overdue.length;
    const overdueValue = overdue.reduce((sum, inv) => sum + inv.amountDue, 0);

    const paid = invoices.filter(inv => inv.status === "Paid");
    const paidCount = paid.length;
    const paidValue = paid.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const outstanding = invoices.filter(inv => inv.amountDue > 0);
    const outstandingCount = outstanding.length;
    const outstandingValue = outstanding.reduce((sum, inv) => sum + inv.amountDue, 0);

    return {
      totalCount, totalValue,
      overdueCount, overdueValue,
      paidCount, paidValue,
      outstandingCount, outstandingValue
    };
  }, [invoices]);

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Apply status filter
    if (activeTab === "Outstanding") {
      filtered = filtered.filter(inv => inv.amountDue > 0);
    } else if (activeTab !== "All") {
      filtered = filtered.filter(inv => inv.status === activeTab);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.accountName.toLowerCase().includes(query) ||
        (invoice.contactName && invoice.contactName.toLowerCase().includes(query)) ||
        (invoice.description && invoice.description.toLowerCase().includes(query)) ||
        invoice.salesOrderNumber?.toLowerCase().includes(query) ||
        invoice.purchaseOrderNumber?.toLowerCase().includes(query) ||
        invoice.proposalName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [invoices, searchQuery, activeTab]);

  // Sorting
  const { items: sortedInvoices, requestSort, sortConfig } = useSortableData<Invoice>(filteredInvoices, { key: 'invoiceNumber', direction: 'desc' });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / ITEMS_PER_PAGE));
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedInvoices, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleCardClick = (tab: InvoiceStatus | "All" | "Outstanding") => {
    setActiveTab(tab);
  };

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1">Manage Invoices and Track Payments</p>
      </div>

      {/* Stats Cards - Following Proposal Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Invoices Card */}
        <button
          onClick={() => handleCardClick("All")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "All"
            ? "border-primary ring-2 ring-primary/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">Total Invoices</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Invoices</span>
                </div>
                <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "All" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline">
                View all invoices
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Outstanding Card */}
        <button
          onClick={() => handleCardClick("Outstanding")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "Outstanding"
            ? "border-amber-500 ring-2 ring-amber-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-amber-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">Outstanding</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.outstandingCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Unpaid</span>
                </div>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(stats.outstandingValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Outstanding" ? "bg-amber-500 text-white" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
                View outstanding
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Overdue Card */}
        <button
          onClick={() => handleCardClick("Overdue")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "Overdue"
            ? "border-red-500 ring-2 ring-red-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-red-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">Overdue</p>
                  {stats.overdueCount > 0 && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.overdueCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Critical</span>
                </div>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1">{formatCurrency(stats.overdueValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Overdue" ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-red-600 dark:text-red-400 group-hover:underline">
                Review overdue
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Paid Card */}
        <button
          onClick={() => handleCardClick("Paid")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "Paid"
            ? "border-green-500 ring-2 ring-green-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-green-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">Paid</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.paidCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                </div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">{formatCurrency(stats.paidValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Paid" ? "bg-green-500 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline">
                View paid
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Invoices Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {/* Header with Search and Filter */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice List</h2>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Status Dropdown Filter */}
              <div className="relative min-w-[160px]">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="All">All Invoices</option>
                  {availableStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Following Proposal Style */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p className="text-sm">Loading invoices...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Invoice Number" field="invoiceNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceNumber} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                  <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                  <SortableHeader label="Sales Order" field="salesOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={handleResize} />
                  <SortableHeader label="Purchase Order" field="purchaseOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={handleResize} />
                  <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                  <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                  <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                  <SortableHeader label="Bill to Account" field="accountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.accountName} onResize={handleResize} />
                  <SortableHeader label="Total Lines" field="lineItemCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                  <SortableHeader label="Grand Total" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} />
                  <SortableHeader label="Issued Date" field="invoiceDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceDate} onResize={handleResize} />
                  <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={handleResize} />
                  <SortableHeader label="Collection Status" field="collectionStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.collectionStatus} onResize={handleResize} />
                  <SortableHeader label="Open Balance" field="amountDue" sortConfig={sortConfig} requestSort={requestSort} width={widths.amountDue} onResize={handleResize} />
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No invoices found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          {searchQuery || activeTab !== "All" ? "Try adjusting your filters" : "No invoices available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left">
                        <div title={invoice.invoiceNumber}>{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.salesOrderNumber}>{invoice.salesOrderNumber || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.purchaseOrderNumber}>{invoice.purchaseOrderNumber || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.proposalName}>{invoice.proposalName || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.customerOrder}>{invoice.customerOrder || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.customerPO}>{invoice.customerPO || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.accountName}>{invoice.accountName}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">{invoice.lineItemCount}</td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(invoice.invoiceDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.paymentTerms}>{invoice.paymentTerms || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.collectionStatus}>{invoice.collectionStatus || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-left">
                        <span className={`font-semibold ${invoice.amountDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {formatCurrency(invoice.amountDue)}
                        </span>
                      </td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="View invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="invoices"
        />
      </div>
    </Sidebar>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const getStyles = () => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Partial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Sent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Viewed":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Draft":
        return "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-400";
      case "Cancelled":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
      {status}
    </span>
  );
}

