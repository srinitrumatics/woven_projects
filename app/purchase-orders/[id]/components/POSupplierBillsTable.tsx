"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

import { StatusBadge, RemittanceBadge } from "@/components/ui/StatusBadge";

interface SupplierBill {
    Id: string;
    Name: string;
    Status__c: string;
    Purchase_Order_Name?: string;
    Customer_Quote_Name?: string;
    Customer_Order_Name?: string;
    Supplier_Name?: string;
    Supplier_DBA__c?: string;
    Supplier_Contact_Name?: string;
    Total_Lines__c?: number;
    Total_Product_Amount__c?: number;
    Total_Shipping_Charges__c?: number;
    TotalAmount__c?: number;
    Billed_Date__c?: string;
    Payment_Terms__c?: string;
    Due_Date__c?: string;
    Remittance_Status__c?: string;
    Open_Balance__c?: number;
    Days_Outstanding__c?: number;
    Settled_Date__c?: string;
}

interface POSupplierBillsTableProps {
    bills: SupplierBill[];
}

const ITEMS_PER_PAGE = 10;

export default function POSupplierBillsTable({ bills }: POSupplierBillsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Map data for sorting
    const mappedBills = useMemo(() => bills.map(b => ({
        ...b,
        name: b.Name,
        status: b.Status__c,
        totalAmount: b.TotalAmount__c || 0,
        billedDate: b.Billed_Date__c,
        dueDate: b.Due_Date__c,
    })), [bills]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedBills);

    const initialWidths = {
        name: 180,
        status: 120,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        supplierName: 180,
        supplierDBA: 150,
        supplierContact: 150,
        totalLines: 150,
        totalCost: 150,
        shipping: 150,
        totalAmount: 150,
        billedDate: 120,
        paymentTerms: 160,
        dueDate: 150,
        remittanceStatus: 190,
        openBalance: 180,
        daysOutstanding: 190,
        settledDate: 190
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);

    if (bills.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Supplier Bills associated with this purchase order.">There are no Supplier Bills associated with this purchase order.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Supplier Bill" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader label="Customer Quote" field="Customer_Quote_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Supplier Name" field="Supplier_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierName} onResize={handleResize} />
                            <SortableHeader label="Supplier DBA" field="Supplier_DBA__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierDBA} onResize={handleResize} />
                            <SortableHeader label="Supplier Contact" field="Supplier_Contact_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierContact} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="Total_Product_Amount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="Total_Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Total Amount" field="TotalAmount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalAmount} onResize={handleResize} />
                            <SortableHeader label="Billed Date" field="Billed_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billedDate} onResize={handleResize} />
                            <SortableHeader label="Payment Terms" field="Payment_Terms__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.paymentTerms} onResize={handleResize} />
                            <SortableHeader label="Due Date" field="Due_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.dueDate} onResize={handleResize} />
                            <SortableHeader label="Remittance Status" field="Remittance_Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.remittanceStatus} onResize={handleResize} />
                            <SortableHeader label="Open Balance" field="Open_Balance__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.openBalance} onResize={handleResize} />
                            <SortableHeader label="Days Outstanding" field="Days_Outstanding__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.daysOutstanding} onResize={handleResize} />
                            <SortableHeader label="Settled Date" field="Settled_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.settledDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((b) => (
                            <tr key={b.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={b.Name}>
                                    {b.Name}
                                </td>
                                <td className="px-3 py-2 truncate">
                                    <StatusBadge status={b.Status__c} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Purchase_Order_Name || '-'}>
                                    {b.Purchase_Order_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Customer_Quote_Name || '-'}>
                                    {b.Customer_Quote_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Customer_Order_Name || '-'}>
                                    {b.Customer_Order_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Supplier_Name || '-'}>
                                    {b.Supplier_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Supplier_DBA__c || '-'}>
                                    {b.Supplier_DBA__c || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Supplier_Contact_Name || '-'}>
                                    {b.Supplier_Contact_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={String(b.Total_Lines__c || 0)}>
                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-semibold truncate" >
                                        {b.Total_Lines__c || 0}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.Total_Product_Amount__c || 0)}>
                                    {formatCurrency(b.Total_Product_Amount__c || 0)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.Total_Shipping_Charges__c || 0)}>
                                    {formatCurrency(b.Total_Shipping_Charges__c || 0)}
                                </td>
                                <td className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.TotalAmount__c || 0)}>
                                    {formatCurrency(b.TotalAmount__c || 0)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={b.Billed_Date__c ? formatDate(b.Billed_Date__c, 'numeric-dash') : '-'}>
                                    {b.Billed_Date__c ? formatDate(b.Billed_Date__c, 'numeric-dash') : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Payment_Terms__c || '-'}>
                                    {b.Payment_Terms__c || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={b.Due_Date__c ? formatDate(b.Due_Date__c, 'numeric-dash') : '-'}>
                                    {b.Due_Date__c ? formatDate(b.Due_Date__c, 'numeric-dash') : '-'}
                                </td>
                                <td className="px-3 py-2 truncate">
                                    <RemittanceBadge status={b.Remittance_Status__c || 'Pending'} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.Open_Balance__c || 0)}>
                                    {formatCurrency(b.Open_Balance__c || 0)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={String(b.Days_Outstanding__c || 0)}>
                                    {b.Days_Outstanding__c || 0}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={b.Settled_Date__c ? formatDate(b.Settled_Date__c, 'numeric-dash') : '-'}>
                                    {b.Settled_Date__c ? formatDate(b.Settled_Date__c, 'numeric-dash') : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={bills.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Supplier Bills"
                />
            </div>
        </div>
    );
}
