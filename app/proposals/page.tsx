import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/utils/formatting";
import { Proposal, ProposalStatus } from "./types";
import { mockProposals, mockProposalStats } from "./mockData";
import { requireAuth } from "@/lib/session";

interface ProposalsPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
  };
}

type SearchParams = Promise<{
  page?: string;
  search?: string;
  status?: string;
}>;

export default async function ProposalsPage({ searchParams: rawSearchParams }: { searchParams?: SearchParams }) {
  const searchParams = await rawSearchParams;
  // Server-side authentication and permission check
  await requireAuth(['proposal-list', 'proposal-read']); // Requires either proposal-list or proposal-read permission

  const currentPage = searchParams?.page ? Number(searchParams.page) : 1;
  const searchQuery = searchParams?.search || '';
  const statusFilter = searchParams?.status as ProposalStatus | 'All' || 'All';
  const itemsPerPage = 10;

  // Filter proposals based on search and status
  const filteredProposals = mockProposals.filter((proposal) => {
    const matchesSearch =
      proposal.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || proposal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: ProposalStatus) => {
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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Generate query string for pagination links
  const generateQueryString = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter);
    params.set('page', newPage.toString());
    return params.toString();
  };

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proposals</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track sales proposals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Proposals Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {mockProposalStats.totalProposals}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Proposals</p>
        </div>

        {/* Pending Review Card with CTA */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 shadow-md border-2 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-700 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {mockProposalStats.pendingReview}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Pending Review</p>
          <a
            href={`/proposals?status=Pending Review`}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium block text-center"
          >
            Review Now
          </a>
        </div>

        {/* Approved Proposals Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {mockProposalStats.approvedProposals}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
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
            ${mockProposalStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Total Value</p>
          <a
            href="/proposals/new"
            className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium block text-center"
          >
            Create Proposal
          </a>
        </div>
      </div>

      {/* Filters and Search */}
      <form className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search proposals by number, account, or description..."
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
            <select
              name="status"
              defaultValue={statusFilter}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
            
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      {/* Proposals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-light dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Proposal #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Account</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Expires</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Products</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
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
                      <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                        {searchQuery || statusFilter !== "All"
                          ? "Try adjusting your filters"
                          : "Get started by creating your first proposal"}
                      </p>
                      {!searchQuery && statusFilter === "All" && (
                        <a
                          href="/proposals/new"
                          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Create Proposal
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProposals.map((proposal) => (
                  <tr
                    key={proposal.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <a href={`/proposals/${proposal.id}`} className="text-sm font-semibold text-primary hover:underline">
                        {proposal.proposalNumber}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{proposal.proposalDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/proposals/${proposal.id}`} className="text-sm text-gray-900 dark:text-white font-medium hover:underline">
                        {proposal.accountName}
                      </a>
                      {proposal.opportunityName && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{proposal.opportunityName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{proposal.contactName}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[250px] line-clamp-2">
                        {proposal.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(proposal.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{proposal.expirationDate}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">
                      {proposal.productCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`/proposals/${proposal.id}`}
                          className="px-3 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-xs font-medium"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredProposals.length)}
              </span>{' '}
              of <span className="font-medium">{filteredProposals.length}</span> results
            </div>
            
            <div className="flex space-x-2">
              {currentPage > 1 && (
                <a
                  href={`?${generateQueryString(currentPage - 1)}`}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Previous
                </a>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate the page numbers to display
                let pageNum;
                if (totalPages <= 5) {
                  // If total pages <= 5, show all
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // If near the beginning, show first 5
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // If near the end, show last 5
                  pageNum = totalPages - 4 + i;
                } else {
                  // Show around current page
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <a
                    key={pageNum}
                    href={`?${generateQueryString(pageNum)}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </a>
                );
              })}
              
              {currentPage < totalPages && (
                <a
                  href={`?${generateQueryString(currentPage + 1)}`}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}