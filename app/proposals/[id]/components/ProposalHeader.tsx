"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface ProposalHeaderProps {
    id: string;
    proposalNumber: string;
    status: string;
    description: string;
}

export default function ProposalHeader({ id, proposalNumber, status, description }: ProposalHeaderProps) {
    return (
        <div className="mb-6">
            <Breadcrumb
                items={[
                    { label: "Proposals", href: "/proposals" },
                    { label: "Proposal Details", href: `/proposals/${id}` },
                    { label: proposalNumber },
                ]}
                className="mb-2"
            />

            {/* Proposal header card (full width) */}
            <div className="w-full p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 3h18v4H3z" />
                                <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 01-2-2V7" />
                                <path d="M7 12h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white " title={proposalNumber}>{proposalNumber}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Proposal Details and Summary</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                        <StatusBadge status={status} variant="pill" />
                    </div>
                </div>
            </div>
        </div>
    );
}
