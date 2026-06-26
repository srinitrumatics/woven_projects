"use client";

import { useEffect, useState } from "react";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { formatDate } from "@/lib/utils/formatting";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SerialNumberLog {
    id: string;
    name: string;
    serialNumber: string;
    productSerialNumber: string;
    productName: string;
    productDescription: string;
    shippingManifest: string;
    shippingManifestId?: string;
    shippingManifestLine: string;
    shipDate: string | null;
    shipToAccount: string | null;
    active: any;
}

type SortField = keyof SerialNumberLog;
type SortDir = "asc" | "desc";

// ─── Column widths ────────────────────────────────────────────────────────────
const DEFAULT_WIDTHS: Record<string, number> = {
    name: 220,
    serialNumber: 180,
    productSerialNumber: 210,
    productName: 180,
    productDescription: 210,
    shippingManifest: 220,
    shippingManifestLine: 220,
    shipDate: 150,
    shipToAccount: 180,
    active: 100,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function mapLog(raw: any): SerialNumberLog {
    return {
        id: raw.Id,
        name: raw.Name || "",
        serialNumber: raw.Serial_Number_Name || raw.Serial_Number__c || "",
        productSerialNumber: raw.Product_Serial_Number__c || "",
        productName: raw.Product_Name || "",
        productDescription: raw.Product_Description__c || "",
        shippingManifest: raw.Shipping_Manifest_Name || raw.Shipping_Manifest__r?.Name || "",
        shippingManifestId: raw.Shipping_Manifest__c || "",
        shippingManifestLine: raw.Shipping_Manifest_Line_Name || raw.Shipping_Manifest_Line__c || "",
        shipDate: raw.Ship_Date__c || null,
        shipToAccount: raw.Ship_to_Account_Name || raw.Ship_to_Account__c || "",
        active: raw.Active__c,
    };
}

function fmtDate(v: string | null | undefined): string {
    if (!v) return "";
    return formatDate(v, "numeric-dash");
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

    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

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

    const handleSort = (field: string) => {
        const f = field as SortField;
        if (sortField === f) {
            setSortDir(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(f);
            setSortDir("asc");
        }
    };

    const sorted = [...logs].sort((a, b) => {
        const av = a[sortField];
        const bv = b[sortField];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });

    const sortConfig = { key: sortField as string, direction: sortDir };

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
        <div className="overflow-x-auto py-2">
            <table className="w-full text-sm table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Serial Number Log" field="name" sortConfig={sortConfig} requestSort={handleSort} width={widths.name} onResize={handleResize} align="left" className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Serial Number" field="serialNumber" sortConfig={sortConfig} requestSort={handleSort} width={widths.serialNumber} onResize={handleResize} align="left" />
                        <SortableHeader label="Product Serial Number" field="productSerialNumber" sortConfig={sortConfig} requestSort={handleSort} width={widths.productSerialNumber} onResize={handleResize} align="left" />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={handleSort} width={widths.productName} onResize={handleResize} align="left" />
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={handleSort} width={widths.productDescription} onResize={handleResize} align="left" />
                        <SortableHeader label="Shipping Manifest" field="shippingManifest" sortConfig={sortConfig} requestSort={handleSort} width={widths.shippingManifest} onResize={handleResize} align="left" />
                        <SortableHeader label="Shipping Manifest Line" field="shippingManifestLine" sortConfig={sortConfig} requestSort={handleSort} width={widths.shippingManifestLine} onResize={handleResize} align="left" />
                        <SortableHeader label="Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={handleSort} width={widths.shipDate} onResize={handleResize} align="left" />
                        <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={handleSort} width={widths.shipToAccount} onResize={handleResize} align="left" />
                        <SortableHeader label="Active" field="active" sortConfig={sortConfig} requestSort={handleSort} width={widths.active} onResize={handleResize} align="left" />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sorted.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.name }} title={log.name}>
                                {log.name}
                            </td>
                            <TextCell v={log.serialNumber} w={widths.serialNumber} />
                            <TextCell v={log.productSerialNumber} w={widths.productSerialNumber} />
                            <TextCell v={log.productName} w={widths.productName} />
                            <TextCell v={log.productDescription} w={widths.productDescription} />
                            <TextCell
                                v={log.shippingManifestId ? (
                                    <Link href={`/shipments/${log.shippingManifestId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                        {log.shippingManifest || "View Manifest"}
                                    </Link>
                                ) : (
                                    log.shippingManifest || " "
                                )}
                                w={widths.shippingManifest}
                            />
                            <TextCell v={log.shippingManifestLine} w={widths.shippingManifestLine} />
                            <TextCell v={formatDate(log.shipDate, "numeric-dash")} w={widths.shipDate} />
                            <TextCell v={log.shipToAccount || ""} w={widths.shipToAccount} />
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate" style={{ width: widths.active }}>
                                {log.active === true || log.active === "true" || log.active === "True" ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 truncate">
                                        Active
                                    </span>
                                ) : log.active === false || log.active === "false" || log.active === "False" ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 truncate">
                                        Inactive
                                    </span>
                                ) : (
                                    log.active?.toString() || ""
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
