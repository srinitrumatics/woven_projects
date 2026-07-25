import { useState, useEffect, useMemo } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatNumber, displayCell } from "@/lib/utils/formatting";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

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
                            brand: item.Product_Brand_Name__c || "",
                            supplierName: item.gtherp__Supplier_Name__c || item.Supplier_Name__c || "",
                            purchaseOrderName: item.Purchase_Order_Name || item.gtherp__Purchase_Order__r?.Name || item.Purchase_Order__r?.Name || "",
                            purchaseOrderId: item.gtherp__Purchase_Order__c || item.Purchase_Order__c || "",
                            qtyOnHand: item.gtherp__Qty_On_Hand__c || item.Qty_On_Hand__c || 0,
                            qtyAvailable: item.gtherp__Qty_Available__c || item.Qty_Available__c || 0,
                            unitCost: item.gtherp__Unit_Cost__c || item.Unit_Cost__c || 0,
                            inventoryLocation: item.Location || item.gtherp__Inventory_Location__c || item.Inventory_Location_Name || item.Inventory_Location__c || "",
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
        return <TableLoadingState />;
    }

    if (inventoryData.length === 0) {
        return (
            <TableEmptyState message="No records found" description="There are no Inventory Positions associated with this shipping manifest line." />
        );
    }

    return (
        <div className="flex flex-col mt-4">
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <Table className="table-fixed">
                <THead>
                    <tr>
                        <SortableHeader label="Inventory Position" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                        <SortableHeader label="Received Date" field="receivedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.receivedDate} onResize={handleResize} />
                        <SortableHeader label="Age (Days)" field="daysInInventory" sortConfig={sortConfig} requestSort={requestSort} width={widths.daysInInventory} onResize={handleResize} />
                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} />
                        <SortableHeader label="Product Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.productDescription} onResize={handleResize} />
                        <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturerDBA} onResize={handleResize} />
                        <SortableHeader label="Supplier Name" field="supplierName" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplierName} onResize={handleResize} />
                        <SortableHeader label="Qty On Hand" field="qtyOnHand" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyOnHand} onResize={handleResize} />
                        <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyAvailable} onResize={handleResize} />
                        <SortableHeader label="Location" field="inventoryLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.inventoryLocation} onResize={handleResize} />
                        <SortableHeader label="Ship Confirmed Date" field="shipConfirmedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipConfirmedDate} onResize={handleResize} />
                    </tr>
                </THead>
                <TBody>
                    {paginatedData.map((pos) => (
                        <Tr key={pos.id}>
                            <Td className="font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={pos.name}>
                                {pos.name}
                            </Td>
                            <Td className="text-gray-600 dark:text-gray-400 truncate" title={pos.receivedDate ? formatDate(pos.receivedDate, "numeric-dash") : ""}>{displayCell(pos.receivedDate ? formatDate(pos.receivedDate, "numeric-dash") : "")}</Td>
                            <Td className="truncate" title={`${formatNumber(pos.daysInInventory, 0)} Days`}>{formatNumber(pos.daysInInventory, 0)} Days</Td>
                            <Td className="truncate" title={pos.productName}>
                                {pos.productId ? (
                                    <Link href={`/inventory/${pos.productId}`} className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                        {pos.productName}
                                    </Link>
                                ) : (
                                    displayCell(pos.productName)
                                )}
                            </Td>
                            <Td className="truncate" title={pos.productDescription}>{displayCell(pos.productDescription)}</Td>
                            <Td className="truncate" title={pos.brand}>{displayCell(pos.brand)}</Td>
                            <Td className="truncate" title={pos.supplierName}>{displayCell(pos.supplierName)}</Td>
                            <Td className="truncate" title={pos.qtyOnHand.toLocaleString()}>{pos.qtyOnHand.toLocaleString()}</Td>
                            <Td className="truncate" title={pos.qtyAvailable.toLocaleString()}>{pos.qtyAvailable.toLocaleString()}</Td>
                            <Td className="truncate" title={pos.inventoryLocation}>{displayCell(pos.inventoryLocation)}</Td>
                            <Td className="text-gray-600 dark:text-gray-400 truncate" title={pos.shipConfirmedDate ? formatDate(pos.shipConfirmedDate, "numeric-dash") : ""}>{displayCell(pos.shipConfirmedDate ? formatDate(pos.shipConfirmedDate, "numeric-dash") : "")}</Td>
                        </Tr>
                    ))}
                </TBody>
            </Table>
            </div>
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
