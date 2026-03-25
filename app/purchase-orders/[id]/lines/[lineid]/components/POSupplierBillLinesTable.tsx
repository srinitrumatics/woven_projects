"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

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
    Unit_Cost__c: number;
    Billed_Qty__c: number;
    BillAmount__c: number;
    Shipping_Charges__c: number;
    Total_Bill_Amount__c: number;
    Goods_Receipt_Date__c: string;
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
        const colors: Record<string, string> = {
            "Draft": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            "Pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            "Approved": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
        const colorClass = colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

        return (
            <span className={`inline-flex px-2 py-1 text-[11px] font-bold uppercase tracking-wider rounded ${colorClass}`} title={status}>
                {status}</span>
        );
    };

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm font-medium">No Supplier Bill lines found</p>
                <p className="text-xs mt-1">There are no bill lines associated with this record.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0 table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Supplier Bill Line" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.name} onResize={handleResize} className="sticky left-0 bg-[#e9f1f7] dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="Status__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.status} onResize={handleResize} />
                            <SortableHeader label="Supplier Bill" field="Supplier_Bill__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.supplierBill} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="Customer_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.customerQuoteLine} onResize={handleResize} />
                            <SortableHeader label="Purchase Order Line" field="Purchase_Order_Line__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.purchaseOrderLine} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="Product_Name__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.productName} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="Product_Description__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.description} onResize={handleResize} />
                            <SortableHeader label="Manufacturer DBA" field="Manufacturer_DBA__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.manufacturer} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="Unit_Cost__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.unitCost} onResize={handleResize} />
                            <SortableHeader label="Billed Qty" field="Billed_Qty__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billedQty} onResize={handleResize} />
                            <SortableHeader label="Bill Amount" field="BillAmount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.billAmount} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="Shipping_Charges__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.shipping} onResize={handleResize} />
                            <SortableHeader label="Total Bill Amount" field="Total_Bill_Amount__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.totalAmount} onResize={handleResize} />
                            <SortableHeader label="Goods Receipt Date" field="Goods_Receipt_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={columnWidths.receiptDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((line) => (
                            <tr key={line.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700" title="{line.Name}">
                                    <div className="truncate" title={line.Name}>{line.Name}</div>
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={line.Status__c} /></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title="{line.Supplier_Bill_Name || ' '}"><div className="truncate" title={line.Supplier_Bill_Name}>{line.Supplier_Bill_Name || ' '}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title="{line.Customer_Quote_Line_Name || ' '}"><div className="truncate" title={line.Customer_Quote_Line_Name}>{line.Customer_Quote_Line_Name || ' '}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title="{line.Purchase_Order_Line_Name || ' '}"><div className="truncate" title={line.Purchase_Order_Line_Name}>{line.Purchase_Order_Line_Name || ' '}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title="{line.Product_Name || ' '}"><div className="truncate" title={line.Product_Name}>{line.Product_Name || ' '}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title="{line.Product_Description__c || ' '}"><div className="truncate" title={line.Product_Description__c}>{line.Product_Description__c || ' '}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title="{line.Manufacturer_DBA__c || ' '}"><div className="truncate" title={line.Manufacturer_DBA__c}>{line.Manufacturer_DBA__c || ' '}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{formatCurrency(line.Unit_Cost__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">{line.Billed_Qty__c || 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold text-left" title={formatCurrency(line.BillAmount__c || 0)}>{formatCurrency(line.BillAmount__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left" title={formatCurrency(line.Shipping_Charges__c || 0)}>{formatCurrency(line.Shipping_Charges__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold text-left" title={formatCurrency(line.Total_Bill_Amount__c || 0)}>{formatCurrency(line.Total_Bill_Amount__c || 0)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={line.Goods_Receipt_Date__c ? formatDate(line.Goods_Receipt_Date__c, 'numeric-dash') : ' '}>{line.Goods_Receipt_Date__c ? formatDate(line.Goods_Receipt_Date__c, 'numeric-dash') : ' '}</td>
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
