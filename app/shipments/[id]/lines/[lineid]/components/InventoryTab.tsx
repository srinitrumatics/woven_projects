import { useState, useEffect } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils/formatting";
import Link from "next/link";

interface InventoryTabProps {
    accountId: string;
    contactId: string;
    lineId: string;
}

export default function InventoryTab({ accountId, contactId, lineId }: InventoryTabProps) {
    const [loading, setLoading] = useState(true);
    const [inventoryData, setInventoryData] = useState<any[]>([]);

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
                            productDescription: item.gtherp__Product_Description__c || item.Product_Description__c || "",
                            manufacturerDBA: item.gtherp__Manufacturer_DBA__c || item.Manufacturer_DBA__c || "",
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

    const { items: sortedData, requestSort, sortConfig } = useSortableData<any>(inventoryData, { key: 'Name', direction: 'desc' });

    const { widths, handleResize } = useResizableColumns({
        name: 180,
        receivedDate: 150,
        daysInInventory: 160,
        productName: 180,
        productDescription: 250,
        manufacturerDBA: 180,
        supplierName: 180,
        purchaseOrderName: 150,
        qtyOnHand: 130,
        qtyAvailable: 130,
        unitCost: 130,
        inventoryLocation: 170,
        rack: 150,
        bay: 150,
        levelPosition: 150,
        salesOrderName: 150,
        shippingManifestName: 180,
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
                        <SortableHeader label="Inventory Position" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Received Date" field="receivedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receivedDate} onResize={handleResize} />
                        <SortableHeader label="Days in Inventory" field="daysInInventory" sortConfig={sortConfig} requestSort={requestSort} width={widths.daysInInventory} onResize={handleResize} />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} />
                        <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                        <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={handleResize} />
                        <SortableHeader label="Purchase Order" field="purchaseOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.purchaseOrderName} onResize={handleResize} />
                        <SortableHeader label="Qty on Hand" field="qtyOnHand" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyOnHand} onResize={handleResize} />
                        <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyAvailable} onResize={handleResize} />
                        <SortableHeader label="Unit Cost" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitCost} onResize={handleResize} />
                        <SortableHeader label="Inventory Location" field="inventoryLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.inventoryLocation} onResize={handleResize} />
                        <SortableHeader label="Rack" field="rack" sortConfig={sortConfig} requestSort={requestSort} width={widths.rack} onResize={handleResize} />
                        <SortableHeader label="Bay" field="bay" sortConfig={sortConfig} requestSort={requestSort} width={widths.bay} onResize={handleResize} />
                        <SortableHeader label="Level-Position" field="levelPosition" sortConfig={sortConfig} requestSort={requestSort} width={widths.levelPosition} onResize={handleResize} />
                        <SortableHeader label="Sales Order" field="salesOrderName" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrderName} onResize={handleResize} />
                        <SortableHeader label="Shipping Manifest" field="shippingManifestName" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingManifestName} onResize={handleResize} />
                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={handleResize} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedData.map((pos) => (
                        <tr key={pos.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={pos.name}>
                                {pos.name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={pos.receivedDate ? formatDate(pos.receivedDate, "numeric-dash") : ""}>{pos.receivedDate ? formatDate(pos.receivedDate, "numeric-dash") : ""}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={`${formatNumber(pos.daysInInventory, 0)} Days`}>{formatNumber(pos.daysInInventory, 0)} Days</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.productName}>{pos.productName}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.productDescription}>{pos.productDescription}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.manufacturerDBA}>{pos.manufacturerDBA}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.supplierName}>{pos.supplierName}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={pos.purchaseOrderName}>
                                {pos.purchaseOrderId ? (
                                    <Link href={`/purchase-orders/${pos.purchaseOrderId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                        {pos.purchaseOrderName || "View PO"}
                                    </Link>
                                ) : (
                                    pos.purchaseOrderName || " "
                                )}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.qtyOnHand.toLocaleString()}>{pos.qtyOnHand.toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.qtyAvailable.toLocaleString()}>{pos.qtyAvailable.toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(pos.unitCost)}>{formatCurrency(pos.unitCost)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.inventoryLocation}>{pos.inventoryLocation}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.rack}>{pos.rack}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.bay}>{pos.bay}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={pos.levelPosition}>{pos.levelPosition}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={pos.salesOrderName}>
                                {pos.salesOrderName || " "}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-400 truncate" title={pos.shippingManifestName}>
                                {pos.shippingManifestId ? (
                                    <Link href={`/shipments/${pos.shippingManifestId}`} className="text-primary hover:underline font-medium" target="_blank" onClick={(e) => e.stopPropagation()}>
                                        {pos.shippingManifestName || "View Manifest"}
                                    </Link>
                                ) : (
                                    pos.shippingManifestName || " "
                                )}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={pos.shipConfirmedDate ? formatDate(pos.shipConfirmedDate, "numeric-dash") : ""}>{pos.shipConfirmedDate ? formatDate(pos.shipConfirmedDate, "numeric-dash") : ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
