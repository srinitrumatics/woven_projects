"use client";

import { useEffect, useState, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Eye } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShipmentLine {
    id: string;
    name: string;
    status: string;
    shippingManifestName: string;
    shippingManifestId?: string;
    salesOrderLineName: string;
    salesOrderId?: string;
    salesOrderLineId?: string;
    customerQuoteLineName: string;
    customerQuoteId?: string;
    customerQuoteLineId?: string;
    proposedProduct?: string;
    proposedProductId?: string;
    proposalId?: string;
    productName: string;
    productId?: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    unitPrice: number;
    totalOrderQty: number;
    totalPrice: number;
    qtyShipped: number;
    boxCount: number | null;
    boxLength: number | null;
    boxWidth: number | null;
    boxHeight: number | null;
    boxNetWeight: number | null;
    boxGrossWeight: number | null;
    trackingNumber: string | null;
    trackingStatus: string | null;
    estimatedDeliveryDate: string | null;
    actualDeliveryDate: string | null;
}

// ─── Column widths ────────────────────────────────────────────────────────────
const DEFAULT_WIDTHS: Record<string, number> = {
    name: 190,
    status: 110,
    salesOrderLineName: 160,
    customerQuoteLineName: 185,
    proposedProduct: 180,
    productName: 150,
    productDescription: 180,
    manufacturerDBA: 170,
    unitPrice: 110,
    totalOrderQty: 150,
    totalPrice: 110,
    qtyShipped: 130,
    boxCount: 120,
    boxLength: 120,
    boxWidth: 130,
    boxHeight: 130,
    boxNetWeight: 140,
    boxGrossWeight: 170,
    action: 80,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function mapLine(raw: any): ShipmentLine {
    return {
        id: raw.Id,
        name: raw.Name || "",
        status: raw.Status__c || "",
        shippingManifestName: raw.Shipping_Manifest_Name || "",
        shippingManifestId: raw.Shipping_Manifest__c || "",
        salesOrderLineName: raw.Sales_Order_Line_Name || "",
        salesOrderId: raw.Sales_Order_Line__c || "",
        salesOrderLineId: raw.Sales_Order_Line__c || "",
        customerQuoteLineName: raw.Customer_Quote_Line_Name || "",
        customerQuoteId: raw.Customer_Quote__c || "",
        customerQuoteLineId: raw.Customer_Quote_Line__c || "",
        proposedProduct: raw.Proposed_Product_Name || "",
        proposedProductId: raw.Proposed_Product__c || "",
        proposalId: raw.Proposal__c || "",
        productName: raw.Product_Name || "",
        productId: raw.Product__c || "",
        productDescription: raw.Product_Description__c || "",
        manufacturerDBA: raw.Manufacturer_DBA__c || "",
        brand: raw.Product_Brand_Name__c || "",
        unitPrice: raw.Unit_Price__c ?? 0,
        totalOrderQty: raw.Total_Order_Qty__c ?? 0,
        totalPrice: raw.Total_Price__c ?? 0,
        qtyShipped: raw.Qty_Shipped__c ?? 0,
        boxCount: raw.Box__c ?? raw.gtherp__Box__c ?? null,
        boxLength: raw.Case_Length__c ?? raw.gtherp__Case_Length__c ?? null,
        boxWidth: raw.Case_Width__c ?? raw.gtherp__Case_Width__c ?? null,
        boxHeight: raw.Case_Height__c ?? raw.gtherp__Case_Height__c ?? null,
        boxNetWeight: raw.Case_Net_Weight__c ?? raw.gtherp__Case_Net_Weight__c ?? null,
        boxGrossWeight: raw.Case_Gross_Weight__c ?? raw.gtherp__Case_Gross_Weight__c ?? null,
        trackingNumber: raw.Tracking_Number__c ?? null,
        trackingStatus: raw.Tracking_Status__c ?? null,
        estimatedDeliveryDate: raw.Estimated_Delivery_Date__c ?? null,
        actualDeliveryDate: raw.Actual_Delivery_Date__c ?? null,
    };
}

function fmt(v: number | null | undefined, decimals = 2): string {
    if (v === null || v === undefined) return "";
    return formatNumber(v, decimals);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ShipmentLinesTabProps {
    shipmentId: string;
    accountId: string;
    contactId: string;
}

export default function ShipmentLinesTab({ shipmentId, accountId, contactId }: ShipmentLinesTabProps) {
    const router = useRouter();
    const [lines, setLines] = useState<ShipmentLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);

    const { widths, handleResize } = useResizableColumns(DEFAULT_WIDTHS);

    useEffect(() => {
        async function fetchLines() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(
                    `/api/salesforce/shipments?accountId=${accountId}&contactId=${contactId}&objectId=${shipmentId}&tabName=Products`
                );
                if (!res.ok) throw new Error("Failed to fetch shipment lines");
                const json = await res.json();
                const raw: any[] = json?.data?.[0]?.Shipping_Manifest_Line__c ?? [];
                setLines(raw.map(mapLine));
            } catch (e) {
                setError(e instanceof Error ? e.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        if (shipmentId && accountId && contactId) fetchLines();
    }, [shipmentId, accountId, contactId]);

    const { items: sorted, requestSort: handleSort, sortConfig } = useSortableData<ShipmentLine>(lines, { key: 'name', direction: 'asc' });

    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paginatedLines = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sorted.slice(start, start + ITEMS_PER_PAGE);
    }, [sorted, currentPage]);

    // ── States ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-300 font-medium truncate">{error}</p>
            </div>
        );
    }

    if (lines.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Shipment Manifest Lines associated with this shipment manifest">There are no Shipment Manifest Lines associated with this shipment manifest</p>
            </div>
        );
    }

    // ── Table ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            {/* Sticky first column */}
                            <SortableHeader label="Shipping Manifest Line #" field="name" sortConfig={sortConfig} requestSort={handleSort} width={widths.name} onResize={handleResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={handleSort} width={widths.status} onResize={handleResize} align="left" />
                            <SortableHeader label="Sales Order Line" field="salesOrderLineName" sortConfig={sortConfig} requestSort={handleSort} width={widths.salesOrderLineName} onResize={handleResize} align="left" />
                            <SortableHeader label="Customer Quote Line" field="customerQuoteLineName" sortConfig={sortConfig} requestSort={handleSort} width={widths.customerQuoteLineName} onResize={handleResize} align="left" />
                            <SortableHeader label="Proposed Product" field="proposedProduct" sortConfig={sortConfig} requestSort={handleSort} width={widths.proposedProduct} onResize={handleResize} align="left" />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={handleSort} width={widths.productName} onResize={handleResize} align="left" />
                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={handleSort} width={widths.productDescription} onResize={handleResize} align="left" />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={handleSort} width={widths.manufacturerDBA} onResize={handleResize} align="left" />
                            <SortableHeader label="Unit Price" field="unitPrice" sortConfig={sortConfig} requestSort={handleSort} width={widths.unitPrice} onResize={handleResize} align="left" />
                            <SortableHeader label="Total Order Qty" field="totalOrderQty" sortConfig={sortConfig} requestSort={handleSort} width={widths.totalOrderQty} onResize={handleResize} align="left" />
                            <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={handleSort} width={widths.totalPrice} onResize={handleResize} align="left" />
                            <SortableHeader label="Qty Shipped" field="qtyShipped" sortConfig={sortConfig} requestSort={handleSort} width={widths.qtyShipped} onResize={handleResize} align="left" />
                            <SortableHeader label="Box Count" field="boxCount" sortConfig={sortConfig} requestSort={handleSort} width={widths.boxCount} onResize={handleResize} align="left" />
                            <SortableHeader label="Box Length" field="boxLength" sortConfig={sortConfig} requestSort={handleSort} width={widths.boxLength} onResize={handleResize} align="left" />
                            <SortableHeader label="Box Width" field="boxWidth" sortConfig={sortConfig} requestSort={handleSort} width={widths.boxWidth} onResize={handleResize} align="left" />
                            <SortableHeader label="Box Height" field="boxHeight" sortConfig={sortConfig} requestSort={handleSort} width={widths.boxHeight} onResize={handleResize} align="left" />
                            <SortableHeader label="Box Net Weight" field="boxNetWeight" sortConfig={sortConfig} requestSort={handleSort} width={widths.boxNetWeight} onResize={handleResize} align="left" />
                            <SortableHeader label="Box Gross Weight" field="boxGrossWeight" sortConfig={sortConfig} requestSort={handleSort} width={widths.boxGrossWeight} onResize={handleResize} align="left" />
                            {/* Action – non-sortable */}
                            <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white" style={{ width: widths.action }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedLines.map((line) => (
                            <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                {/* Line name – sticky */}
                                <td className="px-3 py-2 font-bold text-primary dark:text-primary-light sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.name }}>
                                    <Link
                                        href={`/shipments/${shipmentId}/lines/${line.id}`}
                                        className="text-primary font-medium hover:underline truncate"
                                        title={line.name}>{line.name}</Link>
                                </td>
                                <TextCell v={<StatusBadge status={line.status} />} w={widths.status} title={line.status} />
                                <TextCell
                                    v={displayCell(line.salesOrderLineName)}
                                    w={widths.salesOrderLineName}
                                />
                                <TextCell
                                    v={line.customerQuoteId && line.customerQuoteLineId ? (
                                        <Link href={`/quotes/${line.customerQuoteId}/lines/${line.customerQuoteLineId}`} target="_blank" className="text-primary hover:underline font-medium">
                                            {line.customerQuoteLineName}
                                        </Link>
                                    ) : (
                                        displayCell(line.customerQuoteLineName)
                                    )}
                                    w={widths.customerQuoteLineName}
                                />
                                <TextCell
                                    v={line.proposedProductId ? (
                                        <Link href={`/proposals/${line.proposalId}/lines/${line.proposedProductId}`} className="text-primary hover:underline font-medium">
                                            {line.proposedProduct}
                                        </Link>
                                    ) : (
                                        displayCell(line.proposedProduct)
                                    )}
                                    w={widths.proposedProduct}
                                />
                                <TextCell
                                    v={line.productId ? (
                                        <Link href={`/products/${line.productId}`} className="text-primary hover:underline font-medium">
                                            {line.productName}
                                        </Link>
                                    ) : (
                                        displayCell(line.productName)
                                    )}
                                    w={widths.productName}
                                />
                                <TextCell v={displayCell(line.productDescription)} w={widths.productDescription} />
                                <TextCell v={displayCell(line.brand)} w={widths.manufacturerDBA} />
                                <NumCell v={formatCurrency(line.unitPrice)} w={widths.unitPrice} />
                                <NumCell v={fmt(line.totalOrderQty, 0)} w={widths.totalOrderQty} />
                                <NumCell v={formatCurrency(line.totalPrice)} w={widths.totalPrice} />
                                <NumCell v={fmt(line.qtyShipped, 0)} w={widths.qtyShipped} />
                                <NumCell v={fmt(line.boxCount, 0)} w={widths.boxCount} />
                                <NumCell v={fmt(line.boxLength)} w={widths.boxLength} />
                                <NumCell v={fmt(line.boxWidth)} w={widths.boxWidth} />
                                <NumCell v={fmt(line.boxHeight)} w={widths.boxHeight} />
                                <NumCell v={fmt(line.boxNetWeight)} w={widths.boxNetWeight} />
                                <NumCell v={fmt(line.boxGrossWeight)} w={widths.boxGrossWeight} />
                                {/* Action */}
                                <td className="px-3 py-2 text-center" style={{ width: widths.action }}>
                                    <Link
                                        href={`/shipments/${shipmentId}/lines/${line.id}`}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full inline-flex items-center justify-center transition-colors"
                                        title="View Line Details"
                                    >
                                        <Eye className="w-5 h-5 text-primary" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sorted.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="lines"
            />
        </div>
    );
}

// ─── Cell helpers ─────────────────────────────────────────────────────────────
function TextCell({ v, w, title }: { v: ReactNode; w: number; title?: string }) {
    return (
        <td className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate" style={{ width: w }} title={title || (typeof v === 'string' ? v : undefined)}>
            {v}
        </td>
    );
}
function NumCell({ v, w }: { v: string; w: number }) {
    return (
        <td className="px-3 py-2 text-gray-900 dark:text-white text-left font-medium truncate" style={{ width: w }} title={v}>
            {v}
        </td>
    );
}
function StatusBadge({ status }: { status: string }) {
    const getStyles = () => {
        switch (status) {
            case "Shipped":
            case "Delivered":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "In Transit":
            case "Inprogress":
            case "Out for Delivery":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Pending":
            case "Draft":
            case "Picked":
            case "Packed":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Cancelled":
            case "Exception":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status || "N/A"}
        </span>
    );
}