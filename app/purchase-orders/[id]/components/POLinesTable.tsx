"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { formatDate, formatCurrency, displayCell } from "@/lib/utils/formatting";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import Pagination from "@/components/ui/Pagination";
import { useUserSession } from "@/components/UserSessionContext";

import { StatusBadge } from "@/components/ui/StatusBadge";

interface POLinesTableProps {
    lines: any[];
    poId: string;
}

const ITEMS_PER_PAGE = 10;

export default function POLinesTable({ lines, poId }: POLinesTableProps) {
    const { selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    const mappedLines = useMemo(() => {
        return lines.map(line => ({
            ...line,
            name: line.Name || line.Purchase_Order_Name || line.Purchase_Order__r?.Name || '-',
            status: line.Status__c || '-',
            customerQuoteLine: line.Customer_Quote_Line_Name || '-',
            proposedProduct: line.Proposed_Product_Name || '-',
            proposedProductId: line.Proposed_Product__c || '-',
            productName: line.Product_Name || '',
            productId: line.Product_Name__c || line.Product__c || '-',
            productDescription: line.Product_Description__c || '-',
            manufacturerDBA: line.Manufacturer_DBA__c || '-',
            brand: line.Product_Brand_Name__c || '-',
            unitCost: line.Unit_Cost__c || 0,
            totalOrderQty: line.Total_Order_Qty__c || 0,
            productCost: line.Total_Product_Cost__c || line.gtherp__Total_Product_Cost__c || 0,
            shippingCost: line.Shipping_Charges__c || line.gtherp__Shipping_Charges__c || 0,
            totalCost: line.Total_Cost__c || line.gtherp__Total_Cost__c || 0,
            needByDate: line.Need_By_Date__c || '-',
            promiseDate: line.Promise_Date__c || '-',
            trackingNumber: line.Tracking_Number__c || '-',
            estimatedDeliveryDate: line.Estimated_Delivery_Date__c || '-',
            trackingStatus: line.Tracking_Status__c || '-',
            actualDeliveryDate: line.Actual_Delivery_Date__c || '-',
            goodsReceiptDate: line.Goods_Receipt_Date__c || '-',
            purchaseOrderId: line.Purchase_Order__c || '-',
            customerQuoteId: line.Customer_Quote__c || '-',
            customerQuoteLineId: line.Customer_Quote_Line__c || '-',
            shipmentId: line.Shipping_Manifest__c || '-',
            shipmentName: line.Shipping_Manifest_Name || line.Shipping_Manifest__r?.Name || '-'
        }));
    }, [lines]);

    const [currentPage, setCurrentPage] = useState(1);

    const { items: sortedLines, requestSort, sortConfig } = useSortableData(mappedLines, { key: 'name', direction: 'asc' });

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
        customerQuoteLine: 181,
        proposedProduct: 180,
        productName: 201,
        productDescription: 251,
        brand: 181,
        unitCost: 121,
        totalOrderQty: 121,
        productCost: 151,
        shippingCost: 151,
        totalCost: 151,
        needByDate: 160,
        promiseDate: 160,
        trackingNumber: 151,
        trackingStatus: 151,
        estimatedDeliveryDate: 191,
        actualDeliveryDate: 191,
        goodsReceiptDate: 191,
        action: 80
    });

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full text-left whitespace-nowrap text-sm table-fixed border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="Purchase Order Line #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                            <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                            <SortableHeader label="Proposed Product" field="proposedProduct" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProduct} onResize={handleResize} />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.brand} onResize={handleResize} />
                            <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                            <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="shippingCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingCost} onResize={handleResize} />
                            <SortableHeader label="Line Grand Total" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Need By Date" field="needByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.needByDate} onResize={handleResize} />
                            <SortableHeader label="Promise Date" field="promiseDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.promiseDate} onResize={handleResize} />
                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                            <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={handleResize} />
                            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap" style={{ width: widths.action }}>Action</th>
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
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.customerQuoteLine}>
                                    {line.customerQuoteLineId && line.customerQuoteId ? (
                                        !isManufacturer ? (
                                            <Link href={`/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {line.customerQuoteLine || 'View Quote Line'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(line.customerQuoteLine)}</span>
                                        )
                                    ) : (
                                        displayCell(line.customerQuoteLine)
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.proposedProduct}>
                                    {line.proposedProductId ? (
                                        !isManufacturer ? (
                                            <Link href={`/proposals/${line.proposalId}/lines/${line.proposedProductId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                {line.proposedProduct || 'View Product'}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{displayCell(line.proposedProduct)}</span>
                                        )
                                    ) : (
                                        displayCell(line.proposedProduct)
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.productName}>
                                    {line.productId ? (
                                        <Link href={`/products/${line.productId}`} target="_blank" className="text-primary hover:underline font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            {line.productName}
                                        </Link>
                                    ) : (
                                        displayCell(line.productName)
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.productDescription}>{displayCell(line.productDescription)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.brand}>{displayCell(line.brand)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(line.unitCost)}>{formatCurrency(line.unitCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={String(line.totalOrderQty)}>{line.totalOrderQty}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(line.productCost)}>{formatCurrency(line.productCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(line.shippingCost)}>{formatCurrency(line.shippingCost)}</td>
                                <td className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-white truncate" title={formatCurrency(line.totalCost)}>{formatCurrency(line.totalCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.needByDate ? formatDate(line.needByDate, 'numeric-dash') : ''}>{line.needByDate ? formatDate(line.needByDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.promiseDate ? formatDate(line.promiseDate, 'numeric-dash') : ''}>{line.promiseDate ? formatDate(line.promiseDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.trackingNumber}>{displayCell(line.trackingNumber)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.trackingStatus}>{displayCell(line.trackingStatus)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.estimatedDeliveryDate ? formatDate(line.estimatedDeliveryDate, 'numeric-dash') : ''}>{line.estimatedDeliveryDate ? formatDate(line.estimatedDeliveryDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.actualDeliveryDate ? formatDate(line.actualDeliveryDate, 'numeric-dash') : ''}>{line.actualDeliveryDate ? formatDate(line.actualDeliveryDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : ''}>{line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm truncate" style={{ width: widths.action }} onClick={(e) => e.stopPropagation()}>
                                    <Link
                                        href={`/purchase-orders/${poId}/lines/${line.Id}`}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full inline-flex items-center justify-center transition-colors"
                                        title="View Line Details"
                                    >
                                        <Eye className="w-5 h-5 text-primary" />
                                    </Link>
                                </td>
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

