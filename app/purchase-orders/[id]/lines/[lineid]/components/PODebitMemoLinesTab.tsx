"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency, displayCell } from "@/lib/utils/formatting";
import Link from 'next/link';
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface DebitMemoLine {
    Id: string;
    Name: string;
    Status__c: string;
    Debit_Memo__c: string;
    Debit_Memo_Name: string;
    Customer_Order_Line__c: string;
    Customer_Quote_Line__c?: string;
    Customer_Quote_Line_Name: string;
    Proposed_Product_Name?: string;
    Proposed_Product__c?: string;
    Proposal__c?: string;
    Purchase_Order__c?: string;
    Customer_Quote__c?: string;
    Supplier_Bill__c?: string;
    Customer_Order__c?: string;
    Product_Name__c: string;
    Product_Name: string;
    Product_Description__c: string;
    Manufacturer_DBA__c: string;
    brand?: string;
    Brand_Name__c?: string;
    Product_Brand_Name__c?: string;
    Unit_Cost__c: number;
    Debit_Qty__c: number;
    Total_Cost__c: number;
    Shipping_Charges__c: number;
    Line_Grand_Total__c: number;
}

interface PODebitMemoLinesTabProps {
    lines: DebitMemoLine[];
}

const ITEMS_PER_PAGE = 10;

export default function PODebitMemoLinesTab({ lines }: PODebitMemoLinesTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const { items: sortedData, requestSort, sortConfig } = useSortableData(lines, { key: 'Name', direction: 'asc' });

    const initialWidths = {
        name: 180,
        status: 120,
        debitMemo: 150,
        quoteLine: 180,
        proposedProduct: 180,
        productName: 180,
        description: 250,
        manufacturer: 180,
        unitCost: 120,
        qty: 120,
        total: 140,
        shipping: 120,
        grandTotal: 160
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(lines.length / ITEMS_PER_PAGE);

    if (lines.length === 0) {
        return (
            <TableEmptyState message="No Debit Memo lines found" description="There are no debit memo lines associated with this record." />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-4">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Debit Memo Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Debit Memo #" field="Debit_Memo__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.debitMemo} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="Customer_Quote_Line_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.quoteLine} onResize={handleResize} />
                            <SortableHeader label="Proposed Product" field="Proposed_Product_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposedProduct} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="Product_Name__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.description} onResize={handleResize} />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.manufacturer} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="Unit_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader label="Debit Qty" field="Debit_Qty__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.qty} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.total} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Line Grand Total" field="Line_Grand_Total__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.grandTotal} onResize={handleResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((line) => (
                            <Tr key={line.Id} className="transition-colors group">
                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={line.Name}>
                                    {line.Name}
                                </Td>
                                <Td className="truncate"><StatusBadge status={line.Status__c || '-'} variant="bordered" /></Td>
                                <Td className="truncate" title={line.Debit_Memo_Name || '-'}>
                                    {displayCell(line.Debit_Memo_Name)}
                                </Td>
                                <Td className="truncate" title={line.Customer_Quote_Line_Name || '-'}>
                                    {line.Customer_Quote_Line__c && line.Customer_Quote__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${line.Customer_Quote__c}/lines/${line.Customer_Quote_Line__c}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {line.Customer_Quote_Line_Name || 'View Quote Line'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{line.Customer_Quote_Line_Name || '-'}</span>
                                        )
                                    ) : displayCell(line.Customer_Quote_Line_Name)}
                                </Td>
                                <Td className="truncate" title={line.Proposed_Product_Name || '-'}>
                                    {line.Proposed_Product__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/proposals/${line.Proposal__c}/lines/${line.Proposed_Product__c}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {line.Proposed_Product_Name || 'View Product'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{line.Proposed_Product_Name || '-'}</span>
                                        )
                                    ) : displayCell(line.Proposed_Product_Name)}
                                </Td>
                                <Td className="truncate" title={line.Product_Name || '-'}>
                                    {line.Product_Name__c ? (
                                        <Link href={`/products/${line.Product_Name__c}`} target="_blank" className="text-primary hover:underline font-medium">
                                            {line.Product_Name}
                                        </Link>
                                    ) : displayCell(line.Product_Name)}
                                </Td>
                                <Td className="truncate" title={line.Product_Description__c || '-'}>{displayCell(line.Product_Description__c)}</Td>
                                <Td className="truncate" title={line.brand || line.Product_Brand_Name__c || '-'}>{displayCell(line.brand || line.Product_Brand_Name__c)}</Td>
                                <Td className="text-left truncate" title={formatCurrency(line.Unit_Cost__c || 0)}>{formatCurrency(line.Unit_Cost__c || 0)}</Td>
                                <Td className="text-left truncate" title={String(line.Debit_Qty__c || 0)}>{line.Debit_Qty__c || 0}</Td>
                                <Td className="font-semibold text-left truncate" title={formatCurrency(line.Total_Cost__c || 0)}>{formatCurrency(line.Total_Cost__c || 0)}</Td>
                                <Td className="text-left truncate" title={formatCurrency(line.Shipping_Charges__c || 0)}>{formatCurrency(line.Shipping_Charges__c || 0)}</Td>
                                <Td className="font-bold text-left truncate" title={formatCurrency(line.Line_Grand_Total__c || 0)}>{formatCurrency(line.Line_Grand_Total__c || 0)}</Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={lines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
