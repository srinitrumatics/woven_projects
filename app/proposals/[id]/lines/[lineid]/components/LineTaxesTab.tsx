import React, { useState } from "react";
import { TaxDetail } from "../../../types";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";

interface LineTaxesTabProps {
    taxData: TaxDetail | null;
    loading: boolean;
}

export default function LineTaxesTab({ taxData, loading }: LineTaxesTabProps) {
    const { widths, handleResize } = useResizableColumns({
        salesTaxRate: 150,
        salesTaxAmount: 150,
        useTaxRate: 150,
        useTaxAmount: 150,
        localTaxRate: 150,
        localTaxAmount: 150,
        exciseTaxRate: 150,
        exciseTaxAmount: 150,
        grossReceiptsTaxRate: 150,
        grossReceiptsTaxAmount: 150,
        gstRate: 150,
        gstAmount: 150,
        vatRate: 150,
        vatAmount: 150
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center py-12 min-w-0">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!taxData) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no taxes associated with this proposal line.">There are no taxes associated with this proposal line.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800">
            <table className="w-full table-fixed ">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Sales Tax Rate" field="salesTaxRate" sortConfig={null} requestSort={() => { }} width={widths.salesTaxRate} onResize={handleResize} />
                        <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" sortConfig={null} requestSort={() => { }} width={widths.salesTaxAmount} onResize={handleResize} />
                        <SortableHeader label="Use Tax Rate" field="useTaxRate" sortConfig={null} requestSort={() => { }} width={widths.useTaxRate} onResize={handleResize} />
                        <SortableHeader label="Use Tax Amount" field="useTaxAmount" sortConfig={null} requestSort={() => { }} width={widths.useTaxAmount} onResize={handleResize} />
                        <SortableHeader label="Local Tax Rate" field="localTaxRate" sortConfig={null} requestSort={() => { }} width={widths.localTaxRate} onResize={handleResize} />
                        <SortableHeader label="Local Tax Amount" field="localTaxAmount" sortConfig={null} requestSort={() => { }} width={widths.localTaxAmount} onResize={handleResize} />
                        <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" sortConfig={null} requestSort={() => { }} width={widths.exciseTaxRate} onResize={handleResize} />
                        <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={null} requestSort={() => { }} width={widths.exciseTaxAmount} onResize={handleResize} />
                        <SortableHeader label="GRT Rate" field="grossReceiptsTaxRate" sortConfig={null} requestSort={() => { }} width={widths.grossReceiptsTaxRate} onResize={handleResize} />
                        <SortableHeader label="GRT Amount" field="grossReceiptsTaxAmount" sortConfig={null} requestSort={() => { }} width={widths.grossReceiptsTaxAmount} onResize={handleResize} />
                        <SortableHeader label="GST Rate" field="gstRate" sortConfig={null} requestSort={() => { }} width={widths.gstRate} onResize={handleResize} />
                        <SortableHeader label="GST Amount" field="gstAmount" sortConfig={null} requestSort={() => { }} width={widths.gstAmount} onResize={handleResize} />
                        <SortableHeader label="VAT Rate" field="vatRate" sortConfig={null} requestSort={() => { }} width={widths.vatRate} onResize={handleResize} />
                        <SortableHeader label="VAT Amount" field="vatAmount" sortConfig={null} requestSort={() => { }} width={widths.vatAmount} onResize={handleResize} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.salesTaxRate?.toFixed(3) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white min-w-[165px] truncate">${taxData.salesTaxAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.useTaxRate?.toFixed(3) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">${taxData.useTaxAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.localTaxRate?.toFixed(2) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white min-w-[163px] truncate">${taxData.localTaxAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.exciseTaxRate?.toFixed(3) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white min-w-[168px] truncate">${taxData.exciseTaxAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.grossReceiptsTaxRate?.toFixed(3) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">${taxData.grossReceiptsTaxAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.gstRate?.toFixed(3) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">${taxData.gstAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">{taxData.vatRate?.toFixed(3) || '0.000'}%</td>
                        <td className="px-4 py-3 text-sm  text-gray-900 dark:text-white truncate">${taxData.vatAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
