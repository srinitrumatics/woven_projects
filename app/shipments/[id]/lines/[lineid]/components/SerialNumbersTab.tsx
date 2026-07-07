import { useState, useEffect, useMemo } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

interface SerialNumbersTabProps {
    accountId: string;
    contactId: string;
    lineId: string;
}

export default function SerialNumbersTab({ accountId, contactId, lineId }: SerialNumbersTabProps) {
    const [loading, setLoading] = useState(true);
    const [serialData, setSerialData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

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
                            productId: item.Product_Name__c || item.Product__c || "",
                            productDescription: item.gtherp__Product_Description__c || item.Product_Description__c || "",
                            brand: item.Product_Brand_Name__c || "",
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

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(serialData, { key: 'name', direction: 'asc' });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const { widths, handleResize } = useResizableColumns({
        name: 180,
        serialNumber: 150,
        productSerialNumber: 200,
        productName: 180,
        productDescription: 250,
        brand: 170,
        shippingManifestName: 180
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
        <div className="flex flex-col mt-4">
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Serial Number Log" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" truncate={false} />
                        <SortableHeader label="Serial Number #" field="serialNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.serialNumber} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Product Serial Number" field="productSerialNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.productSerialNumber} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.brand} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Shipping Manifest #" field="shippingManifestName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingManifestName} onResize={handleResize} truncate={false} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={log.name}>
                                {log.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.serialNumber}>{displayCell(log.serialNumber)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.productSerialNumber}>{displayCell(log.productSerialNumber)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.productName}>
                                {log.productId ? (
                                    <Link href={`/products/${log.productId}`} className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                        {log.productName}
                                    </Link>
                                ) : (
                                    displayCell(log.productName)
                                )}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.productDescription}>{displayCell(log.productDescription)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={log.brand}>{displayCell(log.brand)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={log.shippingManifestName}>
                                {log.shippingManifestId ? (
                                    <Link href={`/shipments/${log.shippingManifestId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                        {log.shippingManifestName || "View Manifest"}
                                    </Link>
                                ) : (
                                    displayCell(log.shippingManifestName)
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedData.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="logs"
            />
        </div>
    );
}
