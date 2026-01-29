import { useMemo } from "react";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../../../types";
import { SortableHeader } from "../../../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../../../hooks/useSortableData";

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
            case "invoices": return fulfillmentData.invoices;
            case "shipping": return fulfillmentData.shippingManifests;
            case "sales": return fulfillmentData.salesOrders;
            case "quotes": return fulfillmentData.customerQuotes;
            default: return [];
        }
    }, [activeTab, fulfillmentData]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<Invoice | ShippingManifest | SalesOrder | CustomerQuote>(activeData);

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
        <div className="p-6">
            <div>
                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
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
                        onClick={() => onTabChange("quotes")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "quotes"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Customer Quotes ({fulfillmentData.customerQuotes.length})
                    </button>
                </div>

                {/* Invoices Table */}
                {activeTab === "invoices" && (
                    <div className="overflow-x-auto">
                        {sortedData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No invoices found</p>
                            </div>
                        ) : (
                            <table className="w-full min-w-[1800px] table-fixed">
                                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white sticky left-0 bg-primary-light dark:bg-gray-900 z-10 w-[180px]">
                                            <div className="flex items-center justify-start cursor-pointer" onClick={() => requestSort('name')}>
                                                Invoice
                                                {sortConfig?.key === 'name' && (
                                                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Purchase Order Line" field="purchaseOrderLineName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} className="w-[250px]" />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Invoice Qty" field="invoiceQty" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as Invoice[]).map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">
                                                <div className="line-clamp-2" title={invoice.name}>{invoice.name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.invoiceName}>{invoice.invoiceName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.salesOrderLineName}>{invoice.salesOrderLineName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.customerQuoteLineName}>{invoice.customerQuoteLineName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.purchaseOrderLineName}>{invoice.purchaseOrderLineName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="line-clamp-2" title={invoice.productName}>{invoice.productName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="max-w-xs line-clamp-2" title={invoice.productDescription}>{invoice.productDescription}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                                <div className="line-clamp-2" title={invoice.manufacturerDBA}>{invoice.manufacturerDBA}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                ${invoice.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{invoice.invoiceQty}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${invoice.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${invoice.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${invoice.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-primary font-bold">
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
                            <table className="w-full min-w-[2400px]">
                                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white sticky left-0 bg-primary-light dark:bg-gray-900 z-10">
                                            <div className="flex items-center justify-start cursor-pointer" onClick={() => requestSort('name')}>
                                                Shipping Manifest Line
                                                {sortConfig?.key === 'name' && (
                                                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Shipping Manifest" field="shippingManifestName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as ShippingManifest[]).map((manifest) => (
                                        <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center" title={manifest.name}><div className="text-sm font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{manifest.name}</div></td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {manifest.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={manifest.shippingManifestName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.shippingManifestName}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={manifest.salesOrderLineName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.salesOrderLineName}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={manifest.customerQuoteLineName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.customerQuoteLineName}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={manifest.productName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.productName}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs" title={manifest.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{manifest.productDescription}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" title={manifest.manufacturerDBA}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{manifest.manufacturerDBA}</div></td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{manifest.boxCount}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{manifest.boxNetWeight}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{manifest.boxGrossWeight}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                ${manifest.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{manifest.totalOrderQty}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${manifest.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{manifest.qtyShipped}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{manifest.trackingNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{manifest.estimatedDeliveryDate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{manifest.trackingStatus}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{manifest.actualDeliveryDate}</td>
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
                            <table className="w-full min-w-[2200px]">
                                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white sticky left-0 bg-primary-light dark:bg-gray-900 z-10">
                                            <div className="flex items-center justify-start cursor-pointer" onClick={() => requestSort('name')}>
                                                Sales Order Line
                                                {sortConfig?.key === 'name' && (
                                                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Qty Picked" field="qtyPicked" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Back Order Qty" field="backOrderQty" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as SalesOrder[]).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">{order.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.salesOrderName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.customerQuoteLineName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.productName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs" title={order.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{order.productDescription}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.manufacturerDBA}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                ${order.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{order.totalOrderQty}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${order.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${order.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-primary font-bold">
                                                ${order.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{order.qtyPicked}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{order.backOrderQty}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{order.qtyShipped}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Customer Quotes Table */}
                {activeTab === "quotes" && (
                    <div className="overflow-x-auto">
                        {sortedData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No customer quotes found</p>
                            </div>
                        ) : (
                            <table className="w-full min-w-[2000px]">
                                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white sticky left-0 bg-primary-light dark:bg-gray-900 z-10">
                                            <div className="flex items-center justify-start cursor-pointer" onClick={() => requestSort('name')}>
                                                Customer Quote Line
                                                {sortConfig?.key === 'name' && (
                                                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Line Grand Total" field="lineGrandTotal" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as CustomerQuote[]).map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-center">{quote.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{quote.customerQuoteName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{quote.productName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs" title={quote.productDescription}><div className="text-sm text-gray-900 dark:text-white max-w-xs line-clamp-2">{quote.productDescription}</div></td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{quote.manufacturerDBA}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-mono">
                                                ${quote.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{quote.totalOrderQty}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${quote.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${quote.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${quote.taxes?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || '0.000'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-primary font-bold">
                                                ${quote.lineGrandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{quote.qtyShipped}</td>
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
