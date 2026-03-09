import { QuoteSupplierBill } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

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
            {bills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">There are no supplier bills associated with this quote.</p>
                </div>
            ) : (
                <table className="w-full truncate">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Bill Number" field="billNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.billNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierDBA} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                            <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                            <SortableHeader label="Total Amount" field="totalAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalAmount} onResize={onResize} align="left" />
                            <SortableHeader label="Billed Date" field="billedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.billedDate} onResize={onResize} align="left" />
                            <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={onResize} align="left" />
                            <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={onResize} align="left" />
                            <SortableHeader label="Remittance Status" field="remittanceStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.remittanceStatus} onResize={onResize} align="left" />
                            <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalance} onResize={onResize} align="left" />
                            <SortableHeader label="Days Outstanding" field="daysOutstanding" sortConfig={sortConfig} requestSort={requestSort} width={widths.daysOutstanding} onResize={onResize} align="left" />
                            <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.billNumber }}>{bill.billNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bill.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        bill.status === 'Posted' ? 'bg-blue-100 text-blue-800' :
                                            bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                'bg-white text-gray-800 border border-gray-200'
                                        }`}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.purchaseOrder }}>{bill.purchaseOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerQuote }}>{bill.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.customerOrder }}>{bill.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.supplierName }}>{bill.supplierName}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.supplierDBA }}>{bill.supplierDBA}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.supplierContact }}>{bill.supplierContact}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white " style={{ width: widths.totalLines }}>{bill.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold" style={{ width: widths.totalCost }}>{formatCurrency(bill.totalCost)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.shipping }}>{formatCurrency(bill.shipping)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold text-primary" style={{ width: widths.totalAmount }}>{formatCurrency(bill.totalAmount)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.billedDate }}>{formatDate(bill.billedDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.paymentTerms }}>{bill.paymentTerms}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.dueDate }}>{formatDate(bill.dueDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.remittanceStatus }}>{bill.remittanceStatus}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.openBalance }}>{formatCurrency(bill.openBalance)}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white " style={{ width: widths.daysOutstanding }}>{bill.daysOutstanding}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.settledDate }}>{formatDate(bill.settledDate, 'numeric-dash')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
