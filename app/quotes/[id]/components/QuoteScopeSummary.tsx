interface QuoteScopeSummaryProps {
    description: string;
}

export default function QuoteScopeSummary({ description }: QuoteScopeSummaryProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Scope Summary">Scope Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Project Scope and Deliverables Overview</p>
            </div>

            <textarea
                disabled
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white leading-relaxed resize-none focus:ring-0 focus:border-gray-300"
                value={description || "No scope summary provided."}

            />
        </div>
    );
}
