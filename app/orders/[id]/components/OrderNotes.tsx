"use client";

interface OrderNotesProps {
    formData: any;
    setFormData: (data: any) => void;
    isEditing?: boolean;
    className?: string;
}

export default function OrderNotes({
    formData,
    setFormData,
    isEditing = false,
    className = ""
}: OrderNotesProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col min-h-[300px] h-full ${className}`} role="region" aria-label="Order notes">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Order Notes">Order Notes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Special Instructions or Notes</p>
            </div>

            {/* Order Notes Textarea */}
            <div className="flex-1 flex flex-col">
                <textarea
                    placeholder="Add instructions or notes…"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                    readOnly={!isEditing}
                    className={`w-full flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 resize-none ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                />
            </div>
        </div>
    );
}
