"use client";

import React from 'react';

export function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        const s = status?.toLowerCase();
        switch (s) {
            case "approved":
            case "paid":
            case "awarded":
            case "completed":
            case "active":
            case "yes":
            case "received":
            case "acknowledged":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "pending":
            case "issued":
            case "pending approval":
            case "partial":
                return "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
            case "draft":
            case "in stock":
                return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
            case "cancelled":
            case "closed":
            case "no":
            case "failed":
            case "inactive":
            case "exception only":
                return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            case "conditional":
                return "bg-orange-100/80 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
            default:
                return "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50";
        }
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border truncate ${getStyles()}`} title={status}>
            {status}
        </span>
    );
}

export function RemittanceBadge({ status }: { status: string }) {
    const getStyles = () => {
        const s = status?.toLowerCase();
        switch (s) {
            case "paid":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "partially paid":
                return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
            case "unpaid":
            case "not payable":
            case "past due":
                return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            case "pending":
                return "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
            default:
                return "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50";
        }
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border truncate ${getStyles()}`} title={status}>
            {status}
        </span>
    );
}
