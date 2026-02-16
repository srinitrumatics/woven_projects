"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { Quote, QuoteStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

type TabFilter = QuoteStatus | "All";

const ITEMS_PER_PAGE = 10;

export default function QuotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    quoteNumber: 160,
    status: 120,
    proposalName: 200,
    customerOrder: 180,
    customerPO: 180,
    billTo: 180,
    shipTo: 180,
    totalLines: 120,
    totalAmount: 140,
    requestDate: 160,
    plannedShipDate: 160,
    actions: 100
  });

  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch(`/api/salesforce/quotes?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}`);
        if (!res.ok) throw new Error('Failed to fetch quotes');
        const data = await res.json();
        console.log("Fetched quotes data:", data);

        const mappedQuotes: Quote[] = data.map((item: any) => ({
          id: item.Id,
          quoteNumber: item.Quote_Number__c || item.Name || 'N/A',
          status: (item.Status__c || item.Status || 'Draft') as QuoteStatus,
          proposalName: item.Proposal_Name || 'N/A',
          customerPO: item.Customer_PO__c || 'N/A',
          customerOrder: item.Customer_Order_Name || 'N/A',
          shipToAccountName: item.Ship_to_Account_Name || 'N/A',
          billToAccountName: item.Bill_to_Account_Name || 'N/A',
          totalLines: item.LineItemCount || item.Total_Lines__c || 0,
          totalAmount: item.Total_Price__c || item.GrandTotal || item.Total_Amount__c || 0,
          requestDate: item.Request_Date__c || '',
          plannedShipDate: item.Ship_Date__c || '',
          expirationDate: item.Expiration_Date__c || '',
        }));

        setQuotes(mappedQuotes);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Calculate stats from all quotes
  const stats = useMemo(() => {
    const total = quotes.length;
    const totalValue = quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const pending = quotes.filter(q => q.status === "Pending");
    const pendingCount = pending.length;
    const pendingValue = pending.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const approved = quotes.filter(q => q.status === "Approved");
    const approvedCount = approved.length;
    const approvedValue = approved.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const converted = quotes.filter(q => q.status === "Converted");
    const convertedCount = converted.length;
    const convertedValue = converted.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    return {
      total, totalValue,
      pendingCount, pendingValue,
      approvedCount, approvedValue,
      convertedCount, convertedValue
    };
  }, [quotes]);

  // Filter quotes based on search and status
  const filteredAndSearchedQuotes = useMemo(() => {
    let filtered = quotes;

    // Apply status filter
    if (activeTab !== "All") {
      filtered = filtered.filter(quote => quote.status === activeTab);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote =>
        (quote.quoteNumber?.toLowerCase() || '').includes(query) ||
        (quote.proposalName?.toLowerCase() || '').includes(query) ||
        (quote.customerOrder?.toLowerCase() || '').includes(query) ||
        (quote.shipToAccountName?.toLowerCase() || '').includes(query) ||
        (quote.billToAccountName?.toLowerCase() || '').includes(query) ||
        (quote.status?.toLowerCase() || '').includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery, quotes]);

  // Sorting
  const { items: sortedQuotes, requestSort, sortConfig } = useSortableData<Quote>(filteredAndSearchedQuotes, { key: 'quoteNumber', direction: 'desc' });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedQuotes.length / ITEMS_PER_PAGE));
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedQuotes, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleCardClick = (filter: TabFilter) => {
    setActiveTab(filter);
  };

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and Track Sales Quotes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Quotes Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.total}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Quotes</p>
        </div>

        {/* Pending Quotes Card with CTA */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 shadow-md border-2 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-700 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.pendingCount}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Pending Approval</p>
          <button
            onClick={() => setActiveTab("Pending")}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Review Now
          </button>
        </div>

        {/* Approved Quotes Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.approvedCount}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved Quotes</p>
        </div>

        {/* Total Value Card with CTA */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-lg p-6 shadow-md border-2 border-primary dark:border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/30 dark:bg-primary/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-dark dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats.totalValue)}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Total Quote Value</p>
          <button
            onClick={() => router.push("/quotes/new")}
            className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium"
          >
            Create New Quote
          </button>
        </div>
      </div>


      {/* Quotes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header with Search and Filter */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quote List</h2>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Status Dropdown Filter */}
              <div className="relative min-w-[160px]">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabFilter)}
                  className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                  <option value="Converted">Converted</option>
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
                  placeholder="Search quotes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" title="Sort">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" title="Filter Settings">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p className="text-sm">Loading quotes...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Quote Number" field="quoteNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.quoteNumber} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                  <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                  <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                  <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                  <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                  <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.billTo} onResize={handleResize} />
                  <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipTo} onResize={handleResize} />
                  <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                  <SortableHeader label="Total Price" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} />
                  <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={handleResize} />
                  <SortableHeader label="Planned Ship Date" field="plannedShipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={handleResize} />
                  <th
                    className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No quotes found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          {searchQuery || activeTab !== "All"
                            ? "Try adjusting your filters"
                            : "Get started by creating your first quote"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left">
                        <Link href={`/quotes/${quote.id}`} className="text-sm font-semibold text-primary hover:underline">
                          <div title={quote.quoteNumber}>{quote.quoteNumber}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.proposalName}>{quote.proposalName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.customerOrder}>{quote.customerOrder}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.customerPO}>{quote.customerPO}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400" title={quote.billToAccountName}>{quote.billToAccountName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400" title={quote.shipToAccountName}>{quote.shipToAccountName}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">{quote.totalLines}</td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold">{formatCurrency(quote.totalAmount)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(quote.requestDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(quote.plannedShipDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/quotes/${quote.id}`)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="View quote"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAndSearchedQuotes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="quotes"
        />
      </div>
    </Sidebar>
  );
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const getStyles = () => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Converted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
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
