import { QuoteRTV } from"@/app/quotes/types";
import { SortableHeader } from"@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from"next/link";
import Pagination from"@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";

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

const ITEMS_PER_PAGE = 10;

export default function QuoteRTVSubTab({
    rtvs,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteRTVSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteRTV);

    const paginatedRTVs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return rtvs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [rtvs, currentPage]);

    const totalPages = Math.ceil(rtvs.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto py-2">
                {rtvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium"title="No records found">No records found</p>
                        <p className="text-sm"title="There are no RTVs associated with this quote.">There are no RTVs associated with this quote.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="RTV"field="rtvNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvNumber} onResize={onResize} align="left"className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status"field="status"sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                    <SortableHeader label="Purchase Order"field="purchaseOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Quote"field="customerQuote"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Order"field="customerOrder"sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="RTV Type"field="rtvType"sortConfig={sortConfig} requestSort={requestSort} width={widths.rtvType} onResize={onResize} align="left" />
                                    <SortableHeader label="RMA Number"field="rmaNumber"sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship from Account"field="shipFromAccount"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship from Contact"field="shipFromContact"sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Supplier Name"field="supplierName"sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                                    <SortableHeader label="Supplier Contact"field="supplierContact"sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Lines"field="totalLines"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Cost"field="totalCost"sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                                    <SortableHeader label="Issued Date"field="issuedDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Approval Date"field="approvalDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.approvalDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Return by Date"field="returnByDate"sortConfig={sortConfig} requestSort={requestSort} width={widths.returnByDate} onResize={onResize} align="left" />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedRTVs.map((rtv) => (
                                    <tr key={rtv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.rtvNumber }}>
                                            {/* No direct RTV module listed, but keeping it consistent */}
                                            {rtv.rtvNumber}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={rtv.status} />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.purchaseOrder }}>
                                            {rtv.purchaseOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/purchase-orders/${rtv.purchaseOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rtv.purchaseOrder}
                                                    </Link>
                                                ) : displayCell(rtv.purchaseOrder)
                                            ) : displayCell(rtv.purchaseOrder)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }}>
                                            {rtv.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${rtv.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rtv.customerQuote}
                                                    </Link>
                                                ) : displayCell(rtv.customerQuote)
                                            ) : displayCell(rtv.customerQuote)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }}>
                                            {rtv.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${rtv.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rtv.customerOrder}
                                                    </Link>
                                                ) : displayCell(rtv.customerOrder)
                                            ) : displayCell(rtv.customerOrder)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.rtvType }}>{displayCell(rtv.rtvType)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.rmaNumber }}>
                                            {/* No direct RMA module listed, but keeping it consistent if we had rmaId */}
                                            {displayCell(rtv.rmaNumber)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.shipFromAccount }}>{displayCell(rtv.shipFromAccount)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.shipFromContact }}>{displayCell(rtv.shipFromContact)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.supplierName }}>{displayCell(rtv.supplierName)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.supplierContact }}>{displayCell(rtv.supplierContact)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }}>{formatNumber(rtv.totalLines)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalCost }}>{formatCurrency(rtv.totalCost)}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.issuedDate }}>{formatDate(rtv.issuedDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.approvalDate }}>{formatDate(rtv.approvalDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white truncate" style={{ width: widths.returnByDate }}>{formatDate(rtv.returnByDate, 'numeric-dash')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </>
                )}
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={rtvs.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName=""
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case"Approved":
            case"Paid":
            case"Posted":
            case"Delivered":
            case"Completed":
            case"Applied":
                return"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case"Open":
            case"Shipped":
            case"Converted":
                return"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case"Pending":
            case"Partial Shipment":
                return"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case"Draft":
                return"bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case"Rejected":
            case"Partial Rejected":
            case"Cancelled":
            case"Canceled":
                return"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case"Expired":
                return"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case"Closed":
                return"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            default:
                return"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
