"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

interface DebitMemoLine {
    Id: string;
    Name: string;
    Status__c: string;
    Debit_Memo__c: string;
    Debit_Memo_Name: string;
    Supplier_Bill_Line__c: string;
    Supplier_Bill_Line_Name: string;
    Customer_Order_Line__c: string;
    Customer_Quote_Line_Name: string;
    Purchase_Order_Line__c: string;
    Purchase_Order_Line_Name: string;
    Product_Name__c: string;
    Product_Name: string;
    Product_Description__c: string;
    Manufacturer_DBA__c: string;
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
    const { items: sortedData, requestSort, sortConfig } = useSortableData(lines);

    const initialWidths = {
        name: 180,
        status: 120,
        debitMemo: 150,
        billLine: 180,
        quoteLine: 180,
        poLine: 180,
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

    const StatusBadge = ({ status }: { status: string }) => {
        const getStyles = () => {
            switch (status) {
                case "Approved":
                case "Paid":
                case "Awarded":
                case "Completed":
                    return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
                case "Pending":
                    return "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
                case "Draft":
                    return "bg-blue-100/80 text-blue-600 border-blue-200 dark:bg-blue-700 dark:text-blue-300 dark:border-blue-600/50";
                case "Cancelled":
                case "Closed":
                    return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
                default:
                    return "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800/50";
            }
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`} title={status || '-'}>
                {status || '-'}
            </span>
        );
    };

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 min-w-0">
                <p className="text-sm font-medium truncate" title="No Debit Memo lines found">No Debit Memo lines found</p>
                <p className="text-xs mt-1 truncate" title="There are no debit memo lines associated with this record.">There are no debit memo lines associated with this record.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-4">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Debit Memo Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Debit Memo" field="Debit_Memo__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.debitMemo} onResize={handleResize} />
                            <SortableHeader label="Supplier Bill Line" field="Supplier_Bill_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billLine} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="Customer_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.quoteLine} onResize={handleResize} />
                            <SortableHeader label="Purchase Order Line" field="Purchase_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.poLine} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="Product_Name__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.description} onResize={handleResize} />
                            <SortableHeader label="Manufacturer DBA" field="Manufacturer_DBA__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.manufacturer} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="Unit_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader label="Debit Qty" field="Debit_Qty__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.qty} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.total} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Line Grand Total" field="Line_Grand_Total__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.grandTotal} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((line) => (
                            <tr key={line.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={line.Name}>
                                    {line.Name}
                                </td>
                                <td className="px-4 py-3 truncate"><StatusBadge status={line.Status__c} /></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Debit_Memo_Name || ' '}>
                                    {line.Debit_Memo_Name || ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Supplier_Bill_Line_Name || ' '}>{line.Supplier_Bill_Line_Name || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Customer_Quote_Line_Name || ' '}>{line.Customer_Quote_Line_Name || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Purchase_Order_Line_Name || ' '}>{line.Purchase_Order_Line_Name || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Product_Name || ' '}>{line.Product_Name || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Product_Description__c || ' '}>{line.Product_Description__c || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Manufacturer_DBA__c || ' '}>{line.Manufacturer_DBA__c || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(line.Unit_Cost__c || 0)}>{formatCurrency(line.Unit_Cost__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={String(line.Debit_Qty__c || 0)}>{line.Debit_Qty__c || 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold text-left truncate" title={formatCurrency(line.Total_Cost__c || 0)}>{formatCurrency(line.Total_Cost__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(line.Shipping_Charges__c || 0)}>{formatCurrency(line.Shipping_Charges__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold text-left truncate" title={formatCurrency(line.Line_Grand_Total__c || 0)}>{formatCurrency(line.Line_Grand_Total__c || 0)}</td>
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
                    totalItems={lines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
