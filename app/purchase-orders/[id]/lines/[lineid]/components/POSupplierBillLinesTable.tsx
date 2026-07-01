"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency, displayCell } from "@/lib/utils/formatting";
import Link from 'next/link';

interface SupplierBillLine {
    Id: string;
    Name: string;
    Status__c: string;
    Supplier_Bill_Name: string;
    Customer_Quote_Line_Name: string;
    Purchase_Order_Line_Name: string;
    Product_Name: string;
    Product_Description__c: string;
    Manufacturer_DBA__c: string;
    brand?: string;
    Unit_Cost__c: number;
    Billed_Qty__c: number;
    BillAmount__c: number;
    Shipping_Charges__c: number;
    Total_Bill_Amount__c: number;
    Goods_Receipt_Date__c: string;
    Supplier_Bill__c?: string;
    Customer_Quote_Line__c?: string;
    Customer_Quote__c?: string;
    Purchase_Order_Line__c?: string;
    Purchase_Order__c?: string;
}

interface POSupplierBillLinesTableProps {
    lines: SupplierBillLine[];
}

const ITEMS_PER_PAGE = 10;

export default function POSupplierBillLinesTable({ lines }: POSupplierBillLinesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedData, requestSort, sortConfig } = useSortableData(lines);

    const initialWidths = {
        name: 180,
        status: 120,
        supplierBill: 150,
        customerQuoteLine: 180,
        purchaseOrderLine: 180,
        productName: 180,
        description: 250,
        manufacturer: 180,
        unitCost: 120,
        billedQty: 120,
        billAmount: 140,
        shipping: 120,
        totalAmount: 180,
        receiptDate: 190
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`} title={status}>
                {status}
            </span>
        );
    };

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 min-w-0">
                <p className="text-sm font-medium truncate" title="No Supplier Bill lines found">No Supplier Bill lines found</p>
                <p className="text-xs mt-1 truncate" title="There are no bill lines associated with this record.">There are no bill lines associated with this record.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader truncate={false} label="Supplier Bill Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30" />
                            <SortableHeader truncate={false} label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Supplier Bill" field="Supplier_Bill__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierBill} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Customer Quote Line" field="Customer_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuoteLine} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Purchase Order Line" field="Purchase_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrderLine} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Name" field="Product_Name__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.description} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.manufacturer} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Unit Cost" field="Unit_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Billed Qty" field="Billed_Qty__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billedQty} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Bill Amount" field="BillAmount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Shipping" field="Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Total Bill Amount" field="Total_Bill_Amount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalAmount} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Goods Receipt Date" field="Goods_Receipt_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.receiptDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((line) => (
                            <tr key={line.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={line.Name}>
                                    {line.Name}
                                </td>
                                <td className="px-4 py-3 truncate"><StatusBadge status={line.Status__c} /></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Supplier_Bill_Name || '-'}>
                                    {line.Supplier_Bill__c ? (
                                        <Link href={`/supplier-bills/${line.Supplier_Bill__c}`} target="_blank" className="text-primary hover:underline font-medium">
                                            {line.Supplier_Bill_Name || ''}
                                        </Link>
                                    ) : displayCell(line.Supplier_Bill_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Customer_Quote_Line_Name || '-'}>
                                    {displayCell(line.Customer_Quote_Line_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Purchase_Order_Line_Name || '-'}>
                                    {displayCell(line.Purchase_Order_Line_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Product_Name || '-'}>
                                    {displayCell(line.Product_Name)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Product_Description__c || '-'}>
                                    {displayCell(line.Product_Description__c)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.brand || '-'}>
                                    {displayCell(line.brand)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(line.Unit_Cost__c || 0)}>{formatCurrency(line.Unit_Cost__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={String(line.Billed_Qty__c || 0)}>{line.Billed_Qty__c || 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold text-left truncate" title={formatCurrency(line.BillAmount__c || 0)}>{formatCurrency(line.BillAmount__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left truncate" title={formatCurrency(line.Shipping_Charges__c || 0)}>{formatCurrency(line.Shipping_Charges__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold text-left truncate" title={formatCurrency(line.Total_Bill_Amount__c || 0)}>{formatCurrency(line.Total_Bill_Amount__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={line.Goods_Receipt_Date__c ? formatDate(line.Goods_Receipt_Date__c, 'numeric-dash') : '-'}>{line.Goods_Receipt_Date__c ? formatDate(line.Goods_Receipt_Date__c, 'numeric-dash') : displayCell(undefined)}</td>
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
                    totalItems={lines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
