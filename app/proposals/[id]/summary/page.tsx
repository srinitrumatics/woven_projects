"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Link from "next/link";
import { Proposal } from "../types";
import { useUserSession } from "@/components/UserSessionContext";

export default function ProposalSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  // Constants used for Salesforce API
  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
  const SF_CONTACT_ID = user?.Id || "";

  useEffect(() => {
    async function fetchProposal() {
      try {
        const res = await fetch(`/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&proposalId=${id}&action=view`);
        if (!res.ok) throw new Error('Failed to fetch proposal');
        const data = await res.json();

        let item: any = null;
        if (Array.isArray(data) && data.length > 0) {
          item = data[0];
        } else if (data && data.Proposal__c && Array.isArray(data.Proposal__c) && data.Proposal__c.length > 0) {
          item = data.Proposal__c[0];
        } else if (data && data.Id) {
          item = data;
        }

        if (item) {
          setProposal({
            id: item.Id,
            Project_Workspace__c: item.Project_Workspace__c || ''
          } as Proposal);
        }
      } catch (error) {
        console.error("Error fetching proposal summary data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProposal();
  }, [id]);

  return (
    <Sidebar>
      {/* Breadcrumb - Compact */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1 min-w-0">
          <button
            onClick={() => router.push("/proposals")}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Proposals
          </button>
          <span>&gt;</span>
          <button
            onClick={() => router.push(`/proposals/${id}`)}
            className="hover:text-gray-700 dark:hover:text-gray-300">
            Proposal Details
          </button>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white truncate">Proposal Workspace Page</span>
        </div>
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white ">
              Proposal Workspace Page
            </h1>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/proposals/${id}`}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2 truncate"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Proposal
            </Link>
          </div>
        </div>
      </div>

      {/* Iframe Section */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[calc(100vh-200px)] ${loading || !proposal?.Project_Workspace__c ? 'flex items-center justify-center' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading workspace...</p>
          </div>
        ) : proposal?.Project_Workspace__c ? (
          <div
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
            dangerouslySetInnerHTML={{ __html: proposal.Project_Workspace__c }}
          />
        ) : (
          <div className="text-center p-8">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Workspace URL Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">The Project_Workspace__c field is empty for this proposal.</p>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
