"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import Pagination from "@/components/ui/Pagination";

import { StatusBadge } from "@/components/ui/StatusBadge";

interface POLinesTableProps {
    lines: any[];
    poId: string;
}

const ITEMS_PER_PAGE = 10;

export default function POLinesTable({ lines, poId }: POLinesTableProps) {
    const mappedLines = useMemo(() => {
        return lines.map(line => ({
            ...line,
            name: line.Name || line.Purchase_Order_Name || line.Purchase_Order__r?.Name || '',
            status: line.Status__c || '',
            purchaseOrder: line.Purchase_Order_Name || '',
            customerQuoteLine: line.Customer_Quote_Line_Name || '',
            productName: line.Product_Name || '',
            productDescription: line.Product_Description__c || '',
            manufacturerDBA: line.Manufacturer_DBA__c || '',
            unitCost: line.Unit_Cost__c || 0,
            totalOrderQty: line.Total_Order_Qty__c || 0,
            productCost: line.Total_Product_Cost__c || 0,
            shippingCost: line.Total_Shipping_Charges__c || 0,
            totalCost: line.Total_Cost__c || 0,
            openBalanceQty: line.Open_Balance_Qty__c || 0,
            trackingNumber: line.Tracking_Number__c || '',
            estimatedDeliveryDate: line.Estimated_Delivery_Date__c || '',
            trackingStatus: line.Tracking_Status__c || '',
            actualDeliveryDate: line.Actual_Delivery_Date__c || '',
            goodsReceiptDate: line.Goods_Receipt_Date__c || '',
            invoiceStatus: line.Invoice_Status__c || '',
            purchaseOrderId: line.Purchase_Order__c || '',
            customerQuoteId: line.Customer_Quote__c || '',
            customerQuoteLineId: line.Customer_Quote_Line__c || '',
            shipmentId: line.Shipping_Manifest__c || '',
            shipmentName: line.Shipping_Manifest_Name || line.Shipping_Manifest__r?.Name || ''
        }));
    }, [lines]);

    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedLines, requestSort, sortConfig } = useSortableData(mappedLines);

    const totalPages = Math.ceil(sortedLines.length / ITEMS_PER_PAGE);
    const paginatedLines = useMemo(() => {
        return sortedLines.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
    }, [sortedLines, currentPage]);

    const { widths, handleResize } = useResizableColumns({
        name: 220,
        status: 120,
        purchaseOrder: 151,
        customerQuoteLine: 181,
        productName: 201,
        productDescription: 251,
        manufacturerDBA: 181,
        unitCost: 121,
        totalOrderQty: 121,
        productCost: 151,
        shippingCost: 151,
        totalCost: 151,
        openBalanceQty: 151,
        trackingNumber: 151,
        estimatedDeliveryDate: 191,
        trackingStatus: 151,
        actualDeliveryDate: 191,
        goodsReceiptDate: 191,
        invoiceStatus: 151
    });

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full text-left whitespace-nowrap text-sm table-fixed border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader truncate={false} label="Purchase Order Line" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader truncate={false} label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Total Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Shipping" field="shippingCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Line Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Open Balance Qty" field="openBalanceQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalanceQty} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={handleResize} />
                            <SortableHeader truncate={false} label="Invoice Status" field="invoiceStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceStatus} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedLines.map((line: any) => (
                            <tr key={line.Id || Math.random()} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={line.name}>
                                    <Link
                                        href={`/purchase-orders/${poId}/lines/${line.Id}`}
                                        className="text-primary hover:text-primary-dark hover:underline font-semibold block truncate"
                                        title={line.name}
                                    >
                                        {line.name}
                                    </Link>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                    <StatusBadge status={line.status} />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.purchaseOrder}>
                                    {line.purchaseOrderId ? (
                                        <Link href={`/purchase-orders/${line.purchaseOrderId}`} className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                            {line.purchaseOrder || 'View PO'}
                                        </Link>
                                    ) : (
                                        line.purchaseOrder || '-'
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.customerQuoteLine}>
                                    {line.customerQuoteLineId && line.customerQuoteId ? (
                                        <Link href={`/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}`} className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {line.customerQuoteLine || 'View Quote Line'}
                                        </Link>
                                    ) : (
                                        line.customerQuoteLine || '-'
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.productName}>{line.productName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.productDescription}>{line.productDescription}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.manufacturerDBA}>{line.manufacturerDBA}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(line.unitCost)}>{formatCurrency(line.unitCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={String(line.totalOrderQty)}>{line.totalOrderQty}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(line.productCost)}>{formatCurrency(line.productCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(line.shippingCost)}>{formatCurrency(line.shippingCost)}</td>
                                <td className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-white truncate" title={formatCurrency(line.totalCost)}>{formatCurrency(line.totalCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={String(line.openBalanceQty)}>{line.openBalanceQty}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.trackingNumber}>{line.trackingNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.estimatedDeliveryDate ? formatDate(line.estimatedDeliveryDate, 'numeric-dash') : ''}>{line.estimatedDeliveryDate ? formatDate(line.estimatedDeliveryDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.trackingStatus}>{line.trackingStatus}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.actualDeliveryDate ? formatDate(line.actualDeliveryDate, 'numeric-dash') : ''}>{line.actualDeliveryDate ? formatDate(line.actualDeliveryDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : ''}>{line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.invoiceStatus}>{line.invoiceStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedLines.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                        <p className="text-sm truncate" title="There are no Purchase Order Lines associated with this purchase order.">There are no Purchase Order Lines associated with this purchase order.</p>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedLines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="lines"
                />
            </div>
        </div>
    );
}

