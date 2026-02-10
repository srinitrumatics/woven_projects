import { useMemo } from "react";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../../../types";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";
import { useResizableColumns } from "../../../../../../hooks/useResizableColumns";

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

    const activeData = useMemo(() => {
        switch (activeTab) {
            case "quotes": return fulfillmentData.customerQuotes;
            case "sales": return fulfillmentData.salesOrders;
            case "invoices": return fulfillmentData.invoices;
            case "shipping": return fulfillmentData.shippingManifests;
            default: return [];
        }
    }, [activeTab, fulfillmentData]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<Invoice | ShippingManifest | SalesOrder | CustomerQuote>(activeData);

    const { widths: invoiceWidths, handleResize: handleInvoiceResize } = useResizableColumns({
        name: 180,
        status: 120,
        invoiceName: 180,
        salesOrderLineName: 180,
        customerQuoteLineName: 180,
        purchaseOrderLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 150,
        unitPrice: 120,
        invoiceQty: 100,
        totalPrice: 120,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 150
    });

    const { widths: shippingWidths, handleResize: handleShippingResize } = useResizableColumns({
        name: 180,
        status: 120,
        shippingManifestName: 180,
        salesOrderLineName: 180,
        customerQuoteLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 150,
        boxCount: 100,
        boxNetWeight: 120,
        boxGrossWeight: 120,
        unitPrice: 120,
        totalOrderQty: 100,
        totalPrice: 120,
        qtyShipped: 100,
        trackingNumber: 180,
        estimatedDeliveryDate: 150,
        trackingStatus: 150,
        actualDeliveryDate: 150
    });

    const { widths: salesWidths, handleResize: handleSalesResize } = useResizableColumns({
        name: 180,
        status: 120,
        salesOrderName: 180,
        customerQuoteLineName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 150,
        unitPrice: 120,
        totalOrderQty: 100,
        totalPrice: 120,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 150,
        qtyPicked: 100,
        backOrderQty: 100,
        qtyShipped: 100
    });

    const { widths: quoteWidths, handleResize: handleQuoteResize } = useResizableColumns({
        name: 180,
        status: 120,
        customerQuoteName: 180,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 150,
        unitPrice: 120,
        totalOrderQty: 100,
        totalPrice: 120,
        shipping: 120,
        taxes: 120,
        lineGrandTotal: 150,
        qtyShipped: 100
    });

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div>
                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => onTabChange("quotes")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "quotes"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Customer Quotes ({fulfillmentData.customerQuotes.length})
                    </button>
                    <button
                        onClick={() => onTabChange("sales")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "sales"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Sales Orders ({fulfillmentData.salesOrders.length})
                    </button>
                    <button
                        onClick={() => onTabChange("invoices")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "invoices"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Invoices ({fulfillmentData.invoices.length})
                    </button>
                    <button
                        onClick={() => onTabChange("shipping")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "shipping"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Shipping Manifests ({fulfillmentData.shippingManifests.length})
                    </button>
                </div>

                {/* Customer Quotes Table */}
                {activeTab === "quotes" && (
                    <div className="overflow-x-auto">
                        {sortedData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No customer quotes found</p>
                            </div>
                        ) : (
                            <table className="w-full">
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
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.customerQuoteName} onResize={handleQuoteResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.productName} onResize={handleQuoteResize} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.productDescription} onResize={handleQuoteResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.manufacturerDBA} onResize={handleQuoteResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.unitPrice} onResize={handleQuoteResize} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.totalOrderQty} onResize={handleQuoteResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.totalPrice} onResize={handleQuoteResize} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.taxes} onResize={handleQuoteResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.shipping} onResize={handleQuoteResize} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.lineGrandTotal} onResize={handleQuoteResize} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={quoteWidths.qtyShipped} onResize={handleQuoteResize} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as CustomerQuote[]).map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">{quote.name}</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{quote.customerQuoteName}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{quote.productName}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs" title={quote.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{quote.productDescription}</div></td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[163px]">{quote.manufacturerDBA}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                ${quote.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[154px]">{quote.totalOrderQty}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                ${quote.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                                ${quote.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                                ${quote.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-primary font-bold">
                                                ${quote.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[121px]">{quote.qtyShipped}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Sales Orders Table */}
                {activeTab === "sales" && (
                    <div className="overflow-x-auto">
                        {sortedData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No sales orders found</p>
                            </div>
                        ) : (
                            <table className="w-full ">
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
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.salesOrderName} onResize={handleSalesResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.customerQuoteLineName} onResize={handleSalesResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.productName} onResize={handleSalesResize} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.productDescription} onResize={handleSalesResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.manufacturerDBA} onResize={handleSalesResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.unitPrice} onResize={handleSalesResize} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.totalOrderQty} onResize={handleSalesResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.totalPrice} onResize={handleSalesResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.shipping} onResize={handleSalesResize} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.taxes} onResize={handleSalesResize} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.lineGrandTotal} onResize={handleSalesResize} />
                                        <SortableHeader label="Qty Picked" field="qtyPicked" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.qtyPicked} onResize={handleSalesResize} />
                                        <SortableHeader label="Back Order Qty" field="backOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.backOrderQty} onResize={handleSalesResize} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={salesWidths.qtyShipped} onResize={handleSalesResize} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as SalesOrder[]).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">{order.name}</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{order.salesOrderName}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{order.customerQuoteLineName}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{order.productName}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs" title={order.productDescription}>
                                                <div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{order.productDescription}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[163px]">{order.manufacturerDBA}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                ${order.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[161px]">{order.totalOrderQty}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                ${order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                                ${order.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                                ${order.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-primary font-bold">
                                                ${order.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[114px]">{order.qtyPicked}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[149px]">{order.backOrderQty}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[123px]">{order.qtyShipped}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Invoices Table */}
                {activeTab === "invoices" && (
                    <div className="overflow-x-auto">
                        {sortedData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No invoices found</p>
                            </div>
                        ) : (
                            <table className="w-full">
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
                                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.invoiceName} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.salesOrderLineName} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.customerQuoteLineName} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.purchaseOrderLineName} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.productName} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.productDescription} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.manufacturerDBA} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.unitPrice} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Invoice Qty" field="invoiceQty" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.invoiceQty} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.totalPrice} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.taxes} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.shipping} onResize={handleInvoiceResize} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} width={invoiceWidths.lineGrandTotal} onResize={handleInvoiceResize} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as Invoice[]).map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left">
                                                <div className="line-clamp-2" title={invoice.name}>{invoice.name}</div>
                                            </td>
                                            <td className="px-3 py-2 text-left">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.invoiceName}>{invoice.invoiceName}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.salesOrderLineName}>{invoice.salesOrderLineName}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.customerQuoteLineName}>{invoice.customerQuoteLineName}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.purchaseOrderLineName}>{invoice.purchaseOrderLineName}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.productName}>{invoice.productName}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                <div className="max-w-xs line-clamp-2" title={invoice.productDescription}>{invoice.productDescription}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-left min-w-[159px]">
                                                <div className="line-clamp-2" title={invoice.manufacturerDBA}>{invoice.manufacturerDBA}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                ${invoice.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[121px]">{invoice.invoiceQty}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                ${invoice.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                                ${invoice.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white">
                                                ${invoice.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-primary font-bold">
                                                ${invoice.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Shipping Manifests Table */}
                {activeTab === "shipping" && (
                    <div className="overflow-x-auto">
                        {sortedData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No shipping manifests found</p>
                            </div>
                        ) : (
                            <table className="w-full ">
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
                                        <SortableHeader label="Shipping Manifest" field="shippingManifestName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.shippingManifestName} onResize={handleShippingResize} />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.salesOrderLineName} onResize={handleShippingResize} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.customerQuoteLineName} onResize={handleShippingResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.productName} onResize={handleShippingResize} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.productDescription} onResize={handleShippingResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.manufacturerDBA} onResize={handleShippingResize} />
                                        <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxCount} onResize={handleShippingResize} />
                                        <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxNetWeight} onResize={handleShippingResize} />
                                        <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.boxGrossWeight} onResize={handleShippingResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.unitPrice} onResize={handleShippingResize} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.totalOrderQty} onResize={handleShippingResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.totalPrice} onResize={handleShippingResize} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.qtyShipped} onResize={handleShippingResize} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.trackingNumber} onResize={handleShippingResize} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.estimatedDeliveryDate} onResize={handleShippingResize} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.trackingStatus} onResize={handleShippingResize} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={shippingWidths.actualDeliveryDate} onResize={handleShippingResize} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as ShippingManifest[]).map((manifest) => (
                                        <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left min-w-[198px]" title={manifest.name}>
                                                <div className="text-sm font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{manifest.name}</div></td>
                                            <td className="px-3 py-2">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {manifest.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={manifest.shippingManifestName}>
                                                <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                                    {manifest.shippingManifestName}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={manifest.salesOrderLineName}>
                                                <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                                    {manifest.salesOrderLineName}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={manifest.customerQuoteLineName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.customerQuoteLineName}</div></td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={manifest.productName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.productName}</div></td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs" title={manifest.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{manifest.productDescription}</div></td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[167px]" title={manifest.manufacturerDBA}>
                                                <div
                                                    className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.manufacturerDBA}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[118px]">{manifest.boxCount}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[140px]">{manifest.boxNetWeight}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[162px]">{manifest.boxGrossWeight}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-medium">
                                                ${manifest.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[160px]">{manifest.totalOrderQty}</td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white font-semibold">
                                                ${manifest.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-3 py-2 text-sm  text-gray-900 dark:text-white min-w-[124px]">{manifest.qtyShipped}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium ">{manifest.trackingNumber}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[205px]">{manifest.estimatedDeliveryDate}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{manifest.trackingStatus}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[178px]">{manifest.actualDeliveryDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
}
