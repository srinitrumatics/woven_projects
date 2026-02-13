import { QuotePurchase } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";

type SortDirection = 'asc' | 'desc';

interface QuotePurchasesSubTabProps {
    purchases: QuotePurchase[];
    loading: boolean;
    sortField: keyof QuotePurchase;
    sortDirection: SortDirection;
    onSort: (field: keyof QuotePurchase) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuotePurchasesSubTab({
    purchases,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuotePurchasesSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuotePurchase);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            <table className="w-full whitespace-nowrap">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Purchase Order" field="purchaseOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                        <SortableHeader label="Vendor" field="vendor" sortConfig={sortConfig} requestSort={requestSort} width={widths.vendor} onResize={onResize} align="left" />
                        <SortableHeader label="Date" field="date" sortConfig={sortConfig} requestSort={requestSort} width={widths.date} onResize={onResize} align="left" />
                        <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={onResize} align="right" />
                        <SortableHeader label="Expected Delivery" field="expectedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.expectedDeliveryDate} onResize={onResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {purchases.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No Purchases found</td>
                        </tr>
                    ) : (
                        purchases.map((po) => (
                            <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.purchaseOrderNumber }}>{po.purchaseOrderNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${po.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        po.status === 'Issued' ? 'bg-blue-100 text-blue-800' :
                                            po.status === 'Received' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.vendor }}>{po.vendor}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.date }}>{po.date}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.totalAmount }}>${po.totalAmount.toFixed(2)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.expectedDeliveryDate }}>{po.expectedDeliveryDate}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
