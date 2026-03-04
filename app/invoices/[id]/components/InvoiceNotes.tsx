interface InvoiceNotesProps {
    notes: string;
    className?: string;
}

export default function InvoiceNotes({ notes, className = "" }: InvoiceNotesProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col min-h-[182px] ${className}`}>
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Invoice Notes">Invoice Notes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Review Invoice Notes</p>
            </div>
            <textarea
                disabled
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none h-full focus:ring-0 focus:border-gray-300"
                value={notes || "No special notes."}
            />
        </div>
    );
}
