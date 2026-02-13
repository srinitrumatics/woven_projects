import { QuoteSupplierBill } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";

type SortDirection = 'asc' | 'desc';

interface QuoteSupplierBillsSubTabProps {
    bills: QuoteSupplierBill[];
    loading: boolean;
    sortField: keyof QuoteSupplierBill;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteSupplierBill) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteSupplierBillsSubTab({
    bills,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteSupplierBillsSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteSupplierBill);

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
                        <SortableHeader label="Bill Number" field="billNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.billNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                        <SortableHeader label="Vendor" field="vendor" sortConfig={sortConfig} requestSort={requestSort} width={widths.vendor} onResize={onResize} align="left" />
                        <SortableHeader label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                        <SortableHeader label="Bill Date" field="billDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.billDate} onResize={onResize} align="left" />
                        <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={onResize} align="left" />
                        <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={onResize} align="right" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {bills.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No Supplier Bills found</td>
                        </tr>
                    ) : (
                        bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.billNumber }}>{bill.billNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bill.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        bill.status === 'Posted' ? 'bg-blue-100 text-blue-800' :
                                            bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.vendor }}>{bill.vendor}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.purchaseOrder }}>{bill.purchaseOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billDate }}>{bill.billDate}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.dueDate }}>{bill.dueDate}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white" style={{ width: widths.totalAmount }}>${bill.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
