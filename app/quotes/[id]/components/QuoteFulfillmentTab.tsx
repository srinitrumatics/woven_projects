import { useState } from "react";
import { QuoteSalesOrder, QuoteShippingManifest, QuoteInvoice } from "../../types";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteSalesOrdersSubTab from "./QuoteSalesOrdersSubTab";
import QuoteShippingManifestsSubTab from "./QuoteShippingManifestsSubTab";
import QuoteInvoicesSubTab from "./QuoteInvoicesSubTab";

type FulfillmentSubTab = "salesOrders" | "shippingManifests" | "invoices";

interface QuoteFulfillmentTabProps {
    quoteId: string;
    data: {
        salesOrders: QuoteSalesOrder[];
        shippingManifests: QuoteShippingManifest[];
        invoices: QuoteInvoice[];
    };
    loading: boolean;
}

export default function QuoteFulfillmentTab({ quoteId, data, loading }: QuoteFulfillmentTabProps): JSX.Element {
    const [activeSubTab, setActiveSubTab] = useState<FulfillmentSubTab>("salesOrders");
    const { salesOrders = [], shippingManifests = [], invoices = [] } = data;

    // Sales Orders State
    const [salesSortField, setSalesSortField] = useState<keyof QuoteSalesOrder>("salesOrderNumber");
    const [salesSortDirection, setSalesSortDirection] = useState<'asc' | 'desc'>('desc');

    // Shipping Manifests State
    const [manifestSortField, setManifestSortField] = useState<keyof QuoteShippingManifest>("manifestNumber");
    const [manifestSortDirection, setManifestSortDirection] = useState<'asc' | 'desc'>('desc');

    // Invoices State
    const [invoiceSortField, setInvoiceSortField] = useState<keyof QuoteInvoice>("invoiceNumber");
    const [invoiceSortDirection, setInvoiceSortDirection] = useState<'asc' | 'desc'>('desc');

    // Setup resizable columns for Sales Orders
    const { widths: salesWidths, handleResize: handleSalesResize } = useResizableColumns({
        salesOrderNumber: 150,
        status: 100,
        customerQuote: 180,
        customerOrder: 180,
        customerPO: 180,
        billToAccount: 200,
        billToLocation: 200,
        billToContact: 200,
        shipToAccount: 200,
        shipToLocation: 200,
        shipToContact: 180,
        dropShip: 180,
        totalLines: 100,
        totalPrice: 120,
        shipping: 100,
        taxes: 100,
        grandTotal: 120,
        requestDate: 180,
        pickDate: 150,
        pickCompleteDate: 200,
        plannedShipDate: 200,
        shipConfirmedDate: 200
    });

    // Setup resizable columns for Shipping Manifests
    const { widths: manifestWidths, handleResize: handleManifestResize } = useResizableColumns({
        manifestNumber: 160,
        status: 100,
        salesOrder: 180,
        customerQuote: 180,
        customerOrder: 150,
        customerPO: 190,
        shipToAccount: 180,
        shipToLocation: 180,
        shipToContact: 180,
        dropShip: 150,
        boxCount: 150,
        boxNetWeight: 180,
        boxGrossWeight: 180,
        totalLines: 180,
        totalPrice: 190,
        plannedShipDate: 190,
        shipConfirmedDate: 190,
        shippingMethod: 190,
        logisticsPartner: 180,
        logisticsContact: 190,
        trackingNumber: 160,
        estimatedDeliveryDate: 190,
        trackingStatus: 120,
        actualDeliveryDate: 190
    });

    // Setup resizable columns for Invoices
    const { widths: invoiceWidths, handleResize: handleInvoiceResize } = useResizableColumns({
        invoiceNumber: 150,
        status: 100,
        salesOrder: 180,
        customerQuote: 180,
        customerOrder: 180,
        customerPO: 180,
        billToAccount: 180,
        billToLocation: 180,
        billToContact: 180,
        totalLines: 150,
        totalPrice: 160,
        shipping: 100,
        taxes: 100,
        grandTotal: 150,
        issuedDate: 180,
        paymentTerms: 120,
        dueDate: 180,
        collectionStatus: 180,
        openBalance: 120,
        daysOutstanding: 140,
        settledDate: 190
    });

    const handleSalesSort = (field: keyof QuoteSalesOrder) => {
        if (salesSortField === field) {
            setSalesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSalesSortField(field);
            setSalesSortDirection('asc');
        }
    };

    const handleManifestSort = (field: keyof QuoteShippingManifest) => {
        if (manifestSortField === field) {
            setManifestSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setManifestSortField(field);
            setManifestSortDirection('asc');
        }
    };

    const handleInvoiceSort = (field: keyof QuoteInvoice) => {
        if (invoiceSortField === field) {
            setInvoiceSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setInvoiceSortField(field);
            setInvoiceSortDirection('asc');
        }
    };

    const sortedSalesOrders = [...salesOrders].sort((a, b) => {
        const aVal = a[salesSortField];
        const bVal = b[salesSortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return salesSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return salesSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const sortedManifests = [...shippingManifests].sort((a, b) => {
        const aVal = a[manifestSortField];
        const bVal = b[manifestSortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return manifestSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return manifestSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const sortedInvoices = [...invoices].sort((a, b) => {
        const aVal = a[invoiceSortField];
        const bVal = b[invoiceSortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return invoiceSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return invoiceSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const tabs: { id: FulfillmentSubTab; label: string }[] = [
        { id:"salesOrders", label:"Sales Orders"},
        { id:"shippingManifests", label:"Shipping Manifests"},
        { id:"invoices", label:"Invoices"},
    ];

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Sub-tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 px-4"aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`
                                 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeSubTab === tab.id
                                    ?"border-primary text-primary"
                                    :"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                }
                            `}
                        >
                            {tab.label}
                            {tab.id ==="salesOrders"&& salesOrders.length > 0 && ` (${salesOrders.length})`}
                            {tab.id ==="shippingManifests"&& shippingManifests.length > 0 && ` (${shippingManifests.length})`}
                            {tab.id ==="invoices"&& invoices.length > 0 && ` (${invoices.length})`}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-0 bg-gray-50 dark:bg-gray-900/50 py-2">
                {activeSubTab ==="salesOrders"&& (
                    <QuoteSalesOrdersSubTab
                        salesOrders={sortedSalesOrders}
                        loading={false}
                        sortField={salesSortField}
                        sortDirection={salesSortDirection}
                        onSort={handleSalesSort}
                        widths={salesWidths}
                        onResize={handleSalesResize}
                    />
                )}
                {activeSubTab ==="shippingManifests"&& (
                    <QuoteShippingManifestsSubTab
                        manifests={sortedManifests}
                        loading={false}
                        sortField={manifestSortField}
                        sortDirection={manifestSortDirection}
                        onSort={handleManifestSort}
                        widths={manifestWidths}
                        onResize={handleManifestResize}
                    />
                )}
                {activeSubTab ==="invoices"&& (
                    <QuoteInvoicesSubTab
                        invoices={sortedInvoices}
                        loading={false}
                        sortField={invoiceSortField}
                        sortDirection={invoiceSortDirection}
                        onSort={handleInvoiceSort}
                        widths={invoiceWidths}
                        onResize={handleInvoiceResize}
                    />
                )}
            </div>
        </div>
    );
}
