import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';
import { useResizableColumns } from '@/hooks/useResizableColumns';
import { SortableHeader } from '@/components/ui/SortableHeader';

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

    // Initialize resizable columns
    const { widths, handleResize } = useResizableColumns({
        salesTaxRate: 150,
        salesTaxAmount: 160,
        useTaxRate: 150,
        useTaxAmount: 160,
        localTaxRate: 150,
        localTaxAmount: 160,
        exciseTaxRate: 170,
        exciseTaxAmount: 180,
        grtRate: 150,
        grtAmount: 150,
        gstRate: 150,
        gstAmount: 150,
        vatRate: 150,
        vatAmount: 150,
    });

    // Dummy sort config for SortableHeader
    const sortConfig = null;
    const requestSort = () => { };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2 min-w-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white ">
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
                                <SortableHeader label="Sales Tax Rate" field="salesTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxRate} onResize={handleResize} />
                                <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxAmount} onResize={handleResize} />
                                <SortableHeader label="Use Tax Rate" field="useTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxRate} onResize={handleResize} />
                                <SortableHeader label="Use Tax Amount" field="useTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxAmount} onResize={handleResize} />
                                <SortableHeader label="Local Tax Rate" field="localTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxRate} onResize={handleResize} />
                                <SortableHeader label="Local Tax Amount" field="localTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxAmount} onResize={handleResize} />
                                <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxRate} onResize={handleResize} />
                                <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxAmount} onResize={handleResize} />
                                <SortableHeader label="GRT Rate" field="grtRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtRate} onResize={handleResize} />
                                <SortableHeader label="GRT Amount" field="grtAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtAmount} onResize={handleResize} />
                                <SortableHeader label="GST Rate" field="gstRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={handleResize} />
                                <SortableHeader label="GST Amount" field="gstAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={handleResize} />
                                <SortableHeader label="VAT Rate" field="vatRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={handleResize} />
                                <SortableHeader label="VAT Amount" field="vatAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={handleResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.salesTaxRate, minWidth: widths.salesTaxRate, maxWidth: widths.salesTaxRate }} title={formatPercent(product.Sales_Tax_Rate__c)}>
                                    {formatPercent(product.Sales_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.salesTaxAmount, minWidth: widths.salesTaxAmount, maxWidth: widths.salesTaxAmount }} title={formatTax(product.Sales_Tax_Amount__c)}>
                                    {formatTax(product.Sales_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.useTaxRate, minWidth: widths.useTaxRate, maxWidth: widths.useTaxRate }} title={formatPercent(product.Use_Tax_Rate__c)}>
                                    {formatPercent(product.Use_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.useTaxAmount, minWidth: widths.useTaxAmount, maxWidth: widths.useTaxAmount }} title={formatTax(product.Use_Tax_Amount__c)}>
                                    {formatTax(product.Use_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.localTaxRate, minWidth: widths.localTaxRate, maxWidth: widths.localTaxRate }} title={formatPercent(product.Local_Tax_Rate__c)}>
                                    {formatPercent(product.Local_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.localTaxAmount, minWidth: widths.localTaxAmount, maxWidth: widths.localTaxAmount }} title={formatTax(product.Local_Tax_Amount__c)}>
                                    {formatTax(product.Local_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.exciseTaxRate, minWidth: widths.exciseTaxRate, maxWidth: widths.exciseTaxRate }} title={formatPercent(product.Excise_Tax_Rate__c)}>
                                    {formatPercent(product.Excise_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.exciseTaxAmount, minWidth: widths.exciseTaxAmount, maxWidth: widths.exciseTaxAmount }} title={formatTax(product.Excise_Tax_Amount__c)}>
                                    {formatTax(product.Excise_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.grtRate, minWidth: widths.grtRate, maxWidth: widths.grtRate }} title={formatPercent(product.Gross_Receipts_Tax_Rate__c)}>
                                    {formatPercent(product.Gross_Receipts_Tax_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.grtAmount, minWidth: widths.grtAmount, maxWidth: widths.grtAmount }} title={formatTax(product.Gross_Receipts_Tax_Amount__c)}>
                                    {formatTax(product.Gross_Receipts_Tax_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.gstRate, minWidth: widths.gstRate, maxWidth: widths.gstRate }} title={formatPercent(product.GST_Rate__c)}>
                                    {formatPercent(product.GST_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.gstAmount, minWidth: widths.gstAmount, maxWidth: widths.gstAmount }} title={formatTax(product.GST_Amount__c)}>
                                    {formatTax(product.GST_Amount__c)}
                                </td>

                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.vatRate, minWidth: widths.vatRate, maxWidth: widths.vatRate }} title={formatPercent(product.VAT_Rate__c)}>
                                    {formatPercent(product.VAT_Rate__c)}
                                </td>
                                <td className="px-2 py-3 text-sm text-gray-900 dark:text-white text-left truncate" style={{ width: widths.vatAmount, minWidth: widths.vatAmount, maxWidth: widths.vatAmount }} title={formatTax(product.Total_VAT_Amount__c)}>
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
