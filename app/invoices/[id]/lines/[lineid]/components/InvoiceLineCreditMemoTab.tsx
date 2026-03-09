"use client";

import { useEffect, useState } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency } from "@/lib/utils/formatting";

interface CreditMemoLine {
    id: string;
    lineName: string;          // Credit Memo Line (Name)
    status: string;            // Status
    creditMemoName: string;    // Credit Memo
    invoiceLine: string;       // Invoice Line
    salesOrderLine: string;    // Sales Order Line
    customerQuoteLine: string; // Customer Quote Line
    productName: string;       // Product Name
    description: string;       // Product Description
    manufacturerDBA: string;   // Manufacturer DBA
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
                        invoiceLine: item.Invoice_Line_Name || "",
                        salesOrderLine: item.Sales_Order_Line_Name || "",
                        customerQuoteLine: item.Customer_Quote_Line_Name || "",
                        productName: item.Product_Name || "",
                        description: item.Product_Description__c || "",
                        manufacturerDBA: item.Manufacturer_DBA__c || "",
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

    const { items: sortedData, requestSort, sortConfig } = useSortableData<CreditMemoLine>(creditMemoLines);
    const { widths, handleResize } = useResizableColumns({
        lineName: 160,
        status: 110,
        creditMemoName: 160,
        invoiceLine: 140,
        salesOrderLine: 150,
        customerQuoteLine: 200,
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
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (creditMemoLines.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg">No records found</p>
                <p className="text-sm">There is no credit memo associated with this invoice line.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800">
            <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Credit Memo Line" field="lineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} className="sticky left-0 top-0 z-20 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Credit Memo" field="creditMemoName" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditMemoName} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Invoice Line" field="invoiceLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceLine} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Sales Order Line" field="salesOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderLine} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Credit Qty" field="creditQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.creditQty} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Line Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={handleResize} className="sticky top-0 z-10 bg-primary-light dark:bg-gray-900" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {sortedData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                {/* Sticky column — z-10, inherits row bg */}
                                <td className="px-3 py-2 text-sm text-left sticky left-0 bg-white dark:bg-gray-800 ">{item.lineName}</td>
                                <td className="px-3 py-2 text-sm">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.creditMemoName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.invoiceLine}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.salesOrderLine}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.customerQuoteLine}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.productName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[180px] truncate" title={item.description}>{item.description}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.manufacturerDBA}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate ">{formatCurrency(item.unitPrice)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{item.creditQty}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">{formatCurrency(item.totalPrice)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.shipping)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatCurrency(item.taxes)}</td>
                                <td className="px-3 py-2 text-sm truncate font-bold text-primary">{formatCurrency(item.grandTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
