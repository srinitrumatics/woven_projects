"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils/formatting";

import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from 'next/link';
import { useUserSession } from "@/components/UserSessionContext";

interface RTV {
    Id: string;
    Name: string;
    Status__c: string;
    Purchase_Order_Name?: string;
    Purchase_Order__c?: string;
    Customer_Quote_Name?: string;
    Customer_Quote__c?: string;
    Customer_Order_Name?: string;
    Customer_Order__c?: string;
    RTV_Type__c?: string;
    Supplier_RMA_Number__c?: string;
    Ship_from_Account_Name?: string;
    Ship_from_Contact_Name?: string;
    Supplier_Name?: string;
    Supplier_Contact_Name?: string;
    Total_Lines__c?: number;
    Total_Cost__c?: number;
    Issued_Date__c?: string;
    Approval_Date__c?: string;
    Return_by_Date__c?: string;
}

interface PORTVTableProps {
    rtv: RTV[];
}

const ITEMS_PER_PAGE = 10;

export default function PORTVTable({ rtv }: PORTVTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    // Map data for sorting
    const mappedData = useMemo(() => rtv.map(r => ({
        ...r,
        name: r.Name,
        status: r.Status__c,
    })), [rtv]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedData, { key: 'name', direction: 'desc' });

    const initialWidths = {
        name: 180,
        status: 120,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        rtvType: 120,
        rmaNumber: 150,
        shipFromAccount: 180,
        shipFromContact: 180,
        supplierName: 180,
        supplierContact: 180,
        totalLines: 140,
        totalCost: 120,
        issuedDate: 150,
        approvalDate: 150,
        returnByDate: 150
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(rtv.length / ITEMS_PER_PAGE);

    if (rtv.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no RTVs associated with this purchase order.">There are no RTVs associated with this purchase order.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader truncate={false} label="RTV" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader truncate={false} label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Purchase Order" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Customer Quote" field="Customer_Quote_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuote} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Customer Order" field="Customer_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerOrder} onResize={handleResize} />
                            <SortableHeader truncate={false} label="RTV Type" field="RTV_Type__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rtvType} onResize={handleResize} />
                            <SortableHeader truncate={false} label="RMA Number" field="Supplier_RMA_Number__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rmaNumber} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Ship from Account" field="Ship_from_Account_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipFromAccount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Ship from Contact" field="Ship_from_Contact_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipFromContact} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Supplier Name" field="Supplier_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierName} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Supplier Contact" field="Supplier_Contact_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierContact} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Total Lines" field="Total_Lines__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Issued Date" field="Issued_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.issuedDate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Approval Date" field="Approval_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.approvalDate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Return by Date" field="Return_by_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.returnByDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((r) => (
                            <tr key={r.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={r.Name}>
                                    {r.Name}
                                </td>
                                <td className="px-3 py-2 truncate">
                                    <StatusBadge status={r.Status__c} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Purchase_Order_Name || '-'}>
                                    {r.Purchase_Order__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/purchase-orders/${r.Purchase_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {r.Purchase_Order_Name || 'View PO'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{r.Purchase_Order_Name || 'View PO'}</span>
                                        )
                                    ) : r.Purchase_Order_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Customer_Quote_Name || '-'}>
                                    {r.Customer_Quote__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${r.Customer_Quote__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {r.Customer_Quote_Name || 'View Quote'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{r.Customer_Quote_Name || 'View Quote'}</span>
                                        )
                                    ) : r.Customer_Quote_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Customer_Order_Name || '-'}>
                                    {r.Customer_Order__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/orders/${r.Customer_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {r.Customer_Order_Name || 'View Order'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{r.Customer_Order_Name || 'View Order'}</span>
                                        )
                                    ) : r.Customer_Order_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.RTV_Type__c || '-'}>
                                    {r.RTV_Type__c || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Supplier_RMA_Number__c || '-'}>
                                    {r.Supplier_RMA_Number__c || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Ship_from_Account_Name || '-'}>
                                    {r.Ship_from_Account_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Ship_from_Contact_Name || '-'}>
                                    {r.Ship_from_Contact_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Supplier_Name || '-'}>
                                    {r.Supplier_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={r.Supplier_Contact_Name || '-'}>
                                    {r.Supplier_Contact_Name || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={String(r.Total_Lines__c || 0)}>
                                    <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium truncate">
                                        {r.Total_Lines__c || 0}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={`$${(r.Total_Cost__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${(r.Total_Cost__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={r.Issued_Date__c ? formatDate(r.Issued_Date__c, 'numeric-dash') : '-'}>
                                    {r.Issued_Date__c ? formatDate(r.Issued_Date__c, 'numeric-dash') : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={r.Approval_Date__c ? formatDate(r.Approval_Date__c, 'numeric-dash') : '-'}>
                                    {r.Approval_Date__c ? formatDate(r.Approval_Date__c, 'numeric-dash') : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={r.Return_by_Date__c ? formatDate(r.Return_by_Date__c, 'numeric-dash') : '-'}>
                                    {r.Return_by_Date__c ? formatDate(r.Return_by_Date__c, 'numeric-dash') : '-'}
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
                    totalItems={rtv.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
