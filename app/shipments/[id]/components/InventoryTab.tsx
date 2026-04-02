"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/formatting";


// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryPosition {
    id: string;
    name: string;
    receivedDate: string | null;
    daysInInventory: number;
    productName: string;
    productDescription: string;
    manufacturerDBA: string;
    supplierName: string;
    purchaseOrderName: string;
    purchaseOrderId?: string;
    qtyOnHand: number;
    qtyAvailable: number;
    unitCost: number;
    inventoryLocation: string;
    inventoryLocationId?: string;
    rack: string;
    bay: string;   // Bin_Name
    levelPosition: string;   // Rack_Level_Name
    salesOrderName: string;
    salesOrderId?: string;
    shippingManifestName: string;
    shippingManifestId?: string;
    shipConfirmed: string | null;  // Shipped_Date__c
}

type SortField = keyof InventoryPosition;
type SortDir = "asc" | "desc";

// ─── Column widths (order matches screenshot) ─────────────────────────────────
const DEFAULT_WIDTHS: Record<string, number> = {
    name: 170,
    receivedDate: 140,
    daysInInventory: 190,
    productName: 150,
    productDescription: 180,
    manufacturerDBA: 175,
    supplierName: 140,
    purchaseOrderName: 170,
    qtyOnHand: 160,
    qtyAvailable: 160,
    unitCost: 110,
    inventoryLocation: 195,
    rack: 110,
    bay: 100,
    levelPosition: 170,
    salesOrderName: 140,
    shippingManifestName: 195,
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
        productDescription: raw.Product_Description__c || "",
        manufacturerDBA: raw.Manufacturer_DBA__c || "",
        supplierName: raw.Supplier_Name__c || "",
        purchaseOrderName: raw.Purchase_Order_Name || "",
        purchaseOrderId: raw.Purchase_Order__c || "",
        qtyOnHand: raw.Qty_On_Hand__c ?? 0,
        qtyAvailable: raw.Qty_Available__c ?? 0,
        unitCost: raw.Unit_Cost__c ?? 0,
        inventoryLocation: raw.Inventory_Location_Name || "",
        inventoryLocationId: raw.Inventory_Location__c || "",
        rack: raw.Rack_Name || "",
        bay: raw.Bin_Name || "",
        levelPosition: raw.Rack_Level_Name || "",
        salesOrderName: raw.Sales_Order_Name || "",
        salesOrderId: raw.Sales_Order__c || "",
        shippingManifestName: raw.Shipping_Manifest_Name || "",
        shippingManifestId: raw.Shipping_Manifest__c || "",
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

    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

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

    const handleSort = (field: string) => {
        const f = field as SortField;
        setSortDir(prev => sortField === f && prev === "asc" ? "desc" : "asc");
        setSortField(f);
    };

    const sorted = [...items].sort((a, b) => {
        const av = a[sortField];
        const bv = b[sortField];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        if (typeof av === "number" && typeof bv === "number")
            return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });

    const sc = { key: sortField as string, direction: sortDir };

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
        <div className="overflow-x-auto py-2">
            <table className="w-full text-sm table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        {/* 1 – sticky */}
                        <SortableHeader label="Inventory Position" field="name" sortConfig={sc} requestSort={handleSort} width={widths.name} onResize={handleResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        {/* 2 */}
                        <SortableHeader label="Received Date" field="receivedDate" sortConfig={sc} requestSort={handleSort} width={widths.receivedDate} onResize={handleResize} align="left" />
                        {/* 3 */}
                        <SortableHeader label="Days in Inventory" field="daysInInventory" sortConfig={sc} requestSort={handleSort} width={widths.daysInInventory} onResize={handleResize} align="left" />
                        {/* 4 */}
                        <SortableHeader label="Product Name" field="productName" sortConfig={sc} requestSort={handleSort} width={widths.productName} onResize={handleResize} align="left" />
                        {/* 5 */}
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sc} requestSort={handleSort} width={widths.productDescription} onResize={handleResize} align="left" />
                        {/* 6 */}
                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sc} requestSort={handleSort} width={widths.manufacturerDBA} onResize={handleResize} align="left" />
                        {/* 7 */}
                        <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sc} requestSort={handleSort} width={widths.supplierName} onResize={handleResize} align="left" />
                        {/* 8 */}
                        <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sc} requestSort={handleSort} width={widths.purchaseOrderName} onResize={handleResize} align="left" />
                        {/* 9 */}
                        <SortableHeader label="Qty on Hand" field="qtyOnHand" sortConfig={sc} requestSort={handleSort} width={widths.qtyOnHand} onResize={handleResize} align="left" />
                        {/* 10 */}
                        <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sc} requestSort={handleSort} width={widths.qtyAvailable} onResize={handleResize} align="left" />
                        {/* 11 */}
                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sc} requestSort={handleSort} width={widths.unitCost} onResize={handleResize} align="left" />
                        {/* 12 */}
                        <SortableHeader label="Inventory Location" field="inventoryLocation" sortConfig={sc} requestSort={handleSort} width={widths.inventoryLocation} onResize={handleResize} align="left" />
                        {/* 13 */}
                        <SortableHeader label="Rack" field="rack" sortConfig={sc} requestSort={handleSort} width={widths.rack} onResize={handleResize} align="left" />
                        {/* 14 */}
                        <SortableHeader label="Bay" field="bay" sortConfig={sc} requestSort={handleSort} width={widths.bay} onResize={handleResize} align="left" />
                        {/* 15 */}
                        <SortableHeader label="Level-Position" field="levelPosition" sortConfig={sc} requestSort={handleSort} width={widths.levelPosition} onResize={handleResize} align="left" />
                        {/* 16 */}
                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sc} requestSort={handleSort} width={widths.salesOrderName} onResize={handleResize} align="left" />
                        {/* 17 */}
                        <SortableHeader label="Shipping Manifest" field="shippingManifestName" sortConfig={sc} requestSort={handleSort} width={widths.shippingManifestName} onResize={handleResize} align="left" />
                        {/* 18 */}
                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmed" sortConfig={sc} requestSort={handleSort} width={widths.shipConfirmed} onResize={handleResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sorted.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {/* 1 – sticky */}
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.name }}>
                                <span className="truncate block" title={item.name}>{item.name}</span>
                            </td>
                            <TC v={fmtDate(item.receivedDate)} w={widths.receivedDate} />
                            <TC v={`${formatNumber(item.daysInInventory, 0)} Days`} w={widths.daysInInventory} />
                            <TC v={item.productName} w={widths.productName} />
                            <TC v={item.productDescription} w={widths.productDescription} />
                            <TC v={item.manufacturerDBA} w={widths.manufacturerDBA} />
                            <TC v={item.supplierName} w={widths.supplierName} />
                            <TC
                                v={item.purchaseOrderId ? (
                                    <Link href={`/purchase-orders/${item.purchaseOrderId}`} className="text-primary hover:underline font-medium" target="_blank">
                                        {item.purchaseOrderName || "View PO"}
                                    </Link>
                                ) : (
                                    item.purchaseOrderName || " "
                                )}
                                w={widths.purchaseOrderName}
                            />
                            <TC v={formatNumber(item.qtyOnHand, 2)} w={widths.qtyOnHand} />
                            <TC v={formatNumber(item.qtyAvailable, 2)} w={widths.qtyAvailable} />
                            <TC v={formatCurrency(item.unitCost)} w={widths.unitCost} />
                            <TC v={item.inventoryLocation || " "} w={widths.inventoryLocation} />
                            <TC v={item.rack} w={widths.rack} />
                            <TC v={item.bay} w={widths.bay} />
                            <TC v={item.levelPosition} w={widths.levelPosition} />
                            <TC
                                v={item.salesOrderName || " "}
                                w={widths.salesOrderName}
                            />
                            <TC
                                v={item.shippingManifestId ? (
                                    <Link href={`/shipments/${item.shippingManifestId}`} className="text-primary hover:underline font-medium" target="_blank">
                                        {item.shippingManifestName || "View Manifest"}
                                    </Link>
                                ) : (
                                    item.shippingManifestName || " "
                                )}
                                w={widths.shippingManifestName}
                            />
                            <TC v={fmtDate(item.shipConfirmed)} w={widths.shipConfirmed} />
                        </tr>
                    ))}
                </tbody>
            </table>
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
