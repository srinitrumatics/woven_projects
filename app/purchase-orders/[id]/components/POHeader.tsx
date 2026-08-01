"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface POHeaderProps {
    poNumber: string;
    status: string;
    supplierName: string;
    onBack: () => void;
}

export default function POHeader({ poNumber, status, supplierName, onBack }: POHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 min-w-0">
                <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300 shrink-0 truncate" title="Purchase Orders">Purchase Orders</button>
                <span className="shrink-0 truncate"> &gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300 shrink-0 truncate" title="Purchase Order Details">Purchase Order Details</span>
                <span className="shrink-0 truncate"> &gt;</span>
                <span className="text-gray-900 dark:text-white truncate" title={poNumber}>{poNumber}</span>
            </div>

            <div className="w-full px-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight " title={poNumber}>{poNumber}</h2>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 truncate" title={`${supplierName} • Purchase Order Details`} >
                                {supplierName} • Purchase Order Details
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                        <StatusBadge status={status} variant="bordered" />
                    </div>
                </div>
            </div>
        </div>
    );
}
