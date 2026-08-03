import { useState } from "react";
import { QuotePurchase, QuoteSupplierBill } from "../../types";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuotePurchasesSubTab from "./QuotePurchasesSubTab";
import QuoteSupplierBillsSubTab from "./QuoteSupplierBillsSubTab";
import Pagination from "@/components/ui/Pagination";
import SubTabs from "@/components/ui/SubTabs";

type PurchasesSubTab = "purchases" | "supplierBills";

interface QuotePurchasesTabProps {
    quoteId: string;
    data: {
        purchases: QuotePurchase[];
        supplierBills: QuoteSupplierBill[];
    };
    loading: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function QuotePurchasesTab({ quoteId, data, loading }: QuotePurchasesTabProps): JSX.Element {
    const [activeSubTab, setActiveSubTab] = useState<PurchasesSubTab>("purchases");
    const { purchases = [], supplierBills = [] } = data;

    // Purchases State
    const [purchaseSortField, setPurchaseSortField] = useState<keyof QuotePurchase>("purchaseOrderNumber");
    const [purchaseSortDirection, setPurchaseSortDirection] = useState<'asc' | 'desc'>('desc');

    // Supplier Bills State
    const [billSortField, setBillSortField] = useState<keyof QuoteSupplierBill>("billNumber");
    const [billSortDirection, setBillSortDirection] = useState<'asc' | 'desc'>('desc');

    // Pagination State
    const [currentPagePurchases, setCurrentPagePurchases] = useState(1);
    const [currentPageBills, setCurrentPageBills] = useState(1);

    // Setup resizable columns for Purchases
    const { widths: purchaseWidths, handleResize: handlePurchaseResize } = useResizableColumns({
        purchaseOrderNumber: 150,
        status: 100,
        customerQuote: 150,
        customerOrder: 150,
        customerPO: 120,
        supplierName: 200,
        supplierDBA: 150,
        supplierContact: 150,
        shipToAccount: 200,
        shipToLocation: 200,
        shipToContact: 150,
        dropShip: 100,
        totalLines: 100,
        productCost: 120,
        shipping: 120,
        totalCost: 120,
        issuedDate: 120,
        acknowledgedDate: 120,
        requestDate: 120,
        promiseDate: 120,
        shippingMethod: 150,
        logisticsPartner: 150,
        logisticsContact: 150,
        trackingNumber: 180,
        estimatedDeliveryDate: 150,
        trackingStatus: 120,
        actualDeliveryDate: 120,
        goodsReceiptDate: 120
    });

    // Setup resizable columns for Supplier Bills
    const { widths: billWidths, handleResize: handleBillResize } = useResizableColumns({
        billNumber: 150,
        status: 100,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        supplierName: 200,
        supplierDBA: 150,
        supplierContact: 150,
        totalLines: 100,
        totalCost: 120,
        shipping: 120,
        totalAmount: 120,
        billedDate: 120,
        paymentTerms: 150,
        dueDate: 120,
        remittanceStatus: 120,
        openBalance: 120,
        daysOutstanding: 120,
        settledDate: 120
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

    // Sub-tab Pagination
    const paginatedPurchases = sortedPurchases.slice(
        (currentPagePurchases - 1) * ITEMS_PER_PAGE,
        currentPagePurchases * ITEMS_PER_PAGE
    );
    const totalPagesPurchases = Math.ceil(purchases.length / ITEMS_PER_PAGE);

    const paginatedBills = sortedBills.slice(
        (currentPageBills - 1) * ITEMS_PER_PAGE,
        currentPageBills * ITEMS_PER_PAGE
    );
    const totalPagesBills = Math.ceil(supplierBills.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Sub-tabs Navigation */}
            <SubTabs
                tabs={[
                    { key: "purchases", label: "Purchases Order", count: purchases.length },
                    { key: "supplierBills", label: "Supplier Bills", count: supplierBills.length },
                ]}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as PurchasesSubTab)}
                className="flex gap-8 mb-0 border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4"
            />

            {/* Tab Content */}
            <div className="p-0 bg-gray-50 dark:bg-gray-900/50 py-2">
                {activeSubTab ==="purchases"&& (
                    <div className="flex flex-col">
                        <QuotePurchasesSubTab
                            purchases={paginatedPurchases}
                            loading={false}
                            sortField={purchaseSortField}
                            sortDirection={purchaseSortDirection}
                            onSort={handlePurchaseSort}
                            widths={purchaseWidths}
                            onResize={handlePurchaseResize}
                        />
                        <div className="px-4 py-3">
                            <Pagination
                                currentPage={currentPagePurchases}
                                totalPages={totalPagesPurchases}
                                onPageChange={setCurrentPagePurchases}
                                totalItems={purchases.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemName=""
                            />
                        </div>
                    </div>
                )}
                {activeSubTab ==="supplierBills"&& (
                    <div className="flex flex-col">
                        <QuoteSupplierBillsSubTab
                            bills={paginatedBills}
                            loading={false}
                            sortField={billSortField}
                            sortDirection={billSortDirection}
                            onSort={handleBillSort}
                            widths={billWidths}
                            onResize={handleBillResize}
                        />
                        <div className="px-4 py-3">
                            <Pagination
                                currentPage={currentPageBills}
                                totalPages={totalPagesBills}
                                onPageChange={setCurrentPageBills}
                                totalItems={supplierBills.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemName=""
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
