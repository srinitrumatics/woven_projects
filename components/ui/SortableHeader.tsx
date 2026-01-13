import React from 'react';
import { SortConfig } from '../../hooks/useSortableData';

interface SortableHeaderProps {
    label: string;
    field: string;
    sortConfig: SortConfig<any> | null;
    requestSort: (key: any) => void;
    className?: string;
    align?: 'left' | 'right' | 'center';
}

export function SortableHeader({
    label,
    field,
    sortConfig,
    requestSort,
    className = "",
    align = "left"
}: SortableHeaderProps) {
    const isSorted = sortConfig?.key === field;

    return (
        <th
            className={`px-4 py-3 text-${align} text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none ${className}`}
            onClick={() => requestSort(field)}
        >
            <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
                {label}
                <span className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 w-4">
                    {isSorted ? (
                        sortConfig?.direction === 'asc' ? '↑' : '↓'
                    ) : (
                        <span className="opacity-0 group-hover:opacity-100 text-[10px]">↕</span>
                    )}
                </span>
            </div>
        </th>
    );
}
