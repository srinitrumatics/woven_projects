"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { QuoteDetails, QuoteLine, QuoteStatus, QuoteTax } from "../types";
import QuoteHeader from "./components/QuoteHeader";
import QuoteDetailsSection from "./components/QuoteDetails";
import QuoteTabs, { QuoteTabType } from "./components/QuoteTabs";
import QuoteProductsTab from "./components/QuoteProductsTab";
import QuoteTaxesTab from "./components/QuoteTaxesTab";
import QuoteFulfillmentTab from "./components/QuoteFulfillmentTab";
import QuotePurchasesTab from "./components/QuotePurchasesTab";
import QuoteReturnsTab from "./components/QuoteReturnsTab";
import { useResizableColumns } from "@/hooks/useResizableColumns";

// Mock quote line items
const mockQuoteLines: QuoteLine[] = [
  {
    id: "1",
    productName: "Command Hub License, Perpetual",
    productSku: "Command-Hub",
    description: "Command Hub License, Perpetual",
    quantity: 5,
    unitPrice: 899.00,
    discount: 0,
    subtotal: 4495.00,
    taxAmount: 0,
    total: 4495.00
  },
  {
    id: "2",
    productName: "Apple Mac mini with M4 Chip",
    productSku: "MU9D3LL/A",
    description: "Apple Mac mini with M4 Chip",
    quantity: 10,
    unitPrice: 549.00,
    discount: 5,
    subtotal: 5215.50,
    taxAmount: 0,
    total: 5215.50
  },
  {
    id: "3",
    productName: "PTZ 4K NDI Box with PoE",
    productSku: "PTV5221V2",
    description: "PTZ 4K NDI Box with PoE",
    quantity: 8,
    unitPrice: 725.00,
    discount: 0,
    subtotal: 5800.00,
    taxAmount: 0,
    total: 5800.00
  }
];

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<QuoteTabType>("products");
  const [sortField, setSortField] = useState<keyof QuoteLine>("productName");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Interactive column resizing
  const { widths, handleResize } = useResizableColumns({
    productName: 250,
    productSku: 150,
    description: 300,
    quantity: 100,
    unitPrice: 120,
    discount: 100,
    subtotal: 120
  });

  // Calculate totals
  const productsSubtotal = mockQuoteLines.reduce((sum, line) => sum + line.subtotal, 0);
  const discountTotal = mockQuoteLines.reduce((sum, line) => sum + ((line.unitPrice * line.quantity * line.discount) / 100), 0);
  const taxRate = 0.15;
  const taxTotal = (productsSubtotal - discountTotal) * taxRate;
  const shippingCost = 65.00;
  const grandTotal = productsSubtotal - discountTotal + taxTotal + shippingCost;

  // Mock quote data matching QuoteDetails interface
  const quote: QuoteDetails = {
    id: id,
    quoteNumber: "Q-2024-001",
    status: "Approved" as QuoteStatus,
    accountName: "Blum Oakland", // Used in header/breadcrumbs if applicable
    contactName: "Sarah Johnson",

    // Header/Top Section
    accountExecutive: "Account Rep. Name",
    proposalName: "Q4 2024 Product Order",
    customerOrder: "PO-998877",
    issuedDate: "2024-11-15",
    expirationDate: "2024-12-31",
    plannedShipDate: "2024-12-01",

    // Billing Section
    billToAccountName: "Apple", // Used in type definition
    billToAccount: "Apple",     // Used in layout
    billToLocation: "Corp Billing",
    billingAddress: "578 West Grand Ave, Oakland, CA 94612",
    paymentTerms: "NET 30",
    customerPO: "PO-2024-0892",
    priceBook: "Standard Price Book",

    // Shipping Section
    shipToAccountName: "Apple", // Used in type definition
    shipToAccount: "Apple",     // Used in layout
    shipToLocation: "Apple NSO #1",
    shippingAddress: "578 West Grand Ave, Oakland, CA 94612",
    requestDate: "2024-11-15",
    dropShip: false,
    site: "PWH",

    // Financials
    totalAmount: grandTotal,
    totalLines: mockQuoteLines.length,
    subtotal: productsSubtotal,
    taxTotal: taxTotal,
    discountTotal: discountTotal,
    shippingCost: shippingCost,
    grandTotal: grandTotal,

    // Notes & Misc
    notes: "Customer requested expedited delivery. Premium products only.",
    description: "Q4 2024 Product Order - Premium Selection",
    opportunityName: "Q4 2024 Expansion",
    lines: mockQuoteLines,

    // Legacy/Unused/Compatibility fields required by type
    proposalType: "Standard Quote",
    validUntil: "2024-12-31" // Mapped to expirationDate in component
  };

  const handleSort = (field: keyof QuoteLine) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort logic (basic)
  const sortedLines = [...mockQuoteLines].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // --- Taxes Tab Logic ---
  const [taxSortField, setTaxSortField] = useState<keyof QuoteTax>("salesTaxRate");
  const [taxSortDirection, setTaxSortDirection] = useState<'asc' | 'desc'>('asc');

  const { widths: taxWidths, handleResize: handleTaxResize } = useResizableColumns({
    salesTaxRate: 120,
    salesTaxAmount: 140,
    useTaxRate: 120,
    useTaxAmount: 140,
    localTaxRate: 120,
    localTaxAmount: 140,
    exciseTaxRate: 120,
    exciseTaxAmount: 150,
    grtRate: 100,
    grtAmount: 120,
    gstRate: 100,
    gstAmount: 120,
    vatRate: 100,
    vatAmount: 120
  });

  const mockTaxes: QuoteTax[] = [
    {
      id: "1",
      salesTaxRate: 7.25,
      salesTaxAmount: 325.80,
      useTaxRate: 0,
      useTaxAmount: 0,
      localTaxRate: 2.0,
      localTaxAmount: 89.90,
      exciseTaxRate: 0,
      exciseTaxAmount: 0,
      grtRate: 0,
      grtAmount: 0,
      gstRate: 0,
      gstAmount: 0,
      vatRate: 0,
      vatAmount: 0
    }
  ];

  const handleTaxSort = (field: keyof QuoteTax) => {
    if (taxSortField === field) {
      setTaxSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTaxSortField(field);
      setTaxSortDirection('asc');
    }
  };

  const sortedTaxes = [...mockTaxes].sort((a, b) => {
    const aVal = a[taxSortField];
    const bVal = b[taxSortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return taxSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  return (
    <Sidebar>
      <QuoteHeader
        quoteNumber={quote.quoteNumber}
        status={quote.status}
        description={quote.description || ''}
        onBack={() => router.push("/quotes")}
      />

      <QuoteDetailsSection quote={quote} lines={mockQuoteLines} />

      <div className="mt-8 mb-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
            <QuoteTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{ products: mockQuoteLines.length, taxes: mockTaxes.length }}
            />
          </div>
          <div className="p-0">
            {activeTab === 'products' && (
              <QuoteProductsTab
                products={sortedLines}
                quoteId={id}
                loading={false}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                widths={widths}
                onResize={handleResize}
              />
            )}
            {activeTab === 'taxes' && (
              <QuoteTaxesTab
                taxes={sortedTaxes}
                loading={false}
                sortField={taxSortField}
                sortDirection={taxSortDirection}
                onSort={handleTaxSort}
                widths={taxWidths}
                onResize={handleTaxResize}
              />
            )}
            {activeTab === 'fulfillment' && (
              <QuoteFulfillmentTab quoteId={id} />
            )}
            {activeTab === 'purchases' && (
              <QuotePurchasesTab quoteId={id} />
            )}
            {activeTab === 'returns' && (
              <QuoteReturnsTab quoteId={id} />
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] gap-4 sm:gap-0" style={{ zIndex: 40, marginLeft: 'var(--sidebar-width, 0px)' }}>
        {/* Note: Sidebar might push content, need to check if sidebar is fixed. Usually main content padding handles it, but fixed footer covers full width. 
           If Sidebar is generic, it might need adjustment. Proposal page uses <Sidebar> which likely handles layout context. 
           In Proposal page: <div className="fixed bottom-0 left-0 right-0 ... " style={{ zIndex: 40 }}>
           Wait, Proposal page action bar code:
           <div className="fixed bottom-0 left-0 right-0 ... " style={{ zIndex: 40 }}>
           The sidebar likely sits on left, fixed. If footer is left-0 right-0, it covers sidebar at bottom? 
           Usually sidebar has z-index higher or footer starts after sidebar. 
           I'll keep it as is from source.
       */}
        <button
          onClick={() => router.push("/quotes")}
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Quotes
        </button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {quote.status === "Draft" && (
            <button className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Edit Quote
            </button>
          )}
          <button className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Download PDF
          </button>
        </div>
      </div>
      <div className="h-16"></div>
    </Sidebar>
  );
}
