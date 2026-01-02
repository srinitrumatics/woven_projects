import { useState } from "react";
import { ReturnsData, ReturnsTabType, Return, RMA, RTV, CreditMemo, DebitMemo } from "../../../types";

interface LineReturnsTabProps {
    returnsData: ReturnsData;
    loading: boolean;
}

export default function LineReturnsTab({ returnsData, loading }: LineReturnsTabProps) {
    const [activeTab, setActiveTab] = useState<ReturnsTabType>("rma");

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const tabs: { id: ReturnsTabType; label: string; count: number }[] = [
        { id: "rma", label: "RMAs", count: returnsData.rma.length },
        { id: "rtv", label: "RTVs", count: returnsData.rtv.length },
        { id: "credit", label: "Credit Memos", count: returnsData.creditMemos.length },
        { id: "debit", label: "Debit Memos", count: returnsData.debitMemos.length },
    ];

    const getActiveData = (): Return[] => {
        switch (activeTab) {
            case "rma": return returnsData.rma;
            case "rtv": return returnsData.rtv;
            case "credit": return returnsData.creditMemos;
            case "debit": return returnsData.debitMemos;
            default: return [];
        }
    };

    const activeData = getActiveData();

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Number</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                            {activeTab === 'rma' && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship From Account</th>}
                            {activeTab === 'rtv' && (
                                <>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Supplier</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                                </>
                            )}
                            {activeTab === 'credit' && (
                                <>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Credit To Account</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Invoice</th>
                                </>
                            )}
                            {activeTab === 'debit' && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Debit To Account</th>}
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activeData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        <p className="text-lg font-medium">No {tabs.find(t => t.id === activeTab)?.label} found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            activeData.map((item) => {
                                // Type guards or casting can be used here if needed, or simple property access if common
                                const rma = item as RMA;
                                const rtv = item as RTV;
                                const credit = item as CreditMemo;
                                const debit = item as DebitMemo;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{item.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                item.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        {activeTab === 'rma' && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rma.shipFromAccountName}</td>}
                                        {activeTab === 'rtv' && (
                                            <>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.supplierName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rtv.rtvType}</td>
                                            </>
                                        )}
                                        {activeTab === 'credit' && (
                                            <>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.creditToAccountName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{credit.invoiceName}</td>
                                            </>
                                        )}
                                        {activeTab === 'debit' && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{debit.debitToAccountName}</td>}
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.requestDate}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                            ${item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
