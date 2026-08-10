"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import { Invoice, InvoiceStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useSortableData } from "@/hooks/useSortableData";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState, SEARCH_EMPTY_MESSAGE, SEARCH_EMPTY_DESCRIPTION } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
    customerQuote: 170,
    proposalNumber: 150,
    proposalName: 200,
    customerOrder: 150,
    customerPO: 180,
    accountName: 200,
    billToLocation: 180,
    billToContact: 180,
    totalLines: 120,
    totalPrice: 130,
    shipping: 110,
    taxes: 110,
    totalAmount: 140,
    invoiceDate: 140,
    paymentTerms: 160,
    dueDate: 140,
    collectionStatus: 160,
    amountDue: 140,
    settledDate: 140,
    actions: 100
  });

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || user?.Id || "";

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch(`/api/salesforce/invoices?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&action=list`);
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();

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
          accountId: item.Bill_to_Account__c || '',
          customerQuoteId: item.Customer_Quote__c || '',
          customerQuoteName: item.Customer_Quote_Name || 'N/A',
          proposalNumber: item.Proposal_Number__c || item.Proposal_Name || 'N/A',
          billToLocation: item.Authorized_Bill_To_Location_Name || 'N/A',
          totalPrice: item.Total_Price__c || 0,
          shipping: item.Total_Shipping_Charges__c || 0,
          taxes: item.Total_Taxes_Amount__c || 0,
          settledDate: item.Settled_Date__c || ''
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

  const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
  const isCustomerOrNSO = ['Customer', 'NSO'].includes(selectedAccount?.Account_Record_Type__c || '');

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
        <p className="text-gray-600 dark:text-gray-400 text-base mt-1" title="Manage Invoices and Track Payments">Manage Invoices and Track Payments</p>
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
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1" title="All Invoices">All Invoices</p>
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
                    <span className="text-sm text-gray-500 dark:text-gray-400">Invoices</span>
                  </Link>
                </div>
                <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "All" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1" title="Pending">Pending</p>
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
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide" title="Past due">Past due</p>
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
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1" title="Paid">Paid</p>
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
                placeholder="Search Invoices..."
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
        <div className="rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto" >
            {
              loading ? (
                <TableLoadingState message="Loading invoices..." />
              ) : paginatedInvoices.length === 0 ? (
                <TableEmptyState
                  message={searchQuery || activeTab !== "All" ? SEARCH_EMPTY_MESSAGE : "No invoices found"}
                  description={searchQuery || activeTab !== "All" ? SEARCH_EMPTY_DESCRIPTION : "No invoices available"}
                />
              ) : (
                <Table className="text-sm">
                  <THead>
                    <tr>
                      <SortableHeader label="Invoice #" field="invoiceNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceNumber} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                      <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                      <SortableHeader label="Sales Order #" field="salesOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={handleResize} />
                      <SortableHeader label="Purchase Order #" field="purchaseOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={handleResize} />
                      <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={handleResize} />
                      <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={handleResize} />
                      <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                      <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                      <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                      <SortableHeader label="Bill to Account" field="accountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.accountName} onResize={handleResize} />
                      <SortableHeader label="Bill to Location" field="billToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocation} onResize={handleResize} />
                      <SortableHeader label="Bill to Contact" field="contactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContact} onResize={handleResize} />
                      <SortableHeader label="Total Lines" field="lineItemCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                      <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                      <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                      <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} />
                      <SortableHeader label="Grand Total" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} />
                      <SortableHeader label="Issued Date" field="invoiceDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceDate} onResize={handleResize} />
                      <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={handleResize} />
                      <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={handleResize} />
                      <SortableHeader label="Collection Status" field="collectionStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.collectionStatus} onResize={handleResize} />
                      <SortableHeader label="Open Balance" field="amountDue" sortConfig={sortConfig} requestSort={requestSort} width={widths.amountDue} onResize={handleResize} />
                      <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={handleResize} />
                      <Th className="whitespace-nowrap" style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                        Action
                      </Th>
                    </tr>
                  </THead>
                  <TBody>
                    {paginatedInvoices.map((invoice) => (
                      <Tr
                        key={invoice.id}
                        className="cursor-pointer">
                        <Td className="px-3 py-2 text-sm text-primary font-semibold text-gray-600 dark:text-gray-400 hover:underline sticky left-0 bg-white dark:bg-gray-800 text-left truncate">
                          <Link href={`/invoices/${invoice.id}`} title={invoice.invoiceNumber} onClick={(e: React.MouseEvent) => e.stopPropagation()}>{invoice.invoiceNumber}</Link>
                        </Td>
                        <Td className="px-3 py-2 text-gray-600 dark:text-gray-400 truncate">
                          <StatusBadge status={invoice.status} variant="pill" />
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{displayCell(invoice.salesOrderNumber)}</div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            <span className="font-medium">{displayCell(invoice.purchaseOrderNumber)}</span>
                          </div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div>
                            {invoice.customerQuoteId ? (
                              <Link
                                href={`/quotes/${invoice.customerQuoteId}`}
                                target="_blank"
                                className="text-primary hover:underline font-semibold"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {invoice.customerQuoteName || 'N/A'}
                              </Link>
                            ) : (
                              displayCell(invoice.customerQuoteName)
                            )}
                          </div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div>
                            {invoice.proposalId ? (
                              <Link
                                href={`/proposals/${invoice.proposalId}`}
                                target="_blank"
                                className="text-primary hover:underline font-semibold"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {invoice.proposalNumber || 'N/A'}
                              </Link>
                            ) : (
                              displayCell(invoice.proposalNumber)
                            )}
                          </div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          {displayCell(invoice.proposalName)}
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div>
                            {invoice.customerOrderId ? (
                              <Link
                                href={`/orders/${invoice.customerOrderId}`}
                                target="_blank"
                                className="text-primary hover:underline font-semibold"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {invoice.customerOrder || 'N/A'}
                              </Link>
                            ) : (
                              displayCell(invoice.customerOrder)
                            )}
                          </div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm text-gray-900 dark:text-white font-medium" title={invoice.customerPO}>{displayCell(invoice.customerPO)}</div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium">{displayCell(invoice.accountName)}</div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium">{displayCell(invoice.billToLocation)}</div>
                        </Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm font-medium">{displayCell(invoice.contactName)}</div>
                        </Td>
                        <Td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white truncate">{invoice.lineItemCount}</Td>
                        <Td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white truncate">{formatCurrency(invoice.totalPrice || 0)}</Td>
                        <Td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white truncate">{formatCurrency(invoice.shipping || 0)}</Td>
                        <Td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white truncate">{formatCurrency(invoice.taxes || 0)}</Td>
                        <Td className="px-3 py-2 text-sm text-left text-gray-600 dark:text-white font-semibold truncate">{formatCurrency(invoice.totalAmount)}</Td>
                        <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(invoice.invoiceDate, 'numeric-dash')}</Td>
                        <Td className="px-3 py-2 truncate">
                          <div className="text-sm text-gray-600 dark:text-white font-medium" title={invoice.paymentTerms}>{displayCell(invoice.paymentTerms)}</div>
                        </Td>
                        <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(invoice.dueDate, 'numeric-dash')}</Td>
                        <Td className="px-3 py-2 truncate">
                          <StatusBadge status={invoice.collectionStatus || 'N/A'} variant="compact" />
                        </Td>
                        <Td className="px-3 py-2 text-sm text-left truncate">
                          <span className={`font-semibold ${invoice.amountDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCurrency(invoice.amountDue)}
                          </span>
                        </Td>
                        <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{invoice.settledDate ? formatDate(invoice.settledDate, 'numeric-dash') : '-'}</Td>
                        <Td className="px-3 py-2 truncate" onClick={(e) => e.stopPropagation()}>
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
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              )
            }
          </div >
        </div>

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
