"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface LineHeaderProps {
    id: string;
    lineId: string;
    orderName: string;
    productSku: string;
    lineNumber: number;
    totalLines: number;
    orderStatus: string;
    lineStatus: string;
    isEditing: boolean;
    isSubmitting: boolean;
    onEditToggle: () => void;
    onSave: () => void;
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Awarded":
            case "Paid":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "Pending":
                return "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
            case "Draft":
                return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
            case "Cancelled":
            case "Closed":
                return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            default:
                return "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold border ${getStyles()}`}>
            {status}
        </span>
    );
}

export default function LineHeader({
    id,
    lineId,
    orderName,
    productSku,
    lineNumber,
    totalLines,
    orderStatus,
    lineStatus,
    isEditing,
    isSubmitting,
    onEditToggle,
    onSave,
}: LineHeaderProps) {
    const router = useRouter();

    return (
        <div className="mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1 min-w-0">
                <button
                    onClick={() => router.push("/orders")}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Orders
                </button>
                <span>&gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300 truncate">Order Line</span>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white truncate max-w-[200px]" title={productSku || `Line #${lineId}`}>
                    {productSku || `Line #${lineId}`}
                </span>
            </div>

            <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white " title={productSku || `Order Line #${lineId}`}>
                        {productSku || `Order Line #${lineId}`}
                    </h1>

                </div>
                <div className="flex items-center gap-2 min-w-0">
                    {orderStatus === "Draft" && (
                        <button
                            onClick={onEditToggle}
                            disabled={isSubmitting}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${isEditing
                                ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isEditing ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                )}
                            </svg>
                            {isEditing ? "Cancel" : "Edit"}
                        </button>
                    )}

                    {isEditing && (
                        <button
                            onClick={onSave}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 truncate"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    )}

                    {/* Back to Order Button */}
                    <Link
                        href={`/orders/${id}`}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2 truncate"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Order
                    </Link>
                </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">
                    Line {lineNumber} of {totalLines}
                </span>
                <StatusBadge status={lineStatus} />
            </div>
        </div>
    );
}
