import { useMemo, useState } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

interface QuoteLineData {
    id: string;
    lineName: string;
    status: string;
    quoteNumber: string;
    productName: string;
    description: string;
    manufacturerDBA: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
}

interface SOLI {
    id: string;
    lineName: string;
    status: string;
    salesOrderName: string;
    productName: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
}

interface SMLI {
    id: string;
    lineName: string;
    status: string;
    manifestName: string;
    productName: string;
    qtyShipped: number;
    trackingNumber: string;
}

interface INLI {
    id: string;
    lineName: string;
    status: string;
    invoiceName: string;
    productName: string;
    unitPrice: number;
    invoiceQty: number;
    totalPrice: number;
}

interface QuoteLineFulfillmentTabProps {
    lineId: string;
    loading: boolean;
}

export default function QuoteLineFulfillmentsTab({ lineId, loading }: QuoteLineFulfillmentTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"Quotes" | "Orders" | "Invoices" | "Manifests">("Quotes");

    // Placeholder data to match screenshot
    const quoteLines: QuoteLineData[] = [
        {
            id: "1",
            lineName: "CQLI-0000000035",
            status: "Draft",
            quoteNumber: "CQ-0000000010",
            productName: "Test-Pro-001",
            description: "Test-pro",
            manufacturerDBA: "Test",
            unitPrice: 15.00,
            totalOrderQty: 1,
            totalPrice: 15.00
        }
    ];
    const soliData: SOLI[] = [];
    const inliData: INLI[] = [];
    const smliData: SMLI[] = [];

    const activeData = useMemo(() => {
        if (activeSubTab === "Quotes") return quoteLines;
        if (activeSubTab === "Orders") return soliData;
        if (activeSubTab === "Invoices") return inliData;
        return smliData;
    }, [activeSubTab]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(activeData);
    const { widths, handleResize } = useResizableColumns({
        lineName: 180,
        status: 120,
        quoteNumber: 150,
        salesOrderName: 150,
        invoiceName: 150,
        manifestName: 150,
        productName: 150,
        description: 200,
        manufacturerDBA: 150,
        unitPrice: 120,
        totalOrderQty: 120,
        totalPrice: 120,
        qtyShipped: 120,
        invoiceQty: 120,
        trackingNumber: 150
    });

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Sub Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
                {[
                    { key: "Quotes", label: "Customer Quotes", count: quoteLines.length },
                    { key: "Orders", label: "Sales Orders", count: soliData.length },
                    { key: "Invoices", label: "Invoices", count: inliData.length },
                    { key: "Manifests", label: "Shipping Manifests", count: smliData.length }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSubTab(tab.key as any)}
                        className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all mr-6 ${activeSubTab === tab.key
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] border-b border-gray-100">
                            <tr>
                                <SortableHeader label="Customer Quote Line" field="lineName" sortConfig={sortConfig} requestSort={requestSort} width={widths.lineName} onResize={handleResize} />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />

                                {activeSubTab === "Quotes" && (
                                    <>
                                        <SortableHeader label="Customer Quote" field="quoteNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.quoteNumber} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Product Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                    </>
                                )}

                                {activeSubTab === "Orders" && (
                                    <>
                                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderName} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalOrderQty} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={handleResize} />
                                    </>
                                )}

                                {activeSubTab === "Invoices" && (
                                    <>
                                        <SortableHeader label="Invoice" field="invoiceName" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceName} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Invoice Qty" field="invoiceQty" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiceQty} onResize={handleResize} />
                                        <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                    </>
                                )}

                                {activeSubTab === "Manifests" && (
                                    <>
                                        <SortableHeader label="Shipping Manifest" field="manifestName" sortConfig={sortConfig} requestSort={requestSort} width={widths.manifestName} onResize={handleResize} />
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                                        <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyShipped} onResize={handleResize} />
                                        <SortableHeader label="Tracking #" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-gray-400 italic">No records found.</td>
                                </tr>
                            ) : (
                                sortedData.map((item: any, idx: number) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.lineName}</td>
                                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.status}</td>
                                        {activeSubTab === "Quotes" && (
                                            <>
                                                <td className="px-4 py-3 text-xs text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.quoteNumber}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate" title={item.description}>{item.description}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.manufacturerDBA}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.totalOrderQty}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 font-bold whitespace-nowrap">${item.totalPrice.toFixed(2)}</td>
                                            </>
                                        )}
                                        {activeSubTab === "Orders" && (
                                            <>
                                                <td className="px-4 py-3 text-xs text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.salesOrderName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.totalOrderQty}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 font-bold whitespace-nowrap">${item.totalPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.qtyShipped}</td>
                                            </>
                                        )}
                                        {activeSubTab === "Invoices" && (
                                            <>
                                                <td className="px-4 py-3 text-xs text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.invoiceName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.invoiceQty}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 font-bold whitespace-nowrap">${item.totalPrice.toFixed(2)}</td>
                                            </>
                                        )}
                                        {activeSubTab === "Manifests" && (
                                            <>
                                                <td className="px-4 py-3 text-xs text-blue-500 hover:underline cursor-pointer whitespace-nowrap">{item.manifestName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.productName}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.qtyShipped}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.trackingNumber}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-100 flex items-center justify-end gap-4">
                    <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md disabled:opacity-50" disabled>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-xs text-gray-500">1 / 1</span>
                        <button className="p-1 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md disabled:opacity-50" disabled>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
