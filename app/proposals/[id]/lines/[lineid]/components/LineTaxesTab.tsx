import React from "react";
import { TaxDetail } from "../../../types";

interface LineTaxesTabProps {
    taxData: TaxDetail | null;
    loading: boolean;
}

export default function LineTaxesTab({ taxData, loading }: LineTaxesTabProps) {
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!taxData) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No tax data available.
            </div>
        );
    }

    return (
        <div className="p-6 overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Sales Tax Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Sales Tax Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Use Tax Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Use Tax Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Local Tax Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Local Tax Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Excise Tax Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Excise Tax Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">GRT Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">GRT Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">GST Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">GST Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">VAT Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">VAT Amount</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.salesTaxRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.salesTaxAmount?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.useTaxRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.useTaxAmount?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.localTaxRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.localTaxAmount?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.exciseTaxRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.exciseTaxAmount?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.grossReceiptsTaxRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.grossReceiptsTaxAmount?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.gstRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.gstAmount?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.vatRate?.toFixed(3) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{taxData.vatAmount?.toFixed(3) || '0.00'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
