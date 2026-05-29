import { QuoteTax } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";

type SortDirection = 'asc' | 'desc';

interface QuoteTaxesTabProps {
    taxes: QuoteTax[];
    loading: boolean;
    sortField: keyof QuoteTax;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteTax) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteTaxesTab({
    taxes,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteTaxesTabProps): JSX.Element {
    const [currentPage, setCurrentPage] = useState(1);
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteTax);

    const displayTaxes = taxes && taxes.length > 0 ? taxes : [{
        id: 'default-tax',
        salesTaxRate: 0,
        salesTaxAmount: 0,
        useTaxRate: 0,
        useTaxAmount: 0,
        localTaxRate: 0,
        localTaxAmount: 0,
        exciseTaxRate: 0,
        exciseTaxAmount: 0,
        grtRate: 0,
        grtAmount: 0,
        gstRate: 0,
        gstAmount: 0,
        vatRate: 0,
        vatAmount: 0
    } as QuoteTax];

    const paginatedTaxes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return displayTaxes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [displayTaxes, currentPage]);

    const totalPages = Math.ceil(displayTaxes.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Sales Tax Rate" field="salesTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxAmount} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Use Tax Rate" field="useTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Use Tax Amount" field="useTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxAmount} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Local Tax Rate" field="localTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Local Tax Amount" field="localTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxAmount} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxAmount} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="GRT Rate" field="grtRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="GRT Amount" field="grtAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtAmount} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="GST Rate" field="gstRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="GST Amount" field="gstAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="VAT Rate" field="vatRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={onResize} align="left" truncate={false} />
                        <SortableHeader label="VAT Amount" field="vatAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={onResize} align="left" truncate={false} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedTaxes.map((tax) => (
                        <tr key={tax.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesTaxRate }}>{(tax.salesTaxRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[160px] truncate" style={{ width: widths.salesTaxAmount }}>{formatCurrency(tax.salesTaxAmount ?? 0)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.useTaxRate }}>{(tax.useTaxRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.useTaxAmount }}>{formatCurrency(tax.useTaxAmount ?? 0)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.localTaxRate }}>{(tax.localTaxRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[160px] truncate" style={{ width: widths.localTaxAmount }}>{formatCurrency(tax.localTaxAmount ?? 0)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.exciseTaxRate }}>{(tax.exciseTaxRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[165px] truncate" style={{ width: widths.exciseTaxAmount }}>{formatCurrency(tax.exciseTaxAmount ?? 0)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.grtRate }}>{(tax.grtRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.grtAmount }}>{formatCurrency(tax.grtAmount ?? 0)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.gstRate }}>{(tax.gstRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.gstAmount }}>{formatCurrency(tax.gstAmount ?? 0)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.vatRate }}>{(tax.vatRate ?? 0).toFixed(3)}%</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.vatAmount }}>{formatCurrency(tax.vatAmount ?? 0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
