import { QuoteTax } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency } from "@/lib/utils/formatting";

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

export default function QuoteTaxesTab({
    taxes,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteTaxesTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteTax);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Sales Tax Rate" field="salesTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="Use Tax Rate" field="useTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Use Tax Amount" field="useTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="Local Tax Rate" field="localTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Local Tax Amount" field="localTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="GRT Rate" field="grtRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtRate} onResize={onResize} align="left" />
                        <SortableHeader label="GRT Amount" field="grtAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtAmount} onResize={onResize} align="left" />
                        <SortableHeader label="GST Rate" field="gstRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={onResize} align="left" />
                        <SortableHeader label="GST Amount" field="gstAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={onResize} align="left" />
                        <SortableHeader label="VAT Rate" field="vatRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={onResize} align="left" />
                        <SortableHeader label="VAT Amount" field="vatAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={onResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {taxes.length === 0 ? (
                        <tr>
                            <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No tax records found</td>
                        </tr>
                    ) : (
                        taxes.map((tax) => (
                            <tr key={tax.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.salesTaxRate }}>{tax.salesTaxRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[160px]" style={{ width: widths.salesTaxAmount }}>{formatCurrency(tax.salesTaxAmount)}</td>

                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.useTaxRate }}>{tax.useTaxRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.useTaxAmount }}>{formatCurrency(tax.useTaxAmount)}</td>

                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.localTaxRate }}>{tax.localTaxRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[160px]" style={{ width: widths.localTaxAmount }}>{formatCurrency(tax.localTaxAmount)}</td>

                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.exciseTaxRate }}>{tax.exciseTaxRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[165px]" style={{ width: widths.exciseTaxAmount }}>{formatCurrency(tax.exciseTaxAmount)}</td>

                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.grtRate }}>{tax.grtRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.grtAmount }}>{formatCurrency(tax.grtAmount)}</td>

                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.gstRate }}>{tax.gstRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.gstAmount }}>{formatCurrency(tax.gstAmount)}</td>

                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.vatRate }}>{tax.vatRate?.toFixed(3)}%</td>
                                <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white" style={{ width: widths.vatAmount }}>{formatCurrency(tax.vatAmount)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
