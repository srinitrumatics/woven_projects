"use client";

import React, { useState, useMemo } from 'react';
import { formatCurrency, displayCell } from "@/lib/utils/formatting";
import Link from 'next/link';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";

interface DebitMemoLine {
    Id: string;
    Name: string;
    Status__c: string;
    Debit_Memo__c?: string;
    Debit_Memo_Name?: string;
    Supplier_Bill_Line__c?: string;
    Supplier_Bill_Line_Name?: string;
    Customer_Quote__c?: string;
    Customer_Quote_Line__c?: string;
    Customer_Quote_Line_Name?: string;
    Purchase_Order__c?: string;
    Purchase_Order_Line__c?: string;
    Purchase_Order_Line_Name?: string;
    Product_Name?: string;
    Product_Description__c?: string;
    Manufacturer_DBA__c?: string;
    brand?: string;
    Unit_Cost__c?: number;
    UnitCost__c?: number;
    Debit_Qty__c?: number;
    DebitQty__c?: number;
    Total_Cost__c?: number;
    TotalCost__c?: number;
    Shipping_Charges__c?: number;
    Shipping__c?: number;
    Line_Grand_Total__c?: number;
    Grand_Total__c?: number;
    Line_Total__c?: number;
    Total_Amount__c?: number;
}

const ITEMS_PER_PAGE = 10;

export default function SBLDebitMemoLinesTab({ debitMemos, id }: { debitMemos: DebitMemoLine[], id?: string }) {
    const [currentPage, setCurrentPage] = useState(1);
    const { items: sortedData, requestSort, sortConfig } = useSortableData<DebitMemoLine>(debitMemos);
    const initialWidths = {
        Name: 180,
        Status__c: 120,
        Debit_Memo_Name: 160,
        Supplier_Bill_Line_Name: 180,
        Customer_Quote_Line_Name: 200,
        Purchase_Order_Line_Name: 200,
        Product_Name: 200,
        Product_Description__c: 250,
        Manufacturer_DBA__c: 180,
        brand: 180,
        Unit_Cost__c: 120,
        Debit_Qty__c: 120,
        Total_Cost__c: 120,
        Shipping_Charges__c: 120,
        Line_Grand_Total__c: 150
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(debitMemos.length / ITEMS_PER_PAGE);

    if (!debitMemos || debitMemos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate">No Debit Memo Lines</p>
                <p className="text-sm truncate">There are no debit memo lines associated with this record.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-0">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Debit Memo Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Status__c} onResize={handleResize} />
                            <SortableHeader label="Debit Memo" field="Debit_Memo_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Debit_Memo_Name} onResize={handleResize} />
                            <SortableHeader label="Supplier Bill Line" field="Supplier_Bill_Line_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Supplier_Bill_Line_Name} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="Customer_Quote_Line_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Customer_Quote_Line_Name} onResize={handleResize} />
                            <SortableHeader label="Purchase Order Line" field="Purchase_Order_Line_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Purchase_Order_Line_Name} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="Product_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Product_Name} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Product_Description__c} onResize={handleResize} />
                            <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.brand} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="Unit_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Unit_Cost__c} onResize={handleResize} />
                            <SortableHeader label="Debit Qty" field="Debit_Qty__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Debit_Qty__c} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Total_Cost__c} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Shipping_Charges__c} onResize={handleResize} />
                            <SortableHeader label="Line Grand Total" field="Line_Grand_Total__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.Line_Grand_Total__c} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((line) => (

                            <tr key={line.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate">{displayCell(line.Name)}</td>
                                <td className="px-3 py-2 text-sm truncate">
                                    <StatusBadge status={line.Status__c || "-"} />

                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate">
                                    {displayCell(line.Debit_Memo_Name)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate">
                                    {displayCell(line.Supplier_Bill_Line_Name)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate">
                                    {displayCell(line.Customer_Quote_Line_Name)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate">
                                    {displayCell(line.Purchase_Order_Line_Name)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate">{displayCell(line.Product_Name)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate" title={line.Product_Description__c}>{displayCell(line.Product_Description__c)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white truncate">{displayCell(line.brand)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white font-medium truncate">{formatCurrency(line.Unit_Cost__c || line.UnitCost__c || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white font-medium truncate">{line.Debit_Qty__c ?? line.DebitQty__c ?? 0}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white font-medium truncate">{formatCurrency(line.Total_Cost__c || line.TotalCost__c || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white font-medium truncate">{formatCurrency(line.Shipping_Charges__c || line.Shipping__c || 0)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700 dark:text-white font-bold truncate">{formatCurrency(line.Line_Grand_Total__c || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {debitMemos.length > ITEMS_PER_PAGE && (
                <div className="mt-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={debitMemos.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemName="Debit Memo Lines"
                    />
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Paid":
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`}>
            {status}
        </span>
    );
}