import Link from "next/link";
import { QuoteStatus } from "@/app/quotes/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface QuoteHeaderProps {
    id: string;
    quoteNumber: string;
    status: QuoteStatus;
    description: string;
}

export default function QuoteHeader({ id, quoteNumber, status, description }: QuoteHeaderProps): JSX.Element {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 min-w-0">
                <Link href={`/quotes`} className="text-sm text-gray-500 dark:text-gray-400 truncate">Quotes</Link>
                <span>&gt;</span>
                <Link href={`/quotes/${id}`} className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Quote Details
                </Link>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white" title={quoteNumber}>{quoteNumber}</span>
            </div>
            <div className="w-full p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 3h18v4H3z" />
                                <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 01-2-2V7" />
                                <path d="M7 12h10" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" title={quoteNumber}>{quoteNumber}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Quote Details and Summary</div>
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
