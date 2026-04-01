import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "../../../../components/ui/Pagination";

const ITEMS_PER_PAGE = 10;

interface FulfillmentsTabProps {
    fulfillmentData: FulfillmentData;
    loading: boolean;
    activeTab: FulfillmentTabType;
    onTabChange: (tab: FulfillmentTabType) => void;
    widths: Record<string, any>; // Record of records for each sub-tab
    onResize: (tab: string, field: string, width: number) => void;
}

export default function FulfillmentsTab({
    fulfillmentData,
    loading,
    activeTab,
    onTabChange,
    widths,
    onResize
}: FulfillmentsTabProps) {
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

    const { items: sortedData, requestSort: originalRequestSort, sortConfig } = useSortableData<Invoice | ShippingManifest | SalesOrder | CustomerQuote>(activeData);

    const requestSort = (key: string) => {
        originalRequestSort(key as any);
        setCurrentPage(1);
    };

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center py-12 min-w-0">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 h-full flex flex-col">
            {/* Sub-tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => onTabChange("quotes")}
                        className={`truncate py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "quotes"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Customer Quotes {fulfillmentData.customerQuotes.length > 0 && `(${fulfillmentData.customerQuotes.length})`}
                    </button>
                    <button
                        onClick={() => onTabChange("sales")}
                        className={`truncate py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "sales"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Sales Orders {fulfillmentData.salesOrders.length > 0 && `(${fulfillmentData.salesOrders.length})`}
                    </button>
                    <button
                        onClick={() => onTabChange("invoices")}
                        className={`truncate py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "invoices"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Invoices {fulfillmentData.invoices.length > 0 && `(${fulfillmentData.invoices.length})`}
                    </button>
                    <button
                        onClick={() => onTabChange("shipping")}
                        className={`truncate py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "shipping"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Shipping Manifests {fulfillmentData.shippingManifests.length > 0 && `(${fulfillmentData.shippingManifests.length})`}
                    </button>
                </nav>
            </div>

            <div className="flex-1 min-h-0">
                {/* Customer Quotes Table */}
                {activeTab === "quotes" && (
                    sortedData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Customer Quotes associated with this proposal.">There are no Customer Quotes associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Customer Quote" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.name} onResize={(f, w) => onResize('quotes', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.status} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.customerOrderName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.customerPO} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.billToAccountName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.billToLocationName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.billToContactName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.shipToAccountName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.shipToLocationName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.shipToContactName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.dropShip} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.totalLines} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.totalPrice} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.totalShippingCharges} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.totalTaxesAmount} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.grandTotal} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Issue Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.issuedDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.expirationDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.requestDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.shipDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.deliveredDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as CustomerQuote[]).map((quote) => (
                                            <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={quote.name}>
                                                    {quote.name}
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {quote.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {quote.customerOrderName && quote.customerOrderId ? (
                                                        <Link
                                                            href={`/orders/${quote.customerOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={quote.customerOrderName}
                                                        >
                                                            {quote.customerOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.customerOrderName}>{quote.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {quote.customerPO && quote.purchaseOrderId ? (
                                                        <Link
                                                            href={`/purchase-orders/${quote.purchaseOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={quote.customerPO}
                                                        >
                                                            {quote.customerPO}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.customerPO}>{quote.customerPO}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.billToAccountName}>{quote.billToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.billToLocationName}>{quote.billToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.billToContactName}>{quote.billToContactName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.shipToAccountName}>{quote.shipToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.shipToLocationName}>{quote.shipToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.shipToContactName}>{quote.shipToContactName}</td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${quote.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {quote.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {quote.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${quote.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${quote.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${quote.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${quote.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{quote.issuedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{quote.expirationDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{quote.requestDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{quote.shipDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{quote.deliveredDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    )
                )}

                {/* Sales Orders Table */}
                {activeTab === "sales" && (
                    sortedData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Sales Orders associated with this proposal.">There are no Sales Orders associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Sales Order" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.name} onResize={(f, w) => onResize('sales', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.status} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.customerQuoteName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.customerOrderName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.customerPO} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.billToAccountName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.billToLocationName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.billToContactName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.shipToAccountName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.shipToLocationName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.shipToContactName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.dropShip} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.totalLines} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.totalPrice} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.totalShippingCharges} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.totalTaxesAmount} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.grandTotal} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.requestDate} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Pick Date" field="pickDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.pickDate} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Pick Complete Date" field="pickCompleteDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.pickCompleteDate} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.shipDate} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.deliveredDate} onResize={(f, w) => onResize('sales', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as SalesOrder[]).map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={order.name}>
                                                    {order.name}
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {order.customerQuoteName && order.customerQuoteId ? (
                                                        <Link
                                                            href={`/quotes/${order.customerQuoteId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={order.customerQuoteName}
                                                        >
                                                            {order.customerQuoteName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerQuoteName}>{order.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {order.customerOrderName && order.customerOrderId ? (
                                                        <Link
                                                            href={`/orders/${order.customerOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={order.customerOrderName}
                                                        >
                                                            {order.customerOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerOrderName}>{order.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {order.customerPO && order.purchaseOrderId ? (
                                                        <Link
                                                            href={`/purchase-orders/${order.purchaseOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={order.customerPO}
                                                        >
                                                            {order.customerPO}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerPO}>{order.customerPO}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToAccountName}>{order.billToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToLocationName}>{order.billToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToContactName}>{order.billToContactName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToAccountName}>{order.shipToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToLocationName}>{order.shipToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToContactName}>{order.shipToContactName}</td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${order.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {order.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {order.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${order.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${order.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${order.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{order.requestDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{order.pickDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{order.pickCompleteDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{order.shipDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{order.deliveredDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    )
                )}

                {/* Invoices Table */}
                {activeTab === "invoices" && (
                    sortedData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Invoices associated with this proposal.">There are no Invoices associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Invoice" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.name} onResize={(f, w) => onResize('invoices', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.status} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.salesOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.customerQuoteName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.customerOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.customerPO} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Bill to Account" field="billToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.billToAccountName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Bill to Location" field="billToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.billToLocationName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Bill to Contact" field="billToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.billToContactName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.totalLines} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.totalPrice} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Shipping" field="totalShippingCharges" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.totalShippingCharges} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Taxes" field="totalTaxesAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.totalTaxesAmount} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.grandTotal} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.issuedDate} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.paymentTerms} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.dueDate} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Collection Status" field="collectionStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.collectionStatus} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.openBalance} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.daysOutstanding} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.settledDate} onResize={(f, w) => onResize('invoices', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as Invoice[]).map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={invoice.name}>
                                                    {invoice.name}
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {invoice.salesOrderName && invoice.salesOrderId ? (
                                                        <Link
                                                            href={`/orders/${invoice.salesOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.salesOrderName}
                                                        >
                                                            {invoice.salesOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.salesOrderName}>{invoice.salesOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {invoice.customerQuoteName && invoice.customerQuoteId ? (
                                                        <Link
                                                            href={`/quotes/${invoice.customerQuoteId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.customerQuoteName}
                                                        >
                                                            {invoice.customerQuoteName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerQuoteName}>{invoice.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {invoice.customerOrderName && invoice.customerOrderId ? (
                                                        <Link
                                                            href={`/orders/${invoice.customerOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.customerOrderName}
                                                        >
                                                            {invoice.customerOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerOrderName}>{invoice.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {invoice.customerPO && invoice.purchaseOrderId ? (
                                                        <Link
                                                            href={`/purchase-orders/${invoice.purchaseOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.customerPO}
                                                        >
                                                            {invoice.customerPO}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerPO}>{invoice.customerPO}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.billToAccountName}>{invoice.billToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.billToLocationName}>{invoice.billToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.billToContactName}>{invoice.billToContactName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {invoice.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${invoice.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${invoice.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    ${invoice.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${invoice.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{invoice.issuedDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{invoice.paymentTerms}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{invoice.dueDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{invoice.collectionStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${invoice.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{invoice.daysOutstanding}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{invoice.settledDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    )
                )}

                {/* Shipping Manifests Table */}
                {activeTab === "shipping" && (
                    sortedData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                            <p className="text-sm truncate" title="There are no Shipping Manifests associated with this proposal.">There are no Shipping Manifests associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Shipping Manifest" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.name} onResize={(f, w) => onResize('shipping', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.status} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.salesOrderName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer Quote" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerQuoteName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer Order" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerOrderName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerPO} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipToAccountName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipToLocationName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipToContactName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.dropShip} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxCount} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxNetWeight} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxGrossWeight} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.totalLines} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.totalPrice} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.deliveredDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shippingMethod} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Logistics Partner" field="logisticsPartnerName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.logisticsPartnerName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Logistics Contact" field="logisticsContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.logisticsContactName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.trackingNumber} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.estimatedDeliveryDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.trackingStatus} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.actualDeliveryDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as ShippingManifest[]).map((manifest) => (
                                            <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700 truncate" title={manifest.name}>
                                                    {manifest.name}
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {manifest.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {manifest.salesOrderName && manifest.salesOrderId ? (
                                                        <Link
                                                            href={`/orders/${manifest.salesOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.salesOrderName}
                                                        >
                                                            {manifest.salesOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.salesOrderName}>{manifest.salesOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {manifest.customerQuoteName && manifest.customerQuoteId ? (
                                                        <Link
                                                            href={`/quotes/${manifest.customerQuoteId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.customerQuoteName}
                                                        >
                                                            {manifest.customerQuoteName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerQuoteName}>{manifest.customerQuoteName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {manifest.customerOrderName && manifest.customerOrderId ? (
                                                        <Link
                                                            href={`/orders/${manifest.customerOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.customerOrderName}
                                                        >
                                                            {manifest.customerOrderName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerOrderName}>{manifest.customerOrderName}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {manifest.customerPO && manifest.purchaseOrderId ? (
                                                        <Link
                                                            href={`/purchase-orders/${manifest.purchaseOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.customerPO}
                                                        >
                                                            {manifest.customerPO}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerPO}>{manifest.customerPO}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shipToAccountName}>{manifest.shipToAccountName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shipToLocationName}>{manifest.shipToLocationName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shipToContactName}>{manifest.shipToContactName}</td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${manifest.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {manifest.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.boxCount}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.boxNetWeight}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.boxGrossWeight}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {manifest.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${manifest.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{manifest.shipDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{manifest.deliveredDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.shippingMethod}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.logisticsPartnerName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.logisticsContactName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.trackingNumber || '-'}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{manifest.estimatedDeliveryDate}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{manifest.trackingStatus}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{manifest.actualDeliveryDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    )
                )}
            </div>
        </div>
    );
}
