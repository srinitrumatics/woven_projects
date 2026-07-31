import { QuoteShippingManifest } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SortDirection = 'asc' | 'desc';

interface QuoteShippingManifestsSubTabProps {
    manifests: QuoteShippingManifest[];
    loading: boolean;
    sortField: keyof QuoteShippingManifest;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteShippingManifest) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteShippingManifestsSubTab({
    manifests,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteShippingManifestsSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = '';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteShippingManifest);

    const paginatedManifests = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return manifests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [manifests, currentPage]);

    const totalPages = Math.ceil(manifests.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto py-2">
                {manifests.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no shipping manifests associated with this quote." />
                ) : (
                    <>
                        <Table>
                            <THead>
                                <tr>
                                    <SortableHeader label="Shipping Manifest #" field="manifestNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.manifestNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                    <SortableHeader label="Sales Order #" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                    <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                                    <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxCount} onResize={onResize} align="left" />
                                    <SortableHeader label="Box Length" field="boxLength" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxLength} onResize={onResize} align="left" />
                                    <SortableHeader label="Box Width" field="boxWidth" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxWidth} onResize={onResize} align="left" />
                                    <SortableHeader label="Box Height" field="boxHeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxHeight} onResize={onResize} align="left" />
                                    <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxNetWeight} onResize={onResize} align="left" />
                                    <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={requestSort} width={widths.boxGrossWeight} onResize={onResize} align="left" />
                                    <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" />
                                    <SortableHeader label="Planned Ship Date" field="plannedShipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.plannedShipDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" />
                                    <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" />
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedManifests.map((manifest) => (
                                    <Tr key={manifest.id}>
                                        <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.manifestNumber }} title={manifest.manifestNumber}>
                                            <Link href={`/shipments/${manifest.id}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {manifest.manifestNumber}
                                            </Link>
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={manifest.status} variant="pill" />
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.salesOrder }}>
                                            {displayCell(manifest.salesOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerQuote }}>
                                            {manifest.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${manifest.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {manifest.customerQuote}
                                                    </Link>
                                                ) : displayCell(manifest.customerQuote)
                                            ) : displayCell(manifest.customerQuote)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalNumber }}>
                                            {manifest.proposalId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/proposals/${manifest.proposalId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {manifest.proposalNumber}
                                                    </Link>
                                                ) : displayCell(manifest.proposalNumber)
                                            ) : displayCell(manifest.proposalNumber)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalName }}>
                                            {displayCell(manifest.proposalName)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerOrder }}>
                                            {manifest.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${manifest.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {manifest.customerOrder}
                                                    </Link>
                                                ) : displayCell(manifest.customerOrder)
                                            ) : displayCell(manifest.customerOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerPO }}>{displayCell(manifest.customerPO)}</Td>
                                        <Td className="truncate" style={{ width: widths.shipToAccount }}>{displayCell(manifest.shipToAccount)}</Td>
                                        <Td className="truncate" style={{ width: widths.shipToLocation }}>{displayCell(manifest.shipToLocation)}</Td>
                                        <Td className="truncate" style={{ width: widths.shipToContact }}>{displayCell(manifest.shipToContact)}</Td>
                                        <Td className="truncate" style={{ width: widths.dropShip }}>{manifest.dropShip ? 'Yes' : 'No'}</Td>
                                        <Td className="truncate" style={{ width: widths.totalLines }}>{formatNumber(manifest.totalLines)}</Td>
                                        <Td className="font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(manifest.totalPrice)}</Td>
                                        <Td className="truncate" style={{ width: widths.boxCount }}>{formatNumber(manifest.boxCount)}</Td>
                                        <Td className="truncate" style={{ width: widths.boxLength }}>{formatNumber(manifest.boxLength)}</Td>
                                        <Td className="truncate" style={{ width: widths.boxWidth }}>{formatNumber(manifest.boxWidth)}</Td>
                                        <Td className="truncate" style={{ width: widths.boxHeight }}>{formatNumber(manifest.boxHeight)}</Td>
                                        <Td className="truncate" style={{ width: widths.boxNetWeight }}>{formatNumber(manifest.boxNetWeight)}</Td>
                                        <Td className="truncate" style={{ width: widths.boxGrossWeight }}>{formatNumber(manifest.boxGrossWeight)}</Td>
                                        <Td className="truncate" style={{ width: widths.logisticsPartner }}>{displayCell(manifest.logisticsPartner)}</Td>
                                        <Td className="truncate" style={{ width: widths.plannedShipDate }}>{formatDate(manifest.plannedShipDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.shipConfirmedDate }}>{formatDate(manifest.shipConfirmedDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.trackingNumber }}>{displayCell(manifest.trackingNumber)}</Td>
                                        <Td className="truncate" style={{ width: widths.trackingStatus }}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${manifest.trackingStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {manifest.trackingStatus}
                                            </span>
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.estimatedDeliveryDate }}>{formatDate(manifest.estimatedDeliveryDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.actualDeliveryDate }}>{formatDate(manifest.actualDeliveryDate, 'numeric-dash')}</Td>
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
                    totalItems={manifests.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="shipping manifests"
                />
            </div>
        </div>
    );
}

