"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils/formatting";

interface SerialNumberLog {
    Id: string;
    Name: string;
    Serial_Number_Name?: string;
    Product_Serial_Number__c?: string;
    Product_Name?: string;
    Product_Description__c?: string;
    Purchase_Order_Name?: string;
    Purchase_Order_Line_Name?: string;
    RMA_Name?: string;
    RMA_Line_Name?: string;
    Received_Date__c?: string;
    Active__c?: boolean;
}

interface POSerialNumberLogLinesTabProps {
    serialNumbers: SerialNumberLog[];
}

const ITEMS_PER_PAGE = 10;

export default function POSerialNumberLogLinesTab({ serialNumbers }: POSerialNumberLogLinesTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(serialNumbers);

    const initialWidths = {
        name: 180,
        serialNumber: 150,
        productSerialNumber: 190,
        productName: 150,
        productDescription: 200,
        purchaseOrder: 150,
        purchaseOrderLines: 200,
        rma: 150,
        rmaLine: 150,
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
            <div className="flex flex-col items-center justify-center py-12 text-gray-900 dark:text-gray-700 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Serial Number Logs associated with this record.">There are no Serial Number Logs associated with this record.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader truncate={false} label="Serial Number Log" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30"/>
                            <SortableHeader truncate={false} label="Serial Number" field="Serial_Number__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.serialNumber} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Serial Number" field="Product_Serial_Number__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productSerialNumber} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Name" field="Product_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productDescription} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Purchase Order" field="Purchase_Order__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Purchase Order Lines" field="Purchase_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrderLines} onResize={handleResize} />
                            <SortableHeader truncate={false} label="RMA" field="RMA__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rma} onResize={handleResize} />
                            <SortableHeader truncate={false} label="RMA Line" field="RMA_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rmaLine} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Received Date" field="Received_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.receivedDate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Active" field="Active__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.active} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((s) => (
                            <tr key={s.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={s.Name}>
                                    {s.Name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.Serial_Number_Name || ' '}>
                                    {s.Serial_Number_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.Product_Serial_Number__c || ' '}>
                                    {s.Product_Serial_Number__c || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium truncate" title={s.Product_Name || ' '}>
                                    {s.Product_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.Product_Description__c || ' '}>
                                    {s.Product_Description__c || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.Purchase_Order_Name || ' '}>
                                    {s.Purchase_Order_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.Purchase_Order_Line_Name || ' '}>
                                    {s.Purchase_Order_Line_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.RMA_Name || ' '}>
                                    {s.RMA_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.RMA_Line_Name || ' '}>
                                    {s.RMA_Line_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={s.Received_Date__c ? formatDate(s.Received_Date__c, 'numeric-dash') : ' '}>
                                    {s.Received_Date__c ? formatDate(s.Received_Date__c, 'numeric-dash') : ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={s.Active__c ? 'Yes' : 'No'}>
                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full truncate ${s.Active__c ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`} title={s.Active__c ? 'Yes' : 'No'}>
                                        {s.Active__c ? 'Yes' : 'No'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={serialNumbers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
