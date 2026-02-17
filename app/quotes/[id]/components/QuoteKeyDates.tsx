import { QuoteDetails } from "../../types";

interface QuoteKeyDatesProps {
    quote: QuoteDetails;
}

export default function QuoteKeyDates({ quote }: QuoteKeyDatesProps) {
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
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Account Rep</label>
                    <input type="text" disabled value={quote.accountExecutive || ''} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Proposal Name</label>
                    <input type="text" disabled value={quote.proposalName || ''} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Customer Order</label>
                    <input type="text" disabled value={quote.customerOrder || ''} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Issued Date</label>
                    <input type="text" disabled value={quote.issuedDate || ''} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Expiration Date</label>
                    <input type="text" disabled value={quote.expirationDate || ''} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Planned Ship Date</label>
                    <input type="text" disabled value={quote.plannedShipDate || ''} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300" />
                </div>
            </div>
        </div>
    );
}
