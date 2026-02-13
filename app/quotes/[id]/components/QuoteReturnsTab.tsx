import { useState } from "react";
import { QuoteRMA, QuoteCreditMemo, QuoteRTV, QuoteDebitMemo } from "../../types";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteRMASubTab from "./QuoteRMASubTab";
import QuoteCreditMemoSubTab from "./QuoteCreditMemoSubTab";
import QuoteRTVSubTab from "./QuoteRTVSubTab";
import QuoteDebitMemoSubTab from "./QuoteDebitMemoSubTab";

type ReturnsSubTab = "rmas" | "creditMemo" | "rtvs" | "debitMemo";

interface QuoteReturnsTabProps {
    quoteId: string;
}

export default function QuoteReturnsTab({ quoteId }: QuoteReturnsTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<ReturnsSubTab>("rmas");

    // RMA State
    const [rmaSortField, setRmaSortField] = useState<keyof QuoteRMA>("rmaNumber");
    const [rmaSortDirection, setRmaSortDirection] = useState<'asc' | 'desc'>('asc');

    // Credit Memo State
    const [cmSortField, setCmSortField] = useState<keyof QuoteCreditMemo>("memoNumber");
    const [cmSortDirection, setCmSortDirection] = useState<'asc' | 'desc'>('asc');

    // RTV State
    const [rtvSortField, setRtvSortField] = useState<keyof QuoteRTV>("rtvNumber");
    const [rtvSortDirection, setRtvSortDirection] = useState<'asc' | 'desc'>('asc');

    // Debit Memo State
    const [dmSortField, setDmSortField] = useState<keyof QuoteDebitMemo>("memoNumber");
    const [dmSortDirection, setDmSortDirection] = useState<'asc' | 'desc'>('asc');

    // Resizable Columns for RMA (23 fields)
    const { widths: rmaWidths, handleResize: handleRmaResize } = useResizableColumns({
        rmaNumber: 150,
        status: 100,
        salesOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        rmaType: 120,
        shipFromAccount: 150,
        shipFromContact: 150,
        returnToAccount: 150,
        returnToContact: 150,
        dropShip: 100,
        totalLines: 100,
        totalPrice: 120,
        issuedDate: 120,
        returnByDate: 120,
        shippingMethod: 150,
        logisticsPartner: 150,
        logisticsContact: 150,
        trackingNumber: 150,
        estimatedDeliveryDate: 160,
        trackingStatus: 130,
        actualDeliveryDate: 150,
        goodsReceiptsDate: 150
    });

    const { widths: cmWidths, handleResize: handleCmResize } = useResizableColumns({
        memoNumber: 150, status: 100, customer: 150, date: 120, totalAmount: 120, relatedInvoice: 150
    });
    const { widths: rtvWidths, handleResize: handleRtvResize } = useResizableColumns({
        rtvNumber: 150, status: 100, vendor: 150, date: 120, totalAmount: 120, reason: 200
    });
    const { widths: dmWidths, handleResize: handleDmResize } = useResizableColumns({
        memoNumber: 150,
        status: 100,
        supplierBill: 150,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        supplierCredit: 150,
        debitToAccount: 150,
        debitToContact: 150,
        totalLines: 100,
        totalCost: 120,
        shipping: 100,
        totalDebitAmount: 140,
        issuedDate: 120,
        approvalDate: 120,
        availableBalance: 140,
        settledDate: 120
    });

    // Mock Data for RMA matching the new structure
    const mockRMAs: QuoteRMA[] = [
        {
            id: "RMA-001",
            rmaNumber: "RMA-2024-001",
            status: "Approved",
            salesOrder: "SO-1001",
            customerQuote: "Q-2024-001",
            customerOrder: "CO-5050",
            rmaType: "Customer Return",
            shipFromAccount: "Apple",
            shipFromContact: "Sarah Johnson",
            returnToAccount: "Woven",
            returnToContact: "Returns Dept",
            dropShip: false,
            totalLines: 1,
            totalPrice: 549.00,
            issuedDate: "2024-11-28",
            returnByDate: "2024-12-28",
            shippingMethod: "Ground",
            logisticsPartner: "FedEx",
            logisticsContact: "Support",
            trackingNumber: "TRK778899",
            estimatedDeliveryDate: "2024-12-05",
            trackingStatus: "In Transit",
            actualDeliveryDate: "",
            goodsReceiptsDate: ""
        }
    ];
    const mockCMs: QuoteCreditMemo[] = [
        { id: "CM-001", memoNumber: "CM-2024-001", status: "Applied", customer: "Apple", date: "2024-11-30", totalAmount: 549.00, relatedInvoice: "INV-2001" }
    ];
    const mockRTVs: QuoteRTV[] = [
        { id: "RTV-001", rtvNumber: "RTV-2024-001", status: "Shipped", vendor: "Acme Corp", date: "2024-12-01", totalAmount: 500.00, reason: "Return to Vendor" }
    ];
    const mockDMs: QuoteDebitMemo[] = [
        {
            id: "DM-001",
            memoNumber: "DM-2024-001",
            status: "Applied",
            supplierBill: "BILL-4001",
            purchaseOrder: "PO-3001",
            customerQuote: "Q-2024-001",
            customerOrder: "CO-5050",
            supplierCredit: "SC-001",
            debitToAccount: "Acme Corp",
            debitToContact: "Vendor Support",
            totalLines: 1,
            totalCost: 500.00,
            shipping: 25.00,
            totalDebitAmount: 525.00,
            issuedDate: "2024-12-05",
            approvalDate: "2024-12-06",
            availableBalance: 525.00,
            settledDate: ""
        }
    ];

    // Sorting Handlers
    const handleRmaSort = (field: keyof QuoteRMA) => {
        if (rmaSortField === field) setRmaSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setRmaSortField(field); setRmaSortDirection('asc'); }
    };
    const handleCmSort = (field: keyof QuoteCreditMemo) => {
        if (cmSortField === field) setCmSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setCmSortField(field); setCmSortDirection('asc'); }
    };
    const handleRtvSort = (field: keyof QuoteRTV) => {
        if (rtvSortField === field) setRtvSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setRtvSortField(field); setRtvSortDirection('asc'); }
    };
    const handleDmSort = (field: keyof QuoteDebitMemo) => {
        if (dmSortField === field) setDmSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setDmSortField(field); setDmSortDirection('asc'); }
    };

    // Sorting Logic
    const sortedRMAs = [...mockRMAs].sort((a, b) => {
        const aVal = a[rmaSortField];
        const bVal = b[rmaSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return rmaSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return rmaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });
    const sortedCMs = [...mockCMs].sort((a, b) => {
        const aVal = a[cmSortField];
        const bVal = b[cmSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return cmSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return cmSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });
    const sortedRTVs = [...mockRTVs].sort((a, b) => {
        const aVal = a[rtvSortField];
        const bVal = b[rtvSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return rtvSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return rtvSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });
    const sortedDMs = [...mockDMs].sort((a, b) => {
        const aVal = a[dmSortField];
        const bVal = b[dmSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return dmSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return dmSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });

    const tabs: { id: ReturnsSubTab; label: string }[] = [
        { id: "rmas", label: "RMA'S" },
        { id: "creditMemo", label: "Credit Memo" },
        { id: "rtvs", label: "RTV'S" },
        { id: "debitMemo", label: "Debit Memo" },
    ];

    return (
        <div className="flex flex-col h-full">
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

            <div className="p-0 bg-gray-50 dark:bg-gray-900/50 py-2 min-h-[300px]">
                {activeSubTab === "rmas" && (
                    <QuoteRMASubTab
                        rmas={sortedRMAs}
                        loading={false}
                        sortField={rmaSortField}
                        sortDirection={rmaSortDirection}
                        onSort={handleRmaSort}
                        widths={rmaWidths}
                        onResize={handleRmaResize}
                    />
                )}
                {activeSubTab === "creditMemo" && (
                    <QuoteCreditMemoSubTab
                        memos={sortedCMs}
                        loading={false}
                        sortField={cmSortField}
                        sortDirection={cmSortDirection}
                        onSort={handleCmSort}
                        widths={cmWidths}
                        onResize={handleCmResize}
                    />
                )}
                {activeSubTab === "rtvs" && (
                    <QuoteRTVSubTab
                        rtvs={sortedRTVs}
                        loading={false}
                        sortField={rtvSortField}
                        sortDirection={rtvSortDirection}
                        onSort={handleRtvSort}
                        widths={rtvWidths}
                        onResize={handleRtvResize}
                    />
                )}
                {activeSubTab === "debitMemo" && (
                    <QuoteDebitMemoSubTab
                        memos={sortedDMs}
                        loading={false}
                        sortField={dmSortField}
                        sortDirection={dmSortDirection}
                        onSort={handleDmSort}
                        widths={dmWidths}
                        onResize={handleDmResize}
                    />
                )}
            </div>
        </div>
    );
}
