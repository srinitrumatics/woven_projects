import { formatCurrency } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

interface InvoiceTaxesProps {
    salesTaxRate?: number;
    salesTaxAmount?: number;
    useTaxRate?: number;
    useTaxAmount?: number;
    localTaxRate?: number;
    localTaxAmount?: number;
    exciseTaxRate?: number;
    exciseTaxAmount?: number;
    grtRate?: number;
    grtAmount?: number;
    gstRate?: number;
    gstAmount?: number;
    vatRate?: number;
    vatAmount?: number;
}

export default function InvoiceTaxes(props: InvoiceTaxesProps) {
    const taxData = [
        {
            id: '1',
            salesTaxRate: props.salesTaxRate || 0,
            salesTaxAmount: props.salesTaxAmount || 0,
            useTaxRate: props.useTaxRate || 0,
            useTaxAmount: props.useTaxAmount || 0,
            localTaxRate: props.localTaxRate || 0,
            localTaxAmount: props.localTaxAmount || 0,
            exciseTaxRate: props.exciseTaxRate || 0,
            exciseTaxAmount: props.exciseTaxAmount || 0,
            grtRate: props.grtRate || 0,
            grtAmount: props.grtAmount || 0,
            gstRate: props.gstRate || 0,
            gstAmount: props.gstAmount || 0,
            vatRate: props.vatRate || 0,
            vatAmount: props.vatAmount || 0,
        }
    ];

    const { items: sortedData, requestSort, sortConfig } = useSortableData(taxData);
    const hasNoTaxes =
        !props.salesTaxAmount && !props.useTaxAmount && !props.localTaxAmount &&
        !props.exciseTaxAmount && !props.grtAmount && !props.gstAmount && !props.vatAmount;

    if (hasNoTaxes) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg truncate" title="No record found">No record found</p>
                <p className="text-sm truncate" title="There are no taxes associated with this invoice.">There are no taxes associated with this invoice.</p>
            </div>
        );
    }

    const { widths, handleResize } = useResizableColumns({
        salesRate: 140,
        salesAmount: 170,
        useRate: 140,
        useAmount: 150,
        localRate: 140,
        localAmount: 180,
        exciseRate: 170,
        exciseAmount: 180,
        grtRate: 140,
        grtAmount: 150,
        gstRate: 140,
        gstAmount: 150,
        vatRate: 140,
        vatAmount: 150,
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader truncate={false} label="Sales Tax Rate" field="salesTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Sales Tax Amount" field="salesTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Use Tax Rate" field="useTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.useRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Use Tax Amount" field="useTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.useAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Local Tax Rate" field="localTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.localRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Local Tax Amount" field="localTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.localAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Excise Tax Rate" field="exciseTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="GRT Rate" field="grtRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="GRT Amount" field="grtAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.grtAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="GST Rate" field="gstRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="GST Amount" field="gstAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="VAT Rate" field="vatRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="VAT Amount" field="vatAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={handleResize} />
                        </tr>
                        <tr aria-hidden="true" className="h-0 border-none"></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedData.map((tax) => (
                            <tr key={tax.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.salesTaxRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.salesTaxAmount || 0)}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.useTaxRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.useTaxAmount || 0)}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.localTaxRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.localTaxAmount || 0)}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.exciseTaxRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.exciseTaxAmount || 0)}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.grtRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.grtAmount || 0)}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.gstRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.gstAmount || 0)}</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{(tax.vatRate || 0).toFixed(2)}%</td>
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium truncate">{formatCurrency(tax.vatAmount || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
