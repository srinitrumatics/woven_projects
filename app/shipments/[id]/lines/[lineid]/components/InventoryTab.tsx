import { useState, useEffect, useMemo } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

interface InventoryTabProps {
    accountId: string;
    contactId: string;
    lineId: string;
}

export default function InventoryTab({ accountId, contactId, lineId }: InventoryTabProps) {
    const [loading, setLoading] = useState(true);
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function fetchInventory() {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    accountId,
                    contactId,
                    objectId: lineId,
                    objectName: "Shipping_Manifest_Line__c",
                    tabName: "Inventory"
                });
                const response = await fetch(`/api/salesforce/shipments?${queryParams}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result && result.data && Array.isArray(result.data)) {
                        let records: any[] = [];
                        if (result.data.length > 0 && result.data[0].Inventory_Position__c) {
                            records = result.data[0].Inventory_Position__c;
                        } else if (result.data.length > 0 && !result.data[0].hasOwnProperty('Inventory_Position__c')) {
                            records = result.data;
                        }

                        const mapped = records.map((item: any) => ({
                            id: item.Id,
                            name: item.Name || "",
                            receivedDate: item.gtherp__Received_Date__c || item.Received_Date__c || "",
                            daysInInventory: item.gtherp__Days_in_Inventory__c || item.Days_in_Inventory__c || 0,
                            productName: item.gtherp__Product_Name__c || item.Product_Name || "",
                            productId: item.Product_Name__c || item.Product__c || "",
                            productDescription: item.gtherp__Product_Description__c || item.Product_Description__c || "",
                            manufacturerDBA: item.gtherp__Manufacturer_DBA__c || item.Manufacturer_DBA__c || "",
                            brand: item.gtherp__Brand_Name__c || item.Brand_Name__c || "",
                            supplierName: item.gtherp__Supplier_Name__c || item.Supplier_Name__c || "",
                            purchaseOrderName: item.Purchase_Order_Name || item.gtherp__Purchase_Order__r?.Name || item.Purchase_Order__r?.Name || "",
                            purchaseOrderId: item.gtherp__Purchase_Order__c || item.Purchase_Order__c || "",
                            qtyOnHand: item.gtherp__Qty_On_Hand__c || item.Qty_On_Hand__c || 0,
                            qtyAvailable: item.gtherp__Qty_Available__c || item.Qty_Available__c || 0,
                            unitCost: item.gtherp__Unit_Cost__c || item.Unit_Cost__c || 0,
                            inventoryLocation: item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || "",
                            rack: item.gtherp__Rack__c || item.Rack_Name || item.Rack__c || "",
                            bay: item.gtherp__Rack_Level__c || item.Rack_Level_Name || item.Rack_Level__c || "",
                            levelPosition: item.gtherp__Bin__c || item.Bin_Name || item.Bin__c || "",
                            salesOrderName: item.Sales_Order_Name || item.gtherp__Sales_Order__r?.Name || item.Sales_Order__r?.Name || "",
                            salesOrderId: item.gtherp__Sales_Order__c || item.Sales_Order__c || "",
                            shippingManifestName: item.Shipping_Manifest_Name || item.gtherp__Shipping_Manifest__r?.Name || item.Shipping_Manifest__r?.Name || "",
                            shippingManifestId: item.gtherp__Shipping_Manifest__c || item.Shipping_Manifest__c || "",
                            shipConfirmedDate: item.gtherp__Shipped_Date__c || item.Shipped_Date__c || "",
                        }));
                        setInventoryData(mapped);
                    }
                }
            } catch (error) {
                console.error("Fetch inventory error:", error);
            } finally {
                setLoading(false);
            }
        }

        if (accountId && contactId && lineId) {
            fetchInventory();
        }
    }, [accountId, contactId, lineId]);

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(inventoryData, { key: 'name', direction: 'asc' });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const { widths, handleResize } = useResizableColumns({
        name: 180,
        receivedDate: 150,
        daysInInventory: 160,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 180,
        supplierName: 180,
        qtyOnHand: 130,
        qtyAvailable: 130,
        inventoryLocation: 170,
        shipConfirmedDate: 180
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (inventoryData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Inventory Positions associated with this shipping manifest line.">There are no Inventory Positions associated with this shipping manifest line.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Inventory Position" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" truncate={false} />
                        <SortableHeader label="Received Date" field="receivedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receivedDate} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Age (Days)" field="daysInInventory" sortConfig={sortConfig} requestSort={requestSort} width={widths.daysInInventory} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Qty On Hand" field="qtyOnHand" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyOnHand} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyAvailable} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Location" field="inventoryLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.inventoryLocation} onResize={handleResize} truncate={false} />
                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={handleResize} truncate={false} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map((pos) => (
                        <tr key={pos.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={pos.name}>
                                {pos.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={pos.receivedDate ? formatDate(pos.receivedDate, "numeric-dash") : ""}>{displayCell(pos.receivedDate ? formatDate(pos.receivedDate, "numeric-dash") : "")}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={`${formatNumber(pos.daysInInventory, 0)} Days`}>{formatNumber(pos.daysInInventory, 0)} Days</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.productName}>
                                {pos.productId ? (
                                    <Link href={`/inventory/${pos.productId}`} className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                        {pos.productName}
                                    </Link>
                                ) : (
                                    displayCell(pos.productName)
                                )}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.productDescription}>{displayCell(pos.productDescription)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.brand}>{displayCell(pos.brand)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.supplierName}>{displayCell(pos.supplierName)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.qtyOnHand.toLocaleString()}>{pos.qtyOnHand.toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.qtyAvailable.toLocaleString()}>{pos.qtyAvailable.toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.inventoryLocation}>{displayCell(pos.inventoryLocation)}</td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={pos.shipConfirmedDate ? formatDate(pos.shipConfirmedDate, "numeric-dash") : ""}>{displayCell(pos.shipConfirmedDate ? formatDate(pos.shipConfirmedDate, "numeric-dash") : "")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedData.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="positions"
            />
        </div>
    );
}
