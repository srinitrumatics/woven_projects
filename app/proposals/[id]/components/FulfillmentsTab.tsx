import { useMemo } from "react";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";

interface FulfillmentsTabProps {
    fulfillmentData: FulfillmentData;
    loading: boolean;
    activeTab: FulfillmentTabType;
    onTabChange: (tab: FulfillmentTabType) => void;
}

export default function FulfillmentsTab({
    fulfillmentData,
    loading,
    activeTab,
    onTabChange
}: FulfillmentsTabProps) {

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
                            <table className="w-full table-fixed min-w-[2200px]">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <SortableHeader label="Invoice" field="name" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={requestSort} className="w-[200px]" />
                                        <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={requestSort} className="w-[200px]" />
                                        <SortableHeader label="CPO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Collection Status" field="collectionStatus" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as Invoice[]).map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium" title={invoice.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{invoice.name}</div></td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={invoice.salesOrderLineName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{invoice.salesOrderLineName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={invoice.customerQuoteLineName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{invoice.customerQuoteLineName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={invoice.customerPO}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{invoice.customerPO}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={invoice.billToAccountName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{invoice.billToAccountName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={invoice.billToLocationName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{invoice.billToLocationName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={invoice.billToContactName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{invoice.billToContactName}</div></td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                    {invoice.totalLines}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${invoice.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${invoice.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${invoice.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) ?? '0.000'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                ${invoice.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{invoice.issuedDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{invoice.paymentTerms}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{invoice.dueDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{invoice.collectionStatus}</td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${invoice.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">{invoice.daysOutstanding}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{invoice.settledDate}</td>
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
                            <table className="w-full table-fixed min-w-[3200px]">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <SortableHeader label="Shipping Manifest" field="name" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="CPO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Logistics Partner" field="logisticsPartnerName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Logistics Contact" field="logisticsContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as ShippingManifest[]).map((manifest) => (
                                        <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium" title={manifest.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{manifest.name}</div></td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {manifest.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.salesOrderName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.salesOrderName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.customerQuoteName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.customerQuoteName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.customerOrderName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.customerOrderName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.customerPO}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.customerPO}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.shipToAccountName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.shipToAccountName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.shipToLocationName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.shipToLocationName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={manifest.shipToContactName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{manifest.shipToContactName}</div></td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${manifest.dropShip
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {manifest.dropShip ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">{manifest.boxCount}</td>
                                            <td className="px-4 py-3 text-right text-xs text-gray-900 dark:text-white">{manifest.boxNetWeight}</td>
                                            <td className="px-4 py-3 text-right text-xs text-gray-900 dark:text-white">{manifest.boxGrossWeight}</td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                    {manifest.totalLines}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                ${manifest.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{manifest.requestDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{manifest.shipDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{manifest.deliveredDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{manifest.shippingMethod}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{manifest.logisticsPartnerName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{manifest.logisticsContactName}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white">{manifest.trackingNumber || '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{manifest.estimatedDeliveryDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{manifest.trackingStatus}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{manifest.actualDeliveryDate}</td>
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
                            <table className="w-full table-fixed min-w-[3000px]">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <SortableHeader label="Sales Order" field="name" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="CPO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Pick Date" field="pickDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Pick Complete Date" field="pickCompleteDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as SalesOrder[]).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium" title={order.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{order.name}</div></td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.customerQuoteName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.customerQuoteName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.customerOrderName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.customerOrderName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.customerPO}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.customerPO}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.billToAccountName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.billToAccountName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.billToLocationName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.billToLocationName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.billToContactName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.billToContactName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.shipToAccountName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.shipToAccountName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.shipToLocationName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.shipToLocationName}</div></td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white" title={order.shipToContactName}><div className="text-xs text-gray-900 dark:text-white line-clamp-2">{order.shipToContactName}</div></td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${order.dropShip
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {order.dropShip ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                    {order.totalLines}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${order.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${order.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) ?? '0.000'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                ${order.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.requestDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.pickDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.pickCompleteDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.shipDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.deliveredDate}</td>
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
                            <table className="w-full table-fixed min-w-[3000px]">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <SortableHeader label="Customer Quote" field="name" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="CPO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} className="w-[180px]" />
                                        <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} className="w-[100px]" />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} className="w-[120px]" />
                                        <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Issue Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                        <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} className="w-[150px]" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(sortedData as CustomerQuote[]).map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white font-medium" title={quote.name}><div className="text-xs font-medium font-mono text-gray-900 dark:text-white line-clamp-2">{quote.name}</div></td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.customerOrderName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.customerPO}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.billToAccountName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.billToLocationName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.billToContactName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.shipToAccountName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.shipToLocationName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{quote.shipToContactName}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${quote.dropShip
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {quote.dropShip ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-900 dark:text-white">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                                    {quote.totalLines}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${quote.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${quote.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white">
                                                ${quote.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) ?? '0.000'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-right text-gray-900 dark:text-white font-semibold">
                                                ${quote.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{quote.issuedDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{quote.expirationDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{quote.requestDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{quote.shipDate}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{quote.deliveredDate}</td>
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
