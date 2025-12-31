import { Purchase } from "../types";

interface PurchasesTabProps {
    purchases: Purchase[];
    loading: boolean;
}

export default function PurchasesTab({ purchases, loading }: PurchasesTabProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
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
        </div>
    );
}
