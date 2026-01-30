import { useState, useCallback } from 'react';

export interface ColumnWidths {
    [key: string]: number;
}

export const useResizableColumns = (initialWidths: ColumnWidths) => {
    const [widths, setWidths] = useState<ColumnWidths>(initialWidths);

    const handleResize = useCallback((field: string, newWidth: number) => {
        setWidths((prev) => ({
            ...prev,
            [field]: Math.max(newWidth, 50), // Minimum width of 50px
        }));
    }, []);

    return { widths, handleResize };
};
