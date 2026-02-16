import { useState } from "react";
import { QuotePurchase, QuoteSupplierBill } from "../../types";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuotePurchasesSubTab from "./QuotePurchasesSubTab";
import QuoteSupplierBillsSubTab from "./QuoteSupplierBillsSubTab";

type PurchasesSubTab = "purchases" | "supplierBills";

interface QuotePurchasesTabProps {
    quoteId: string;
    data: {
        purchases: QuotePurchase[];
        supplierBills: QuoteSupplierBill[];
    };
    loading: boolean;
}

export default function QuotePurchasesTab({ quoteId, data, loading }: QuotePurchasesTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<PurchasesSubTab>("purchases");
    const { purchases = [], supplierBills = [] } = data;

    // Purchases State
    const [purchaseSortField, setPurchaseSortField] = useState<keyof QuotePurchase>("purchaseOrderNumber");
    const [purchaseSortDirection, setPurchaseSortDirection] = useState<'asc' | 'desc'>('asc');

    // Supplier Bills State
    const [billSortField, setBillSortField] = useState<keyof QuoteSupplierBill>("billNumber");
    const [billSortDirection, setBillSortDirection] = useState<'asc' | 'desc'>('asc');

    // Setup resizable columns for Purchases
    const { widths: purchaseWidths, handleResize: handlePurchaseResize } = useResizableColumns({
        purchaseOrderNumber: 150,
        status: 100,
        vendor: 200,
        date: 120,
        totalAmount: 120,
        expectedDeliveryDate: 150
    });

    // Setup resizable columns for Supplier Bills
    const { widths: billWidths, handleResize: handleBillResize } = useResizableColumns({
        billNumber: 150,
        status: 100,
        vendor: 200,
        purchaseOrder: 150,
        billDate: 120,
        dueDate: 120,
        totalAmount: 120
    });

    const handlePurchaseSort = (field: keyof QuotePurchase) => {
        if (purchaseSortField === field) {
            setPurchaseSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setPurchaseSortField(field);
            setPurchaseSortDirection('asc');
        }
    };

    const handleBillSort = (field: keyof QuoteSupplierBill) => {
        if (billSortField === field) {
            setBillSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setBillSortField(field);
            setBillSortDirection('asc');
        }
    };

    const sortedPurchases = [...purchases].sort((a, b) => {
        const aVal = a[purchaseSortField];
        const bVal = b[purchaseSortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return purchaseSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return purchaseSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const sortedBills = [...supplierBills].sort((a, b) => {
        const aVal = a[billSortField];
        const bVal = b[billSortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return billSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return billSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const tabs: { id: PurchasesSubTab; label: string }[] = [
        { id: "purchases", label: "Purchase" },
        { id: "supplierBills", label: "Supplier Bill" },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Sub-tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 px-4" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeSubTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-0 bg-gray-50 dark:bg-gray-900/50 py-2">
                {activeSubTab === "purchases" && (
                    <QuotePurchasesSubTab
                        purchases={sortedPurchases}
                        loading={false}
                        sortField={purchaseSortField}
                        sortDirection={purchaseSortDirection}
                        onSort={handlePurchaseSort}
                        widths={purchaseWidths}
                        onResize={handlePurchaseResize}
                    />
                )}
                {activeSubTab === "supplierBills" && (
                    <QuoteSupplierBillsSubTab
                        bills={sortedBills}
                        loading={false}
                        sortField={billSortField}
                        sortDirection={billSortDirection}
                        onSort={handleBillSort}
                        widths={billWidths}
                        onResize={handleBillResize}
                    />
                )}
            </div>
        </div>
    );
}
