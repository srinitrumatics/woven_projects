import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useUserSession } from "@/components/UserSessionContext";

interface SBLI {
    id: string;
    name: string;
    status: string;
    supplierBill: string;
    supplierBillId: string;
    purchaseOrderLine: string;
    purchaseOrderLineId: string;
    customerQuoteLine: string;
    customerQuoteLineId: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    brand?: string;
    unitCost: number;
    billedQty: number;
    billAmount: number;
    shipping: number;
    totalBillAmount: number;
    receiptDate: string;
}

interface QuoteLineSupplierBillLinesSubTabProps {
    data: SBLI[];
    loading: boolean;
    sortConfig: { key: any; direction: 'asc' | 'desc' } | null;
    requestSort: (key: string) => void;
    widths: Record<string, number>;
    handleResize: (field: string, width: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineSupplierBillLinesSubTab({
    data,
    loading,
    sortConfig,
    requestSort,
    widths,
    handleResize
}: QuoteLineSupplierBillLinesSubTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { user, selectedAccount } = useUserSession();
    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [data, currentPage]);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium" title="No records found">No records found</p>
                        <p className="text-sm">There are no supplier bill lines associated with this quote line.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <SortableHeader label="Supplier Bill Line" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                <SortableHeader label="Supplier Bill" field="supplierBill" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierBill} onResize={handleResize} />
                                <SortableHeader label="Customer Quote Line" field="customerQuoteLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuoteLine} onResize={handleResize} />
                                <SortableHeader label="Purchase Order Line" field="purchaseOrderLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderLine} onResize={handleResize} />
                                <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                <SortableHeader label="Brand" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                                <SortableHeader label="Billed Qty" field="billedQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.billedQty} onResize={handleResize} />
                                <SortableHeader label="Bill Amount" field="billAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.billAmount} onResize={handleResize} />
                                <SortableHeader label="Shipping" field="shipping" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipping} onResize={handleResize} />
                                <SortableHeader label="Total Bill Amount" field="totalBillAmount" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalBillAmount} onResize={handleResize} />
                                <SortableHeader label="Goods Receipt Date" field="receiptDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receiptDate} onResize={handleResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white  sticky left-0 bg-white dark:bg-gray-800 font-bold truncate" style={{ width: widths.name }}>{displayCell(item.name)}</td>
                                    <td className="px-3 py-2 text-sm truncate" style={{ width: widths.status }}>
                                        <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.supplierBill }}>
                                        {item.supplierBillId ? (
                                            <Link href={`/supplier-bills/${item.supplierBillId}`} target="_blank" className="text-primary hover:underline font-medium">
                                                {item.supplierBill}
                                            </Link>
                                        ) : displayCell(item.supplierBill)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.customerQuoteLine }}>
                                        {displayCell(item.customerQuoteLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.purchaseOrderLine }}>
                                        {displayCell(item.purchaseOrderLine)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.productName }}>{displayCell(item.productName)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.description }} title={item.description}>{displayCell(item.description)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.manufacturerDBA }}>{displayCell(item.brand)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.unitCost }}>{formatCurrency(item.unitCost)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billedQty }}>{item.billedQty}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.billAmount }}>{formatCurrency(item.billAmount)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.shipping }}>{formatCurrency(item.shipping)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-bold truncate" style={{ width: widths.totalBillAmount }}>{formatCurrency(item.totalBillAmount)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatDate(item.receiptDate, 'numeric-dash')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={data.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

