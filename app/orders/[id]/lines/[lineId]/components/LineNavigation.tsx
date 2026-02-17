"use client";

import Link from "next/link";

interface LineNavigationProps {
    id: string;
    hasPrevLine: boolean;
    hasNextLine: boolean;
    prevLineId: string;
    nextLineId: string;
    lineNumber: number;
    totalLines: number;
}

export default function LineNavigation({
    id,
    hasPrevLine,
    hasNextLine,
    prevLineId,
    nextLineId,
    lineNumber,
    totalLines,
}: LineNavigationProps) {
    return (
        <div className="flex items-center justify-end gap-2 mt-4">
            {/* Previous Line Button */}
            {hasPrevLine ? (
                <Link
                    href={`/orders/${id}/lines/${prevLineId}`}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
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
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Prev
                </Link>
            ) : (
                <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
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
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Prev
                </span>
            )}

            {/* Line indicator */}
            <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
                {lineNumber}/{totalLines}
            </span>

            {/* Next Line Button */}
            {hasNextLine ? (
                <Link
                    href={`/orders/${id}/lines/${nextLineId}`}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                >
                    Next
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
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Link>
            ) : (
                <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
                    Next
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
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </span>
            )}
        </div>
    );
}
