import React, { useCallback, useRef } from 'react';
import { SortConfig } from '../../hooks/useSortableData';

interface SortableHeaderProps {
    label: string;
    field: string;
    sortConfig?: SortConfig<any> | null;
    requestSort?: (key: any) => void;
    className?: string;
    align?: 'left' | 'right' | 'center';
    width?: string | number;
    onResize?: (field: string, newWidth: number) => void;
    truncate?: boolean;
    style?: React.CSSProperties;
}

export function SortableHeader({
    label,
    field,
    sortConfig,
    requestSort,
    className = "",
    align = "left",
    width,
    onResize,
    truncate = false,
    style = {}
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
    // Reserve enough room for the label text plus the sort icon/padding so the
    // icon never overlaps the next column, even if a caller passes a narrow width.
    // Tables here use table-fixed, which sizes columns from `width` alone (min-width
    // on the cell is ignored by the fixed layout algorithm), so the computed value
    // has to be applied as the actual width, not just a min-width.
    const contentMinWidth = `calc(${label.length}ch + 3rem)`;
    const resolvedWidth = displayWidth ? `max(${displayWidth}, ${contentMinWidth})` : contentMinWidth;

    return (
        <th
            ref={thRef}
            className={`p-0 text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none ${className?.includes('sticky') ? '' : 'relative'} ${className}`}
            onClick={() => requestSort && requestSort(field)}
            style={{ width: resolvedWidth, minWidth: resolvedWidth, ...style }}
        >
            <div
                className={`px-2 py-3 flex items-center gap-2 h-full min-h-[44px]`}
                style={{ width: '100%' }}
            >
                <div className="flex-1">
                    <span
                        className={`text-${align} block w-full whitespace-nowrap`}
                        title={label}
                    >
                        {label}
                    </span>
                </div>
                <span
                    className={`flex-shrink-0 flex items-center justify-center w-5 h-5 transition-colors ${isSorted
                        ? 'text-primary-dark dark:text-primary'
                        : 'text-gray-400 group-hover:text-primary-dark dark:text-gray-500 dark:group-hover:text-primary'
                        }`}
                >
                    {isSorted ? (
                        sortConfig?.direction === 'asc' ? (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M10 4l5 6H5l5-6z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M10 16l-5-6h10l-5 6z" />
                            </svg>
                        )
                    ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M10 3l4 5H6l4-5zm0 14l-4-5h8l-4 5z" />
                        </svg>
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
