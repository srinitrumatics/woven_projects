"use client";

interface OrderLineNotesProps {
    isEditing: boolean;
    notes: string;
    onNotesChange: (notes: string) => void;
    originalNotes: string;
}

export default function OrderLineNotes({
    isEditing,
    notes,
    onNotesChange,
    originalNotes,
}: OrderLineNotesProps) {
    return (
        <div className="w1500:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Order Line Notes
                </h3>
            </div>
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                    Notes
                </label>
                <div className="flex-1">
                    {isEditing ? (
                        <textarea
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            className="w-full h-full p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none min-h-[200px]"
                            placeholder="Enter order line notes..."
                        />
                    ) : (
                        <div className="h-full p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-sm text-gray-900 dark:text-white min-h-[200px]">
                            <p
                                className={
                                    originalNotes ? "text-gray-900 dark:text-white" : "text-gray-400"
                                }
                            >
                                {originalNotes || "No notes available"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
