"use client";

import React from 'react';

export function StatusBadge({ status, variant = 'bordered' }: { status: string; variant?: 'pill' | 'bordered' | 'compact' }) {
    const getStyles = () => {
        const s = status?.toLowerCase();
        switch (s) {
            case "approved":
            case "paid":
            case "awarded":
            case "completed":
            case "completed_with_errors":
            case "active":
            case "yes":
            case "received":
            case "acknowledged":
            case "applied":
            case "delivered":
            case "lead":
            case "posted":
            case "shipped":
            case "valid":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "pending":
            case "issued":
            case "pending approval":
            case "partial":
            case "in progress":
            case "packed":
            case "partial shipment":
            case "pending review":
            case "picked":
            case "submitted":
            case "pending shipment":
                return "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
            case "draft":
            case "in stock":
            case "accepted":
            case "allocated":
            case "converted":
            case "in transit":
            case "inprogress":
            case "open":
            case "out for delivery":
            case "new":
                return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
            case "cancelled":
            case "closed":
            case "no":
            case "failed":
            case "inactive":
            case "exception only":
            case "canceled":
            case "exception":
            case "overdue":
            case "past due":
            case "partial rejected":
            case "rejected":
                return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
            case "conditional":
            case "expired":
            case "on hold":
                return "bg-orange-100/80 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
            case "sent":
            case "under review":
                return "bg-purple-100/80 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50";
            case "negotiation":
            case "viewed":
                return "bg-indigo-100/80 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50";
            case "quote ready":
            case "settled":
                return "bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
            case "quote requested":
                return "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
            case "proposal sent":
                return "bg-sky-100/80 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50";
            default:
                return "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50";
        }
    };

    const shapeClasses = {
        bordered: "inline-flex items-center px-2.5 py-1.0 rounded-full text-xs font-bold border truncate",
        pill: "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium",
        compact: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
    };
    const titleProp = variant === 'bordered' ? { title: status } : {};

    return (
        <span className={`${shapeClasses[variant]} ${getStyles()}`} {...titleProp}>
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border truncate ${getStyles()}`} title={status}>
            {status}
        </span>
    );
}
