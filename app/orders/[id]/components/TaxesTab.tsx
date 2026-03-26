import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';

interface TaxesTabProps {
    order: any;
    loading?: boolean;
}

export default function TaxesTab({ order, loading }: TaxesTabProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order || (
        !order.Sales_Tax_Rate__c && !order.Total_Sales_Tax_Amount__c &&
        !order.Use_Tax_Rate__c && !order.Total_Use_Tax_Amount__c &&
        !order.Local_Tax_Rate__c && !order.Total_Local_Tax_Amount__c &&
        !order.Excise_Tax_Rate__c && !order.Total_Excise_Tax_Amount__c &&
        !order.Gross_Receipts_Tax_Rate__c && !order.Total_Gross_Receipts_Tax_Amount__c &&
        !order.GST_Rate__c && !order.Total_GST_Amount__c &&
        !order.VAT_Rate__c && !order.Total_VAT_Amount__c
    )) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no taxes associated with this order.">There are no taxes associated with this order.</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Sales Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Sales Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Use Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Use Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Local Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Local Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Excise Tax Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">Excise Tax Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">GRT Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">GRT Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">GST Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">GST Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">VAT Rate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate">VAT Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.Sales_Tax_Rate__c)}>
                                {formatPercent(order.Sales_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_Sales_Tax_Amount__c)}>
                                {formatTax(order.Total_Sales_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.Use_Tax_Rate__c)}>
                                {formatPercent(order.Use_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_Use_Tax_Amount__c)}>
                                {formatTax(order.Total_Use_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.Local_Tax_Rate__c)}>
                                {formatPercent(order.Local_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_Local_Tax_Amount__c)}>
                                {formatTax(order.Total_Local_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.Excise_Tax_Rate__c)}>
                                {formatPercent(order.Excise_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_Excise_Tax_Amount__c)}>
                                {formatTax(order.Total_Excise_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.Gross_Receipts_Tax_Rate__c)}>
                                {formatPercent(order.Gross_Receipts_Tax_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_Gross_Receipts_Tax_Amount__c)}>
                                {formatTax(order.Total_Gross_Receipts_Tax_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.GST_Rate__c)}>
                                {formatPercent(order.GST_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_GST_Amount__c)}>
                                {formatTax(order.Total_GST_Amount__c)}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium text-left truncate" title={formatPercent(order.VAT_Rate__c)}>
                                {formatPercent(order.VAT_Rate__c)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatTax(order.Total_VAT_Amount__c)}>
                                {formatTax(order.Total_VAT_Amount__c)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
