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
import { useResizableColumns } from "@/hooks/useResizableColumns";

type TabFilter = "All" | "Lead" | "Draft" | "Pending Review" | "Under Review" | "Approved" | "Accepted" | "Rejected" | "Expired";

const ITEMS_PER_PAGE = 10;

export default function ProposalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    proposalNumber: 160,
    status: 120,
    proposalName: 200,
    customerOrder: 180,
    customerPO: 180,
    billTo: 180,
    shipTo: 180,
    productCount: 100,
    totalAmount: 120,
    totalLines: 160,
    expirationDate: 120,
    proposalDate: 160,
    actions: 100
  });

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
          proposalName: item.Name || item.Proposal_Name__c || 'N/A',
          customerOrder: item.Customer_Order_Name || 'N/A',
          customerPO: item.Customer_PO__c || 'N/A',
          accountName: item.Bill_to_Account_Name || item.Ship_to_Account_Name || 'N/A',
          contactName: item.Bill_to_Contact_Name || item.Ship_to_Contact_Name || 'N/A',
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

    const inProgressStatuses: ProposalStatus[] = ["Draft", "Quote Requested", "Quote Ready"];
    const inProgress = proposals.filter(p => inProgressStatuses.includes(p.status));
    const inProgressCount = inProgress.length;
    const inProgressValue = inProgress.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const awaitingReviewStatuses: ProposalStatus[] = ["Proposal Sent", "Negotiation", "Pending Review", "Under Review"];
    const awaitingReview = proposals.filter(p => awaitingReviewStatuses.includes(p.status));
    const awaitingReviewCount = awaitingReview.length;
    const awaitingReviewValue = awaitingReview.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const awardedStatuses: ProposalStatus[] = ["Awarded", "Accepted", "Approved"];
    const awarded = proposals.filter(p => awardedStatuses.includes(p.status));
    const awardedCount = awarded.length;
    const awardedValue = awarded.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    return {
      total, totalValue,
      inProgressCount, inProgressValue,
      awaitingReviewCount, awaitingReviewValue,
      awardedCount, awardedValue
    };
  }, [proposals]);

  // Filter proposals based on search and status
  const filteredAndSearchedProposals = useMemo(() => {
    let filtered = proposals;

    // Apply status/group filter
    if (activeTab !== "All") {
      const inProgressGroups = ["Draft", "Quote Requested", "Quote Ready"];
      const awaitingReviewGroups = ["Proposal Sent", "Negotiation", "Pending Review", "Under Review"];
      const awardedGroups = ["Awarded", "Accepted", "Approved"];

      if (activeTab === "Draft") {
        filtered = filtered.filter(proposal => inProgressGroups.includes(proposal.status));
      } else if (activeTab === "Pending Review") {
        filtered = filtered.filter(proposal => awaitingReviewGroups.includes(proposal.status));
      } else if (activeTab === "Approved") {
        filtered = filtered.filter(proposal => awardedGroups.includes(proposal.status));
      } else {
        filtered = filtered.filter(proposal => proposal.status === activeTab);
      }
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
  const { items: sortedProposals, requestSort, sortConfig } = useSortableData<Proposal>(filteredAndSearchedProposals, { key: 'proposalNumber', direction: 'desc' });

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
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and Track Sales Proposals</p>
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("All")}
                  className="hover:underline block"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">Total Pipeline</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("All")}
                  className="hover:underline block"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Proposals</span>
                  </div>
                </Link>
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("All")}
                  className="hover:underline block">
                  View all proposals</Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Draft/In Progress Proposals Card */}
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("Draft")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">In Progress</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Draft")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">

                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgressCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Proposals</span>


                  </div>
                </Link>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-1">{formatCurrency(stats.inProgressValue)}</p>
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("Draft")}
                  className="hover:underline block">
                  View in progress</Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Pending/Awaiting Review Card */}
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
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Pending Review")}
                    className="hover:underline block">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">Awaiting Review</p>
                  </Link>
                  {stats.awaitingReviewCount > 0 && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                  )}
                </div>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Pending Review")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.awaitingReviewCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Proposals</span>
                  </div>
                </Link>

                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mt-1">{formatCurrency(stats.awaitingReviewValue)}</p>
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("Pending Review")}
                  className="hover:underline block">
                  Review now</Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Approved/Awarded Card */}
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1">Awarded</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.awardedCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Awarded</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">{formatCurrency(stats.awardedValue)}</p>
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
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block">
                  View awarded
                </Link>
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
        {/* Header with Search and Filter */}
        <div className="border-b border-gray-200 dark:border-gray-700 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Proposal List</h2>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Status Dropdown Filter */}
              <div className="relative min-w-[160px]">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabFilter)}
                  className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Lead">Lead</option>
                  <option value="Draft">In Progress (Draft/Requested)</option>
                  <option value="Pending Review">Awaiting Review</option>
                  <option value="Approved">Awarded/Approved</option>
                  <option disabled>──────────</option>
                  {(["Quote Requested", "Quote Ready", "Proposal Sent", "Negotiation", "Under Review", "Accepted", "Awarded", "Rejected", "Expired"] as TabFilter[]).map(tab => (
                    <option key={tab} value={tab}>{tab}</option>
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
                  placeholder="Search proposals..."
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
                  <SortableHeader label="Proposal Number" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                  <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                  <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                  <SortableHeader label="Customer  Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                  <SortableHeader label="customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={handleResize} />
                  <SortableHeader label="Bill to Account" field="billTo" sortConfig={sortConfig} requestSort={requestSort} width={widths.billTo} onResize={handleResize} />
                  <SortableHeader label="Ship to Account" field="shipTo" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipTo} onResize={handleResize} />
                  <SortableHeader label="Total Lines" field="productCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCount} onResize={handleResize} />
                  <SortableHeader label="Total Price" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={handleResize} />
                  <SortableHeader label="Expires" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expirationDate} onResize={handleResize} />
                  <SortableHeader label="Request Date" field="proposalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expirationDate} onResize={handleResize} />

                  <th
                    className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                  >
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
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
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
                      <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left">
                        <Link href={`/proposals/${proposal.id}`} className="text-sm font-semibold text-primary hover:underline">
                          <div title={proposal.proposalNumber}>{proposal.proposalNumber}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium " title={proposal.proposalName}>{proposal.proposalName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium " title={proposal.customerOrder}>{proposal.customerOrder}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium " title={proposal.customerPO}>{proposal.customerPO}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 " title={proposal.billTo}>{proposal.billTo}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 " title={proposal.shipTo}>{proposal.shipTo}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white min-w-[130px]">{proposal.productCount}</td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold">{formatCurrency(proposal.totalAmount)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(proposal.expirationDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 min-w-[150px]">{formatDate(proposal.proposalDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
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
      case "Quote Requested":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "Quote Ready":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Proposal Sent":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
      case "Negotiation":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Awarded":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
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
