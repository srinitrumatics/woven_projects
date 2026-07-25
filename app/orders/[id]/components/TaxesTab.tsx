import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';
import { SortableHeader } from '@/components/ui/SortableHeader';
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from '@/components/ui/DataTable';

interface TaxesTabProps {
    order: any;
    loading?: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function TaxesTab({ order, loading, widths, onResize }: TaxesTabProps) {
    if (loading) {
        return <TableLoadingState />;
    }

    if (!order) {
        return (
            <TableEmptyState message="No records found" description="There are no taxes associated with this order." />
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
                <Table className="table-fixed">
                    <THead className="sticky top-0 z-10">
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
                    </THead>
                    <TBody>
                        <Tr>
                            <Td className="font-medium text-left truncate" title={formatPercent(order.Sales_Tax_Rate__c)}>
                                {formatPercent(order.Sales_Tax_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_Sales_Tax_Amount__c)}>
                                {formatTax(order.Total_Sales_Tax_Amount__c)}
                            </Td>

                            <Td className="font-medium text-left truncate" title={formatPercent(order.Use_Tax_Rate__c)}>
                                {formatPercent(order.Use_Tax_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_Use_Tax_Amount__c)}>
                                {formatTax(order.Total_Use_Tax_Amount__c)}
                            </Td>

                            <Td className="font-medium text-left truncate" title={formatPercent(order.Local_Tax_Rate__c)}>
                                {formatPercent(order.Local_Tax_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_Local_Tax_Amount__c)}>
                                {formatTax(order.Total_Local_Tax_Amount__c)}
                            </Td>

                            <Td className="font-medium text-left truncate" title={formatPercent(order.Excise_Tax_Rate__c)}>
                                {formatPercent(order.Excise_Tax_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_Excise_Tax_Amount__c)}>
                                {formatTax(order.Total_Excise_Tax_Amount__c)}
                            </Td>

                            <Td className="font-medium text-left truncate" title={formatPercent(order.Gross_Receipts_Tax_Rate__c)}>
                                {formatPercent(order.Gross_Receipts_Tax_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_Gross_Receipts_Tax_Amount__c)}>
                                {formatTax(order.Total_Gross_Receipts_Tax_Amount__c)}
                            </Td>

                            <Td className="font-medium text-left truncate" title={formatPercent(order.GST_Rate__c)}>
                                {formatPercent(order.GST_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_GST_Amount__c)}>
                                {formatTax(order.Total_GST_Amount__c)}
                            </Td>

                            <Td className="font-medium text-left truncate" title={formatPercent(order.VAT_Rate__c)}>
                                {formatPercent(order.VAT_Rate__c)}
                            </Td>
                            <Td className="text-left truncate" title={formatTax(order.Total_VAT_Amount__c)}>
                                {formatTax(order.Total_VAT_Amount__c)}
                            </Td>
                        </Tr>
                    </TBody>
                </Table>
            </div>
        </div>
    );
}
