import { useState, useMemo } from "react";
import { TaxDetail } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "../../../../components/ui/Pagination";
import { Table, THead, TBody, Tr, Td, TableLoadingState } from "@/components/ui/DataTable";

const ITEMS_PER_PAGE = 10;

interface TaxesTabProps {
    taxes: TaxDetail[];
    loading: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function TaxesTab({ taxes, loading, widths, onResize }: TaxesTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const displayTaxes = taxes && taxes.length > 0 ? taxes : [{
        id: 'default-tax',
        salesTaxRate: 0,
        salesTaxAmount: 0,
        useTaxRate: 0,
        useTaxAmount: 0,
        localTaxRate: 0,
        localTaxAmount: 0,
        exciseTaxRate: 0,
        exciseTaxAmount: 0,
        grossReceiptsTaxRate: 0,
        grossReceiptsTaxAmount: 0,
        gstRate: 0,
        gstAmount: 0,
        vatRate: 0,
        vatAmount: 0
    } as TaxDetail];

    const { items: sortedData, requestSort: originalRequestSort, sortConfig } = useSortableData<TaxDetail>(displayTaxes, { key: 'id', direction: 'desc' });

    const requestSort = (key: string) => {
        originalRequestSort(key as keyof TaxDetail);
        setCurrentPage(1);
    }

    const paginatedTaxes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(displayTaxes.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }



    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Sales Tax Rate" field="salesTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Sales Tax Amount" field="salesTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesTaxAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Use Tax Rate" field="useTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Use Tax Amount" field="useTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.useTaxAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Local Tax Rate" field="localTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Local Tax Amount" field="localTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.localTaxAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Excise Tax Rate" field="exciseTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="Excise Tax Amount" field="exciseTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.exciseTaxAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="GRT Rate" field="grossReceiptsTaxRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.grossReceiptsTaxRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="GRT Amount" field="grossReceiptsTaxAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.grossReceiptsTaxAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="GST Rate" field="gstRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="GST Amount" field="gstAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.gstAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="VAT Rate" field="vatRate" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatRate} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                            <SortableHeader label="VAT Amount" field="vatAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.vatAmount} onResize={onResize} align="left" className="border-b border-gray-100 dark:border-gray-700" />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedTaxes.map((tax) => (
                            <Tr key={tax.id} className="transition-colors">
                                <Td className="text-left truncate">
                                    {tax.salesTaxRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.salesTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate">
                                    {tax.useTaxRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.useTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate">
                                    {tax.localTaxRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.localTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate">
                                    {tax.exciseTaxRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.exciseTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate">
                                    {tax.grossReceiptsTaxRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.grossReceiptsTaxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate">
                                    {tax.gstRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.gstAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="text-left truncate">
                                    {tax.vatRate?.toFixed(3)}%
                                </Td>
                                <Td className="text-left truncate">
                                    ${tax.vatAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>

        </div>
    );
}
