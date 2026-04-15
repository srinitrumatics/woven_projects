import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';
import { SortableHeader } from '@/components/ui/SortableHeader';

interface TaxesTabProps {
    order: any;
    loading?: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function TaxesTab({ order, loading, widths, onResize }: TaxesTabProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if order exists and if at least one tax field is present (not null/undefined)
    const hasTaxData = order && (
        (order.Sales_Tax_Rate__c !== undefined && order.Sales_Tax_Rate__c !== null) ||
        (order.Total_Sales_Tax_Amount__c !== undefined && order.Total_Sales_Tax_Amount__c !== null) ||
        (order.Use_Tax_Rate__c !== undefined && order.Use_Tax_Rate__c !== null) ||
        (order.Total_Use_Tax_Amount__c !== undefined && order.Total_Use_Tax_Amount__c !== null) ||
        (order.Local_Tax_Rate__c !== undefined && order.Local_Tax_Rate__c !== null) ||
        (order.Total_Local_Tax_Amount__c !== undefined && order.Total_Local_Tax_Amount__c !== null) ||
        (order.Excise_Tax_Rate__c !== undefined && order.Excise_Tax_Rate__c !== null) ||
        (order.Total_Excise_Tax_Amount__c !== undefined && order.Total_Excise_Tax_Amount__c !== null) ||
        (order.Gross_Receipts_Tax_Rate__c !== undefined && order.Gross_Receipts_Tax_Rate__c !== null) ||
        (order.Total_Gross_Receipts_Tax_Amount__c !== undefined && order.Total_Gross_Receipts_Tax_Amount__c !== null) ||
        (order.GST_Rate__c !== undefined && order.GST_Rate__c !== null) ||
        (order.Total_GST_Amount__c !== undefined && order.Total_GST_Amount__c !== null) ||
        (order.VAT_Rate__c !== undefined && order.VAT_Rate__c !== null) ||
        (order.Total_VAT_Amount__c !== undefined && order.Total_VAT_Amount__c !== null)
    );

    if (!hasTaxData) {
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
                            <SortableHeader label="Sales Tax Rate" field="salesRate" width={widths.salesRate} onResize={onResize} />
                            <SortableHeader label="Sales Tax Amount" field="salesAmount" width={widths.salesAmount} onResize={onResize} />
                            <SortableHeader label="Use Tax Rate" field="useRate" width={widths.useRate} onResize={onResize} />
                            <SortableHeader label="Use Tax Amount" field="useAmount" width={widths.useAmount} onResize={onResize} />
                            <SortableHeader label="Local Tax Rate" field="localRate" width={widths.localRate} onResize={onResize} />
                            <SortableHeader label="Local Tax Amount" field="localAmount" width={widths.localAmount} onResize={onResize} />
                            <SortableHeader label="Excise Tax Rate" field="exciseRate" width={widths.exciseRate} onResize={onResize} />
                            <SortableHeader label="Excise Tax Amount" field="exciseAmount" width={widths.exciseAmount} onResize={onResize} />
                            <SortableHeader label="GRT Rate" field="grtRate" width={widths.grtRate} onResize={onResize} />
                            <SortableHeader label="GRT Amount" field="grtAmount" width={widths.grtAmount} onResize={onResize} />
                            <SortableHeader label="GST Rate" field="gstRate" width={widths.gstRate} onResize={onResize} />
                            <SortableHeader label="GST Amount" field="gstAmount" width={widths.gstAmount} onResize={onResize} />
                            <SortableHeader label="VAT Rate" field="vatRate" width={widths.vatRate} onResize={onResize} />
                            <SortableHeader label="VAT Amount" field="vatAmount" width={widths.vatAmount} onResize={onResize} />
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
