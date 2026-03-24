"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import Pagination from "@/components/ui/Pagination";

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
            status: line.Status__c || line.gtherp__Status__c || '',
            customerQuote: line.Customer_Quote__c || line.gtherp__Customer_Quote__c || '',
            customerOrder: line.Customer_Order__c || line.gtherp__Customer_Order__c || '',
            customerPO: line.Customer_PO__c || line.gtherp__Customer_PO__c || '',
            supplierName: line.Supplier_Name__c || line.gtherp__Supplier_Name__c || '',
            supplierDBA: line.Supplier_DBA__c || line.gtherp__Supplier_DBA__c || '',
            supplierContact: line.Supplier_Contact__c || line.gtherp__Supplier_Contact__c || '',
            shipToAccount: line.Ship_to_Account__c || line.gtherp__Ship_to_Account__c || '',
            shipToLocation: line.Authorized_Ship_To_Location__c || line.gtherp__Authorized_Ship_To_Location__c || '',
            shipToContact: line.Ship_to_Contact__c || line.gtherp__Ship_to_Contact__c || '',
            dropShip: (line.Drop_Ship__c || line.gtherp__Drop_Ship__c) ? 'Yes' : 'No',
            totalLines: line.Total_Lines__c || line.gtherp__Total_Lines__c || 0,
            productCost: line.Total_Product_Cost__c || line.gtherp__Total_Product_Cost__c || 0,
            shippingCost: line.Total_Shipping_Charges__c || line.gtherp__Total_Shipping_Charges__c || 0,
            totalCost: line.Total_Cost__c || line.gtherp__Total_Cost__c || 0,
            issuedDate: line.Issued_Date__c || line.gtherp__Issued_Date__c || null,
            acknowledgedDate: line.Acknowledged_Date__c || line.gtherp__Acknowledged_Date__c || null,
            requestDate: line.Request_Date__c || line.gtherp__Request_Date__c || null,
            promiseDate: line.Promise_Date__c || line.gtherp__Promise_Date__c || null,
            shippingMethod: line.Shipping_Method__c || line.gtherp__Shipping_Method__c || '',
            logisticsPartner: line.Logistics_Partner__c || line.gtherp__Logistics_Partner__c || '',
            logisticsContact: line.Logistics_Contact__c || line.gtherp__Logistics_Contact__c || '',
            trackingNumber: line.Tracking_Number__c || line.gtherp__Tracking_Number__c || '',
            estimatedDeliveryDate: line.Estimated_Delivery_Date__c || line.gtherp__Estimated_Delivery_Date__c || null,
            trackingStatus: line.Tracking_Status__c || line.gtherp__Tracking_Status__c || '',
            actualDeliveryDate: line.Actual_Delivery_Date__c || line.gtherp__Actual_Delivery_Date__c || null,
            goodsReceiptDate: line.Goods_Receipt_Date__c || line.gtherp__Goods_Receipt_Date__c || null
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
        customerQuote: 151,
        customerOrder: 151,
        customerPO: 151,
        supplierName: 181,
        supplierDBA: 181,
        supplierContact: 181,
        shipToAccount: 181,
        shipToLocation: 181,
        shipToContact: 181,
        dropShip: 101,
        totalLines: 121,
        productCost: 151,
        shippingCost: 151,
        totalCost: 151,
        issuedDate: 151,
        acknowledgedDate: 201,
        requestDate: 151,
        promiseDate: 151,
        shippingMethod: 151,
        logisticsPartner: 181,
        logisticsContact: 181,
        trackingNumber: 151,
        estimatedDeliveryDate: 191,
        trackingStatus: 151,
        actualDeliveryDate: 191,
        goodsReceiptDate: 191
    });

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-sm">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Purchase Order Line" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={handleResize} />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                            <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={handleResize} />
                            <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierDBA} onResize={handleResize} />
                            <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={handleResize} />
                            <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={handleResize} />
                            <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={handleResize} />
                            <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={handleResize} />
                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={handleResize} />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                            <SortableHeader label="Product Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={handleResize} />
                            <SortableHeader label="Shipping" field="shippingCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingCost} onResize={handleResize} />
                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={handleResize} />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={handleResize} />
                            <SortableHeader label="Acknowledged Date" field="acknowledgedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.acknowledgedDate} onResize={handleResize} />
                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={handleResize} />
                            <SortableHeader label="Promise Date" field="promiseDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.promiseDate} onResize={handleResize} />
                            <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={handleResize} />
                            <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={handleResize} />
                            <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={handleResize} />
                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={handleResize} />
                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={handleResize} />
                            <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={handleResize} />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedLines.map((line: any) => (
                            <tr key={line.Id || Math.random()} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-100 dark:border-gray-700">
                                    <Link
                                        href={`/purchase-orders/${poId}/lines/${line.Id}`}
                                        className="text-primary hover:text-primary-dark hover:underline font-semibold"
                                    >
                                        {line.name}
                                    </Link>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white"><StatusBadge status={line.status} /></td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.customerPO}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.supplierName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.supplierDBA}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.supplierContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.shipToAccount}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.shipToLocation}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.shipToContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.dropShip}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{formatCurrency(line.productCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{formatCurrency(line.shippingCost)}</td>
                                <td className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(line.totalCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.issuedDate ? formatDate(line.issuedDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.acknowledgedDate ? formatDate(line.acknowledgedDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.requestDate ? formatDate(line.requestDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.promiseDate ? formatDate(line.promiseDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.shippingMethod}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.logisticsPartner}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.logisticsContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.trackingNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.estimatedDeliveryDate ? formatDate(line.estimatedDeliveryDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.trackingStatus}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.actualDeliveryDate ? formatDate(line.actualDeliveryDate, 'numeric-dash') : ''}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{line.goodsReceiptDate ? formatDate(line.goodsReceiptDate, 'numeric-dash') : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedLines.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-medium">No records found</p>
                        <p className="text-sm">There are no Purchase Order Lines associated with this purchase order.</p>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedLines.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="lines"
            />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Acknowledged":
            case "Received":
                return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
            case "Issued":
            case "Pending Approval":
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
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStyles()}`}>
            {status}
        </span>
    );
}
