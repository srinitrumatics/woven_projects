import { Proposal, ProposedProduct } from "../types";
import { formatAddress } from "../utils";
import ProposalSummary from "./ProposalSummary";
import BillingInfo from "./BillingInfo";
import ShippingInfo from "./ShippingInfo";
import KeyDates from "./KeyDates";

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Draft":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            case "Pending Review":
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Under Review":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Approved":
            case "Accepted":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Lead":
                return "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <div className="grid grid-cols-1 w1500:grid-cols-10 gap-6">
            {/* Key Dates (70%) */}
            <div className="w1500:col-span-7 h-full">
                <KeyDates proposal={proposal} />
            </div>

            {/* Proposal Notes Card (30%) */}
            <div className="w1500:col-span-3 h-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden w-full flex flex-col h-full">
                    <div className="w-full flex items-center gap-2 justify-start p-4 border-b border-gray-50 dark:border-gray-700/50">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proposal Notes</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Review Your Proposal Notes</p>
                        </div>
                    </div>

                    <div className="p-4 flex-1">
                        <textarea
                            readOnly
                            className="w-full h-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:ring-0 focus:border-gray-300"
                            value={proposal.Proposal_Notes || "No special notes for this proposal."}
                        />
                    </div>
                </div>
            </div>

            {/* Left Column Remainder (70%) */}
            <div className="w1500:col-span-7 flex flex-col gap-4 h-full">
                {/* Billing and Shipping Information Cards - Side by Side */}
                <div className="grid grid-cols-1 w1500:grid-cols-2 gap-4">
                    <BillingInfo proposal={proposal} />
                    <ShippingInfo proposal={proposal} />
                </div>

                {/* Scope Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="w-full flex items-center gap-2 justify-start p-4 border-b border-gray-50 dark:border-gray-700/50">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scope Summary</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Proposal Scope and Deliverables Overview</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <textarea
                            readOnly
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white leading-relaxed resize-none focus:ring-0 focus:border-gray-300 h-26"
                            value={proposal.specialTerms || "No scope summary provided for this proposal."}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column Remainder (30%) */}
            <div className="w1500:col-span-3 flex flex-col gap-4 self-start">
                {/* Proposal Summary Card */}
                <ProposalSummary
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
