import { useState } from "react";
import { QuoteSalesOrder, QuoteShippingManifest, QuoteInvoice } from "../../types";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteSalesOrdersSubTab from "./QuoteSalesOrdersSubTab";
import QuoteShippingManifestsSubTab from "./QuoteShippingManifestsSubTab";
import QuoteInvoicesSubTab from "./QuoteInvoicesSubTab";
import SubTabs from "@/components/ui/SubTabs";

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
    const [salesSortDirection, setSalesSortDirection] = useState<'asc' | 'desc'>('asc');

    // Shipping Manifests State
    const [manifestSortField, setManifestSortField] = useState<keyof QuoteShippingManifest>("manifestNumber");
    const [manifestSortDirection, setManifestSortDirection] = useState<'asc' | 'desc'>('asc');

    // Invoices State
    const [invoiceSortField, setInvoiceSortField] = useState<keyof QuoteInvoice>("invoiceNumber");
    const [invoiceSortDirection, setInvoiceSortDirection] = useState<'asc' | 'desc'>('asc');

    // Setup resizable columns for Sales Orders
    const { widths: salesWidths, handleResize: handleSalesResize } = useResizableColumns({
        salesOrderNumber: 150,
        status: 100,
        customerQuote: 180,
        proposalNumber: 180,
        proposalName: 180,
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
        plannedShipDate: 200,
        shipConfirmedDate: 200
    });

    // Setup resizable columns for Shipping Manifests
    const { widths: manifestWidths, handleResize: handleManifestResize } = useResizableColumns({
        manifestNumber: 180,
        status: 100,
        salesOrder: 180,
        customerQuote: 180,
        proposalNumber: 180,
        proposalName: 180,
        customerOrder: 150,
        customerPO: 190,
        shipToAccount: 180,
        shipToLocation: 180,
        shipToContact: 180,
        dropShip: 150,
        totalLines: 180,
        totalPrice: 190,
        boxCount: 150,
        boxLength: 150,
        boxWidth: 150,
        boxHeight: 150,
        boxNetWeight: 180,
        boxGrossWeight: 180,
        logisticsPartner: 180,
        plannedShipDate: 190,
        shipConfirmedDate: 190,
        trackingNumber: 160,
        trackingStatus: 120,
        estimatedDeliveryDate: 190,
        actualDeliveryDate: 190
    });

    // Setup resizable columns for Invoices
    const { widths: invoiceWidths, handleResize: handleInvoiceResize } = useResizableColumns({
        invoiceNumber: 150,
        status: 100,
        salesOrder: 180,
        purchaseOrder: 180,
        customerQuote: 180,
        proposalNumber: 180,
        proposalName: 180,
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

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Sub-tabs Navigation */}
            <SubTabs
                tabs={[
                    { key: "salesOrders", label: "Sales Orders", count: salesOrders.length },
                    { key: "shippingManifests", label: "Shipping Manifests", count: shippingManifests.length },
                    { key: "invoices", label: "Invoices", count: invoices.length },
                ]}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as FulfillmentSubTab)}
            />

            {/* Tab Content */}
            <div className="p-0 bg-gray-50 dark:bg-gray-900/50 py-2">
                {activeSubTab === "salesOrders" && (
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
                {activeSubTab === "shippingManifests" && (
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
                {activeSubTab === "invoices" && (
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
