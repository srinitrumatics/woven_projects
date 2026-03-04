import { QuoteRTV } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

type SortDirection = 'asc' | 'desc';

interface QuoteRTVSubTabProps {
    rtvs: QuoteRTV[];
    loading: boolean;
    sortField: keyof QuoteRTV;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteRTV) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function QuoteRTVSubTab({
    rtvs,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteRTVSubTabProps) {
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteRTV);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-2">
            {rtvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">There are no RTVs associated with this quote.</p>
                </div>
            ) : (
                <table className="w-full truncate">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="RTV" field="rtvNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                            <SortableHeader label="Purchase Order" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                            <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                            <SortableHeader label="RTV Type" field="rtvType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvType} onResize={onResize} align="left" />
                            <SortableHeader label="RMA Number" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaNumber} onResize={onResize} align="left" />
                            <SortableHeader label="Ship from Account" field="shipFromAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromAccount} onResize={onResize} align="left" />
                            <SortableHeader label="Ship from Contact" field="shipFromContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromContact} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                            <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                            <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                            <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                            <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                            <SortableHeader label="Approval Date" field="approvalDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.approvalDate} onResize={onResize} align="left" />
                            <SortableHeader label="Return by Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnByDate} onResize={onResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rtvs.map((rtv) => (
                            <tr key={rtv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800" style={{ width: widths.rtvNumber }}>{rtv.rtvNumber}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" style={{ width: widths.status }}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${rtv.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        rtv.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {rtv.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.purchaseOrder }}>{rtv.purchaseOrder}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.customerQuote }}>{rtv.customerQuote}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.customerOrder }}>{rtv.customerOrder}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.rtvType }}>{rtv.rtvType}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.rmaNumber }}>{rtv.rmaNumber}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.shipFromAccount }}>{rtv.shipFromAccount}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.shipFromContact }}>{rtv.shipFromContact}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.supplierName }}>{rtv.supplierName}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.supplierContact }}>{rtv.supplierContact}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.totalLines }}>{rtv.totalLines}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.totalCost }}>{formatCurrency(rtv.totalCost)}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.issuedDate }}>{formatDate(rtv.issuedDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.approvalDate }}>{formatDate(rtv.approvalDate, 'numeric-dash')}</td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white" style={{ width: widths.returnByDate }}>{formatDate(rtv.returnByDate, 'numeric-dash')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
