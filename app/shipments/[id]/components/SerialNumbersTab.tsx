"use client";

import { useEffect, useState, useMemo } from "react";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
interface SerialNumberLog {
    id: string;
    name: string;
    serialNumber: string;
    productSerialNumber: string;
    productName: string;
    productId?: string;
    productDescription: string;
    brand?: string;
    shippingManifest: string;
    shippingManifestId?: string;
}

// ─── Column widths ────────────────────────────────────────────────────────────
const DEFAULT_WIDTHS: Record<string, number> = {
    name: 220,
    serialNumber: 180,
    productSerialNumber: 210,
    productName: 180,
    productDescription: 210,
    brand: 170,
    shippingManifest: 220,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function mapLog(raw: any): SerialNumberLog {
    return {
        id: raw.Id,
        name: raw.Name || "",
        serialNumber: raw.Serial_Number_Name || raw.Serial_Number__c || "",
        productSerialNumber: raw.Product_Serial_Number__c || "",
        productName: raw.Product_Name || "",
        productId: raw.Product__c || "",
        productDescription: raw.Product_Description__c || "",
        brand: raw.Product_Brand_Name__c || "",
        shippingManifest: raw.Shipping_Manifest_Name || raw.Shipping_Manifest__r?.Name || "",
        shippingManifestId: raw.Shipping_Manifest__c || "",
    };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface SerialNumbersTabProps {
    shipmentId: string;
    accountId: string;
    contactId: string;
    onCountLoaded?: (count: number) => void;
}

export default function SerialNumbersTab({ shipmentId, accountId, contactId, onCountLoaded }: SerialNumbersTabProps) {
    const [logs, setLogs] = useState<SerialNumberLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);

    const { widths, handleResize } = useResizableColumns(DEFAULT_WIDTHS);

    useEffect(() => {
        async function fetchLogs() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(
                    `/api/salesforce/shipments?accountId=${accountId}&contactId=${contactId}&objectId=${shipmentId}&objectName=Shipping_Manifest__c&tabName=Serial_Numbers`
                );
                if (!res.ok) throw new Error("Failed to fetch serial numbers");
                const json = await res.json();

                // Based on standard format mapping
                const raw: any[] = json?.data?.[0]?.Serial_Number_Log__c ?? [];
                setLogs(raw.map(mapLog));
                if (onCountLoaded) {
                    onCountLoaded(raw.length);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "An error occurred");
                if (onCountLoaded) {
                    onCountLoaded(0);
                }
            } finally {
                setLoading(false);
            }
        }

        if (shipmentId && accountId && contactId) fetchLogs();
    }, [shipmentId, accountId, contactId, onCountLoaded]);

    const { items: sorted, requestSort: handleSort, sortConfig } = useSortableData<SerialNumberLog>(logs, { key: 'name', direction: 'asc' });

    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paginatedLogs = useMemo(() => {
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

    if (logs.length === 0) {
        return (
            <div className="p-12 text-center  rounded-lg ">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Serial Number Logs associated with this shipment manifest.">There are no Serial Number Logs associated with this shipment manifest.</p>
            </div>
        );
    }

    // ── Table ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto py-2">
                <table className="w-full text-sm table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="Serial Number Log" field="name" sortConfig={sortConfig} requestSort={handleSort} width={widths.name} onResize={handleResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Serial Number #" field="serialNumber" sortConfig={sortConfig} requestSort={handleSort} width={widths.serialNumber} onResize={handleResize} align="left" />
                            <SortableHeader label="Product Serial Number" field="productSerialNumber" sortConfig={sortConfig} requestSort={handleSort} width={widths.productSerialNumber} onResize={handleResize} align="left" />
                            <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={handleSort} width={widths.productName} onResize={handleResize} align="left" />
                            <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={handleSort} width={widths.productDescription} onResize={handleResize} align="left" />
                            <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={handleSort} width={widths.brand} onResize={handleResize} align="left" />
                            <SortableHeader label="Shipping Manifest #" field="shippingManifest" sortConfig={sortConfig} requestSort={handleSort} width={widths.shippingManifest} onResize={handleResize} align="left" />
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.name }} title={log.name}>
                                    {log.name}
                                </td>
                                <TextCell v={displayCell(log.serialNumber)} w={widths.serialNumber} />
                                <TextCell v={displayCell(log.productSerialNumber)} w={widths.productSerialNumber} />
                                <TextCell
                                    v={log.productId ? (
                                        <Link href={`/products/${log.productId}`} className="text-primary hover:underline font-medium">
                                            {log.productName}
                                        </Link>
                                    ) : (
                                        displayCell(log.productName)
                                    )}
                                    w={widths.productName}
                                />
                                <TextCell v={displayCell(log.productDescription)} w={widths.productDescription} />
                                <TextCell v={displayCell(log.brand)} w={widths.brand} />
                                <TextCell
                                    v={log.shippingManifestId ? (
                                        <Link href={`/shipments/${log.shippingManifestId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                            {log.shippingManifest || "View Manifest"}
                                        </Link>
                                    ) : (
                                        displayCell(log.shippingManifest)
                                    )}
                                    w={widths.shippingManifest}
                                />
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
                itemName="logs"
            />
        </div>
    );
}

// ─── Cell helpers ─────────────────────────────────────────────────────────────
function TextCell({ v, w }: { v: React.ReactNode; w: number }) {
    return (
        <td className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate" style={{ width: w }} title={typeof v === 'string' ? v : undefined}>
            {v}
        </td>
    );
}
