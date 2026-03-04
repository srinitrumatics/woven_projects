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
        <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6">
            {/* Key Dates (70%) and Proposal Notes (30%) - Aligned Height */}
            <div className="w1025:col-span-7">
                <KeyDates proposal={proposal} />
            </div>
            <div className="w1025:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 w-full flex flex-col min-h-[180px] h-full">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Proposal Notes">Proposal Notes</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Review Your Proposal Notes</p>
                    </div>

                    <div className="flex-1">
                        <textarea
                            readOnly
                            className="w-full h-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:ring-0 focus:border-gray-300"
                            value={proposal.Proposal_Notes || "No special notes for this proposal."}
                        />
                    </div>
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
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Scope Summary">Scope Summary</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Proposal Scope and Deliverables Overview</p>
                    </div>

                    <div className="flex-1">
                        <textarea
                            readOnly
                            className="w-full h-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white leading-relaxed resize-none focus:ring-0 focus:border-gray-300 min-h-[104px]"
                            value={proposal.specialTerms || "No scope summary provided for this proposal."}
                        />
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
