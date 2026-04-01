"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils/formatting";

import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from 'next/link';

interface DebitMemo {
    Id: string;
    Name: string;
    Status__c: string;
    Supplier_Bill_Name?: string;
    Supplier_Bill__c?: string;
    Purchase_Order_Name?: string;
    Purchase_Order__c?: string;
    Customer_Quote_Name?: string;
    Customer_Quote__c?: string;
    Customer_Order_Name?: string;
    Customer_Order__c?: string;
    Supplier_Credit_Memo__c?: string;
    Debit_to_Account_Name?: string;
    Debit_to_Contact_Name?: string;
    Total_Lines__c?: number;
    Total_Cost__c?: number;
    Total_Shipping_Charges__c?: number;
    Total_Debit_Amount__c?: number;
    Issued_Date__c?: string;
    Approval_Date__c?: string;
    Available_Debit_Balance__c?: number;
    Settled_Date__c?: string;
}

interface PODebitMemoTableProps {
    debitMemos: DebitMemo[];
}

const ITEMS_PER_PAGE = 10;

export default function PODebitMemoTable({ debitMemos }: PODebitMemoTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Map data for sorting
    const mappedData = useMemo(() => debitMemos.map(d => ({
        ...d,
        name: d.Name,
        status: d.Status__c,
    })), [debitMemos]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedData);

    const initialWidths = {
        name: 180,
        status: 120,
        supplierBill: 150,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        supplierCreditMemo: 200,
        debitToAccount: 180,
        debitToContact: 180,
        totalLines: 140,
        totalCost: 120,
        shipping: 100,
        totalDebitAmount: 190,
        issuedDate: 150,
        approvalDate: 150,
        availableDebitBalance: 220,
        settledDate: 150
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(debitMemos.length / ITEMS_PER_PAGE);

    if (debitMemos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Debit Memos associated with this purchase order.">There are no Debit Memos associated with this purchase order.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Debit Memo" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Supplier Bill" field="Supplier_Bill_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierBill} onResize={handleResize} />
                            <SortableHeader label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader label="Customer Quote" field="Customer_Quote_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Supplier Credit Memo" field="Supplier_Credit_Memo__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierCreditMemo} onResize={handleResize} />
                            <SortableHeader label="Debit to Account" field="Debit_to_Account_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.debitToAccount} onResize={handleResize} />
                            <SortableHeader label="Debit to Contact" field="Debit_to_Contact_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.debitToContact} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Total Debit Amount" field="Total_Debit_Amount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalDebitAmount} onResize={handleResize} />
                            <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.issuedDate} onResize={handleResize} />
                            <SortableHeader label="Approval Date" field="Approval_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.approvalDate} onResize={handleResize} />
                            <SortableHeader label="Available Debit Balance" field="Available_Debit_Balance__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.availableDebitBalance} onResize={handleResize} />
                            <SortableHeader label="Settled Date" field="Settled_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.settledDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((d) => (
                            <tr key={d.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={d.Name}>
                                    {d.Name}
                                </td>
                                <td className="px-3 py-2 truncate">
                                    <StatusBadge status={d.Status__c} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Supplier_Bill_Name || '-'}>
                                    {d.Supplier_Bill__c ? (
                                        <Link href={`/supplier-bills/${d.Supplier_Bill__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {d.Supplier_Bill_Name || 'View Bill'}
                                        </Link>
                                    ) : d.Supplier_Bill_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Purchase_Order_Name || '-'}>
                                    {d.Purchase_Order__c ? (
                                        <Link href={`/purchase-orders/${d.Purchase_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {d.Purchase_Order_Name || 'View PO'}
                                        </Link>
                                    ) : d.Purchase_Order_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Customer_Quote_Name || '-'}>
                                    {d.Customer_Quote__c ? (
                                        <Link href={`/quotes/${d.Customer_Quote__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {d.Customer_Quote_Name || 'View Quote'}
                                        </Link>
                                    ) : d.Customer_Quote_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Customer_Order_Name || '-'}>
                                    {d.Customer_Order__c ? (
                                        <Link href={`/orders/${d.Customer_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {d.Customer_Order_Name || 'View Order'}
                                        </Link>
                                    ) : d.Customer_Order_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Supplier_Credit_Memo__c || '-'}>
                                    {d.Supplier_Credit_Memo__c || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Debit_to_Account_Name || '-'}>
                                    {d.Debit_to_Account_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={d.Debit_to_Contact_Name || '-'}>
                                    {d.Debit_to_Contact_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={String(d.Total_Lines__c || 0)}>
                                    <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium truncate" >
                                        {d.Total_Lines__c || 0}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={`$${(d.Total_Cost__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${(d.Total_Cost__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={`$${(d.Total_Shipping_Charges__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${(d.Total_Shipping_Charges__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left font-semibold truncate" title={`$${(d.Total_Debit_Amount__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${(d.Total_Debit_Amount__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={d.Issued_Date__c ? formatDate(d.Issued_Date__c, 'numeric-dash') : '-'}>
                                    {d.Issued_Date__c ? formatDate(d.Issued_Date__c, 'numeric-dash') : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={d.Approval_Date__c ? formatDate(d.Approval_Date__c, 'numeric-dash') : '-'}>
                                    {d.Approval_Date__c ? formatDate(d.Approval_Date__c, 'numeric-dash') : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left font-medium truncate" title={`$${(d.Available_Debit_Balance__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${(d.Available_Debit_Balance__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={d.Settled_Date__c ? formatDate(d.Settled_Date__c, 'numeric-dash') : '-'}>
                                    {d.Settled_Date__c ? formatDate(d.Settled_Date__c, 'numeric-dash') : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={debitMemos.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
