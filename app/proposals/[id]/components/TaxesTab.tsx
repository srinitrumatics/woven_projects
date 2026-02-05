import { TaxDetail } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

interface TaxesTabProps {
    taxes: TaxDetail[];
    loading: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function TaxesTab({ taxes, loading, widths, onResize }: TaxesTabProps) {

    const { items: sortedData, requestSort, sortConfig } = useSortableData<TaxDetail>(taxes);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <SortableHeader label="Sales Tax Rate" field="salesTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="Use Tax Rate" field="useTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Use Tax Amount" field="useTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="Local Tax Rate" field="localTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Local Tax Amount" field="localTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="GRT Rate" field="grossReceiptsTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.grossReceiptsTaxRate} onResize={onResize} align="left" />
                        <SortableHeader label="GRT Amount" field="grossReceiptsTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.grossReceiptsTaxAmount} onResize={onResize} align="left" />
                        <SortableHeader label="GST Rate" field="gstRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={onResize} align="left" />
                        <SortableHeader label="GST Amount" field="gstAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={onResize} align="left" />
                        <SortableHeader label="VAT Rate" field="vatRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={onResize} align="left" />
                        <SortableHeader label="VAT Amount" field="vatAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={onResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-lg font-medium">No tax information found</p>
                                    <p className="text-sm text-gray-400 mt-2">Data length: {taxes.length}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((tax) => (
                            <tr key={tax.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    {tax.salesTaxRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white min-w-[163px]">
                                    ${tax.salesTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    {tax.useTaxRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    ${tax.useTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white ">
                                    {tax.localTaxRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white min-w-[158px]">
                                    ${tax.localTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    {tax.exciseTaxRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white min-w-[178px]">
                                    ${tax.exciseTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    {tax.grossReceiptsTaxRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    ${tax.grossReceiptsTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    {tax.gstRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    ${tax.gstAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">
                                    {tax.vatRate?.toFixed(3)}%
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white ">
                                    ${tax.vatAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
