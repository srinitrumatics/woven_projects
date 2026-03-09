import { formatCurrency } from "@/lib/utils/formatting";

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

export default function QuoteLineTaxesTab({ product }: QuoteLineTaxesTabProps) {
    const hasTaxes = product.salesTaxRate > 0 ||
        product.salesTaxAmount > 0 ||
        product.useTaxRate > 0 ||
        product.useTaxAmount > 0 ||
        product.localTaxRate > 0 ||
        product.localTaxAmount > 0 ||
        product.exciseTaxRate > 0 ||
        product.exciseTaxAmount > 0 ||
        product.grtRate > 0 ||
        product.grtAmount > 0 ||
        product.gstRate > 0 ||
        product.gstAmount > 0 ||
        product.vatRate > 0 ||
        product.vatAmount > 0;

    if (!hasTaxes) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">There are no taxes associated with this quote line.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg dark:border-gray-700">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm ">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr >
                            <th className="px-3  py-2 font-semibold truncate">Sales Tax Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">Sales Tax Amount</th>
                            <th className="px-3  py-2 font-semibold truncate">Use Tax Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">Use Tax Amount</th>
                            <th className="px-3  py-2 font-semibold truncate">Local Tax Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">Local Tax Amount</th>
                            <th className="px-3  py-2 font-semibold truncate">Excise Tax Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">Excise Tax Amount</th>
                            <th className="px-3  py-2 font-semibold truncate">GRT Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">GRT Amount</th>
                            <th className="px-3  py-2 font-semibold truncate">GST Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">GST Amount</th>
                            <th className="px-3  py-2 font-semibold truncate">VAT Rate</th>
                            <th className="px-3  py-2 font-semibold truncate">VAT Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.salesTaxRate?.toFixed(3)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.salesTaxAmount)}</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.useTaxRate?.toFixed(3)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.useTaxAmount)}</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.localTaxRate?.toFixed(2)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.localTaxAmount)}</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.exciseTaxRate?.toFixed(3)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.exciseTaxAmount)}</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.grtRate?.toFixed(3)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.grtAmount)}</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.gstRate?.toFixed(3)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.gstAmount)}</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{product.vatRate?.toFixed(3)}%</td>
                            <td className="px-3  py-2 text-gray-900 dark:text-gray-100 truncate">{formatCurrency(product.vatAmount)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
