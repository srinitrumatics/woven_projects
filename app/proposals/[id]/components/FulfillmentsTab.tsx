import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { FulfillmentData, FulfillmentTabType, Invoice, ShippingManifest, SalesOrder, CustomerQuote } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import Pagination from "../../../../components/ui/Pagination";
import { useUserSession } from "../../../../components/UserSessionContext";
import { displayCell } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import SubTabs from "@/components/ui/SubTabs";

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
                <TableLoadingState />
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Sub-tabs */}
            <SubTabs
                tabs={[
                    { key: "quotes", label: "Customer Quotes", count: fulfillmentData.customerQuotes.length },
                    { key: "sales", label: "Sales Orders", count: fulfillmentData.salesOrders.length },
                    { key: "shipping", label: "Shipping Manifests", count: fulfillmentData.shippingManifests.length },
                    { key: "invoices", label: "Invoices", count: fulfillmentData.invoices.length },
                ]}
                activeKey={activeTab}
                onChange={(key) => onTabChange(key as FulfillmentTabType)}
            />

            <div className="flex-1 min-h-0">
                {/* Customer Quotes Table */}
                {activeTab === "quotes" && (
                    sortedData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <TableEmptyState message="No records found" description="There are no Customer Quotes associated with this proposal." />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Customer Quote" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.name} onResize={(f, w) => onResize('quotes', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.status} onResize={(f, w) => onResize('quotes', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.quotes.proposalId} onResize={(f, w) => onResize('quotes', f, w)} />
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
                                    </THead>
                                    <TBody>
                                        {(paginatedData as CustomerQuote[]).map((quote) => (
                                            <Tr key={quote.id} className="group transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={quote.name}>
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

                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={quote.status as any} variant="pill" />
                                                </Td>
                                                <Td className="truncate">
                                                    {quote.proposalNumber && quote.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${quote.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={quote.proposalNumber}
                                                        >
                                                            {quote.proposalNumber}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.proposalNumber}>{displayCell(quote.proposalNumber)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={quote.proposalName}>{displayCell(quote.proposalName)}</Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={quote.customerPO}>{displayCell(quote.customerPO)}</div>
                                                </Td>
                                                <Td className="truncate" title={quote.billToAccountName}>{displayCell(quote.billToAccountName)}</Td>
                                                <Td className="truncate" title={quote.billToLocationName}>{displayCell(quote.billToLocationName)}</Td>
                                                <Td className="truncate" title={quote.billToContactName}>{displayCell(quote.billToContactName)}</Td>
                                                <Td className="truncate" title={quote.shipToAccountName}>{displayCell(quote.shipToAccountName)}</Td>
                                                <Td className="truncate" title={quote.shipToLocationName}>{displayCell(quote.shipToLocationName)}</Td>
                                                <Td className="truncate" title={quote.shipToContactName}>{displayCell(quote.shipToContactName)}</Td>
                                                <Td className="truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${quote.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {quote.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {quote.totalLines}
                                                    </span>
                                                </Td>
                                                <Td className="truncate font-medium">
                                                    ${quote.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="truncate">
                                                    ${quote.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${quote.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate font-bold">
                                                    ${quote.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.issuedDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.expirationDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.requestDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.shipDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(quote.deliveredDate)}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <TableEmptyState message="No records found" description="There are no Sales Orders associated with this proposal." />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Sales Order #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.name} onResize={(f, w) => onResize('sales', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.status} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.customerQuoteName} onResize={(f, w) => onResize('sales', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.sales.proposalId} onResize={(f, w) => onResize('sales', f, w)} />
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
                                    </THead>
                                    <TBody>
                                        {(paginatedData as SalesOrder[]).map((order) => (
                                            <Tr key={order.id} className="group transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={order.name}>
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
                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={order.status as any} variant="pill" />
                                                </Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    {order.proposalNumber && order.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${order.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={order.proposalNumber}
                                                        >
                                                            {order.proposalNumber}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={order.proposalNumber}>{displayCell(order.proposalNumber)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={order.proposalName}>{displayCell(order.proposalName)}</Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={order.customerPO}>{displayCell(order.customerPO)}</div>
                                                </Td>
                                                <Td className="truncate" title={order.billToAccountName}>{displayCell(order.billToAccountName)}</Td>
                                                <Td className="truncate" title={order.billToLocationName}>{displayCell(order.billToLocationName)}</Td>
                                                <Td className="truncate" title={order.billToContactName}>{displayCell(order.billToContactName)}</Td>
                                                <Td className="truncate" title={order.shipToAccountName}>{displayCell(order.shipToAccountName)}</Td>
                                                <Td className="truncate" title={order.shipToLocationName}>{displayCell(order.shipToLocationName)}</Td>
                                                <Td className="truncate" title={order.shipToContactName}>{displayCell(order.shipToContactName)}</Td>
                                                <Td className="truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${order.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {order.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {order.totalLines}
                                                    </span>
                                                </Td>
                                                <Td className="truncate font-medium">
                                                    ${order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="truncate">
                                                    ${order.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${order.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate font-bold">
                                                    ${order.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.requestDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.shipDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(order.deliveredDate)}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <TableEmptyState message="No records found" description="There are no Invoices associated with this proposal." />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Invoice #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.name} onResize={(f, w) => onResize('invoices', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.status} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.salesOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Purchase Order #" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.purchaseOrderName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.customerQuoteName} onResize={(f, w) => onResize('invoices', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoices.proposalId} onResize={(f, w) => onResize('invoices', f, w)} />
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
                                    </THead>
                                    <TBody>
                                        {(paginatedData as Invoice[]).map((invoice) => (
                                            <Tr key={invoice.id} className="group transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={invoice.name}>

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
                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={invoice.status as any} variant="pill" />
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.salesOrderName}>{displayCell(invoice.salesOrderName)}</div>
                                                </Td>
                                                <Td className="truncate" title={invoice.purchaseOrderName}>{displayCell(invoice.purchaseOrderName)}</Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    {invoice.proposalNumber && invoice.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${invoice.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={invoice.proposalNumber}
                                                        >
                                                            {invoice.proposalNumber}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.proposalNumber}>{displayCell(invoice.proposalNumber)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={invoice.proposalName}>{displayCell(invoice.proposalName)}</Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={invoice.customerPO}>{displayCell(invoice.customerPO)}</div>
                                                </Td>
                                                <Td className="truncate" title={invoice.billToAccountName}>{displayCell(invoice.billToAccountName)}</Td>
                                                <Td className="truncate" title={invoice.billToLocationName}>{displayCell(invoice.billToLocationName)}</Td>
                                                <Td className="truncate" title={invoice.billToContactName}>{displayCell(invoice.billToContactName)}</Td>
                                                <Td className="truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {invoice.totalLines}
                                                    </span>
                                                </Td>
                                                <Td className="truncate font-medium">
                                                    ${invoice.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="truncate">
                                                    ${invoice.totalShippingCharges?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate">
                                                    ${invoice.totalTaxesAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="truncate font-bold">
                                                    ${invoice.grandTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(invoice.issuedDate)}</Td>
                                                <Td className="truncate">{displayCell(invoice.paymentTerms)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(invoice.dueDate)}</Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={invoice.collectionStatus as any} variant="pill" /></Td>
                                                <Td className="truncate font-medium">
                                                    ${invoice.openBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                                </Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(invoice.settledDate)}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <TableEmptyState message="No records found" description="There are no Shipping Manifests associated with this proposal." />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">
                                        <tr>
                                            <SortableHeader label="Shipping Manifest #" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.name} onResize={(f, w) => onResize('shipping', f, w)} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.status} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Sales Order #" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.salesOrderName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Customer Quote #" field="customerQuoteName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.customerQuoteName} onResize={(f, w) => onResize('shipping', f, w)} />
                                            <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping.proposalId} onResize={(f, w) => onResize('shipping', f, w)} />
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
                                    </THead>
                                    <TBody>
                                        {(paginatedData as ShippingManifest[]).map((manifest) => (
                                            <Tr key={manifest.id} className="group transition-colors">
                                                <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" title={manifest.name}>
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

                                                </Td>
                                                <Td className="truncate">
                                                    <StatusBadge status={manifest.status as any} variant="pill" />
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.salesOrderName}>{displayCell(manifest.salesOrderName)}</div>
                                                </Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    {manifest.proposalNumber && manifest.proposalId ? (
                                                        <Link
                                                            href={`/proposals/${manifest.proposalId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-semibold text-primary hover:underline truncate"
                                                            title={manifest.proposalNumber}
                                                        >
                                                            {manifest.proposalNumber}
                                                        </Link>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.proposalNumber}>{displayCell(manifest.proposalNumber)}</div>
                                                    )}
                                                </Td>
                                                <Td className="truncate" title={manifest.proposalName}>{displayCell(manifest.proposalName)}</Td>
                                                <Td className="truncate">
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
                                                </Td>
                                                <Td className="truncate">
                                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={manifest.customerPO}>{displayCell(manifest.customerPO)}</div>
                                                </Td>
                                                <Td className="truncate" title={manifest.shipToAccountName}>{displayCell(manifest.shipToAccountName)}</Td>
                                                <Td className="truncate" title={manifest.shipToLocationName}>{displayCell(manifest.shipToLocationName)}</Td>
                                                <Td className="truncate" title={manifest.shipToContactName}>{displayCell(manifest.shipToContactName)}</Td>
                                                <Td className="truncate">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${manifest.dropShip
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {manifest.dropShip ? 'Yes' : 'No'}
                                                    </span>
                                                </Td>
                                                <Td className="truncate">
                                                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                                        {manifest.totalLines}
                                                    </span>
                                                </Td>
                                                <Td className="truncate font-bold">
                                                    ${manifest.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Td>
                                                <Td className="truncate">{displayCell(String(manifest.boxCount ?? ''))}</Td>
                                                <Td className="truncate">{displayCell(String(manifest.boxLength ?? ''))}</Td>
                                                <Td className="truncate">{displayCell(String(manifest.boxWidth ?? ''))}</Td>
                                                <Td className="truncate">{displayCell(String(manifest.boxHeight ?? ''))}</Td>
                                                <Td className="truncate">{displayCell(String(manifest.boxNetWeight ?? ''))}</Td>
                                                <Td className="truncate">{displayCell(String(manifest.boxGrossWeight ?? ''))}</Td>
                                                <Td className="truncate">{displayCell(manifest.logisticsPartnerName)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.shipDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.deliveredDate)}</Td>
                                                <Td className="truncate">{displayCell(manifest.trackingNumber)}</Td>
                                                <Td className="truncate">{manifest.trackingStatus ? <StatusBadge status={manifest.trackingStatus} variant="pill" /> : "—"}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.estimatedDeliveryDate)}</Td>
                                                <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(manifest.actualDeliveryDate)}</Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                </Table>
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
