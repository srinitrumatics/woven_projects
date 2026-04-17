import { formatCurrency } from"@/lib/utils/formatting";
import { SortableHeader } from"@/components/ui/SortableHeader";
import { useSortableData } from"@/hooks/useSortableData";
import { useResizableColumns } from"@/hooks/useResizableColumns";

interface QuoteLineTaxesTabProps {
    product: {
        isTaxable: string;
        salesTaxRate: number;
        salesTaxAmount: number;
        useTaxRate: number;
        useTaxAmount: number;
        localTaxRate: number;
        localTaxAmount: number;
        exciseTaxRate: number;
        exciseTaxAmount: number;
        grtRate: number;
        grtAmount: number;
        gstRate: number;
        gstAmount: number;
        vatRate: number;
        vatAmount: number;
    };
}

interface TaxData {
    id: string;
    salesTaxRate: number;
    salesTaxAmount: number;
    useTaxRate: number;
    useTaxAmount: number;
    localTaxRate: number;
    localTaxAmount: number;
    exciseTaxRate: number;
    exciseTaxAmount: number;
    grtRate: number;
    grtAmount: number;
    gstRate: number;
    gstAmount: number;
    vatRate: number;
    vatAmount: number;
}

export default function QuoteLineTaxesTab({ product }: QuoteLineTaxesTabProps) {
    const taxData: TaxData[] = [
        {
            id: '1',
            salesTaxRate: product.salesTaxRate || 0,
            salesTaxAmount: product.salesTaxAmount || 0,
            useTaxRate: product.useTaxRate || 0,
            useTaxAmount: product.useTaxAmount || 0,
            localTaxRate: product.localTaxRate || 0,
            localTaxAmount: product.localTaxAmount || 0,
            exciseTaxRate: product.exciseTaxRate || 0,
            exciseTaxAmount: product.exciseTaxAmount || 0,
            grtRate: product.grtRate || 0,
            grtAmount: product.grtAmount || 0,
            gstRate: product.gstRate || 0,
            gstAmount: product.gstAmount || 0,
            vatRate: product.vatRate || 0,
            vatAmount: product.vatAmount || 0,
        }
    ];

    const { items: sortedData, requestSort, sortConfig } = useSortableData<TaxData>(taxData);

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
        <div className="bg-white dark:bg-gray-800 rounded-lg dark:border-gray-700">
            <div className="overflow-auto pt-0">
                {product.isTaxable ==="No"? (
                    <div className="py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        <p className="text-lg font-medium tracking-tight"title="No records found">No records found</p>
                        <p className="text-sm"title="There are no taxes associated with this quote line.">There are no taxes associated with this quote line.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader label="Sales Tax Rate"field="salesTaxRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.salesRate} onResize={handleResize} />
                                <SortableHeader label="Sales Tax Amount"field="salesTaxAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.salesAmount} onResize={handleResize} />
                                <SortableHeader label="Use Tax Rate"field="useTaxRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.useRate} onResize={handleResize} />
                                <SortableHeader label="Use Tax Amount"field="useTaxAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.useAmount} onResize={handleResize} />
                                <SortableHeader label="Local Tax Rate"field="localTaxRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.localRate} onResize={handleResize} />
                                <SortableHeader label="Local Tax Amount"field="localTaxAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.localAmount} onResize={handleResize} />
                                <SortableHeader label="Excise Tax Rate"field="exciseTaxRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseRate} onResize={handleResize} />
                                <SortableHeader label="Excise Tax Amount"field="exciseTaxAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseAmount} onResize={handleResize} />
                                <SortableHeader label="GRT Rate"field="grtRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.grtRate} onResize={handleResize} />
                                <SortableHeader label="GRT Amount"field="grtAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.grtAmount} onResize={handleResize} />
                                <SortableHeader label="GST Rate"field="gstRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={handleResize} />
                                <SortableHeader label="GST Amount"field="gstAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={handleResize} />
                                <SortableHeader label="VAT Rate"field="vatRate"sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={handleResize} />
                                <SortableHeader label="VAT Amount"field="vatAmount"sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={handleResize} />
                            </tr>
                            <tr aria-hidden="true"className="h-0 border-none"></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedData.map((tax: TaxData) => (
                                <tr key={tax.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.salesTaxRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.salesTaxAmount || 0)}</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.useTaxRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.useTaxAmount || 0)}</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.localTaxRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.localTaxAmount || 0)}</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.exciseTaxRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.exciseTaxAmount || 0)}</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.grtRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.grtAmount || 0)}</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.gstRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.gstAmount || 0)}</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{(tax.vatRate || 0).toFixed(3)}%</td>
                                    <td className="px-3 py-4 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(tax.vatAmount || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
