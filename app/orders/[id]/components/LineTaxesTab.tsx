import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';

interface LineTaxesTabProps {
    product: any; // Using any for now to avoid strict type deps, will improve
    loading?: boolean;
}

export default function LineTaxesTab({ product, loading }: LineTaxesTabProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 min-w-0">
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
        return val !== undefined && val !== null ? `${Number(val).toFixed(3)}%` : '0.000%';
    };

    // Format currency helper
    const formatAmt = (val: number | undefined | null) => {
        return val !== undefined && val !== null ? formatCurrency(val) : '$0.00';
    };
    const formatTax = (val: number | undefined | null) => {
        return val !== undefined && val !== null ? formatCurrency(val, 'USD', 2) : '$0.00';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2 min-w-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    Taxes
                </h2>
            </div>
            <div className="overflow-x-auto">
                {product.isTaxable === "No" ? (
                    <div className="py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                        <p className="text-sm truncate" title="There are no taxes associated with this Order.">There are no taxes associated with this Order.</p>
                    </div>
                ) : (
                    <table className="w-full table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Sales Tax Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Sales Tax Amount</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Use Tax Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Use Tax Amount</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Local Tax Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Local Tax Amount</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Excise Tax Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">Excise Tax Amount</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">GRT Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">GRT Amount</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">GST Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">GST Amount</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">VAT Rate</th>
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white text-left truncate">VAT Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatPercent(product.Sales_Tax_Rate__c)}>
                                    {formatPercent(product.Sales_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[140px] truncate" title={formatTax(product.Sales_Tax_Amount__c)}>
                                    {formatTax(product.Sales_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatPercent(product.Use_Tax_Rate__c)}>
                                    {formatPercent(product.Use_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[140px] truncate" title={formatTax(product.Use_Tax_Amount__c)}>
                                    {formatTax(product.Use_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatPercent(product.Local_Tax_Rate__c)}>
                                    {formatPercent(product.Local_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[140px] truncate" title={formatTax(product.Local_Tax_Amount__c)}>
                                    {formatTax(product.Local_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[140px] truncate" title={formatPercent(product.Excise_Tax_Rate__c)}>
                                    {formatPercent(product.Excise_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[160px] truncate" title={formatTax(product.Excise_Tax_Amount__c)}>
                                    {formatTax(product.Excise_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[140px] truncate" title={formatPercent(product.Gross_Receipts_Tax_Rate__c)}>
                                    {formatPercent(product.Gross_Receipts_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatTax(product.Gross_Receipts_Tax_Amount__c)}>
                                    {formatTax(product.Gross_Receipts_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatPercent(product.GST_Rate__c)}>
                                    {formatPercent(product.GST_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatTax(product.GST_Amount__c)}>
                                    {formatTax(product.GST_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatPercent(product.VAT_Rate__c)}>
                                    {formatPercent(product.VAT_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left min-w-[120px] truncate" title={formatTax(product.Total_VAT_Amount__c)}>
                                    {formatTax(product.Total_VAT_Amount__c)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
