"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency, displayCell } from "@/lib/utils/formatting";
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { useUserSession } from "@/components/UserSessionContext";

import { StatusBadge, RemittanceBadge } from "@/components/ui/StatusBadge";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState } from "@/components/ui/DataTable";

interface SupplierBill {
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
    Ship_to_Account_Name?: string;
    Authorized_Ship_To_Location_Name?: string;
    Ship_to_Contact_Name?: string;
    Total_Lines__c?: number;
    Total_Product_Amount__c?: number;
    gtherp__Total_Product_Amount__c?: number;
    Total_Shipping_Charges__c?: number;
    gtherp__Total_Shipping_Charges__c?: number;
    TotalAmount__c?: number;
    gtherp__TotalAmount__c?: number;
    Billed_Date__c?: string;
    Payment_Terms__c?: string;
    Due_Date__c?: string;
    Remittance_Status__c?: string;
    Open_Balance__c?: number;
    Settled_Date__c?: string;
}

interface POSupplierBillsTableProps {
    bills: SupplierBill[];
}

const ITEMS_PER_PAGE = 10;

export default function POSupplierBillsTable({ bills }: POSupplierBillsTableProps) {
    const { selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    const [currentPage, setCurrentPage] = useState(1);

    // Map data for sorting
    const mappedBills = useMemo(() => bills.map(b => ({
        ...b,
        name: b.Name,
        status: b.Status__c,
        proposalNumber: b.Proposal_Number__c || b.Proposal_Name || '',
        proposalName: b.Proposal_Name || '',
        shipToAccount: b.Ship_to_Account_Name || '',
        shipToLocation: b.Authorized_Ship_To_Location_Name || '',
        shipToContact: b.Ship_to_Contact_Name || '',
        totalAmount: b.Total_Product_Amount__c || b.gtherp__Total_Product_Amount__c || 0,
        shippingCost: b.Total_Shipping_Charges__c || b.gtherp__Total_Shipping_Charges__c || 0,
        grandTotal: b.TotalAmount__c || b.gtherp__TotalAmount__c || 0,
        billedDate: b.Billed_Date__c,
        dueDate: b.Due_Date__c,
    })), [bills]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(mappedBills, { key: 'name', direction: 'asc' });

    const initialWidths = {
        name: 180,
        status: 120,
        purchaseOrder: 150,
        customerQuote: 150,
        proposalNumber: 150,
        proposalName: 180,
        customerOrder: 150,
        shipToAccount: 180,
        shipToLocation: 180,
        shipToContact: 180,
        totalLines: 150,
        totalAmount: 150,
        shipping: 150,
        grandTotal: 150,
        billedDate: 120,
        paymentTerms: 160,
        dueDate: 150,
        remittanceStatus: 190,
        openBalance: 180,
        settledDate: 190,
        action: 80
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);

    if (bills.length === 0) {
        return (
            <TableEmptyState
                message="No records found"
                description="There are no Supplier Bills associated with this purchase order."
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Supplier Bill #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Purchase Order #" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader label="Customer Quote #" field="Customer_Quote_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposalNumber} onResize={handleResize} />
                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.proposalName} onResize={handleResize} />
                            <SortableHeader label="Customer Order #" field="Customer_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipToAccount} onResize={handleResize} />
                            <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipToLocation} onResize={handleResize} />
                            <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipToContact} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="Total_Lines__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalAmount} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="shippingCost" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.grandTotal} onResize={handleResize} />
                            <SortableHeader label="Billed Date" field="Billed_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billedDate} onResize={handleResize} />
                            <SortableHeader label="Payment Terms" field="Payment_Terms__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.paymentTerms} onResize={handleResize} />
                            <SortableHeader label="Due Date" field="Due_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.dueDate} onResize={handleResize} />
                            <SortableHeader label="Remittance Status" field="Remittance_Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.remittanceStatus} onResize={handleResize} />
                            <SortableHeader label="Open Balance" field="Open_Balance__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.openBalance} onResize={handleResize} />
                            <SortableHeader label="Settled Date" field="Settled_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.settledDate} onResize={handleResize} />
                            <Th className="whitespace-nowrap" style={{ width: columnWidths.action }}>Action</Th>
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedData.map((b) => (
                            <Tr key={b.Id} className="transition-colors group">
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={b.Name}>
                                    {b.Id ? (
                                        <Link href={`/supplier-bills/${b.Id}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {b.Name || 'View suppiler bill'}
                                        </Link>
                                    ) : b.Name || '-'}

                                </Td>
                                <Td className="px-3 py-2 truncate">
                                    <StatusBadge status={b.Status__c} />
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Purchase_Order_Name || '-'}>
                                    {b.Purchase_Order__c ? (
                                        <Link href={`/purchase-orders/${b.Purchase_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {b.Purchase_Order_Name || 'View PO'}
                                        </Link>
                                    ) : displayCell(b.Purchase_Order_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Customer_Quote_Name || '-'}>
                                    {b.Customer_Quote__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${b.Customer_Quote__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {b.Customer_Quote_Name || 'View Quote'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(b.Customer_Quote_Name)}</span>
                                        )
                                    ) : displayCell(b.Customer_Quote_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Proposal_Number__c || b.Proposal_Name || '-'}>
                                    {b.Proposal__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/proposals/${b.Proposal__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {b.Proposal_Number__c || b.Proposal_Name || 'View Proposal'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(b.Proposal_Number__c || b.Proposal_Name)}</span>
                                        )
                                    ) : displayCell(b.Proposal_Number__c || b.Proposal_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Proposal_Name || '-'}>{displayCell(b.Proposal_Name)}</Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Customer_Order_Name || '-'}>
                                    {b.Customer_Order__c ? (
                                        !isManufacturer ? (
                                            <Link href={`/orders/${b.Customer_Order__c}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {b.Customer_Order_Name || 'View Order'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(b.Customer_Order_Name)}</span>
                                        )
                                    ) : displayCell(b.Customer_Order_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Ship_to_Account_Name || '-'}>
                                    {displayCell(b.Ship_to_Account_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Authorized_Ship_To_Location_Name || '-'}>
                                    {displayCell(b.Authorized_Ship_To_Location_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Ship_to_Contact_Name || '-'}>
                                    {displayCell(b.Ship_to_Contact_Name)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={String(b.Total_Lines__c || 0)}>
                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-semibold truncate">
                                        {b.Total_Lines__c || 0}
                                    </span>
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.Total_Product_Amount__c || b.gtherp__Total_Product_Amount__c || 0)}>
                                    {formatCurrency(b.Total_Product_Amount__c || b.gtherp__Total_Product_Amount__c || 0)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.Total_Shipping_Charges__c || b.gtherp__Total_Shipping_Charges__c || 0)}>
                                    {formatCurrency(b.Total_Shipping_Charges__c || b.gtherp__Total_Shipping_Charges__c || 0)}
                                </Td>
                                <Td className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-white text-left truncate" title={formatCurrency(b.TotalAmount__c || b.gtherp__TotalAmount__c || 0)}>
                                    {formatCurrency(b.TotalAmount__c || b.gtherp__TotalAmount__c || 0)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={b.Billed_Date__c ? formatDate(b.Billed_Date__c, 'numeric-dash') : '-'}>
                                    {b.Billed_Date__c ? formatDate(b.Billed_Date__c, 'numeric-dash') : '-'}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={b.Payment_Terms__c || '-'}>
                                    {displayCell(b.Payment_Terms__c)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={b.Due_Date__c ? formatDate(b.Due_Date__c, 'numeric-dash') : '-'}>
                                    {b.Due_Date__c ? formatDate(b.Due_Date__c, 'numeric-dash') : '-'}
                                </Td>
                                <Td className="px-3 py-2 truncate">
                                    <RemittanceBadge status={b.Remittance_Status__c || 'Pending'} />
                                </Td>
                                <Td className={`px-3 py-2 text-sm text-left truncate font-medium ${(b.Open_Balance__c || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} title={formatCurrency(b.Open_Balance__c || 0)}>
                                    {formatCurrency(b.Open_Balance__c || 0)}
                                </Td>
                                <Td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-700 truncate" title={b.Settled_Date__c ? formatDate(b.Settled_Date__c, 'numeric-dash') : '-'}>
                                    {b.Settled_Date__c ? formatDate(b.Settled_Date__c, 'numeric-dash') : '-'}
                                </Td>
                                <Td className="px-3 py-2 text-sm truncate" onClick={(e) => e.stopPropagation()}>
                                    <Link
                                        href={`/supplier-bills/${b.Id}`}
                                        target="_blank"
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full inline-flex items-center justify-center transition-colors"
                                        title="View Supplier Bill"
                                    >
                                        <Eye className="w-5 h-5 text-primary" />
                                    </Link>
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
                    totalItems={bills.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Supplier Bills"
                />
            </div>
        </div>
    );
}
