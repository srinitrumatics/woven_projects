import { QuoteRMA } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto py-2">
                {rmas.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no RMAs associated with this quote." />
                ) : (
                    <>
                        <Table className="table-fixed">
                            <THead>
                                <tr>
                                    <SortableHeader label="RMA #" field="rmaNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                    <SortableHeader label="Type" field="rmaType" sortConfig={sortConfig} requestSort={requestSort} width={widths.rmaType} onResize={onResize} align="left" />
                                    <SortableHeader label="Sales Order #" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                    <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship from Account" field="shipFromAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship from Contact" field="shipFromContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipFromContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Return to Account" field="returnToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnToAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Return to Contact" field="returnToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnToContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Return By Date" field="returnByDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.returnByDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={onResize} align="left" />
                                    <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" />
                                    <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Goods Receipt Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={onResize} align="left" />
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedRMAs.map((rma) => (
                                    <Tr key={rma.id}>
                                        <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.rmaNumber }} title={rma.rmaNumber}>
                                            {/* No direct RMA module listed, but keeping it consistent */}
                                            {rma.rmaNumber}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={rma.status} variant="pill" />
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.rmaType }} title={rma.rmaType}>{displayCell(rma.rmaType)}</Td>
                                        <Td className="truncate" style={{ width: widths.salesOrder }} title={rma.salesOrder}>
                                            {displayCell(rma.salesOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerQuote }} title={rma.customerQuote}>
                                            {rma.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${rma.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rma.customerQuote}
                                                    </Link>
                                                ) : displayCell(rma.customerQuote)
                                            ) : displayCell(rma.customerQuote)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalNumber }} title={rma.proposalNumber}>
                                            {rma.proposalId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/proposals/${rma.proposalId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rma.proposalNumber}
                                                    </Link>
                                                ) : displayCell(rma.proposalNumber)
                                            ) : displayCell(rma.proposalNumber)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalName }} title={rma.proposalName}>
                                            {displayCell(rma.proposalName)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerOrder }} title={rma.customerOrder}>
                                            {rma.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${rma.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {rma.customerOrder}
                                                    </Link>
                                                ) : displayCell(rma.customerOrder)
                                            ) : displayCell(rma.customerOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.shipFromAccount }} title={rma.shipFromAccount}>{displayCell(rma.shipFromAccount)}</Td>
                                        <Td className="truncate" style={{ width: widths.shipFromContact }} title={rma.shipFromContact}>{displayCell(rma.shipFromContact)}</Td>
                                        <Td className="truncate" style={{ width: widths.returnToAccount }} title={rma.returnToAccount}>{displayCell(rma.returnToAccount)}</Td>
                                        <Td className="truncate" style={{ width: widths.returnToContact }} title={rma.returnToContact}>{displayCell(rma.returnToContact)}</Td>
                                        <Td className="truncate" style={{ width: widths.dropShip }} title={rma.dropShip ? 'Yes' : 'No'}>{rma.dropShip ? 'Yes' : 'No'}</Td>
                                        <Td className="truncate" style={{ width: widths.totalLines }} title={String(rma.totalLines)}>{formatNumber(rma.totalLines)}</Td>
                                        <Td className="font-bold truncate" style={{ width: widths.totalPrice }} title={formatCurrency(rma.totalPrice)}>{formatCurrency(rma.totalPrice)}</Td>
                                        <Td className="truncate" style={{ width: widths.issuedDate }} title={formatDate(rma.issuedDate, 'numeric-dash')}>{formatDate(rma.issuedDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.returnByDate }} title={formatDate(rma.returnByDate, 'numeric-dash')}>{formatDate(rma.returnByDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.shippingMethod }} title={rma.shippingMethod}>{displayCell(rma.shippingMethod)}</Td>
                                        <Td className="truncate" style={{ width: widths.logisticsPartner }} title={rma.logisticsPartner}>{displayCell(rma.logisticsPartner)}</Td>
                                        <Td className="truncate" style={{ width: widths.logisticsContact }} title={rma.logisticsContact}>{displayCell(rma.logisticsContact)}</Td>
                                        <Td className="truncate" style={{ width: widths.trackingNumber }} title={rma.trackingNumber}>{displayCell(rma.trackingNumber)}</Td>
                                        <Td className="truncate" style={{ width: widths.trackingStatus }} title={rma.trackingStatus}>{displayCell(rma.trackingStatus)}</Td>
                                        <Td className="truncate" style={{ width: widths.estimatedDeliveryDate }} title={formatDate(rma.estimatedDeliveryDate, 'numeric-dash')}>{formatDate(rma.estimatedDeliveryDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.actualDeliveryDate }} title={formatDate(rma.actualDeliveryDate, 'numeric-dash')}>{formatDate(rma.actualDeliveryDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.goodsReceiptDate }} title={formatDate(rma.goodsReceiptDate, 'numeric-dash')}>{formatDate(rma.goodsReceiptDate, 'numeric-dash')}</Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>

                    </>
                )}
            </div>
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

