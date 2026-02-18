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
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg dark:border-gray-700">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm ">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr >
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Sales Tax Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Sales Tax Amount</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Use Tax Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Use Tax Amount</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Local Tax Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Local Tax Amount</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Excise Tax Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Excise Tax Amount</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">GRT Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">GRT Amount</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">GST Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">GST Amount</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">VAT Rate</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">VAT Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.salesTaxRate?.toFixed(3)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.salesTaxAmount)}</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.useTaxRate?.toFixed(3)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.useTaxAmount)}</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.localTaxRate?.toFixed(2)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.localTaxAmount)}</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.exciseTaxRate?.toFixed(3)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.exciseTaxAmount)}</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.grtRate?.toFixed(3)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.grtAmount)}</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.gstRate?.toFixed(3)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.gstAmount)}</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{product.vatRate?.toFixed(3)}%</td>
                            <td className="px-4 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(product.vatAmount)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
