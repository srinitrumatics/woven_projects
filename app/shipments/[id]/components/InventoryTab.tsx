"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 10;


// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryPosition {
    id: string;
    name: string;
    receivedDate: string | null;
    daysInInventory: number;
    productName: string;
    productId?: string;
    productDescription: string;
    manufacturerDBA: string;
    brand?: string;
    supplierName: string;
    qtyOnHand: number;
    qtyAvailable: number;
    inventoryLocation: string;
    inventoryLocationId?: string;
    shipConfirmed: string | null;  // Shipped_Date__c
}

// ─── Column widths (order matches screenshot) ─────────────────────────────────
const DEFAULT_WIDTHS: Record<string, number> = {
    name: 170,
    receivedDate: 140,
    daysInInventory: 190,
    productName: 150,
    productDescription: 180,
    manufacturerDBA: 175,
    supplierName: 140,
    qtyOnHand: 160,
    qtyAvailable: 160,
    inventoryLocation: 195,
    shipConfirmed: 200,
};

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapItem(raw: any): InventoryPosition {
    return {
        id: raw.Id,
        name: raw.Name || "",
        receivedDate: raw.Received_Date__c ?? null,
        daysInInventory: raw.Days_in_Inventory__c ?? 0,
        productName: raw.Product_Name || "",
        productId: raw.Product_Name__c || raw.Product__c || "",
        productDescription: raw.Product_Description__c || "",
        manufacturerDBA: raw.Manufacturer_DBA__c || "",
        brand: raw.Product_Brand_Name__c || "",
        supplierName: raw.Supplier_Name__c || "",
        qtyOnHand: raw.Qty_On_Hand__c ?? 0,
        qtyAvailable: raw.Qty_Available__c ?? 0,
        inventoryLocation: raw.Location || raw.Inventory_Location_Name || "",
        inventoryLocationId: raw.Inventory_Location__c || "",
        shipConfirmed: raw.Shipped_Date__c ?? null,
    };
}

function fmtDate(v: string | null | undefined): string {
    if (!v) return "";
    return formatDate(v, "numeric-dash");
}

// ─── Component ────────────────────────────────────────────────────────────────
interface InventoryTabProps {
    shipmentId: string;
    accountId: string;
    contactId: string;
    onCountLoaded?: (count: number) => void;
}

export default function InventoryTab({ shipmentId, accountId, contactId, onCountLoaded }: InventoryTabProps) {
    const [items, setItems] = useState<InventoryPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);

    const { widths, handleResize } = useResizableColumns(DEFAULT_WIDTHS);

    useEffect(() => {
        async function fetchInventory() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(
                    `/api/salesforce/shipments?accountId=${accountId}&contactId=${contactId}&objectId=${shipmentId}&tabName=Inventory`
                );
                if (!res.ok) throw new Error("Failed to fetch inventory");
                const json = await res.json();
                const raw: any[] = json?.data?.[0]?.Inventory_Position__c ?? [];
                const mapped = raw.map(mapItem);
                setItems(mapped);
                onCountLoaded?.(mapped.length);
            } catch (e) {
                setError(e instanceof Error ? e.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }
        if (shipmentId && accountId && contactId) fetchInventory();
    }, [shipmentId, accountId, contactId]);

    const { items: sorted, requestSort: handleSort, sortConfig: sc } = useSortableData<InventoryPosition>(items, { key: 'name', direction: 'asc' });

    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sorted.slice(start, start + ITEMS_PER_PAGE);
    }, [sorted, currentPage]);

    // ── States ──────────────────────────────────────────────────────────────
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

    if (items.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-lg ">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Inventory Positions associated with this shipment manifest.">There are no Inventory Positions associated with this shipment manifest.</p>
            </div>
        );
    }

    // ── Table ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto py-2">
                <table className="w-full text-sm table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            {/* 1 – sticky */}
                            <SortableHeader label="Inventory Position" field="name" sortConfig={sc} requestSort={handleSort} width={widths.name} onResize={handleResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            {/* 2 */}
                            <SortableHeader label="Received Date" field="receivedDate" sortConfig={sc} requestSort={handleSort} width={widths.receivedDate} onResize={handleResize} align="left" />
                            {/* 3 */}
                            <SortableHeader label="Age (Days)" field="daysInInventory" sortConfig={sc} requestSort={handleSort} width={widths.daysInInventory} onResize={handleResize} align="left" />
                            {/* 4 */}
                            <SortableHeader label="Product Name" field="productName" sortConfig={sc} requestSort={handleSort} width={widths.productName} onResize={handleResize} align="left" />
                            {/* 5 */}
                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sc} requestSort={handleSort} width={widths.productDescription} onResize={handleResize} align="left" />
                            {/* 6 */}
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sc} requestSort={handleSort} width={widths.manufacturerDBA} onResize={handleResize} align="left" />
                            {/* 7 */}
                            <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sc} requestSort={handleSort} width={widths.supplierName} onResize={handleResize} align="left" />
                            {/* 8 */}
                            <SortableHeader label="Qty On Hand" field="qtyOnHand" sortConfig={sc} requestSort={handleSort} width={widths.qtyOnHand} onResize={handleResize} align="left" />
                            {/* 9 */}
                            <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sc} requestSort={handleSort} width={widths.qtyAvailable} onResize={handleResize} align="left" />
                            {/* 10 */}
                            <SortableHeader label="Location" field="inventoryLocation" sortConfig={sc} requestSort={handleSort} width={widths.inventoryLocation} onResize={handleResize} align="left" />
                            {/* 11 */}
                            <SortableHeader label="Ship Confirmed Date" field="shipConfirmed" sortConfig={sc} requestSort={handleSort} width={widths.shipConfirmed} onResize={handleResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                {/* 1 – sticky */}
                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.name }}>
                                    <span className="truncate block" title={item.name}>{item.name}</span>
                                </td>
                                <TC v={displayCell(fmtDate(item.receivedDate))} w={widths.receivedDate} />
                                <TC v={`${formatNumber(item.daysInInventory, 0)} Days`} w={widths.daysInInventory} />
                                <TC
                                    v={item.productId ? (
                                        <Link href={`/inventory/${item.productId}`} className="text-primary hover:underline font-medium">
                                            {item.productName}
                                        </Link>
                                    ) : (
                                        displayCell(item.productName)
                                    )}
                                    w={widths.productName}
                                />
                                <TC v={displayCell(item.productDescription)} w={widths.productDescription} />
                                <TC v={displayCell(item.brand)} w={widths.manufacturerDBA} />
                                <TC v={displayCell(item.supplierName)} w={widths.supplierName} />
                                <TC v={formatNumber(item.qtyOnHand, 2)} w={widths.qtyOnHand} />
                                <TC v={formatNumber(item.qtyAvailable, 2)} w={widths.qtyAvailable} />
                                <TC v={displayCell(item.inventoryLocation)} w={widths.inventoryLocation} />
                                <TC v={displayCell(fmtDate(item.shipConfirmed))} w={widths.shipConfirmed} />
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
                itemName="positions"
            />
        </div>
    );
}

// ─── Cell helper ──────────────────────────────────────────────────────────────
function TC({ v, w }: { v: React.ReactNode; w: number }) {
    return (
        <td className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate" style={{ width: w }} title={typeof v === 'string' ? v : undefined}>
            {v}
        </td>
    );
}
