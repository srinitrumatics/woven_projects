import React, { useCallback, useRef } from 'react';
import { SortConfig } from '../../hooks/useSortableData';

interface SortableHeaderProps {
    label: string;
    field: string;
    sortConfig: SortConfig<any> | null;
    requestSort: (key: any) => void;
    className?: string;
    align?: 'left' | 'right' | 'center';
    width?: string | number;
    onResize?: (field: string, newWidth: number) => void;
}

export function SortableHeader({
    label,
    field,
    sortConfig,
    requestSort,
    className = "",
    align = "left",
    width,
    onResize
}: SortableHeaderProps) {
    const isSorted = sortConfig?.key === field;
    const thRef = useRef<HTMLTableHeaderCellElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!onResize || !thRef.current) return;

        e.stopPropagation();
        e.preventDefault();

        const startX = e.pageX;
        const startWidth = thRef.current.offsetWidth;

        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
            const newWidth = startWidth + (mouseMoveEvent.pageX - startX);
            onResize(field, newWidth);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    }, [field, onResize]);

    const displayWidth = typeof width === 'number' ? `${width}px` : width;

    return (
        <th
            ref={thRef}
            className={`p-0 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none relative ${className}`}
            onClick={() => requestSort(field)}
            style={displayWidth ? { width: displayWidth, minWidth: displayWidth, maxWidth: displayWidth } : {}}
        >
            <div
                className={`px-2 py-3 flex items-start gap-1`}
                style={{ width: '100%' }}
            >
                <span className={`line-clamp-2 text-${align} flex-1`} title={label}>{label}</span>
                <span className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 w-4 flex-shrink-0 mt-0.5">
                    {isSorted ? (
                        sortConfig?.direction === 'asc' ? '↑' : '↓'
                    ) : (
                        <span className="opacity-0 group-hover:opacity-100 text-[10px]">↕</span>
                    )}
                </span>
            </div>

            {onResize && (
                <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-10"
                    onMouseDown={handleMouseDown}
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </th>
    );
}
