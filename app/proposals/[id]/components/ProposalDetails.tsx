import { Proposal, ProposedProduct } from "../types";
import { formatAddress } from "../utils";
import ProposalSummary from "./ProposalSummary";
import BillingInfo from "./BillingInfo";
import ShippingInfo from "./ShippingInfo";
import KeyDates from "./KeyDates";
import ReadOnlyTextArea from "@/components/ui/ReadOnlyTextArea";

interface ProposalDetailsProps {
    proposal: Proposal;
    proposedProducts: ProposedProduct[];
    grandTotal: number;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadPDF: () => void;
}

export default function ProposalDetails({
    proposal,
    proposedProducts,
    grandTotal,
    isUploading,
    handleFileUpload,
    handleDownloadPDF
}: ProposalDetailsProps) {

    return (
        <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6">
            {/* Key Dates (70%) and Proposal Notes (30%) - Aligned Height */}
            <div className="w1025:col-span-7">
                <KeyDates proposal={proposal} />
            </div>
            <div className="w1025:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 w-full flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Proposal Notes">Proposal Notes</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="For Your Review">For Your Review</p>
                        </div>
                    </div>

                    <ReadOnlyTextArea value={proposal.Proposal_Notes || "No special notes for this proposal."} className="max-h-[64px] overflow-y-auto" />
                </div>
            </div>

            {/* Bottom Row - Left Column and Sidebar */}
            <div className="w1025:col-span-7 flex flex-col gap-6 h-full">
                {/* Billing and Shipping Information Cards - Side by Side */}
                <div className="grid grid-cols-1 w1025:grid-cols-2 gap-4">
                    <BillingInfo proposal={proposal} />
                    <ShippingInfo proposal={proposal} />
                </div>

                {/* Scope Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Scope Summary">Scope Summary</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Proposal Scope and Deliverables Overview">Proposal Scope and Deliverables Overview</p>
                        </div>
                    </div>

                    <div className="flex-1">
                        <ReadOnlyTextArea value={proposal.specialTerms || "No scope summary provided for this proposal."} className="max-h-[100px] overflow-y-auto" />
                    </div>
                </div>
            </div>

            {/* Proposal Summary Card */}
            <div className="w1025:col-span-3">
                <ProposalSummary
                    className="h-full"
                    proposal={proposal}
                    proposedProducts={proposedProducts}
                    grandTotal={grandTotal}
                    isUploading={isUploading}
                    handleFileUpload={handleFileUpload}
                    handleDownloadPDF={handleDownloadPDF}
                />
            </div>
        </div>
    );
}
