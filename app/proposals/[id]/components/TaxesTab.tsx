import { TaxDetail } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

interface TaxesTabProps {
    taxes: TaxDetail[];
    loading: boolean;
}

export default function TaxesTab({ taxes, loading }: TaxesTabProps) {

    const { items: sortedData, requestSort, sortConfig } = useSortableData<TaxDetail>(taxes);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <SortableHeader label="Sales Tax Rate" field="salesTaxRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Use Tax Rate" field="useTaxRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Use Tax Amount" field="useTaxAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Local Tax Rate" field="localTaxRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Local Tax Amount" field="localTaxAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="GRT Rate" field="grossReceiptsTaxRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="GRT Amount" field="grossReceiptsTaxAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="GST Rate" field="gstRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="GST Amount" field="gstAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="VAT Rate" field="vatRate" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="VAT Amount" field="vatAmount" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-lg font-medium">No tax information found</p>
                                    <p className="text-xs text-gray-400 mt-2">Data length: {taxes.length}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((tax) => (
                            <tr key={tax.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.salesTaxRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.salesTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.useTaxRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.useTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.localTaxRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.localTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.exciseTaxRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.exciseTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.grossReceiptsTaxRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.grossReceiptsTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.gstRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.gstAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    {tax.vatRate?.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                    ${tax.vatAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
