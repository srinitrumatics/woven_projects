"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, displayCell } from "@/lib/utils/formatting";

import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from 'next/link';
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";

interface RTV {
    Id: string;
    Name: string;
    Status__c: string;
    Purchase_Order_Name?: string;
    Purchase_Order__c?: string;
    Customer_Quote_Name?: string;
    Customer_Quote__c?: string;
    Proposal_Name?: string;
    Proposal_Number__c?: string;
    Proposal__c?: string;
    Customer_Order_Name?: string;
    Customer_Order__c?: string;
    RTV_Type__c?: string;
    Supplier_RMA_Number__c?: string;
    Ship_from_Account_Name?: string;
    Ship_from_Contact_Name?: string;
    Total_Lines__c?: number;
    Total_Cost__c?: number;
    Issued_Date__c?: string;
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
        proposalNumber: r.Proposal_Number__c || r.Proposal_Name || '',
        proposalName: r.Proposal_Name || '',
    })), [rtv]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedData, { key: 'name', direction: 'asc' });

    const initialWidths = {
        name: 180,
        status: 120,
        rtvType: 120,
        purchaseOrder: 150,
        customerQuote: 150,
        proposalNumber: 150,
        proposalName: 180,
        customerOrder: 150,
        shipFromAccount: 180,
        shipFromContact: 180,
        totalLines: 140,
        totalCost: 120,
        issuedDate: 150,
        returnByDate: 150,
        rmaNumber: 170
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(rtv.length / ITEMS_PER_PAGE);

    if (rtv.length === 0) {
        return (
            <TableEmptyState
                message="No records found"
                description="There are no RTVs associated with this purchase order."
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="RTV #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Type" field="RTV_Type__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rtvType} onResize={handleResize} />
                            <SortableHeader label="Purchase Order #" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader label="Customer Quote #" field="Customer_Quote_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposalNumber} onResize={handleResize} />
                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposalName} onResize={handleResize} />
                            <SortableHeader label="Customer Order #" field="Customer_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Ship from Account" field="Ship_from_Account_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipFromAccount} onResize={handleResize} />
                            <SortableHeader label="Ship from Contact" field="Ship_from_Contact_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipFromContact} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="Total_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Issued Date" field="Issued_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.issuedDate} onResize={handleResize} />
                            <SortableHeader label="Return By Date" field="Return_by_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.returnByDate} onResize={handleResize} />
                            <SortableHeader label="Supplier RMA Number" field="Supplier_RMA_Number__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.rmaNumber} onResize={handleResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((r) => (
                            <Tr key={r.Id} className="transition-colors group">
                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={r.Name}>
                                    {r.Name}
                                </Td>
                                <Td className="truncate">
                                    <StatusBadge status={r.Status__c} />
                                </Td>
                                <Td className="truncate" title={r.RTV_Type__c || '-'}>
                                    {displayCell(r.RTV_Type__c)}
                                </Td>
                                <Td className="truncate" title={r.Purchase_Order_Name || '-'}>
                                    {r.Purchase_Order__c ? (
                                        <Link href={`/purchase-orders/${r.Purchase_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {r.Purchase_Order_Name || 'View PO'}
                                        </Link>
                                    ) : displayCell(r.Purchase_Order_Name)}
                                </Td>
                                <Td className="truncate" title={r.Customer_Quote_Name || '-'}>
                                    {r.Customer_Quote__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${r.Customer_Quote__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {r.Customer_Quote_Name || 'View Quote'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(r.Customer_Quote_Name)}</span>
                                        )
                                    ) : displayCell(r.Customer_Quote_Name)}
                                </Td>
                                <Td className="truncate" title={r.Proposal_Number__c || '-'}>
                                    {r.proposalNumber ? (
                                        !isManufacturer ? (
                                            <Link href={`/proposals/${r.Proposal__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {r.Proposal_Number__c || 'View Proposal'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(r.Proposal_Number__c || r.Proposal_Name)}</span>
                                        )
                                    ) : displayCell(r.Proposal_Number__c || '')}
                                </Td>
                                <Td className="truncate" title={r.Proposal_Name || '-'}>{displayCell(r.Proposal_Name)}</Td>
                                <Td className="truncate" title={r.Customer_Order_Name || '-'}>
                                    {r.Customer_Order__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/orders/${r.Customer_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {r.Customer_Order_Name || 'View Order'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(r.Customer_Order_Name)}</span>
                                        )
                                    ) : displayCell(r.Customer_Order_Name)}
                                </Td>
                                <Td className="truncate" title={r.Ship_from_Account_Name || '-'}>
                                    {displayCell(r.Ship_from_Account_Name)}
                                </Td>
                                <Td className="truncate" title={r.Ship_from_Contact_Name || '-'}>
                                    {displayCell(r.Ship_from_Contact_Name)}
                                </Td>
                                <Td className="text-left truncate" title={String(r.Total_Lines__c || 0)}>
                                    <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium truncate">
                                        {r.Total_Lines__c || 0}
                                    </span>
                                </Td>
                                <Td className="text-left truncate" title={`$${(r.Total_Cost__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${(r.Total_Cost__c || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Td>
                                <Td className="dark:text-gray-700 truncate" title={r.Issued_Date__c ? formatDate(r.Issued_Date__c, 'numeric-dash') : '-'}>
                                    {r.Issued_Date__c ? formatDate(r.Issued_Date__c, 'numeric-dash') : '-'}
                                </Td>
                                <Td className="dark:text-gray-700 truncate" title={r.Return_by_Date__c ? formatDate(r.Return_by_Date__c, 'numeric-dash') : '-'}>
                                    {r.Return_by_Date__c ? formatDate(r.Return_by_Date__c, 'numeric-dash') : '-'}
                                </Td>
                                <Td className="truncate" title={r.Supplier_RMA_Number__c || '-'}>
                                    {displayCell(r.Supplier_RMA_Number__c)}
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
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
