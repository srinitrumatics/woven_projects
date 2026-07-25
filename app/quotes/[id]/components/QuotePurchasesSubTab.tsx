import { QuotePurchase, QuoteStatus } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

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

const ITEMS_PER_PAGE = 10;

export default function QuotePurchasesSubTab({
    purchases,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuotePurchasesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuotePurchase);

    const paginatedPurchases = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return purchases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [purchases, currentPage]);

    const totalPages = Math.ceil(purchases.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div className="overflow-x-auto py-2">
            {purchases.length === 0 ? (
                <TableEmptyState message="No records found" description="There are no purchases associated with this quote." />
            ) : (
                <>
                    <Table>
                        <THead>
                            <tr>
                                <SortableHeader label="Purchase Order" field="purchaseOrderNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                                <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={onResize} align="left" />
                                <SortableHeader label="Supplier DBA" field="supplierDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierDBA} onResize={onResize} align="left" />
                                <SortableHeader label="Supplier Contact" field="supplierContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierContact} onResize={onResize} align="left" />
                                <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={onResize} align="left" />
                                <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={onResize} align="left" />
                                <SortableHeader label="Ship to Contact" field="shipToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToContact} onResize={onResize} align="left" />
                                <SortableHeader label="Drop Ship" field="dropShip" sortConfig={sortConfig} requestSort={requestSort} width={widths.dropShip} onResize={onResize} align="left" />
                                <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                <SortableHeader label="Product Cost" field="productCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.productCost} onResize={onResize} align="left" />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                                <SortableHeader label="Total Cost" field="totalCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalCost} onResize={onResize} align="left" />
                                <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                <SortableHeader label="Acknowledged Date" field="acknowledgedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.acknowledgedDate} onResize={onResize} align="left" />
                                <SortableHeader label="Request Date" field="requestDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestDate} onResize={onResize} align="left" />
                                <SortableHeader label="Promise Date" field="promiseDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.promiseDate} onResize={onResize} align="left" />
                                <SortableHeader label="Shipping Method" field="shippingMethod" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingMethod} onResize={onResize} align="left" />
                                <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={onResize} align="left" />
                                <SortableHeader label="Logistics Contact" field="logisticsContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsContact} onResize={onResize} align="left" />
                                <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={onResize} align="left" />
                                <SortableHeader label="Estimated Delivery Date" field="estimatedDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedDeliveryDate} onResize={onResize} align="left" />
                                <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={onResize} align="left" />
                                <SortableHeader label="Actual Delivery Date" field="actualDeliveryDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.actualDeliveryDate} onResize={onResize} align="left" />
                                <SortableHeader label="Goods Receipts Date" field="goodsReceiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.goodsReceiptDate} onResize={onResize} align="left" />
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedPurchases.map((po) => (
                                <Tr key={po.id}>
                                    <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.purchaseOrderNumber }}>
                                        <Link href={`/purchase-orders/${po.id}`} target="_blank" className="text-primary hover:underline font-bold">
                                            {po.purchaseOrderNumber}
                                        </Link>
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.status }}>
                                        <StatusBadge status={po.status as QuoteStatus} />
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerQuote }}>
                                        {po.customerQuoteId ? (
                                            <Link href={`/quotes/${po.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {po.customerQuote}
                                            </Link>
                                        ) : displayCell(po.customerQuote)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerOrder }}>
                                        {po.customerOrderId ? (
                                            <Link href={`/orders/${po.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {po.customerOrder}
                                            </Link>
                                        ) : displayCell(po.customerOrder)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.customerPO }}>{displayCell(po.customerPO)}</Td>
                                    <Td className="truncate" style={{ width: widths.supplierName }}>{displayCell(po.supplierName)}</Td>
                                    <Td className="truncate" style={{ width: widths.supplierDBA }}>{displayCell(po.supplierDBA)}</Td>
                                    <Td className="truncate" style={{ width: widths.supplierContact }}>{displayCell(po.supplierContact)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipToAccount }}>{displayCell(po.shipToAccount)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipToLocation }}>{displayCell(po.shipToLocation)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipToContact }}>{displayCell(po.shipToContact)}</Td>
                                    <Td className="truncate" style={{ width: widths.dropShip }}>{po.dropShip ? 'Yes' : 'No'}</Td>
                                    <Td className="truncate" style={{ width: widths.totalLines }}>{po.totalLines}</Td>
                                    <Td className="font-bold truncate" style={{ width: widths.productCost }}>{formatCurrency(po.productCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(po.shipping)}</Td>
                                    <Td className="font-bold text-primary truncate" style={{ width: widths.totalCost }}>{formatCurrency(po.totalCost)}</Td>
                                    <Td className="truncate" style={{ width: widths.issuedDate }}>{formatDate(po.issuedDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.acknowledgedDate }}>{formatDate(po.acknowledgedDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.requestDate }}>{formatDate(po.requestDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.promiseDate }}>{formatDate(po.promiseDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.shippingMethod }}>{displayCell(po.shippingMethod)}</Td>
                                    <Td className="truncate" style={{ width: widths.logisticsPartner }}>{displayCell(po.logisticsPartner)}</Td>
                                    <Td className="truncate" style={{ width: widths.logisticsContact }}>{displayCell(po.logisticsContact)}</Td>
                                    <Td className="truncate" style={{ width: widths.trackingNumber }}>{displayCell(po.trackingNumber)}</Td>
                                    <Td className="truncate" style={{ width: widths.estimatedDeliveryDate }}>{formatDate(po.estimatedDeliveryDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.trackingStatus }}>{displayCell(po.trackingStatus)}</Td>
                                    <Td className="truncate" style={{ width: widths.actualDeliveryDate }}>{formatDate(po.actualDeliveryDate, 'numeric-dash')}</Td>
                                    <Td className="truncate" style={{ width: widths.goodsReceiptDate }}>{formatDate(po.goodsReceiptDate, 'numeric-dash')}</Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>

                </>
            )}
        </div>
    );
}
function StatusBadge({ status }: { status: QuoteStatus }) {
    const getStyles = () => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Draft":
                return "bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "Rejected":
            case "Canceled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Converted":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Shipped":
                return "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
            case "Partial Shipment":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
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