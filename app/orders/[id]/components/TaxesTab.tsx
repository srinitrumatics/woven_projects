import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';

interface TaxesTabProps {
    order: any;
    loading?: boolean;
}

export default function TaxesTab({ order, loading }: TaxesTabProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Sales Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Sales Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Use Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Use Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Local Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Local Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Excise Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Excise Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">GRT Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">GRT Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">GST Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">GST Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">VAT Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">VAT Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.Sales_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_Sales_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.Use_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_Use_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.Local_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_Local_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.Excise_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_Excise_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.Gross_Receipts_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_Gross_Receipts_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.GST_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_GST_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left">
                                {formatPercent(order.VAT_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatTax(order.Total_VAT_Amount__c)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
