import { useState } from "react";
import { QuoteRMA, QuoteCreditMemo, QuoteRTV, QuoteDebitMemo } from "@/app/quotes/types";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import QuoteRMASubTab from "./QuoteRMASubTab";
import QuoteCreditMemoSubTab from "./QuoteCreditMemoSubTab";
import QuoteRTVSubTab from "./QuoteRTVSubTab";
import QuoteDebitMemoSubTab from "./QuoteDebitMemoSubTab";
import SubTabs from "@/components/ui/SubTabs";

type ReturnsSubTab = "rmas" | "creditMemo" | "rtvs" | "debitMemo";

interface QuoteReturnsTabProps {
    quoteId: string;
    accountType?: string;
    data: {
        rma: QuoteRMA[];
        creditMemos: QuoteCreditMemo[];
        rtv: QuoteRTV[];
        debitMemos: QuoteDebitMemo[];
    };
    loading: boolean;
}

export default function QuoteReturnsTab({ quoteId, accountType, data, loading }: QuoteReturnsTabProps): JSX.Element {
    const [activeSubTab, setActiveSubTab] = useState<ReturnsSubTab>("rmas");
    const { rma = [], creditMemos = [], rtv = [], debitMemos = [] } = data;

    const isCustomerOrNSO = accountType?.toLowerCase() === 'customer' || accountType?.toLowerCase() === 'nso';

    const tabs: { id: ReturnsSubTab; label: string; count: number }[] = (([
        { id: "rmas", label: "RMAs", count: rma.length },
        { id: "creditMemo", label: "Credit Memos", count: creditMemos.length },
        { id: "rtvs", label: "RTVs", count: rtv.length },
        { id: "debitMemo", label: "Debit Memos", count: debitMemos.length },
    ] as { id: ReturnsSubTab; label: string; count: number }[]).filter(tab => {
        if (isCustomerOrNSO && (tab.id === 'rtvs' || tab.id === 'debitMemo')) return false;
        return true;
    }));

    // RMA State
    const [rmaSortField, setRmaSortField] = useState<keyof QuoteRMA>("rmaNumber");
    const [rmaSortDirection, setRmaSortDirection] = useState<'asc' | 'desc'>('asc');

    // Credit Memo State
    const [cmSortField, setCmSortField] = useState<keyof QuoteCreditMemo>("memoNumber");
    const [cmSortDirection, setCmSortDirection] = useState<'asc' | 'desc'>('asc');

    // RTV State
    const [rtvSortField, setRtvSortField] = useState<keyof QuoteRTV>("rtvNumber");
    const [rtvSortDirection, setRtvSortDirection] = useState<'asc' | 'desc'>('desc');

    // Debit Memo State
    const [dmSortField, setDmSortField] = useState<keyof QuoteDebitMemo>("memoNumber");
    const [dmSortDirection, setDmSortDirection] = useState<'asc' | 'desc'>('desc');

    // Resizable Columns for RMA (23 fields)
    const { widths: rmaWidths, handleResize: handleRmaResize } = useResizableColumns({
        rmaNumber: 150,
        status: 100,
        rmaType: 120,
        salesOrder: 150,
        customerQuote: 150,
        proposalNumber: 150,
        proposalName: 150,
        customerOrder: 150,
        supplierBill: 150,
        purchaseOrder: 150,
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
        trackingStatus: 200,
        estimatedDeliveryDate: 200,
        actualDeliveryDate: 150,
        goodsReceiptDate: 150
    });

    const { widths: cmWidths, handleResize: handleCmResize } = useResizableColumns({
        memoNumber: 150,
        status: 120,
        invoice: 150,
        salesOrder: 150,
        customerQuote: 150,
        proposalNumber: 150,
        proposalName: 150,
        customerOrder: 150,
        supplierBill: 150,
        purchaseOrder: 150,
        totalLines: 100,
        totalPrice: 120,
        shipping: 100,
        taxes: 100,
        totalCreditAmount: 140,
        issuedDate: 120,
        expirationDate: 120,
        availableCreditBalance: 190,
        settledDate: 120
    });
    const { widths: rtvWidths, handleResize: handleRtvResize } = useResizableColumns({
        rtvNumber: 150,
        status: 120,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        supplierBill: 150,
        salesOrder: 150,
        rtvType: 120,
        rmaNumber: 150,
        shipFromAccount: 150,
        shipFromContact: 150,
        supplierName: 150,
        supplierContact: 150,
        totalLines: 100,
        totalCost: 120,
        issuedDate: 120,
        approvalDate: 120,
        returnByDate: 120
    });
    const { widths: dmWidths, handleResize: handleDmResize } = useResizableColumns({
        memoNumber: 150,
        status: 100,
        supplierBill: 150,
        purchaseOrder: 150,
        customerQuote: 150,
        customerOrder: 150,
        salesOrder: 150,
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
    const sortedRMAs = [...rma].sort((a, b) => {
        const aVal = a[rmaSortField];
        const bVal = b[rmaSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return rmaSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return rmaSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });
    const sortedCMs = [...creditMemos].sort((a, b) => {
        const aVal = a[cmSortField];
        const bVal = b[cmSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return cmSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return cmSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });
    const sortedRTVs = [...rtv].sort((a, b) => {
        const aVal = a[rtvSortField];
        const bVal = b[rtvSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return rtvSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return rtvSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });
    const sortedDMs = [...debitMemos].sort((a, b) => {
        const aVal = a[dmSortField];
        const bVal = b[dmSortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') return dmSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return dmSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
    });


    return (
        <div className="flex flex-col h-full min-w-0">
            <SubTabs
                tabs={tabs.map((tab) => ({ key: tab.id, label: tab.label, count: tab.count }))}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as ReturnsSubTab)}
            />

            <div className="p-0 bg-gray-50 dark:bg-gray-900/50 ">
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
