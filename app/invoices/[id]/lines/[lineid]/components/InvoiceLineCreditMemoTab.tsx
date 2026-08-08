"use client";

import { useEffect, useState, useMemo } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ITEMS_PER_PAGE = 10;

interface CreditMemoLine {
    id: string;
    lineName: string;          // Credit Memo Line (Name)
    status: string;            // Status
    creditMemoName: string;    // Credit Memo
    salesOrderLine: string;    // Sales Order Line
    customerQuoteLine: string; // Customer Quote Line
    customerQuoteLineId: string;
    customerQuoteId: string;
    proposedProduct: string;   // Proposed Product
    proposedProductId: string;
    proposalId?: string;
    productName: string;       // Product Name
    productId: string;
    description: string;       // Product Description
    manufacturerDBA: string;   // Manufacturer DBA
    brand?: string;            // Brand
    unitPrice: number;         // Unit Price
    creditQty: number;         // Credit Qty
    totalPrice: number;        // Total Price
    shipping: number;          // Shipping
    taxes: number;             // Taxes
    grandTotal: number;        // Line Grand Total
}

interface InvoiceLineCreditMemoTabProps {
    lineId: string;
    accountId?: string;
    contactId?: string;
}

export default function InvoiceLineCreditMemoTab({ lineId, accountId, contactId }: InvoiceLineCreditMemoTabProps) {
    const [loading, setLoading] = useState(true);
    const [creditMemoLines, setCreditMemoLines] = useState<CreditMemoLine[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function fetchCreditMemoLines() {
            if (!accountId || !contactId || !lineId) return;
            try {
                setLoading(true);
                const res = await fetch(`/api/salesforce/invoices?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&invoiceId=${encodeURIComponent(lineId)}&action=creditmemolines&objectName=Invoice_Line__c`);
                if (!res.ok) throw new Error("Failed to fetch credit memo lines");
                const data = await res.json();

                if (data && data.Credit_Memo_Line__c) {
                    setCreditMemoLines(data.Credit_Memo_Line__c.map((item: any) => ({
                        id: item.Id,
                        lineName: item.Name || "",
                        status: item.Status__c || "",
                        creditMemoName: item.Credit_Memo_Name || "",
                        salesOrderLine: item.Sales_Order_Line_Name || "",
                        customerQuoteLine: item.Customer_Quote_Line_Name || "",
                        customerQuoteLineId: item.Customer_Quote_Line__c || "",
                        customerQuoteId: item.Customer_Quote__c || item.Customer_Quote_Line__r?.Customer_Quote__c || "",
                        proposedProduct: item.Proposed_Product_Name || "",
                        proposedProductId: item.Proposed_Product__c || "",
                        proposalId: item.Proposal__c || "",
                        productName: item.Product_Name || "",
                        productId: item.Product_Name__c || "",
                        description: item.Product_Description__c || "",
                        manufacturerDBA: item.Manufacturer_DBA__c || "",
                        brand: item.Brand_Name__c || "",
                        unitPrice: item.Unit_Price__c || 0,
                        creditQty: item.Credit_Qty__c || 0,
                        totalPrice: item.Total_Price__c || 0,
                        shipping: item.Shipping_Charges__c || 0,
                        taxes: item.Total_Taxes_Amount__c || 0,
                        grandTotal: item.Line_Grand_Total__c || 0,
                    })));
                }
            } catch (err) {
                console.error("Error fetching credit memo lines:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCreditMemoLines();
    }, [lineId, accountId, contactId]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<CreditMemoLine>(creditMemoLines, { key: 'lineName', direction: 'asc' });

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(creditMemoLines.length / ITEMS_PER_PAGE);

    const { widths, handleResize } = useResizableColumns({
        lineName: 160,
        status: 110,
        creditMemoName: 160,
        salesOrderLine: 150,
        customerQuoteLine: 200,
        proposedProduct: 180,
        productName: 150,
        description: 180,
        manufacturerDBA: 180,
        unitPrice: 110,
        creditQty: 120,
        totalPrice: 110,
        shipping: 110,
        taxes: 100,
        grandTotal: 180,
    });

    if (loading) {
        return <TableLoadingState />;
    }

    if (creditMemoLines.length === 0) {
        return (
            <TableEmptyState
                message="No records found"
                description="There is no credit memo associated with this invoice line."
            />
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800">
            <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-auto ">
                    <Table className="text-sm table-fixed">
                        <THead>
                            <tr>
                                <SortableHeader label="Credit Memo Line" field="lineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 top-0 z-20 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Credit Memo #" field="creditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditMemoName} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Proposed Product" field="proposedProduct" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposedProduct} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Credited Qty" field="creditQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditQty} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                                <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedData.map((item) => (
                                <Tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                                    {/* Sticky column — z-10, inherits row bg */}
                                    <Td className="text-left sticky left-0 bg-white dark:bg-gray-800 truncate">{displayCell(item.lineName)}</Td>
                                    <Td className="truncate">
                                        <StatusBadge status={item.status} variant="pill" />
                                    </Td>
                                    <Td className="truncate">{displayCell(item.creditMemoName)}</Td>
                                    <Td className="truncate">{displayCell(item.salesOrderLine)}</Td>
                                    <Td className="truncate">
                                        {item.customerQuoteId && item.customerQuoteLineId ? (
                                            <Link href={`/quotes/${item.customerQuoteId}/lines/${item.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                                                {displayCell(item.customerQuoteLine)}
                                            </Link>
                                        ) : item.customerQuoteId ? (
                                            <Link href={`/quotes/${item.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                                                {displayCell(item.customerQuoteLine)}
                                            </Link>
                                        ) : (
                                            displayCell(item.customerQuoteLine)
                                        )}
                                    </Td>
                                    <Td className="truncate">
                                        {item.proposedProductId ? (
                                            <Link href={`/proposals/${item.proposalId}/lines/${item.proposedProductId}`} target="_blank" className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                                                {displayCell(item.proposedProduct)}
                                            </Link>
                                        ) : (
                                            displayCell(item.proposedProduct)
                                        )}
                                    </Td>
                                    <Td className="truncate" title={item.productName}>
                                        {item.productId ? (
                                            <Link href={`/products/${item.productId}`} target="_blank" className="text-primary hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                                                {displayCell(item.productName)}
                                            </Link>
                                        ) : (
                                            displayCell(item.productName)
                                        )}
                                    </Td>
                                    <Td className="min-w-[180px] truncate" title={item.description}>{displayCell(item.description)}</Td>
                                    <Td className="truncate">{displayCell(item.brand)}</Td>
                                    <Td className="truncate">{formatCurrency(item.unitPrice)}</Td>
                                    <Td className="truncate">{formatNumber(item.creditQty)}</Td>
                                    <Td className="truncate font-bold">{formatCurrency(item.totalPrice)}</Td>
                                    <Td className="truncate">{formatCurrency(item.shipping)}</Td>
                                    <Td className="truncate">{formatCurrency(item.taxes)}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </div>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={creditMemoLines.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemName=""
            />
        </div>
    );
}
