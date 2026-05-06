"use client";

import { useState, useMemo, useEffect } from"react";
import Link from"next/link";
import { useRouter } from"next/navigation";
import Sidebar from"@/components/layouts/Sidebar";
import Pagination from"@/components/ui/Pagination";
import { formatCurrency, formatDate } from"@/lib/utils/formatting";
import { Quote, QuoteStatus } from"./types";
import { SortableHeader } from"@/components/ui/SortableHeader";
import { useSortableData } from"@/hooks/useSortableData";
import { useResizableColumns } from"@/hooks/useResizableColumns";
import { useUserSession } from"@/components/UserSessionContext";

type TabFilter = QuoteStatus |"All";

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
    status: 180,
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

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || user?.Id || "";

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch(`/api/salesforce/quotes?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}`);
        if (!res.ok) throw new Error('Failed to fetch quotes');
        const data = await res.json();
        console.log("Fetched quotes data:", data);

        // API might return standard list or object with metadata
        const responseData = Array.isArray(data) ? (data[0] || {}) : data;
        const rawItems = responseData?.Customer_Quote__c || (Array.isArray(data) ? data : []);

        const mappedQuotes: Quote[] = rawItems.map((item: any) => ({
          id: item.Id,
          quoteNumber: item.Quote_Number__c || item.Name || 'N/A',
          status: (item.Status__c || item.Status || 'Draft') as QuoteStatus,
          proposalName: item.Proposal_Name || 'N/A',
          proposalId: item.Proposal__c || '',
          customerPO: item.Customer_PO_Name || 'N/A',
          purchaseOrderId: item.Customer_PO__c || '',
          customerOrder: item.Customer_Order_Name || 'N/A',
          customerOrderId: item.Customer_Order__c || '',
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

    if (SF_ACCOUNT_ID && SF_CONTACT_ID) {
      fetchQuotes();
    }
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Calculate stats from all quotes
  const stats = useMemo(() => {
    // Helper to calculate stats for a specific status
    const getStats = (status: string) => {
      const filtered = quotes.filter(q => q.status === status);
      return {
        count: filtered.length,
        value: filtered.reduce((sum, q) => sum + (q.totalAmount || 0), 0)
      };
    };

    const draft = getStats("Draft");
    const approved = getStats("Approved");
    const partialShipment = getStats("Partial Shipment");
    const shipped = getStats("Shipped");

    return {
      draftCount: draft.count,
      draftValue: draft.value,
      approvedCount: approved.count,
      approvedValue: approved.value,
      partialShipmentCount: partialShipment.count,
      partialShipmentValue: partialShipment.value,
      shippedCount: shipped.count,
      shippedValue: shipped.value
    };
  }, [quotes]);

  // Filter quotes based on search and status
  const filteredAndSearchedQuotes = useMemo(() => {
    let filtered = quotes;

    // Apply status filter
    if (activeTab !=="All") {
      filtered = filtered.filter(quote => (quote.status as string) === activeTab);
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

  const isManufacturer = selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'manufacturer' || user?.role?.toLowerCase() === 'manufacturer';

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
        <p className="text-gray-600 dark:text-gray-400 mt-1"title="Manage and Track Customer Quotes">Manage and Track Customer Quotes</p>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards - New Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-4 gap-4 mb-6">
        {/* Draft Quotes Card */}
        <button
          onClick={() => handleCardClick("Draft")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab ==="Draft"
            ?"border-primary ring-2 ring-primary/20"
            :"border-gray-200 dark:border-gray-700 hover:border-primary/50"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCardClick("Draft");
                  }}
                  className="hover:underline block"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1"title="Draft">Draft</p>
                </Link>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCardClick("Draft");
                  }}
                  className="hover:underline block"
                >
                  <div className="flex items-baseline gap-2">

                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.draftCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Quotes</span>

                  </div>
                </Link>
                <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(stats.draftValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab ==="Draft"?"bg-primary text-white":"bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline">
                View draft quotes
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Approved Quotes Card */}
        <button
          onClick={() => handleCardClick("Approved")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab ==="Approved"// Changed from"Draft"to"Approved"
            ?"border-gray-500 ring-2 ring-gray-500/20"
            :"border-gray-200 dark:border-gray-700 hover:border-gray-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1"title="Approved">Approved</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.approvedCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Quotes</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-1">{formatCurrency(stats.approvedValue)}</p>
              </div>

              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab ==="Approved"?"bg-gray-500 text-white":"bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 group-hover:bg-gray-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:underline">
                View approved quotes
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Partial Shipment Card */}
        <button
          onClick={() => handleCardClick("Partial Shipment")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab ==="Partial Shipment"
            ?"border-yellow-500 ring-2 ring-yellow-500/20"
            :"border-gray-200 dark:border-gray-700 hover:border-yellow-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Partial Shipment")}
                  className="hover:underline block"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1"title="Partial Shipment">Partial Shipment</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Partial Shipment")}
                  className="hover:underline block"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.partialShipmentCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Quotes</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mt-1">{formatCurrency(stats.partialShipmentValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab ==="Partial Shipment"?"bg-yellow-500 text-white":"bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400 group-hover:underline">
                View partial shipments
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Shipped Quotes Card */}
        <button
          onClick={() => handleCardClick("Shipped")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab ==="Shipped"
            ?"border-green-500 ring-2 ring-green-500/20"
            :"border-gray-200 dark:border-gray-700 hover:border-green-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Shipped")}
                  className="hover:underline block"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1"title="Shipped">Shipped</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Shipped")}
                  className="hover:underline block"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.shippedCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Quotes</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">{formatCurrency(stats.shippedValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab ==="Shipped"?"bg-green-500 text-white":"bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline">
                View shipped quotes
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div>


      {/* Quotes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {/* Header with Search and Filter */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Heading row */}
          {/* Search + filter pills row */}
          <div className="flex flex-wrap items-center gap-3 px-2 pb-4">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            {/* Status filter pills — only statuses present in loaded records */}
            <div className="flex flex-wrap items-center gap-2">
              {/*"All"— always visible */}
              <button
                onClick={() => setActiveTab('All')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'All'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                All
              </button>
              {/* One button per unique status in loaded quotes */}
              {Array.from(new Set(quotes.map(q => q.status).filter(Boolean)))
                .sort()
                .map(status => (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status as TabFilter)}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
              <svg className="animate-spin h-10 w-10 text-primary mb-4"xmlns="http://www.w3.org/2000/svg"fill="none"viewBox="0 0 24 24">
                <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"></circle>
                <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p className="text-sm"title="Loading quotes...">Loading quotes...</p>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Quote Number"field="quoteNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.quoteNumber} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"truncate={false} />
                  <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Proposal Name"field="proposalName"sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Customer Order"field="customerOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Customer PO"field="customerPO"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Bill to Account"field="billToAccountName"sortConfig={sortConfig} requestSort={requestSort} width={widths.billTo} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Ship to Account"field="shipToAccountName"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipTo} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Total Lines"field="totalLines"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Total Price"field="totalAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Request Date"field="requestDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={handleResize} truncate={false} />
                  <SortableHeader label="Planned Ship Date"field="plannedShipDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={handleResize} truncate={false} />
                  <th
                    className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center min-w-0">
                        <svg className="w-16 h-16 text-gray-400 mb-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                          <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2"title="No quotes found">No quotes found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          {searchQuery || activeTab !=="All"
                            ?"Try adjusting your filters"
                            :"Get started by creating your first quote"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left truncate">
                        <Link href={`/quotes/${quote.id}`} className="text-sm font-semibold text-primary hover:underline">
                          <div title={quote.quoteNumber}>{quote.quoteNumber}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-2 truncate">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-3 py-2  text-left truncate">
                        {quote.proposalId && quote.proposalName !== 'N/A' ? (
                          !isManufacturer ? (
                            <Link
                              href={`/proposals/${quote.proposalId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                              title={quote.proposalName}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {quote.proposalName}
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.proposalName}>{quote.proposalName}</div>
                          )
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.proposalName}>{quote.proposalName}</div>
                        )}
                      </td>
                      <td className="px-3 py-2  text-left truncate">
                        {quote.customerOrderId && quote.customerOrder !== 'N/A' ? (
                          !isManufacturer ? (
                            <Link
                              href={`/orders/${quote.customerOrderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                              title={quote.customerOrder}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {quote.customerOrder}
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.customerOrder}>{quote.customerOrder}</div>
                          )
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.customerOrder}>{quote.customerOrder}</div>
                        )}
                      </td>
                      <td className="px-3 py-2  text-left truncate">
                        {quote.purchaseOrderId && quote.customerPO !== 'N/A' ? (
                          !isManufacturer ? (
                            <Link
                              href={`/purchase-orders/${quote.purchaseOrderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                              title={quote.customerPO}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {quote.customerPO}
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.customerPO}>{quote.customerPO}</div>
                          )
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white font-medium" title={quote.customerPO}>{quote.customerPO}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 truncate">
                        <div className="text-sm text-gray-600 dark:text-gray-400"title={quote.billToAccountName}>{quote.billToAccountName}</div>
                      </td>
                      <td className="px-3 py-2 truncate">
                        <div className="text-sm text-gray-600 dark:text-gray-400"title={quote.shipToAccountName}>{quote.shipToAccountName}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate">{quote.totalLines}</td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold truncate">{formatCurrency(quote.totalAmount)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(quote.requestDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(quote.plannedShipDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2 truncate">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/quotes/${quote.id}`)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="View quote"
                          >
                            <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
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
      case"Approved":
        return"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case"Pending":
        return"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case"Draft":
        return"bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case"Rejected":
      case"Partial Rejected":
        return"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case"Expired":
        return"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case"Converted":
        return"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case"Shipped":
        return"bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
      case"Partial Shipment":
        return"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
      {status}
    </span>
  );
}
