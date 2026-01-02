import { useState } from "react";
import { PurchasesData } from "../../../types";

interface LinePurchasesTabProps {
    purchasesData: PurchasesData;
    loading: boolean;
}

type TabType = "purchases" | "supplier_bills";

export default function LinePurchasesTab({ purchasesData, loading }: LinePurchasesTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("purchases");

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { purchaseOrders, supplierBills } = purchasesData;

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab("purchases")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "purchases"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                >
                    Purchases
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === "purchases"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}>
                        {purchaseOrders.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("supplier_bills")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "supplier_bills"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                >
                    Supplier Bills
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === "supplier_bills"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}>
                        {supplierBills.length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                {activeTab === "purchases" && (
                    <table className="w-full">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Vendor</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Vendor PO</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Order Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Expected Date</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {purchaseOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <p className="text-lg font-medium">No purchases found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchaseOrders.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{purchase.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${purchase.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                purchase.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    purchase.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{purchase.vendorName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{purchase.vendorPO}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{purchase.orderDate}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{purchase.expectedDate}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                            ${purchase.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === "supplier_bills" && (
                    <table className="w-full">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">PO Line</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Billed Qty</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Bill Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {supplierBills.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium">No supplier bills found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                supplierBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{bill.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${bill.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{bill.supplierBillName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{bill.purchaseOrderLineName}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{bill.billedQty}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                                            ${bill.billAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
