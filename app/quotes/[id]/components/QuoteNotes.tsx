interface QuoteNotesProps {
    notes: string;
}

export default function QuoteNotes({ notes }: QuoteNotesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col h-[182px]">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Notes</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review Quote Notes</p>
                </div>
            </div>
            <textarea
                disabled
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none h-full focus:ring-0 focus:border-gray-300"
                value={notes || "No special notes."}
            />
        </div>
    );
}
