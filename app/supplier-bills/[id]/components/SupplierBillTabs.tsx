"use client";

import React from 'react';

interface SupplierBillTabsProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
    counts?: {
        lines?: number;
        payments?: number;
        debits?: number;
        files?: number;
    };
}

export default function SupplierBillTabs({ activeTab, onTabChange, counts = {} }: SupplierBillTabsProps) {
    const tabs = [
        { id: "lines", label: "Supplier Bill Lines", count: counts.lines },
        { id: "payments", label: "Payments", count: counts.payments },
        { id: "debits", label: "Debits", count: counts.debits },
        { id: "files", label: "Files", count: counts.files },
    ];

    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto py-2 w-full">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 text-sm font-medium ${activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        ` (${tab.count})`
                    )}
                </button>
            ))}
        </div>
    );
}
