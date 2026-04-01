import { useState, useEffect } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate } from "@/lib/utils/formatting";
import Link from "next/link";

interface SerialNumbersTabProps {
    accountId: string;
    contactId: string;
    lineId: string;
}

export default function SerialNumbersTab({ accountId, contactId, lineId }: SerialNumbersTabProps) {
    const [loading, setLoading] = useState(true);
    const [serialData, setSerialData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchSerialNumbers() {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    accountId,
                    contactId,
                    objectId: lineId,
                    objectName: "Shipping_Manifest_Line__c",
                    tabName: "Serial_Numbers"
                });
                const response = await fetch(`/api/salesforce/shipments?${queryParams}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result && result.data && Array.isArray(result.data)) {
                        let records: any[] = [];
                        if (result.data.length > 0 && result.data[0].Serial_Number_Log__c) {
                            records = result.data[0].Serial_Number_Log__c;
                        } else if (result.data.length > 0 && !result.data[0].hasOwnProperty('Serial_Number_Log__c')) {
                            records = result.data;
                        }

                        const mapped = records.map((item: any) => ({
                            id: item.Id,
                            name: item.Name || "",
                            serialNumber: item.gtherp__Serial_Number__c || item.Serial_Number_Name || item.Serial_Number__c || "",
                            productSerialNumber: item.gtherp__Product_Serial_Number__c || item.Product_Serial_Number__c || "",
                            productName: item.gtherp__Product_Name__c || item.Product_Name || item.Product_Name__c || "",
                            productDescription: item.gtherp__Product_Description__c || item.Product_Description__c || "",
                            shippingManifestName: item.Shipping_Manifest_Name || item.gtherp__Shipping_Manifest__r?.Name || item.Shipping_Manifest__r?.Name || "",
                            shippingManifestId: item.gtherp__Shipping_Manifest__c || item.Shipping_Manifest__c || "",
                            shippingManifestLine: item.gtherp__Shipping_Manifest_Line__c || item.Shipping_Manifest_Line_Name || item.Shipping_Manifest_Line__c || "",
                            shipDate: item.gtherp__Ship_Date__c || item.Ship_Date__c || "",
                            shipToAccount: item.gtherp__Ship_to_Account__c || item.Ship_to_Account_Name || item.Ship_to_Account__c || "",
                            active: item.Active__c,
                        }));
                        setSerialData(mapped);
                    }
                }
            } catch (error) {
                console.error("Fetch serial numbers error:", error);
            } finally {
                setLoading(false);
            }
        }

        if (accountId && contactId && lineId) {
            fetchSerialNumbers();
        }
    }, [accountId, contactId, lineId]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(serialData);

    const { widths, handleResize } = useResizableColumns({
        name: 180,
        serialNumber: 150,
        productSerialNumber: 200,
        productName: 180,
        productDescription: 250,
        shippingManifestName: 180,
        shippingManifestLine: 200,
        shipDate: 150,
        shipToAccount: 180,
        active: 100
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (serialData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Serial Numbers Logs associated with this shipping manifest line.">There are no Serial Numbers Logs associated with this shipping manifest line.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Serial Number Log" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Serial Number" field="serialNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.serialNumber} onResize={handleResize} />
                        <SortableHeader label="Product Serial Number" field="productSerialNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.productSerialNumber} onResize={handleResize} />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} />
                        <SortableHeader label="Shipping Manifest" field="shippingManifestName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingManifestName} onResize={handleResize} />
                        <SortableHeader label="Shipping Manifest Line" field="shippingManifestLine" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingManifestLine} onResize={handleResize} />
                        <SortableHeader label="Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipDate} onResize={handleResize} />
                        <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={handleResize} />
                        <SortableHeader label="Active" field="active" sortConfig={sortConfig} requestSort={requestSort} width={widths.active} onResize={handleResize} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedData.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={log.name}>
                                {log.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.serialNumber}>{log.serialNumber}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.productSerialNumber}>{log.productSerialNumber}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.productName}>{log.productName}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.productDescription}>{log.productDescription}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={log.shippingManifestName}>
                                {log.shippingManifestId ? (
                                    <Link href={`/shipments/${log.shippingManifestId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                        {log.shippingManifestName || "View Manifest"}
                                    </Link>
                                ) : (
                                    log.shippingManifestName || " "
                                )}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.shippingManifestLine}>{log.shippingManifestLine}</td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={log.shipDate ? formatDate(log.shipDate, "numeric-dash") : ""}>{log.shipDate ? formatDate(log.shipDate, "numeric-dash") : ""}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.shipToAccount}>{log.shipToAccount}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" style={{ width: widths.active }}>
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
