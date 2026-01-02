import { useState } from "react";
import { Purchase, SupplierBill } from "../types";

interface PurchasesTabProps {
    purchases: Purchase[];
    supplierBills: SupplierBill[];
    loading: boolean;
}

type TabType = "orders" | "bills";

export default function PurchasesTab({ purchases, supplierBills, loading }: PurchasesTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("orders");

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "orders"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Purchase Orders
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === "orders" ? "bg-primary-light text-primary-dark" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"}`}>
                            {purchases.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("bills")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === "bills"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Supplier Bills
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === "bills" ? "bg-primary-light text-primary-dark" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"}`}>
                            {supplierBills.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Content using existing layout styles */}
            <div className="overflow-x-auto">
                {activeTab === "orders" ? (
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
                            {purchases.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <p className="text-lg font-medium">No purchases found</p>
                                            <p className="text-sm">There are no purchase orders associated with this proposal.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => (
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
                ) : (
                    <table className="w-full">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Billed Qty</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Unit Cost</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">PO Line</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {supplierBills.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium">No supplier bills found</p>
                                            <p className="text-sm">There are no supplier bills associated with this proposal.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                supplierBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white font-medium">{bill.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${bill.status === 'Posted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {bill.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            ${bill.totalBillAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{bill.billedQty}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            ${bill.unitCost?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{bill.productName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{bill.purchaseOrderLineName}</td>
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
