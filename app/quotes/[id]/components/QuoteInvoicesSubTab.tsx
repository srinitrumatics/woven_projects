import { QuoteInvoice } from "@/app/quotes/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SortDirection = 'asc' | 'desc';

interface QuoteInvoicesSubTabProps {
    invoices: QuoteInvoice[];
    loading: boolean;
    sortField: keyof QuoteInvoice;
    sortDirection: SortDirection;
    onSort: (field: keyof QuoteInvoice) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteInvoicesSubTab({
    invoices,
    loading,
    sortField,
    sortDirection,
    onSort,
    widths,
    onResize
}: QuoteInvoicesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = '';
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof QuoteInvoice);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return invoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [invoices, currentPage]);

    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto py-2">
                {invoices.length === 0 ? (
                    <TableEmptyState message="No records found" description="There are no invoices associated with this quote." />
                ) : (
                    <>
                        <Table className="table-fixed">
                            <THead>
                                <tr>
                                    <SortableHeader label="Invoice" field="invoiceNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceNumber} onResize={onResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} align="left" />
                                    <SortableHeader label="Sales Order #" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Purchase Order #" field="purchaseOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Quote #" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={onResize} align="left" />
                                    <SortableHeader label="Proposal #" field="proposalNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalNumber} onResize={onResize} align="left" />
                                    <SortableHeader label="Proposal Name" field="proposalName" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalName} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer Order #" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={onResize} align="left" />
                                    <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={onResize} align="left" />
                                    <SortableHeader label="Bill to Account" field="billToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToAccount} onResize={onResize} align="left" />
                                    <SortableHeader label="Bill to Location" field="billToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToLocation} onResize={onResize} align="left" />
                                    <SortableHeader label="Bill to Contact" field="billToContact" sortConfig={sortConfig} requestSort={requestSort} width={widths.billToContact} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={onResize} align="left" />
                                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={onResize} align="left" />
                                    <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={onResize} align="left" />
                                    <SortableHeader label="Taxes" field="taxes" sortConfig={sortConfig} requestSort={requestSort} width={widths.taxes} onResize={onResize} align="left" />
                                    <SortableHeader label="Grand Total" field="grandTotal" sortConfig={sortConfig} requestSort={requestSort} width={widths.grandTotal} onResize={onResize} align="left" />
                                    <SortableHeader label="Issued Date" field="issuedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.issuedDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Payment Terms" field="paymentTerms" sortConfig={sortConfig} requestSort={requestSort} width={widths.paymentTerms} onResize={onResize} align="left" />
                                    <SortableHeader label="Due Date" field="dueDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.dueDate} onResize={onResize} align="left" />
                                    <SortableHeader label="Collection Status" field="collectionStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.collectionStatus} onResize={onResize} align="left" />
                                    <SortableHeader label="Open Balance" field="openBalance" sortConfig={sortConfig} requestSort={requestSort} width={widths.openBalance} onResize={onResize} align="left" />
                                    <SortableHeader label="Settled Date" field="settledDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.settledDate} onResize={onResize} align="left" />
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedInvoices.map((invoice) => (
                                    <Tr key={invoice.id}>
                                        <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 truncate" style={{ width: widths.invoiceNumber }}>
                                            <Link href={`/invoices/${invoice.id}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {invoice.invoiceNumber}
                                            </Link>
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.status }}>
                                            <StatusBadge status={invoice.status} variant="pill" />
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.salesOrder }}>
                                            {displayCell(invoice.salesOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.purchaseOrder }}>
                                            {displayCell(invoice.purchaseOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerQuote }}>
                                            {invoice.customerQuoteId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/quotes/${invoice.customerQuoteId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {invoice.customerQuote}
                                                    </Link>
                                                ) : displayCell(invoice.customerQuote)
                                            ) : displayCell(invoice.customerQuote)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalNumber }}>
                                            {invoice.proposalId ? (
                                                !isManufacturer ? (
                                                    <Link href={`/proposals/${invoice.proposalId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {invoice.proposalNumber}
                                                    </Link>
                                                ) : displayCell(invoice.proposalNumber)
                                            ) : displayCell(invoice.proposalNumber)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.proposalName }}>
                                            {displayCell(invoice.proposalName)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerOrder }}>
                                            {invoice.customerOrderId ? (
                                                !isManufacturer && !isRestricted ? (
                                                    <Link href={`/orders/${invoice.customerOrderId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                        {invoice.customerOrder}
                                                    </Link>
                                                ) : displayCell(invoice.customerOrder)
                                            ) : displayCell(invoice.customerOrder)}
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.customerPO }}>{displayCell(invoice.customerPO)}</Td>
                                        <Td className="truncate" style={{ width: widths.billToAccount }}>{displayCell(invoice.billToAccount)}</Td>
                                        <Td className="truncate" style={{ width: widths.billToLocation }}>{displayCell(invoice.billToLocation)}</Td>
                                        <Td className="truncate" style={{ width: widths.billToContact }}>{displayCell(invoice.billToContact)}</Td>
                                        <Td className="truncate" style={{ width: widths.totalLines }}>{formatNumber(invoice.totalLines)}</Td>
                                        <Td className="font-bold truncate" style={{ width: widths.totalPrice }}>{formatCurrency(invoice.totalPrice)}</Td>
                                        <Td className="truncate" style={{ width: widths.shipping }}>{formatCurrency(invoice.shipping)}</Td>
                                        <Td className="truncate" style={{ width: widths.taxes }}>{formatCurrency(invoice.taxes)}</Td>
                                        <Td className="text-primary font-bold truncate" style={{ width: widths.grandTotal }}>{formatCurrency(invoice.grandTotal)}</Td>
                                        <Td className="truncate" style={{ width: widths.issuedDate }}>{formatDate(invoice.issuedDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.paymentTerms }}>{displayCell(invoice.paymentTerms)}</Td>
                                        <Td className="truncate" style={{ width: widths.dueDate }}>{formatDate(invoice.dueDate, 'numeric-dash')}</Td>
                                        <Td className="truncate" style={{ width: widths.collectionStatus }}>{displayCell(invoice.collectionStatus)}</Td>
                                        <Td className="truncate" style={{ width: widths.openBalance }}>{formatCurrency(invoice.openBalance)}</Td>
                                        <Td className="truncate" style={{ width: widths.settledDate }}>{formatDate(invoice.settledDate, 'numeric-dash')}</Td>
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
                    totalItems={invoices.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="invoices"
                />
            </div>
        </div>
    );
}

