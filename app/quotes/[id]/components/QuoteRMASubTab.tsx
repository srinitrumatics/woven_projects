import { QuoteRMA } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";

type SortDirection = 'asc' | 'desc';

interface QuoteRMASubTabProps {
    rmas: QuoteRMA[];
    loading: boolean;
    sortField: keyof QuoteRMA;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteRMA) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteRMASubTab({
    rmas,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteRMASubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = '';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteRMA);

    const paginatedRMAs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return rmas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [rmas, currentPage]);

    const totalPages = Math.ceil(rmas.length / ITEMS_PER_PAGE);

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
                {rmas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium" title="No records found">No records found</p>
                        <p className="text-sm" title="There are no RMAs associated with this quote.">There are no RMAs associated with this quote.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full table-fixed">
                            <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <SortableHeader label="RMA #" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" truncate={false} />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaType} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Sales Order #" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Proposal #" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Ship from Account" field="shipFromAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromAccount} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Ship from Contact" field="shipFromContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromContact} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Return to Account" field="returnToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnToAccount} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Return to Contact" field="returnToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnToContact} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Return By Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnByDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" truncate={false} />
                                    <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={onResize} align="left" truncate={false} />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedRMAs.map((rma) => (
                                    <tr key={rma.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.rmaNumber }} title={rma.rmaNumber}>
                                            {/* No direct RMA module listed, but keeping it consistent */}
                                            {rma.rmaNumber}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={rma.status} />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.rmaType }} title={rma.rmaType}>{displayCell(rma.rmaType)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.salesOrder }} title={rma.salesOrder}>
                                            {displayCell(rma.salesOrder)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuote }} title={rma.customerQuote}>
                                            {rma.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${rma.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rma.customerQuote}
                                                    </Link>
                                                ) : displayCell(rma.customerQuote)
                                            ) : displayCell(rma.customerQuote)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.proposalNumber }} title={rma.proposalName}>
                                            {rma.proposalId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/proposals/${rma.proposalId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rma.proposalName}
                                                    </Link>
                                                ) : displayCell(rma.proposalName)
                                            ) : displayCell(rma.proposalName)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.proposalName }} title={rma.proposalName}>
                                            {displayCell(rma.proposalName)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerOrder }} title={rma.customerOrder}>
                                            {rma.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${rma.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rma.customerOrder}
                                                    </Link>
                                                ) : displayCell(rma.customerOrder)
                                            ) : displayCell(rma.customerOrder)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipFromAccount }} title={rma.shipFromAccount}>{displayCell(rma.shipFromAccount)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipFromContact }} title={rma.shipFromContact}>{displayCell(rma.shipFromContact)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnToAccount }} title={rma.returnToAccount}>{displayCell(rma.returnToAccount)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnToContact }} title={rma.returnToContact}>{displayCell(rma.returnToContact)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.dropShip }} title={rma.dropShip ? 'Yes' : 'No'}>{rma.dropShip ? 'Yes' : 'No'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.totalLines }} title={String(rma.totalLines)}>{formatNumber(rma.totalLines)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  font-bold truncate" style={{ width: widths.totalPrice }} title={formatCurrency(rma.totalPrice)}>{formatCurrency(rma.totalPrice)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.issuedDate }} title={formatDate(rma.issuedDate, 'numeric-dash')}>{formatDate(rma.issuedDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.returnByDate }} title={formatDate(rma.returnByDate, 'numeric-dash')}>{formatDate(rma.returnByDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shippingMethod }} title={rma.shippingMethod}>{displayCell(rma.shippingMethod)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.logisticsPartner }} title={rma.logisticsPartner}>{displayCell(rma.logisticsPartner)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.logisticsContact }} title={rma.logisticsContact}>{displayCell(rma.logisticsContact)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingNumber }} title={rma.trackingNumber}>{displayCell(rma.trackingNumber)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.trackingStatus }} title={rma.trackingStatus}>{displayCell(rma.trackingStatus)}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.estimatedDeliveryDate }} title={formatDate(rma.estimatedDeliveryDate, 'numeric-dash')}>{formatDate(rma.estimatedDeliveryDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.actualDeliveryDate }} title={formatDate(rma.actualDeliveryDate, 'numeric-dash')}>{formatDate(rma.actualDeliveryDate, 'numeric-dash')}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.goodsReceiptDate }} title={formatDate(rma.goodsReceiptDate, 'numeric-dash')}>{formatDate(rma.goodsReceiptDate, 'numeric-dash')}</td>
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
                    totalItems={rmas.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="RMAs"
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
            case "Paid":
            case "Posted":
            case "Delivered":
            case "Completed":
            case "Applied":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Open":
            case "Shipped":
            case "Converted":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Pending":
            case "Partial Shipment":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Draft":
                return "bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "Rejected":
            case "Partial Rejected":
            case "Cancelled":
            case "Canceled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Closed":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
