import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';

interface LineTaxesTabProps {
    product: any; // Using any for now to avoid strict type deps, will improve
    loading?: boolean;
}

export default function LineTaxesTab({ product, loading }: LineTaxesTabProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
                No tax information available.
            </div>
        );
    }

    // Format percentage helper
    const formatPercent = (val: number | undefined | null) => {
        return val !== undefined && val !== null ? `${Number(val).toFixed(2)}%` : '0.00%';
    };

    // Format currency helper
    const formatAmt = (val: number | undefined | null) => {
        return val !== undefined && val !== null ? formatCurrency(val) : '$0.00';
    };
    const formatTax = (val: number | undefined | null) => {
        return val !== undefined && val !== null ? formatCurrency(val, 'USD', 3) : '$0.000';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Taxes
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">Sales Tax Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">Sales Tax Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">Use Tax Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">Use Tax Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">Local Tax Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">Local Tax Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">Excise Tax Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">Excise Tax Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">GRT Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">GRT Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">GST Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">GST Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[120px]">VAT Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[140px]">VAT Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.Sales_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.Sales_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.Use_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.Use_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.Local_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.Local_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.Excise_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.Excise_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.Gross_Receipts_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.Gross_Receipts_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.GST_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.GST_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(product.VAT_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white text-right">
                                {formatTax(product.Total_VAT_Amount__c)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
