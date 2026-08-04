"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Td, TableEmptyState } from "@/components/ui/DataTable";


const ITEMS_PER_PAGE = 10;

export default function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: productId } = use(params);
    const { user, selectedAccount } = useUserSession();
    const router = useRouter();
    const accountId = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
    const contactId = user?.Id || user?.contact?.Id || "";


    const [positions, setPositions] = useState<any[]>([]);
    const [productInfo, setProductInfo] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!accountId || !productId || !contactId) return;
            try {
                const response = await fetch(`/api/salesforce/product-details?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&productId=${encodeURIComponent(productId)}&tabName=product`);
                if (response.ok) {
                    const data = await response.json();
                    if (data?.data?.[0]?.Product?.[0]) {
                        setProduct(data.data[0].Product[0]);
                    }
                }

            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        };

        const fetchInventory = async () => {
            if (!accountId || !productId) return;
            try {
                setLoading(true);

                // Determine isSupplier based on account record type
                const accountType = selectedAccount?.Account_Record_Type__c || '';
                const isSupplier = accountType === 'Manufacturer' ? 'true' : 'false';

                const response = await fetch(`/api/salesforce/inventory?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&productId=${encodeURIComponent(productId)}&isInventory=true&isSupplier=${isSupplier}`);

                if (response.ok) {
                    const responseData = await response.json();
                    if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                        const info = responseData.data[0];
                        setProductInfo(info);
                        
                        const rawPositions = info.Inventory_Position__c || [];
                        setPositions(rawPositions);
                    }
                } else {
                    console.error("Failed to fetch inventory for product:", productId);
                }
            } catch (error) {
                console.error("Error fetching inventory detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
        fetchInventory();
    }, [productId, accountId, contactId]);



    const stats = useMemo(() => {
        const totalQty = positions.reduce((sum, p) => sum + (Number(p.Qty_On_Hand__c) || 0), 0);
        const availableQty = positions.reduce((sum, p) => sum + (Number(p.Qty_Available__c) || 0), 0);
        const onHoldQty = positions.reduce((sum, p) => sum + (p.On_Hold__c ? Number(p.Qty_On_Hand__c) || 0 : 0), 0);
        const totalValue = positions.reduce((sum, p) => sum + (Number(p.Total_Price__c) || 0), 0);

        return {
            totalItems: positions.length,
            totalQty,
            availableQty,
            onHoldQty,
            totalValue
        };
    }, [positions]);

    const { widths, handleResize } = useResizableColumns({
        name: 220,
        receivedDate: 150,
        age: 120,
        po: 150,
        supplier: 180,
        qtyOnHand: 180,
        qtyAvailable: 190,
        onHold: 100,
        unitPrice: 180,
        totalPrice: 180,
        location: 200,
        site: 200,
        cvIn: 180,
        cvSqft: 180,
        salesOrder: 180,
        shippingManifest: 190,
        condition: 190,
        invoiced: 180
    });

    const filteredPositions = useMemo(() => {
        if (!searchQuery.trim()) return positions;
        const query = searchQuery.toLowerCase();
        return positions.filter(item =>
            String(item.Name || '').toLowerCase().includes(query) ||
            String(item.Supplier_Name__c || '').toLowerCase().includes(query) ||
            String(item.Location || '').toLowerCase().includes(query) ||
            String(item.Site_Name || '').toLowerCase().includes(query)
        );
    }, [positions, searchQuery]);

    const { items: sortedPositions, requestSort, sortConfig } = useSortableData(filteredPositions, { key: 'Name', direction: 'asc' });

    const totalPages = Math.max(1, Math.ceil(sortedPositions.length / ITEMS_PER_PAGE));
    const paginatedPositions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedPositions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPositions, currentPage]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center p-6 min-w-0">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    const productName = product?.Name || "";

    return (
        <div>
            <div className="mb-6">
                <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <button onClick={() => router.push('/inventory')} className="hover:text-primary transition-colors">My Inventory</button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="truncate max-w-[200px]" title={productName}>{productName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-900 dark:text-white font-medium truncate">Inventory Details</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white " title={productName}>{productName}</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-base mt-1 truncate" title="Detailed inventory positions and tracking history">Detailed inventory positions and tracking history</p>
                    </div>
                    <Link
                        href={`/inventory`}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2 truncate"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to My Inventory
                    </Link>

                </div>
            </div>



            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative max-w-xs">
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {paginatedPositions.length === 0 ? (
                        <TableEmptyState message="No positions found." />
                    ) : (
                    <Table className="border-collapse text-sm">
                        <THead>
                            <tr>
                                <SortableHeader label="Inventory Position ID" field="Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Received Date" field="Received_Date__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.receivedDate} onResize={handleResize} />
                                <SortableHeader label="Age (Days)" field="Days_in_Inventory__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.age} onResize={handleResize} />
                                <SortableHeader label="PO # | RMA #" field="Purchase_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.po} onResize={handleResize} />
                                <SortableHeader label="Supplier Name" field="Supplier_Name__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.supplier} onResize={handleResize} />
                                <SortableHeader label="Qty on Hand" field="Qty_On_Hand__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyOnHand} onResize={handleResize} />
                                <SortableHeader label="Qty Available" field="Qty_Available__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyAvailable} onResize={handleResize} />
                                <SortableHeader label="On Hold" field="On_Hold__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.onHold} onResize={handleResize} />
                                <SortableHeader label="Unit Price" field="Unit_Price__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                <SortableHeader label="Total OH Value" field="Total_Price__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                                <SortableHeader label="Total CV (IN)" field="Total_Unit_CV_Inches__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.cvIn} onResize={handleResize} />
                                <SortableHeader label="Total CV (SQFT)" field="Total_Unit_CV_SQFT__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.cvSqft} onResize={handleResize} />
                                <SortableHeader label="Sales Order #" field="Sales_Order_Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={handleResize} />
                                <SortableHeader label="Shipping Manifest" field="Shipping_Manifest_Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.shippingManifest} onResize={handleResize} />
                                <SortableHeader label="Condition" field="Condition__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.condition} onResize={handleResize} />
                                <SortableHeader label="Invoiced" field="Invoiced__c" sortConfig={sortConfig} requestSort={requestSort} width={widths.invoiced} onResize={handleResize} />
                                <SortableHeader label="Location" field="Location" sortConfig={sortConfig} requestSort={requestSort} width={widths.location} onResize={handleResize} />
                                <SortableHeader label="Site" field="Site_Name" sortConfig={sortConfig} requestSort={requestSort} width={widths.site} onResize={handleResize} />

                            </tr>
                        </THead>
                        <TBody>
                                {paginatedPositions.map((item, idx) => (
                                    <Tr key={item.Id || idx}>
                                        <Td className="font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10 truncate">{displayCell(item.Name)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{item.Received_Date__c ? formatDate(item.Received_Date__c, "numeric-dash") : 'N/A'}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{formatNumber(item.Days_in_Inventory__c, 2)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Purchase_Order_Name || item.RMA_Name)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Supplier_Name__c)}</Td>
                                        <Td className="truncate">{formatNumber(item.Qty_On_Hand__c)}</Td>
                                        <Td className={`font-semibold ${item.Qty_Available__c < 1 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatNumber(item.Qty_Available__c)}
                                        </Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{item.On_Hold__c ? 'Yes' : '-'}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{formatCurrency(item.Unit_Price__c)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{formatCurrency(item.Total_Price__c)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{formatNumber(item.Total_Unit_CV_Inches__c)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{formatNumber(item.Total_Unit_CV_SQFT__c)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Sales_Order_Name)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Shipping_Manifest_Name)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Condition__c)}</Td>
                                        <Td className="truncate">{item.Invoiced__c ? 'Yes' : 'No'}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Location)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate">{displayCell(item.Site_Name)}</Td>
                                    </Tr>
                                ))}
                        </TBody>
                    </Table>
                    )}
                </div>
                </div>


                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredPositions.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="positions"
                />

            </div>
        </div>
    );
}

