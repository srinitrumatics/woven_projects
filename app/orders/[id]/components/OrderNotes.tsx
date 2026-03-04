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
            <div className="flex items-center gap-3 mb-3 ">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Notes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Special Instructions or Notes</p>
                </div>
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
