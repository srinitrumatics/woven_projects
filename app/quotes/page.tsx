"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { Quote, QuoteStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useSortableData } from "@/hooks/useSortableData";
import Link from "next/link";

export default function QuotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    quoteNumber: 150,
    accountName: 180,
    contactName: 180,
    description: 250,
    status: 120,
    totalAmount: 120,
    validUntil: 120,
    items: 100,
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
          accountName: item.Account_Name__c || item.Account?.Name || 'Unknown Account',
          contactName: item.Contact_Name__c || item.Contact?.Name || 'Unknown Contact',
          status: (item.Status__c || item.Status || 'Draft') as QuoteStatus,
          totalAmount: item.Total_Price__c || item.GrandTotal || item.Total_Amount__c || 0,
          validUntil: item.ExpirationDate || item.Valid_Until__c ? (item.ExpirationDate || item.Valid_Until__c).split('T')[0] : '',
          createdDate: item.CreatedDate ? item.CreatedDate.split('T')[0] : new Date().toISOString().split('T')[0],
          description: item.Description || '',
          lineItemCount: item.LineItemCount || item.Total_Lines__c || 0,
          opportunityName: item.Opportunity_Name__c || item.Opportunity?.Name || ''
        }));

        setQuotes(mappedQuotes);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, []);

  // Calculate stats from quotes
  const stats = useMemo(() => {
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === "Pending").length;
    const approvedQuotes = quotes.filter(q => q.status === "Approved").length;
    const totalValue = quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    return {
      totalQuotes,
      pendingQuotes,
      approvedQuotes,
      totalValue
    };
  }, [quotes]);

  // Sorting
  const { items: sortedQuotes, requestSort, sortConfig } = useSortableData<Quote>(quotes);

  // Filter quotes based on search and status
  const filteredQuotes = useMemo(() => {
    return sortedQuotes.filter((quote) => {
      const matchesSearch =
        (quote.quoteNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (quote.accountName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (quote.contactName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (quote.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (quote.opportunityName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, sortedQuotes]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Draft":
        return "bg-blue-200 text-blue-900 dark:bg-blue-1000/30 dark:text-blue-500";
      case "Converted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your sales quotes</p>
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
            {stats.totalQuotes}
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
            {stats.pendingQuotes}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Pending Approval</p>
          <button
            onClick={() => setStatusFilter("Pending")}
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
            {stats.approvedQuotes}
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
            ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search quotes by number, account, contact, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {["All", "Draft", "Pending", "Approved", "Rejected", "Expired", "Converted"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as QuoteStatus | "All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin h-10 w-10 text-primary mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="text-sm">Loading quotes...</p>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Quote Number" field="quoteNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.quoteNumber} onResize={handleResize} />
                  <SortableHeader label="Account" field="accountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.accountName} onResize={handleResize} />
                  <SortableHeader label="Contact" field="contactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.contactName} onResize={handleResize} />
                  <SortableHeader label="Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                  <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                  <SortableHeader label="Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} />
                  <SortableHeader label="Valid Until" field="validUntil" sortConfig={sortConfig} requestSort={requestSort} width={widths.validUntil} onResize={handleResize} />
                  <SortableHeader label="Total Lines" field="lineItemCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.items} onResize={handleResize} />
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No quotes found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                          {searchQuery || statusFilter !== "All"
                            ? "Try adjusting your filters"
                            : "Get started by creating your first quote"}
                        </p>
                        {!searchQuery && statusFilter === "All" && (
                          <button
                            onClick={() => router.push("/quotes/new")}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            Create New Quote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      onClick={() => router.push(`/quotes/${quote.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="line-clamp-2" title={quote.quoteNumber}>
                          <div className="text-sm font-semibold text-primary">{quote.quoteNumber}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{quote.createdDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="line-clamp-2" title={quote.accountName}>
                          <div className="text-sm text-gray-900 dark:text-white font-medium">{quote.accountName}</div>
                          {quote.opportunityName && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{quote.opportunityName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white line-clamp-1" title={quote.contactName}>{quote.contactName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[250px] line-clamp-1" title={quote.description}>
                          {quote.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(quote.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(quote.validUntil, 'numeric-dash')}</td>
                      <td className="px-6 py-4 text-sm  text-gray-900 dark:text-white">
                        {quote.lineItemCount}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex start gap-2">
                          <Link href={`/quotes/${quote.id}`} className="text-primary rounded font-medium inline-block">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          totalItems={filteredQuotes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="quotes"
        />
      </div>
    </Sidebar>
  );
}
