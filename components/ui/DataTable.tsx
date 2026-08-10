import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export function Table({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return <table className={`w-full ${className}`} style={style}>{children}</table>;
}

export function THead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <thead className={`bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </thead>
    );
}

export function TBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <tbody className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
            {children}
        </tbody>
    );
}

export function Tr({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLTableRowElement> }) {
    return <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${className}`} onClick={onClick}>{children}</tr>;
}

export function Th({ children, className = "", style }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <th className={`px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white ${className}`} style={style}>
            {children}
        </th>
    );
}

export function Td({ children, className = "", style, title, onClick, colSpan }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties; title?: string; onClick?: React.MouseEventHandler<HTMLTableCellElement>; colSpan?: number }) {
    return <td className={`px-3 py-2 text-sm text-gray-900 dark:text-white ${className}`} style={style} title={title} onClick={onClick} colSpan={colSpan}>{children}</td>;
}

// Shared copy for the "a search or filter matched zero rows" case across every landing
// page's datatable, so the message reads identically everywhere and never echoes back
// whatever the user typed into the search box.
export const SEARCH_EMPTY_MESSAGE = "No matching records found";
export const SEARCH_EMPTY_DESCRIPTION = "Try adjusting your search or filters.";

export function TableEmptyState({ message = "No records found", description }: { message?: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
            <p className="text-lg font-medium truncate" title={message}>{message}</p>
            {description && (
                <p className="text-sm truncate" title={description}>{description}</p>
            )}
        </div>
    );
}

export function TableLoadingState({ message }: { message?: string } = {}) {
    return <LoadingSpinner size="sm" text={message} />;
}
