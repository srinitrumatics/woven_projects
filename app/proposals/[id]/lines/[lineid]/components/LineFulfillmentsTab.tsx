import { FulfillmentData, FulfillmentTabType } from "../../../types";

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
                        {fulfillmentData.invoices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No invoices found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Invoice Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer PO</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill To Account</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Grand Total</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Open Balance</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Payment Terms</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Collection Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fulfillmentData.invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{invoice.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.customerPO}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.billToAccountName}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${invoice.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                ${invoice.openBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.paymentTerms}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.collectionStatus}</td>
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
                        {fulfillmentData.shippingManifests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No shipping manifests found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manifest Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship To Account</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Shipping Method</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tracking Number</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fulfillmentData.shippingManifests.map((manifest) => (
                                        <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{manifest.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {manifest.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{manifest.shipToAccountName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{manifest.shippingMethod}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{manifest.shipDate}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{manifest.trackingNumber || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${manifest.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
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
                        {fulfillmentData.salesOrders.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No sales orders found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Sales Order Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer PO</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill To Account</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship To Account</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Grand Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Request Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fulfillmentData.salesOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{order.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.customerPO}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.billToAccountName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.shipToAccountName}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${order.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.requestDate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{order.shipDate}</td>
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
                        {fulfillmentData.customerQuotes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-medium">No customer quotes found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-primary-light dark:bg-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Quote Number</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer PO</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill To Account</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Grand Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Issued Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Expiration Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fulfillmentData.customerQuotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{quote.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{quote.customerPO}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{quote.billToAccountName}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                                ${quote.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{quote.issuedDate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{quote.expirationDate}</td>
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
