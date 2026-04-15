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
import { useUserSession } from "@/components/UserSessionContext";

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

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
  const SF_CONTACT_ID = user?.Id || "";

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&action=list`);
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();
        console.log("Fetched invoices data:", data);

        // API might return standard list or object with metadata
        const responseData = Array.isArray(data) ? (data[0] || {}) : data;
        const rawItems = responseData?.Invoice__c || (Array.isArray(data) ? data : []);
        const statuses = responseData?.Status__c || [];
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
          contactName: item.Bill_to_Contact_Name || 'N/A',
          salesOrderId: item.Sales_Order__c || '',
          purchaseOrderId: item.Purchase_Order__c || '',
          proposalId: item.Proposal__c || '',
          customerOrderId: item.Customer_Order__c || '',
          accountId: item.Bill_to_Account__c || ''
        }));

        setInvoices(mappedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }

    if (SF_ACCOUNT_ID && SF_CONTACT_ID) {
      fetchInvoices();
    }
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Calculate stats from fetched data
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const overdue = invoices.filter(inv => inv.status === "Overdue");
    const overdueCount = overdue.length;
    const overdueValue = overdue.reduce((sum, inv) => sum + inv.amountDue, 0);

    const paid = invoices.filter(inv => inv.status === "Paid" || inv.status === "Settled");
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Invoices</h1>
        <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Manage Invoices and Track Payments">Manage Invoices and Track Payments</p>
      </div>

      {/* Stats Cards - Following Proposal Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-4 gap-4 mb-6">
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("All")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="All Invoices">All Invoices</p>
                </Link>
                <div className="flex items-baseline gap-2">
                  <Link
                    href="#"
                    onClick={() => handleCardClick("All")}
                    className="hover:underline block">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.totalCount}</span>

                  </Link>
                  <Link
                    href="#"
                    onClick={() => handleCardClick("All")}
                    className="hover:underline block">
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Invoices</span>
                  </Link>
                </div>
                <p className="text-lg font-semibold text-primary mt-1 truncate">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "All" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline truncate">
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
            ? "border-yellow-500 ring-2 ring-yellow-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-yellow-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Outstanding")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Pending">Pending</p>
                </Link>
                <div className="flex items-baseline gap-2">
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Outstanding")}
                    className="hover:underline block">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.outstandingCount}</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Outstanding")}
                    className="hover:underline block">
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Invoices</span>
                  </Link>
                </div>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-1 truncate">{formatCurrency(stats.outstandingValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Outstanding" ? "bg-amber-500 text-white" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline truncate">
                View Pending
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
                <div className="flex items-center gap-2 mb-1 min-w-0">
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Overdue")}
                    className="hover:underline block">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide truncate" title="Past due">Past due</p>
                  </Link>
                  {stats.overdueCount > 0 && (
                    <span className="flex h-2 w-2 truncate">
                      <Link
                        href="#"
                        onClick={() => handleCardClick("Overdue")}
                        className="hover:underline block">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75 truncate"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 truncate"></span>
                      </Link>
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Overdue")}
                    className="hover:underline block">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.overdueCount}</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Overdue")}
                    className="hover:underline block">
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Invoices</span>
                  </Link>
                </div>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1 truncate">{formatCurrency(stats.overdueValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Overdue" ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-red-600 dark:text-red-400 group-hover:underline truncate">
                Past Dues
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("Paid")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Paid">Paid</p>
                </Link>
                <div className="flex items-baseline gap-2">
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Paid")}
                    className="hover:underline block">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.paidCount}</span>
                  </Link>
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Paid")}
                    className="hover:underline block">
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Invoices</span>
                  </Link>
                </div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1 truncate">{formatCurrency(stats.paidValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Paid" ? "bg-green-500 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline truncate">
                View paid
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div >

      {/* Invoices Table Section */}
      < div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4" >
        {/* Header with Search and Filter */}
        < div className="border-b border-gray-200 dark:border-gray-700" >
          {/* Heading row */}
          {/* Search + filter pills row */}
          <div className="flex flex-wrap items-center gap-3 px-2 pb-4">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status filter pills — only statuses present in loaded records */}
            <div className="flex flex-wrap items-center gap-2">
              {/* "All" — always visible */}
              <button
                onClick={() => setActiveTab('All')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'All'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                All
              </button>
              {/* One button per unique status in loaded invoices */}
              {Array.from(new Set(invoices.map(inv => inv.status).filter(Boolean)))
                .sort()
                .map(status => (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === status
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {status}
                  </button>
                ))}
            </div>
          </div>
        </div >

        {/* Table Following Proposal Style */}
        < div className="overflow-x-auto" >
          {
            loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400" >
                <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p className="text-sm truncate" title="Loading invoices...">Loading invoices...</p>
              </div>
            ) : (
              <table className="w-full text-sm">
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
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white " style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center truncate">
                        <div className="flex flex-col items-center justify-center min-w-0">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 truncate" title="No invoices found">No invoices found</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm truncate">
                            {searchQuery || activeTab !== "All" ? "Try adjusting your filters" : "No invoices available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <td className="px-3 py-2 text-sm text-primary font-semibold text-gray-600 dark:text-gray-400 hover:underline sticky left-0 bg-white dark:bg-gray-800 text-left truncate">
                          <div title={invoice.invoiceNumber} onClick={() => router.push(`/invoices/${invoice.id}`)}>{invoice.invoiceNumber}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 truncate">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium">{invoice.salesOrderNumber || ''}</div>
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div>
                            {invoice.purchaseOrderId ? (
                              <Link
                                href={`/purchase-orders/${invoice.purchaseOrderId}`}
                                className="text-primary font-medium hover:underline"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {invoice.purchaseOrderNumber || 'N/A'}
                              </Link>
                            ) : (
                              invoice.purchaseOrderNumber || 'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div>
                            {invoice.proposalId ? (
                              <Link
                                href={`/proposals/${invoice.proposalId}`}
                                target="_blank"
                                className="text-primary hover:underline font-medium"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {invoice.proposalName || 'N/A'}
                              </Link>
                            ) : (
                              invoice.proposalName || 'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div>
                            {invoice.customerOrderId ? (
                              <Link
                                href={`/orders/${invoice.customerOrderId}`}
                                target="_blank"
                                className="text-primary hover:underline font-medium"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {invoice.customerOrder || 'N/A'}
                              </Link>
                            ) : (
                              invoice.customerOrder || 'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.customerPO}>{invoice.customerPO || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium">{invoice.accountName}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white truncate">{invoice.lineItemCount}</td>
                        <td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white font-semibold truncate">{formatCurrency(invoice.totalAmount)}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(invoice.invoiceDate, 'numeric-dash')}</td>
                        <td className="px-3 py-2 truncate">
                          <div className="text-sm text-gray-600 dark:text-white font-medium" title={invoice.paymentTerms}>{invoice.paymentTerms || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2 truncate">
                          <div className="text-sm text-gray-600 dark:text-white font-medium" title={invoice.collectionStatus}>{invoice.collectionStatus || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-left truncate">
                          <span className={`font-semibold ${invoice.amountDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCurrency(invoice.amountDue)}
                          </span>
                        </td>
                        <td className="px-3 py-2 truncate" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="p-1.5 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors truncate"
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
            )
          }
        </div >

        {/* Pagination */}
        < Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="invoices"
        />
      </div >
    </Sidebar >
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
      case "Shipped":
        return "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
      case "Settled":
      case "Approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1.0 rounded-full text-sm ${getStyles()}`}>
      {status}
    </span>
  );
}

