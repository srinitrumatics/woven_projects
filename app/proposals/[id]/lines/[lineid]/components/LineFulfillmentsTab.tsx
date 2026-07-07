import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../../../types";
import { formatNumber, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";
import Pagination from "../../../../../../components/ui/Pagination";

const ITEMS_PER_PAGE = 10;

interface LineFulfillmentsTabProps {
    fulfillmentData: FulfillmentData;
    loading: boolean;
    activeTab: FulfillmentTabType;
    onTabChange: (tab: FulfillmentTabType) => void;
}

export default function LineFulfillmentsTab({
    fulfillmentData,
    loading,
    activeTab,
    onTabChange
}: LineFulfillmentsTabProps) {

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const activeData = useMemo(() => {
        switch (activeTab) {
            case "quotes": return fulfillmentData.customerQuotes;
            case "sales": return fulfillmentData.salesOrders;
            case "invoices": return fulfillmentData.invoices;
            case "shipping": return fulfillmentData.shippingManifests;
            default: return [];
        }
    }, [activeTab, fulfillmentData]);

    const { items: sortedData, requestSort: originalRequestSort, sortConfig } = useSortableData<Invoice | ShippingManifest | SalesOrder | CustomerQuote>(activeData, { key: 'name', direction: 'asc' });

    const requestSort = (key: string) => {
        originalRequestSort(key as any);
        setCurrentPage(1);
    };

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);

    const { widths: invoiceWidths, handleResize: handleInvoiceResize } = useResizableColumns({
        name: 180,
        status: 120,
        invoiceName: 180,
        salesOrderLineName: 180,
        customerQuoteLineName: 180,
        purchaseOrderLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 180,
        unitPrice: 120,
        totalOrderQty: 180,
        totalPrice: 180,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 150,
        action: 80
    });

    const { widths: shippingWidths, handleResize: handleShippingResize } = useResizableColumns({
        name: 190,
        status: 120,
        shippingManifestName: 190,
        salesOrderLineName: 180,
        customerQuoteLineName: 190,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 180,
        unitPrice: 120,
        totalOrderQty: 180,
        totalPrice: 180,
        qtyShipped: 180,
        boxCount: 130,
        boxLength: 130,
        boxWidth: 120,
        boxHeight: 120,
        boxNetWeight: 160,
        boxGrossWeight: 160,
        action: 80
    });

    const { widths: salesWidths, handleResize: handleSalesResize } = useResizableColumns({
        name: 180,
        status: 120,
        salesOrderName: 180,
        customerQuoteLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 180,
        unitPrice: 120,
        totalOrderQty: 180,
        totalPrice: 120,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 180,
        qtyShipped: 180
    });

    const { widths: quoteWidths, handleResize: handleQuoteResize } = useResizableColumns({
        name: 180,
        status: 120,
        customerQuoteName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 180,
        unitPrice: 120,
        totalOrderQty: 180,
        totalPrice: 120,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 150,
        qtyShipped: 180,
        action: 80
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center py-12 min-w-0">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div>
                {/* Sub-tabs */}
                <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-gray-700">
                    {[
                        { id: "quotes", label: "Customer Quotes Lines", count: fulfillmentData.customerQuotes.length },
                        { id: "sales", label: "Sales Orders Lines", count: fulfillmentData.salesOrders.length },
                        { id: "shipping", label: "Shipping Manifests Lines", count: fulfillmentData.shippingManifests.length },
                        { id: "invoices", label: "Invoices Lines", count: fulfillmentData.invoices.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as any)}
                            className={`pb-3 text-sm font-medium transition-all truncate border-b-2 -mb-[2px] ${activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>

                {/* Customer Quotes Table */}
                {activeTab === "quotes" && (
                    <div>
                        <div className="overflow-x-auto">
                            {sortedData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                    <p className="text-lg font-medium" title="No records found">No records found</p>
                                    <p className="text-sm" title="There are no customer quotes associated with this proposal.">There are no customer quotes associated with this proposal.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full table-fixed">
                                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <SortableHeader
                                                    label="Customer Quote Line"
                                                    field="name"
                                                    sortConfig={sortConfig}
                                                    requestSort={requestSort}
                                                    width={quoteWidths.name}
                                                    onResize={handleQuoteResize}
                                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                   
                                                />
                                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.status} onResize={handleQuoteResize} />
                                                <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.customerQuoteName} onResize={handleQuoteResize} />
                                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.productName} onResize={handleQuoteResize} />
                                                <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.productDescription} onResize={handleQuoteResize} />
                                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.manufacturerDBA} onResize={handleQuoteResize} />
                                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.unitPrice} onResize={handleQuoteResize} />
                                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.totalOrderQty} onResize={handleQuoteResize} />
                                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.totalPrice} onResize={handleQuoteResize} />
                                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.shipping} onResize={handleQuoteResize} />
                                                <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.taxes} onResize={handleQuoteResize} />
                                                <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.lineGrandTotal} onResize={handleQuoteResize} />
                                                <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.qtyShipped} onResize={handleQuoteResize} />
                                                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: quoteWidths.action }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {(paginatedData as CustomerQuote[]).map((quote) => (
                                                <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate">
                                                        {quote.customerQuoteId ? (
                                                            <Link href={`/quotes/${quote.customerQuoteId}/lines/${quote.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={quote.name}>{displayCell(quote.name)}</Link>
                                                        ) : displayCell(quote.name)}
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 truncate">
                                                            {quote.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {quote.customerQuoteName && quote.customerQuoteId ? (
                                                            <Link href={`/quotes/${quote.customerQuoteId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={quote.customerQuoteName}>{quote.customerQuoteName}</Link>
                                                        ) : (
                                                            <div className="truncate" title={quote.customerQuoteName}>{quote.customerQuoteName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(quote.productName)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={quote.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{displayCell(quote.productDescription)}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[163px] truncate">{displayCell(quote.brand)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${quote.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[154px] truncate">{formatNumber(quote.totalOrderQty)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${quote.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${quote.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${quote.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-primary font-bold truncate">
                                                        ${quote.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[121px] truncate">{formatNumber(quote.qtyShipped)}</td>
                                                    <td className="px-3 py-2 text-left truncate">
                                                        {quote.customerQuoteId && (
                                                            <Link href={`/quotes/${quote.customerQuoteId}/lines/${quote.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors inline-block">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </>
                            )}
                        </div>
                        <div className="px-3 py-2 ">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={activeData.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemName="records"
                            />
                        </div>
                    </div>
                )}

                {/* Sales Orders Table */}
                {activeTab === "sales" && (
                    <div>
                        <div className="overflow-x-auto">
                            {sortedData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                    <p className="text-lg font-medium" title="No records found">No records found</p>
                                    <p className="text-sm" title="There are no sales orders associated with this proposal.">There are no sales orders associated with this proposal.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full table-fixed">
                                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <SortableHeader
                                                    label="Sales Order Line"
                                                    field="name"
                                                    sortConfig={sortConfig}
                                                    requestSort={requestSort}
                                                    width={salesWidths.name}
                                                    onResize={handleSalesResize}
                                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                   
                                                />
                                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.status} onResize={handleSalesResize} />
                                                <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.salesOrderName} onResize={handleSalesResize} />
                                                <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.customerQuoteLineName} onResize={handleSalesResize} />
                                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.productName} onResize={handleSalesResize} />
                                                <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.productDescription} onResize={handleSalesResize} />
                                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.manufacturerDBA} onResize={handleSalesResize} />
                                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.unitPrice} onResize={handleSalesResize} />
                                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.totalOrderQty} onResize={handleSalesResize} />
                                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.totalPrice} onResize={handleSalesResize} />
                                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.shipping} onResize={handleSalesResize} />
                                                <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.taxes} onResize={handleSalesResize} />
                                                <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.lineGrandTotal} onResize={handleSalesResize} />
                                                <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.qtyShipped} onResize={handleSalesResize} />
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {(paginatedData as SalesOrder[]).map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate">{displayCell(order.name)}</td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 truncate">
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {order.salesOrderName && order.salesOrderId ? (
                                                            <Link href={`/orders/${order.salesOrderId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={order.salesOrderName}>
                                                                {order.salesOrderName}
                                                            </Link>
                                                        ) : (
                                                            <div className="truncate" title={order.salesOrderName}>{order.salesOrderName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {order.customerQuoteLineName && order.customerQuoteLineId ? (
                                                            <Link href={`/quotes/${order.customerQuoteLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={order.customerQuoteLineName}>{order.customerQuoteLineName}</Link>
                                                        ) : (
                                                            <div className="truncate" title={order.customerQuoteLineName}>{order.customerQuoteLineName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(order.productName)}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={order.productDescription}>
                                                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{displayCell(order.productDescription)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[163px] truncate">{displayCell(order.brand)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${order.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[161px] truncate">{formatNumber(order.totalOrderQty)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${order.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${order.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-primary font-bold truncate">
                                                        ${order.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[123px] truncate">{formatNumber(order.qtyShipped)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </>
                            )}
                        </div>
                        <div className="px-3 py-2">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={activeData.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemName=""
                            />
                        </div>
                    </div>
                )}

                {/* Invoices Table */}
                {activeTab === "invoices" && (
                    <div>
                        <div className="overflow-x-auto">
                            {sortedData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                    <p className="text-lg font-medium" title="No records found">No records found</p>
                                    <p className="text-sm" title="There are no invoices associated with this proposal.">There are no invoices associated with this proposal.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full table-fixed">
                                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <SortableHeader
                                                    label="Invoice Line"
                                                    field="name"
                                                    sortConfig={sortConfig}
                                                    requestSort={requestSort}
                                                    width={invoiceWidths.name}
                                                    onResize={handleInvoiceResize}
                                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                   
                                                />
                                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.status} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Invoice #" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.invoiceName} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.salesOrderLineName} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.purchaseOrderLineName} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.customerQuoteLineName} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.productName} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.productDescription} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.manufacturerDBA} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.unitPrice} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.totalOrderQty} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.totalPrice} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.shipping} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.taxes} onResize={handleInvoiceResize} />
                                                <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.lineGrandTotal} onResize={handleInvoiceResize} />
                                                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: invoiceWidths.action }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {(paginatedData as Invoice[]).map((invoice) => (
                                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate">
                                                        {invoice.invoiceId ? (
                                                            <Link href={`/invoices/${invoice.invoiceId}/lines/${invoice.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={invoice.name}>{displayCell(invoice.name)}</Link>
                                                        ) : <div className="truncate" title={invoice.name}>{displayCell(invoice.name)}</div>}
                                                    </td>
                                                    <td className="px-3 py-2 text-left truncate">
                                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 truncate">
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">

                                                        {invoice.invoiceName && invoice.invoiceId ? (
                                                            <Link href={`/invoices/${invoice.invoiceId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={invoice.invoiceName}>{invoice.invoiceName}</Link>
                                                        ) : (
                                                            <div className="truncate" title={invoice.invoiceName}>{invoice.invoiceName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {invoice.salesOrderLineName && invoice.salesOrderLineId ? (
                                                            <Link href={`/orders/${invoice.salesOrderLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={invoice.salesOrderLineName}>{invoice.salesOrderLineName}</Link>
                                                        ) : (
                                                            <div className="truncate" title={invoice.salesOrderLineName}>{invoice.salesOrderLineName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {invoice.purchaseOrderLineName && invoice.purchaseOrderLineId ? (
                                                            <Link href={`/purchase-orders/${invoice.purchaseOrderLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={invoice.purchaseOrderLineName}>{invoice.purchaseOrderLineName}</Link>
                                                        ) : (
                                                            <div className="truncate" title={invoice.purchaseOrderLineName}>{invoice.purchaseOrderLineName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        {invoice.customerQuoteLineName && invoice.customerQuoteLineId ? (
                                                            <Link href={`/quotes/${invoice.customerQuoteLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate" title={invoice.customerQuoteLineName}>{invoice.customerQuoteLineName}</Link>
                                                        ) : (
                                                            <div className="truncate" title={invoice.customerQuoteLineName}>{invoice.customerQuoteLineName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="truncate" title={invoice.productName}>{displayCell(invoice.productName)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                        <div className="max-w-xs truncate" title={invoice.productDescription}>{displayCell(invoice.productDescription)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left min-w-[159px] truncate">
                                                        <div className="truncate" title={invoice.brand}>{displayCell(invoice.brand)}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${invoice.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[121px] truncate">{formatNumber(invoice.totalOrderQty)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${invoice.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${invoice.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">
                                                        ${invoice.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-primary font-bold truncate">
                                                        ${invoice.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-left truncate">
                                                        {invoice.invoiceId && (
                                                            <Link href={`/invoices/${invoice.invoiceId}/lines/${invoice.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors inline-block">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </>
                            )}
                        </div>
                        <div className="px-3 py-2">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={activeData.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemName=""
                            />
                        </div>
                    </div>
                )}

                {/* Shipping Manifests Table */}
                {activeTab === "shipping" && (
                    <div>
                        <div className="overflow-x-auto">
                            {sortedData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                                    <p className="text-lg font-medium" title="No records found">No records found</p>
                                    <p className="text-sm" title="There are no shipping manifests associated with this proposal.">There are no shipping manifests associated with this proposal.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full table-fixed">
                                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <SortableHeader
                                                    label="Shipping Manifest Line"
                                                    field="name"
                                                    sortConfig={sortConfig}
                                                    requestSort={requestSort}
                                                    width={shippingWidths.name}
                                                    onResize={handleShippingResize}
                                                    className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10"
                                                   
                                                />
                                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.status} onResize={handleShippingResize} />
                                                <SortableHeader label="Shipping Manifest #" field="shippingManifestName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.shippingManifestName} onResize={handleShippingResize} />
                                                <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.salesOrderLineName} onResize={handleShippingResize} />
                                                <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.customerQuoteLineName} onResize={handleShippingResize} />
                                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.productName} onResize={handleShippingResize} />
                                                <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.productDescription} onResize={handleShippingResize} />
                                                <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.manufacturerDBA} onResize={handleShippingResize} />
                                                <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.unitPrice} onResize={handleShippingResize} />
                                                <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.totalOrderQty} onResize={handleShippingResize} />
                                                <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.totalPrice} onResize={handleShippingResize} />
                                                <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.qtyShipped} onResize={handleShippingResize} />
                                                <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxCount} onResize={handleShippingResize} />
                                                <SortableHeader label="Box Length" field="boxLength" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxLength} onResize={handleShippingResize} />
                                                <SortableHeader label="Box Width" field="boxWidth" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxWidth} onResize={handleShippingResize} />
                                                <SortableHeader label="Box Height" field="boxHeight" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxHeight} onResize={handleShippingResize} />
                                                <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxNetWeight} onResize={handleShippingResize} />
                                                <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxGrossWeight} onResize={handleShippingResize} />
                                                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: shippingWidths.action }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {(paginatedData as ShippingManifest[]).map((manifest) => (
                                                <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left min-w-[198px] truncate" title={manifest.name}>
                                                        {manifest.shippingManifestId ? (
                                                            <Link href={`/shipments/${manifest.shippingManifestId}/lines/${manifest.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{displayCell(manifest.name)}</Link>
                                                        ) : <div className="text-sm font-medium  text-gray-900 dark:text-white truncate">{displayCell(manifest.name)}</div>}
                                                    </td>
                                                    <td className="px-3 py-2 truncate">
                                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 truncate">
                                                            {manifest.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shippingManifestName}>
                                                        <div className="text-sm text-gray-900 dark:text-white truncate">
                                                            {manifest.shippingManifestName && manifest.shippingManifestId ? (
                                                                <Link href={`/shipments/${manifest.shippingManifestId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{manifest.shippingManifestName}</Link>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 dark:text-white truncate">
                                                                    {manifest.shippingManifestName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.salesOrderLineName}>
                                                        <div className="text-sm text-gray-900 dark:text-white truncate">{manifest.salesOrderLineName}</div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.customerQuoteLineName}>
                                                        {manifest.customerQuoteLineName && manifest.customerQuoteLineId ? (
                                                            <Link href={`/quotes/${manifest.customerQuoteLineId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate">{manifest.customerQuoteLineName}</Link>
                                                        ) : (
                                                            <div className="text-sm text-gray-900 dark:text-white truncate">{manifest.customerQuoteLineName}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.productName}><div className="text-sm text-gray-900 dark:text-white truncate">{displayCell(manifest.productName)}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={manifest.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{displayCell(manifest.productDescription)}</div></td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px] truncate" title={manifest.brand}>
                                                        <div
                                                            className="text-sm text-gray-900 dark:text-white truncate">{displayCell(manifest.brand)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium truncate">
                                                        ${manifest.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[160px] truncate">{formatNumber(manifest.totalOrderQty)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold truncate">
                                                        ${manifest.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[124px] truncate">{formatNumber(manifest.qtyShipped)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[118px] truncate">{formatNumber(manifest.boxCount)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxLength ?? ''))}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxWidth ?? ''))}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxHeight ?? ''))}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[140px] truncate">{formatNumber(manifest.boxNetWeight)}</td>
                                                    <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[162px] truncate">{formatNumber(manifest.boxGrossWeight)}</td>
                                                    <td className="px-3 py-2 text-left truncate">
                                                        {manifest.shippingManifestId && (
                                                            <Link href={`/shipments/${manifest.shippingManifestId}/lines/${manifest.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors inline-block">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                        <div className="px-3 py-2">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={activeData.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemName=""
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
