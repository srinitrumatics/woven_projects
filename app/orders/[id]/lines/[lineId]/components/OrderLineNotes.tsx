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
        <div className="w1025:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Line Notes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Special Instructions or Comments</p>
            </div>
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Notes">
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
