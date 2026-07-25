import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "../../../../components/ui/Pagination";
import { useUserSession } from "../../../../components/UserSessionContext";
import { displayCell } from "@/lib/utils/formatting";

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
    const { selectedAccount } = useUserSession();
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

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

    if (loading) {
        return (
            <div className="px-4">
                <div className="flex justify-center items-center py-12 min-w-0">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
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
                        onClick={() => onTabChange("shipping")}
                        className={`truncate py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "shipping"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Shipping Manifests {fulfillmentData.shippingManifests.length > 0 && `(${fulfillmentData.shippingManifests.length})`}
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
                </nav>
            </div>

            <div className="flex-1 min-h-0">
                {/* Customer Quotes Table */}
                {activeTab === "quotes" && (
                    sortedData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-medium" title="No records found">No records found</p>
                            <p className="text-sm" title="There are no Customer Quotes associated with this proposal.">There are no Customer Quotes associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Customer Quote" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.name} onResize={(f, w) => onResize('quotes', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.status} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalId" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.proposalId} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.proposalName} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.customerOrderName} onResize={(f, w) => onResize('quotes', f, w)} />
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
                                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.issuedDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Expiration Date" field="expirationDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.expirationDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.requestDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.shipDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.deliveredDate} onResize={(f, w) => onResize('quotes', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as CustomerQuote[]).map((quote) => (
                                            <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={quote.name}>
                                                    {quote.name && quote.id ? (
                                                        <Link
                                                            href={`/quotes/${quote.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={quote.name}
                                                        >{quote.name}</Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.name}>{displayCell(quote.name)}</div>

                                                    )}

                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <StatusBadge status={quote.status as any} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {quote.proposalName && quote.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${quote.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={quote.proposalName}
                                                        >
                                                            {quote.proposalName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.proposalName}>{displayCell(quote.proposalName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.proposalName}>{displayCell(quote.proposalName)}</td>
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.customerOrderName}>{displayCell(quote.customerOrderName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.customerPO}>{displayCell(quote.customerPO)}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.billToAccountName}>{displayCell(quote.billToAccountName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.billToLocationName}>{displayCell(quote.billToLocationName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.billToContactName}>{displayCell(quote.billToContactName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.shipToAccountName}>{displayCell(quote.shipToAccountName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.shipToLocationName}>{displayCell(quote.shipToLocationName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={quote.shipToContactName}>{displayCell(quote.shipToContactName)}</td>
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
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.issuedDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.expirationDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.requestDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.shipDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.deliveredDate)}</td>
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
                            <p className="text-lg font-medium" title="No records found">No records found</p>
                            <p className="text-sm" title="There are no Sales Orders associated with this proposal.">There are no Sales Orders associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Sales Order #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.name} onResize={(f, w) => onResize('sales', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.status} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.customerQuoteName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalId" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.proposalId} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.proposalName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.customerOrderName} onResize={(f, w) => onResize('sales', f, w)} />
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
                                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.shipDate} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.deliveredDate} onResize={(f, w) => onResize('sales', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as SalesOrder[]).map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={order.name}>
                                                    {!isRestricted && order.name && order.salesOrderId ? (
                                                        <Link
                                                            href={`/orders/${order.salesOrderId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={order.name}
                                                        >
                                                            {order.name}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.name}>{displayCell(order.name)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <StatusBadge status={order.status as any} />
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerQuoteName}>{displayCell(order.customerQuoteName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {order.proposalName && order.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${order.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={order.proposalName}
                                                        >
                                                            {order.proposalName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.proposalName}>{displayCell(order.proposalName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.proposalName}>{displayCell(order.proposalName)}</td>
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerOrderName}>{displayCell(order.customerOrderName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerPO}>{displayCell(order.customerPO)}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToAccountName}>{displayCell(order.billToAccountName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToLocationName}>{displayCell(order.billToLocationName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.billToContactName}>{displayCell(order.billToContactName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToAccountName}>{displayCell(order.shipToAccountName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToLocationName}>{displayCell(order.shipToLocationName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={order.shipToContactName}>{displayCell(order.shipToContactName)}</td>
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
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.requestDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.shipDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(order.deliveredDate)}</td>
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
                            <p className="text-lg font-medium" title="No records found">No records found</p>
                            <p className="text-sm" title="There are no Invoices associated with this proposal.">There are no Invoices associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Invoice #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.name} onResize={(f, w) => onResize('invoices', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.status} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.salesOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Purchase Order #" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.purchaseOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.customerQuoteName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalId" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.proposalId} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.proposalName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.customerOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
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
                                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.settledDate} onResize={(f, w) => onResize('invoices', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as Invoice[]).map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={invoice.name}>

                                                    {invoice.name && invoice.id ? (
                                                        <Link
                                                            href={`/invoices/${invoice.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.name}
                                                        >
                                                            {invoice.name}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.name}>{displayCell(invoice.name)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <StatusBadge status={invoice.status as any} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.salesOrderName}>{displayCell(invoice.salesOrderName)}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.purchaseOrderName}>{displayCell(invoice.purchaseOrderName)}</td>
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerQuoteName}>{displayCell(invoice.customerQuoteName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {invoice.proposalName && invoice.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${invoice.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.proposalName}
                                                        >
                                                            {invoice.proposalName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.proposalName}>{displayCell(invoice.proposalName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.proposalName}>{displayCell(invoice.proposalName)}</td>
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerOrderName}>{displayCell(invoice.customerOrderName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerPO}>{displayCell(invoice.customerPO)}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.billToAccountName}>{displayCell(invoice.billToAccountName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.billToLocationName}>{displayCell(invoice.billToLocationName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={invoice.billToContactName}>{displayCell(invoice.billToContactName)}</td>
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
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(invoice.issuedDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(invoice.paymentTerms)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(invoice.dueDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <StatusBadge status={invoice.collectionStatus as any} /></td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-medium">
                                                    ${invoice.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(invoice.settledDate)}</td>
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
                            <p className="text-lg font-medium" title="No records found">No records found</p>
                            <p className="text-sm" title="There are no Shipping Manifests associated with this proposal.">There are no Shipping Manifests associated with this proposal.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Shipping Manifest #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.name} onResize={(f, w) => onResize('shipping', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.status} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.salesOrderName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerQuoteName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalId" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.proposalId} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.proposalName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer Order #" field="customerOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerOrderName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerPO} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship to Account" field="shipToAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipToAccountName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship to Location" field="shipToLocationName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipToLocationName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship to Contact" field="shipToContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipToContactName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.dropShip} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.totalLines} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.totalPrice} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxCount} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Length" field="boxLength" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxLength} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Width" field="boxWidth" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxWidth} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Height" field="boxHeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxHeight} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxNetWeight} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.boxGrossWeight} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Logistics Partner" field="logisticsPartnerName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.logisticsPartnerName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.shipDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Ship Confirmed Date" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.deliveredDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.trackingNumber} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.trackingStatus} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.estimatedDeliveryDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.actualDeliveryDate} onResize={(f, w) => onResize('shipping', f, w)} />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(paginatedData as ShippingManifest[]).map((manifest) => (
                                            <tr key={manifest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={manifest.name}>
                                                    {manifest.name && manifest.id ? (
                                                        <Link
                                                            href={`/shipments/${manifest.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.name}
                                                        >
                                                            {manifest.name}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.name}>{displayCell(manifest.name)}</div>
                                                    )}

                                                </td>
                                                <td className="px-3 py-2 truncate">
                                                    <StatusBadge status={manifest.status as any} />
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.salesOrderName}>{displayCell(manifest.salesOrderName)}</div>
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerQuoteName}>{displayCell(manifest.customerQuoteName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    {manifest.proposalName && manifest.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${manifest.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.proposalName}
                                                        >
                                                            {manifest.proposalName}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.proposalName}>{displayCell(manifest.proposalName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.proposalName}>{displayCell(manifest.proposalName)}</td>
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
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerOrderName}>{displayCell(manifest.customerOrderName)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerPO}>{displayCell(manifest.customerPO)}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shipToAccountName}>{displayCell(manifest.shipToAccountName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shipToLocationName}>{displayCell(manifest.shipToLocationName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={manifest.shipToContactName}>{displayCell(manifest.shipToContactName)}</td>
                                                <td className="px-3 py-2 truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${manifest.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {manifest.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {manifest.totalLines}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate font-bold">
                                                    ${manifest.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxCount ?? ''))}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxLength ?? ''))}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxWidth ?? ''))}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxHeight ?? ''))}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxNetWeight ?? ''))}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(String(manifest.boxGrossWeight ?? ''))}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(manifest.logisticsPartnerName)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.shipDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.deliveredDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(manifest.trackingNumber)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{displayCell(manifest.trackingStatus)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.estimatedDeliveryDate)}</td>
                                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.actualDeliveryDate)}</td>
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
function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Shipped":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Accepted":
            case "Draft":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Pending Review":
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Under Review":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "Rejected":
            case "Partial Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Quote Requested":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "Quote Ready":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "Proposal Sent":
                return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
            case "Negotiation":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "Awarded":
                return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}