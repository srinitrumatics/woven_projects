import { QuoteStatus } from "@/app/quotes/types";

interface QuoteHeaderProps {
    quoteNumber: string;
    status: QuoteStatus;
    description: string;
    onBack: () => void;
}

export default function QuoteHeader({ quoteNumber, status, description, onBack }: QuoteHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Quote</button>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white">{quoteNumber}</span>
            </div>
            <div className="flex flex-row flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {quoteNumber}
                        </h1>
                    </div>
                </div>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${status === 'Draft' ? 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-400' :
                    status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
