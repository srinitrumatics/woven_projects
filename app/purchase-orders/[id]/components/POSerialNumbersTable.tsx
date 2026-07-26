"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, displayCell } from "@/lib/utils/formatting";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";

interface SerialNumberLog {
    Id: string;
    Name: string;
    Serial_Number_Name?: string;
    Product_Serial_Number__c?: string;
    Product_Name?: string;
    Product_Name__c?: string;
    Product__c?: string;
    Product_Description__c?: string;
    Brand_Name__c?: string;
    gtherp__Brand_Name__c?: string;
    Product_Brand_Name__c?: string;
    Purchase_Order_Name?: string;
    Purchase_Order__c?: string;
    RMA_Name?: string;
    Received_Date__c?: string;
    Active__c?: boolean;
}

interface POSerialNumbersTableProps {
    serialNumbers: SerialNumberLog[];
}

const ITEMS_PER_PAGE = 10;

export default function POSerialNumbersTable({ serialNumbers }: POSerialNumbersTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Map data for sorting
    const mappedData = useMemo(() => serialNumbers.map(s => ({
        ...s,
        name: s.Name,
        serialNumber: s.Serial_Number_Name,
        productSerialNumber: s.Product_Serial_Number__c,
        productName: s.Product_Name,
        productId: s.Product_Name__c || s.Product__c || '',
        brand: s.Product_Brand_Name__c || '',
    })), [serialNumbers]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedData, { key: 'name', direction: 'asc' });

    const initialWidths = {
        name: 180,
        serialNumber: 150,
        productSerialNumber: 190,
        productName: 150,
        productDescription: 200,
        brand: 170,
        purchaseOrder: 150,
        rma: 150,
        receivedDate: 150,
        active: 100
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(serialNumbers.length / ITEMS_PER_PAGE);

    if (serialNumbers.length === 0) {
        return (
            <TableEmptyState
                message="No records found"
                description="There are no Serial Number Logs associated with this purchase order."
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Serial Number Log" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Serial Number #" field="serialNumber" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.serialNumber} onResize={handleResize} />
                            <SortableHeader label="Product Serial Number" field="productSerialNumber" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productSerialNumber} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productDescription} onResize={handleResize} />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.brand} onResize={handleResize} />
                            <SortableHeader label="Purchase Order #" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader label="RMA #" field="RMA_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rma} onResize={handleResize} />
                            <SortableHeader label="Received Date" field="Received_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.receivedDate} onResize={handleResize} />
                            <SortableHeader label="Active" field="Active__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.active} onResize={handleResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((s) => (
                            <Tr key={s.Id} className="transition-colors group">
                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={s.Name}>
                                    {s.Name}
                                </Td>
                                <Td className="truncate" title={s.Serial_Number_Name || '-'}>
                                    {displayCell(s.Serial_Number_Name)}
                                </Td>
                                <Td className="text-left truncate" title={s.Product_Serial_Number__c || '-'}>
                                    {displayCell(s.Product_Serial_Number__c)}
                                </Td>
                                <Td className="truncate" title={s.Product_Name || '-'}>
                                    {(s.Product_Name__c || s.Product__c) ? (
                                        <Link href={`/products/${s.Product_Name__c || s.Product__c}`} className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {s.Product_Name}
                                        </Link>
                                    ) : (
                                        displayCell(s.Product_Name)
                                    )}
                                </Td>
                                <Td className="truncate" title={s.Product_Description__c || '-'}>
                                    {displayCell(s.Product_Description__c)}
                                </Td>
                                <Td className="truncate" title={s.brand || '-'}>
                                    {displayCell(s.brand)}
                                </Td>
                                <Td className="truncate" title={s.Purchase_Order_Name || '-'}>
                                    {s.Purchase_Order__c ? (
                                        <Link href={`/purchase-orders/${s.Purchase_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {s.Purchase_Order_Name || 'View PO'}
                                        </Link>
                                    ) : (
                                        displayCell(s.Purchase_Order_Name)
                                    )}
                                </Td>
                                <Td className="truncate" title={s.RMA_Name || '-'}>
                                    {displayCell(s.RMA_Name)}
                                </Td>
                                <Td className="dark:text-gray-700 truncate" title={s.Received_Date__c ? formatDate(s.Received_Date__c, 'numeric-dash') : '-'}>
                                    {s.Received_Date__c ? formatDate(s.Received_Date__c, 'numeric-dash') : '-'}
                                </Td>
                                <Td className="text-left truncate">
                                    <StatusBadge status={s.Active__c ? 'Yes' : 'No'} />
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={serialNumbers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Serial Number Logs"
                />
            </div>
        </div>
    );
}
