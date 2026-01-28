import { Proposal } from "../types";

interface KeyDatesProps {
    proposal: Proposal;
}

export default function KeyDates({ proposal }: KeyDatesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Dates</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Important Timeline Information</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Account Rep</label>
                    <p className="text-gray-900 dark:text-white font-medium truncate" title={proposal.accountExecutive}>{proposal.accountExecutive}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Proposal Type</label>
                    <p className="text-gray-900 dark:text-white truncate" title={proposal.proposalType}>{proposal.proposalType}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Issued Date</label>
                    <p className="text-gray-900 dark:text-white truncate" title={proposal.issuedDate}>{proposal.issuedDate}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Expiration Date</label>
                    <p className="text-gray-900 dark:text-white font-semibold truncate" title={proposal.expirationDate}>{proposal.expirationDate}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Customer Order</label>
                    <p className="text-gray-900 dark:text-white font-mono truncate" title={proposal.orderNumber}>{proposal.orderNumber}</p>
                </div>
            </div>
        </div>
    );
}
