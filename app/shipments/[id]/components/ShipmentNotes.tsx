interface ShipmentNotesProps {
    notes: string;
}

export default function ShipmentNotes({ notes }: ShipmentNotesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Notes">Notes</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Special Instructions or Notes">Special Instructions or Notes</p>
                </div>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 font-normal text-sm text-gray-600 dark:text-gray-400 overflow-y-auto break-words whitespace-pre-wrap">
                {notes || "No special notes or instructions for this manifest."}
            </div>
        </div>
    );
}
