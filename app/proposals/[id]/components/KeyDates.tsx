import { Proposal } from "../types";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/formatting";

interface KeyDatesProps {
    proposal: Proposal;
}

export default function KeyDates({ proposal }: KeyDatesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Key Dates">Key Dates</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Important Timeline Information</p>
                </div>
            </div>

            <div className="text-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 w1025:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Account Rep">Account Rep </label>
                        <input type="text" readOnly value={proposal.accountExecutive} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.accountExecutive} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Proposal Type">Proposal Type</label>
                        <input type="text" readOnly value={proposal.proposalType} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.proposalType} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Issued Date">Issued Date</label>
                        <input type="text" readOnly value={formatDate(proposal.issuedDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={formatDate(proposal.issuedDate, 'numeric-dash')} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Expiration Date">Expiration Date</label>
                        <input type="text" readOnly value={formatDate(proposal.expirationDate, 'numeric-dash')} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={formatDate(proposal.expirationDate, 'numeric-dash')} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer Order">Customer Order</label>
                        <input type="text" readOnly value={proposal.orderNumber} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" title={proposal.orderNumber} />
                    </div>
                </div>
            </div>
        </div>
    );
}
