import { formatDate } from"@/lib/utils/formatting";
import { QuoteDetails } from"../../types";
import ReadOnlyField from "@/components/ui/ReadOnlyField";

interface QuoteKeyDatesProps {
    quote: QuoteDetails;
    className?: string;
}

export default function QuoteKeyDates({ quote, className =""}: QuoteKeyDatesProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full ${className}`}>
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white"title="Key Dates">Key Dates</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400"title="Important Timeline Information">Important Timeline Information</p>
                </div>
            </div>

            <div className="text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w1025:grid-cols-5 gap-4">
                    <ReadOnlyField label="Account Rep" value={quote.accountExecutive || ''} />
                    <ReadOnlyField label="Proposal Name" value={quote.proposalName || ''} />
                    <ReadOnlyField label="Customer Order" value={quote.customerOrder || ''} />
                    <ReadOnlyField label="Issued Date" value={formatDate(quote.issuedDate, 'numeric-dash')} />
                    <ReadOnlyField label="Expiration Date" value={formatDate(quote.expirationDate, 'numeric-dash')} />
                </div>
            </div>
        </div>
    );
}
