"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import { Proposal, ProposalStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";

type TabFilter = "All" | "Lead" | "Draft" | "Pending Review" | "Under Review" | "Approved" | "Accepted" | "Rejected" | "Expired";

const ITEMS_PER_PAGE = 10;

export default function ProposalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? ""; // override with real value
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "" //TODO: Get this from session / auth context

  useEffect(() => {
    async function fetchProposals() {
      try {
        const res = await fetch(`/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&action=list`);
        if (!res.ok) throw new Error('Failed to fetch proposals');
        const data = await res.json();
        console.log("Fetched proposals data:", data);

        const mappedProposals: Proposal[] = data.map((item: any) => ({
          id: item.Id,
          proposalNumber: item.Proposal_Number__c || item.Name || 'N/A',
          proposalName: item.Name || item.Proposal_Name__c || 'Untitled Proposal',
          accountName: item.Bill_to_Account_Name || item.Ship_to_Account_Name || 'Unknown Account',
          contactName: item.Bill_to_Contact_Name || item.Ship_to_Contact_Name || 'Unknown Contact',
          status: (item.Status__c as ProposalStatus) || 'Draft',
          totalAmount: item.Total_Price__c || item.Total_Amount__c || 0,
          totalShippingCharges: item.Total_Shipping_Charges__c || 0,
          totalTaxesAmount: item.Total_Taxes_Amount__c || 0,
          proposalDate: item.Request_Date__c || (item.CreatedDate ? item.CreatedDate.split('T')[0] : new Date().toISOString().split('T')[0]),
          expirationDate: item.Expiration_Date__c || '',
          description: item.Description || '',
          productCount: item.Total_Lines__c || item.Product_Count__c || 0,
          billTo: item.Authorized_Bill_To_Location_Name || item.Bill_To_Address__c || '',
          shipTo: item.Authorized_Ship_To_Location_Name || item.Ship_To_Address__c || '',
          opportunityName: item.Opportunity_Name__c || '',
          submittedBy: item.Owner_Name || item.Owner?.Name || 'System'
        }));

        setProposals(mappedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, []);

  // Calculate stats from all proposals
  const stats = useMemo(() => {
    const total = proposals.length;
    const totalValue = proposals.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const drafts = proposals.filter(p => p.status === "Draft");
    const draftCount = drafts.length;
    const draftValue = drafts.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const pending = proposals.filter(p => p.status === "Pending Review");
    const pendingCount = pending.length;
    const pendingValue = pending.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const approved = proposals.filter(p => p.status === "Approved");
    const approvedCount = approved.length;
    const approvedValue = approved.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const accepted = proposals.filter(p => p.status === "Accepted");
    const acceptedCount = accepted.length;
    const acceptedValue = accepted.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    return {
      total, totalValue,
      draftCount, draftValue,
      pendingCount, pendingValue,
      approvedCount, approvedValue,
      acceptedCount, acceptedValue
    };
  }, [proposals]);

  // Filter proposals based on search and status
  const filteredAndSearchedProposals = useMemo(() => {
    let filtered = proposals;

    // Apply tab filter
    if (activeTab !== "All") {
      filtered = filtered.filter(proposal => proposal.status === activeTab);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(proposal =>
        (proposal.proposalNumber?.toLowerCase() || '').includes(query) ||
        (proposal.proposalName?.toLowerCase() || '').includes(query) ||
        (proposal.accountName?.toLowerCase() || '').includes(query) ||
        (proposal.billTo?.toLowerCase() || '').includes(query) ||
        (proposal.shipTo?.toLowerCase() || '').includes(query) ||
        (proposal.status?.toLowerCase() || '').includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery, proposals]);

  // Sorting
  const { items: sortedProposals, requestSort, sortConfig } = useSortableData<Proposal>(filteredAndSearchedProposals);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedProposals.length / ITEMS_PER_PAGE));
  const paginatedProposals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProposals, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortedProposals.length]);

  // Ensure currentPage is safe
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const handleCardClick = (filter: TabFilter) => {
    setActiveTab(filter);
  };

  const handleViewProposal = (proposalId: string) => {
    router.push(`/proposals/${proposalId}`);
  };

  const handleDownloadProposal = (e: React.MouseEvent, proposalId: string) => {
    e.stopPropagation();
    console.log("Downloading proposal:", proposalId);
    alert(`Downloading proposal ${proposalId}`);
  };

  // REMOVED EARLY RETURN for loading

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proposals</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track sales proposals</p>
      </div>

      {/* Stats Cards - Compact & Engaging Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Proposals Card */}
        <button
          onClick={() => handleCardClick("All")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "All"
            ? "border-primary ring-2 ring-primary/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide mb-1">Total Pipeline</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Proposals</span>
                </div>
                <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === "All" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline">
                View all proposals
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Draft Proposals Card */}
        <button
          onClick={() => handleCardClick("Draft")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Draft"
            ? "border-gray-500 ring-2 ring-gray-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">In Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.draftCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Drafts</span>
                </div>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-1">{formatCurrency(stats.draftValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === "Draft" ? "bg-gray-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-600 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:underline">
                Continue editing
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Pending Review Card */}
        <button
          onClick={() => handleCardClick("Pending Review")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Pending Review"
            ? "border-yellow-500 ring-2 ring-yellow-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-yellow-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">Awaiting Review</p>
                  {stats.pendingCount > 0 && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                </div>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mt-1">{formatCurrency(stats.pendingValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === "Pending Review" ? "bg-yellow-500 text-white" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400 group-hover:underline">
                Review now
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Approved Card */}
        <button
          onClick={() => handleCardClick("Approved")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Approved"
            ? "border-green-500 ring-2 ring-green-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-green-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">Ready to Convert</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.approvedCount}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Approved</span>
                </div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">{formatCurrency(stats.approvedValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === "Approved" ? "bg-green-500 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline">
                Convert to orders
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Proposals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tabs and Search */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {(["All", "Lead", "Draft", "Pending Review", "Under Review", "Approved", "Accepted", "Rejected", "Expired"] as TabFilter[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === tab
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
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
              <p className="text-sm">Loading proposals...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Proposal Number" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width="150px" />
                  <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width="120px" />
                  <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width="200px" />
                  <SortableHeader label="Bill to Account" field="billTo" sortConfig={sortConfig} requestSort={requestSort} width="180px" />
                  <SortableHeader label="Ship to Account" field="shipTo" sortConfig={sortConfig} requestSort={requestSort} width="180px" />
                  <SortableHeader label="Items" field="productCount" sortConfig={sortConfig} requestSort={requestSort} width="100px" />
                  <SortableHeader label="Total" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width="120px" />
                  <SortableHeader label="Expires" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width="120px" />
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedProposals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No proposals found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">
                          {searchQuery || activeTab !== "All"
                            ? "Try adjusting your filters"
                            : "Get started by creating your first proposal"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/proposals/${proposal.id}`} className="text-xs font-semibold text-primary hover:underline">
                          <div className="line-clamp-2" title={proposal.proposalNumber}>{proposal.proposalNumber}</div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900 dark:text-white font-medium line-clamp-2" title={proposal.proposalName}>{proposal.proposalName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" title={proposal.billTo}>{proposal.billTo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" title={proposal.shipTo}>{proposal.shipTo}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-right text-gray-900 dark:text-white">{proposal.productCount}</td>
                      <td className="px-6 py-4 text-xs text-right text-gray-900 dark:text-white font-semibold">{formatCurrency(proposal.totalAmount)}</td>
                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">{formatDate(proposal.expirationDate, 'numeric-dash')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewProposal(proposal.id)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="View proposal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDownloadProposal(e, proposal.id)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="Download proposal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
          totalItems={filteredAndSearchedProposals.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="proposals"
        />
      </div>
    </Sidebar>
  );
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  const getStyles = () => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Accepted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Under Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Lead":
        return "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {status}
    </span>
  );
}
