"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency, displayCell } from "@/lib/utils/formatting";
import Link from 'next/link';
import { useUserSession } from "@/components/UserSessionContext";

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
                            <SortableHeader truncate={false} label="Debit Memo Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30" />
                            <SortableHeader truncate={false} label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Debit Memo #" field="Debit_Memo__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.debitMemo} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Customer Quote Line" field="Customer_Quote_Line_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.quoteLine} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Proposed Product" field="Proposed_Product_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposedProduct} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Name" field="Product_Name__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.description} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.manufacturer} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Unit Cost" field="Unit_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Debit Qty" field="Debit_Qty__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.qty} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.total} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Shipping" field="Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Line Grand Total" field="Line_Grand_Total__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.grandTotal} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((line) => (
                            <tr key={line.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={line.Name}>
                                    {line.Name}
                                </td>
                                <td className="px-4 py-3 truncate"><StatusBadge status={line.Status__c} /></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Debit_Memo_Name || '-'}>
                                    {displayCell(line.Debit_Memo_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Customer_Quote_Line_Name || '-'}>
                                    {line.Customer_Quote_Line__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${line.Customer_Quote__c}/lines/${line.Customer_Quote_Line__c}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {line.Customer_Quote_Line_Name || 'View Quote Line'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{line.Customer_Quote_Line_Name || '-'}</span>
                                        )
                                    ) : displayCell(line.Customer_Quote_Line_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Proposed_Product_Name || '-'}>
                                    {line.Proposed_Product__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/products/${line.Proposed_Product__c}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {line.Proposed_Product_Name || 'View Product'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{line.Proposed_Product_Name || '-'}</span>
                                        )
                                    ) : displayCell(line.Proposed_Product_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Product_Name || '-'}>
                                    {line.Product_Name__c ? (
                                        <Link href={`/products/${line.Product_Name__c}`} className="text-primary hover:underline font-medium">
                                            {line.Product_Name}
                                        </Link>
                                    ) : displayCell(line.Product_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Product_Description__c || '-'}>{displayCell(line.Product_Description__c)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.brand || line.Brand_Name__c || '-'}>{displayCell(line.brand || line.Brand_Name__c)}</td>
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
