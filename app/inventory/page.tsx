"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import Tabs from "@/components/ui/Tabs";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatCurrency, formatNumber, displayCell } from "@/lib/utils/formatting";
import { InventoryPosition, InventoryStatus } from "./types";
import Link from "next/link";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

type TabFilter = "All" | "On Hold" | "Put-Away" | "Average Aged";

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
    const router = useRouter();
    const { warning, error: toastError } = useToast();
    const [activeTab, setActiveTab] = useState<TabFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [inventoryData, setInventoryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Top-level session hook
    const { user, selectedAccount } = useUserSession();
    const accountId = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
    const contactId = user?.Id || "";

    const fetchInventory = async () => {
        if (!accountId) return;
        try {
            setLoading(true);
            const response = await fetch(
                `/api/salesforce/inventory?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&isInventory=true`
            );
            if (response.ok) {
                const responseData = await response.json();
                if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    setInventoryData(responseData.data[0]);
                }
            }
        } catch (error) {
            console.error("Error loading inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId && contactId) {
            fetchInventory();
        }
    }, [accountId, contactId]);

    // Auto-hide the transfer error message after a few seconds
    useEffect(() => {
        if (transferError) {
            const timer = setTimeout(() => {
                setTransferError(null);
            }, 3000); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [transferError]);

    // We will define handleRequestTransfer below mappedInventory so it can read product details.
    // Map raw data from API to InventoryPosition objects
    // NOTE: The API already applies the ownership/account filter conditions.
    // Do NOT re-filter here — just map the returned records.
    const mappedInventory = useMemo((): InventoryPosition[] => {
        if (!inventoryData) return [];

        let rawRecords: any[] = [];
        if (activeTab === "All") rawRecords = inventoryData["Total Inventory Value"] || [];
        else if (activeTab === "On Hold") rawRecords = inventoryData["Products On Hold"] || [];
        else if (activeTab === "Put-Away") rawRecords = inventoryData["Put-Away"] || [];
        else if (activeTab === "Average Aged") rawRecords = inventoryData["Average Aged"] || [];

        const recordsToMap = Array.isArray(rawRecords) ? rawRecords : [];

        return recordsToMap.map((item: any, idx: number) => ({
            id: item.Product_Name__c || `inv-${idx}`,
            productId: item.Product_Name__c || "",
            name: item.Product_Name || "",
            productName: item.Product_Name || "",
            productDescription: item.Product_Description__c || "",
            brand: item.Brand_Name__c || "",
            // API returns "Family" (not Product_Name_Family)
            productFamily: item.Family || "",
            manufacturerDBA: item.Manufacturer_DBA__c || "",
            qtyOnHand: item.Qty_On_Hand__c || 0,
            qtyAvailable: item.Qty_Available__c || 0,
            unitCost: item.Unit_Price__c || 0,
            totalPrice: item.Total_Price__c || 0,
            totalUnitCVInches: item.Total_Unit_CV_Inches__c || 0,
            totalUnitCVSQFT: item.Total_Unit_CV_SQFT__c || 0,
            avgInventoryAge: item.Avg_Inventory_Age__c || 0,
            totalPositions: item.Total_Positions__c || 0,
            countSites: item.Count_Sites__c || 0,
            moq: item.MOQ__c || 0,
            availableToSell: item.Available_To_Sell__c || 0,
            manufacturerName: item.Manufacturer_Name || "",
            status: (item.Qty_Available__c > 0 ? "Available" : "Reserved") as InventoryStatus,
            receivedDate: "",
            daysInInventory: item.Avg_Inventory_Age__c || 0,
            supplierName: item.Manufacturer_Name || "",
            purchaseOrder: "",
            inventoryLocation: "",
            rack: "",
            bay: "",
            levelPosition: "",
            salesOrder: "",
            shippingManifest: "",
            shipConfirmedDate: ""
        }));
    }, [inventoryData, activeTab]);

    // Filtering based on search query
    const filteredInventory = useMemo((): InventoryPosition[] => {
        if (!searchQuery.trim()) return mappedInventory;
        const query = searchQuery.toLowerCase();
        return mappedInventory.filter((l: InventoryPosition) =>
            String(l.productName || '').toLowerCase().includes(query) ||
            String(l.productDescription || '').toLowerCase().includes(query) ||
            String(l.productFamily || '').toLowerCase().includes(query)
        );
    }, [mappedInventory, searchQuery]);

    const { items: sortedInventory, requestSort, sortConfig } = useSortableData<InventoryPosition>(filteredInventory, { key: 'name', direction: 'desc' });

    // Pagination
    const totalPages = Math.ceil(sortedInventory.length / ITEMS_PER_PAGE);
    const paginatedInventory = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedInventory.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedInventory, currentPage]);

    const toggleSelection = (id: string) => {
        const item = mappedInventory.find(i => i.productId === id || i.id === id);
        if (item && item.qtyAvailable <= 0) {
            warning("Products with zero available quantity cannot be selected for transfer.");
            return;
        }
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const toggleSelectAll = () => {
        const selectableItems = paginatedInventory.filter(i => i.qtyAvailable > 0);
        const selectableIds = selectableItems.map(i => i.productId || i.id);

        const allSelectableSelected = selectableIds.length > 0 &&
            selectableIds.every(id => selectedItems.has(id));

        const newSelection = new Set(selectedItems);
        if (allSelectableSelected) {
            selectableIds.forEach(id => newSelection.delete(id));
        } else {
            selectableIds.forEach(id => newSelection.add(id));
        }
        setSelectedItems(newSelection);
    };

    useEffect(() => {
        setSelectedItems(new Set());
    }, [activeTab, searchQuery, currentPage]);

    // Resizable columns
    const { widths, handleResize } = useResizableColumns({
        checkbox: 48,
        productName: 180,
        description: 200,
        manufacturer: 200,
        family: 180,
        qtyOnHand: 180,
        qtyAvailable: 190,
        unitPrice: 190,
        totalValue: 160,
        cvIn: 190,
        cvSqft: 190,
        age: 200,
        positions: 190,
        sites: 180,
        status: 150,
        actions: 80
    });

    // Summary stats — derived directly from API response arrays.
    // API already applies all ownership/account/status filters.
    const stats = useMemo(() => {
        if (!inventoryData) return { total: 0, totalValue: 0, uniqueProducts: 0, agedUniqueProducts: 0, agedTotalValue: 0, avgDaysAged: 0, putAwayCount: 0, putAwayUniqueProducts: 0, putAwayTotalValue: 0, onHoldCount: 0, onHoldUniqueProducts: 0, onHoldTotalValue: 0 };

        // Card 1: Total Inventory Value — from "Total Inventory Value" array
        const totalInvItems: any[] = inventoryData["Total Inventory Value"] || [];
        const totalValue = totalInvItems.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);
        const uniqueProducts = new Set(totalInvItems.map((item: any) => item.Product_Name__c)).size;

        // Card 2: Average Aged — from "Average Aged" array
        const agedItems: any[] = inventoryData["Average Aged"] || [];
        const agedUniqueProducts = new Set(agedItems.map((item: any) => item.Product_Name__c)).size;
        const agedTotalValue = agedItems.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);
        const totalAge = agedItems.reduce((sum: number, item: any) => sum + (item.Avg_Inventory_Age__c || 0), 0);
        const avgDaysAged = agedItems.length > 0 ? (totalAge / agedItems.length) : 0;

        // Card 3: Put-Away — from "Put-Away" array directly
        const putAwayItems: any[] = inventoryData["Put-Away"] || [];
        const putAwayCount = putAwayItems.length;
        const putAwayUniqueProducts = new Set(putAwayItems.map((item: any) => item.Product_Name__c)).size;
        const putAwayTotalValue = putAwayItems.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);

        // Card 4: Products On Hold — from "Products On Hold" array directly
        const onHoldItems: any[] = inventoryData["Products On Hold"] || [];
        const onHoldCount = onHoldItems.length;
        const onHoldUniqueProducts = new Set(onHoldItems.map((item: any) => item.Product_Name__c)).size;
        const onHoldTotalValue = onHoldItems.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);

        return {
            total: totalInvItems.length,
            totalValue,
            uniqueProducts,
            agedUniqueProducts,
            agedTotalValue,
            avgDaysAged,
            putAwayCount,
            putAwayUniqueProducts,
            putAwayTotalValue,
            onHoldCount,
            onHoldUniqueProducts,
            onHoldTotalValue
        };

    }, [inventoryData]);

    const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

    const handleRequestTransfer = async () => {
        setTransferError(null);
        if (selectedItems.size === 0) {
            setTransferError("Please select at least one product to transfer.");
            return;
        }

        try {
            setIsTransferring(true);

            // Get product details for selected items
            const selectedProductsDetails = Array.from(selectedItems)
                .map(id => mappedInventory.find(p => p.id === id))
                .filter(Boolean);

            const payload = {
                order: {
                    Bill_to_Account__c: accountId,
                    Ship_to_Account__c: accountId,
                    Inventory_Account__c: accountId,
                    Status__c: 'Draft',
                    Proposal_Requested__c: false,
                    Transfer_Order__c: true
                },
                shipToContact: {
                    Id: contactId
                },
                orderLines: selectedProductsDetails.map(product => ({
                    Status__c: 'Draft',
                    Product_Name__c: product!.productId || product!.id,
                    Order_Qty__c: product!.moq && product!.moq > 0
                        ? Math.max(1, Math.floor((product!.qtyAvailable || 0) / product!.moq))
                        : Math.max(1, product!.qtyAvailable || 0),
                    Unit_Price__c: 0, // Transfer orders always have $0.00 unit price initially
                    MOQ__c: product!.moq || 1,
                    Inventory_Account__c: accountId,
                    IsTaxable__c: true
                })),
                accountId: accountId,
                contactId: contactId,
                isDraft: true
            };

            const response = await fetch('/api/salesforce/orders', {
                method: 'PATCH', // Using PATCH to hit clone logic which supports orderLines
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to create transfer order' }));
                throw new Error(errorData.error || 'Failed to create transfer order');
            }

            const result = await response.json();

            let newOrderId = null;
            if (result.orderId) {
                newOrderId = result.orderId;
            } else if (Array.isArray(result) && result.length > 0) {
                newOrderId = result[0].Id || result[0].id || result[0].orderId;
            } else if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                if (result.data[0].Customer_Order__c && Array.isArray(result.data[0].Customer_Order__c) && result.data[0].Customer_Order__c.length > 0) {
                    newOrderId = result.data[0].Customer_Order__c[0].Id;
                } else {
                    newOrderId = result.data[0].Id;
                }
            } else {
                newOrderId = result.Id || result.id;
            }

            if (newOrderId) {
                const productsStr = selectedItems.size > 0 ? `&products=${Array.from(selectedItems).join(',')}` : '';
                router.push(`/orders/${newOrderId}?new=true&transfer=true${productsStr}`);
            } else {
                throw new Error('No order ID returned from API');
            }
        } catch (error: any) {
            console.error('Failed to create transfer order:', error);
            const errMsg = error.message || 'Failed to initiate transfer. Please try again.';
            setTransferError(errMsg);
        } finally {
            setIsTransferring(false);
        }
    };

    const handleCardClick = (filter: TabFilter) => {
        setActiveTab(filter);
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col gap-6 p-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                <div className="flex flex-col min-w-0">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">My Inventory</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base mt-1 truncate" title="Managed and Track Inventory Across All Locations.">Managed and Track Inventory Across All Locations.</p>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={handleRequestTransfer}
                        disabled={isTransferring}
                        className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 truncate disabled:opacity-50 disabled:cursor-not-allowed ${selectedItems.size > 0 ? 'bg-primary hover:bg-primary-dark' : 'bg-primary/80 hover:bg-primary-dark'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {isTransferring ? 'Creating...' : `Request Transfer ${selectedItems.size > 0 ? `(${selectedItems.size})` : ''}`}
                    </button>
                </div>
            </div>

            {/* Stat Cards - Inherited Design from Proposals */}
            <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-4 gap-4 mb-2">
                {/* Card 1: Total Inventory Value */}
                <button
                    onClick={() => handleCardClick("All")}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "All"
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        }`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark"></div>
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <Link
                                    href="#"
                                    onClick={() => handleCardClick("All")}
                                    className="hover:underline block">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1" title="Total Inventory Value">Total Inventory Value</p>
                                </Link>
                                <div className="flex items-baseline gap-2 group/count">
                                    <Link
                                        href="#"
                                        onClick={() => handleCardClick("All")}
                                        className="hover:underline block">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white ">{stats.uniqueProducts}</span>
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={() => handleCardClick("All")}
                                        className="hover:underline block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Products</span>
                                    </Link>
                                </div>
                                <p className="text-lg font-semibold text-primary mt-1">{formatCurrency(stats.totalValue)}</p>
                            </div>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "All" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                } transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <Link
                                href="#"
                                onClick={() => handleCardClick("All")}
                                className="hover:underline block">
                                <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-blue-500">
                                    View all inventory
                                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </button>

                {/* Card 2: Average Aged */}
                <button
                    onClick={() => handleCardClick("Average Aged")}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "Average Aged"
                        ? "border-slate-500 ring-2 ring-slate-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-slate-500/50"
                        }`}
                >

                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 to-slate-300"></div>
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1" title="Average Days Aged">Average Days Aged</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white ">{stats.avgDaysAged.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ">Days</span>
                                </div>
                                <p className="text-lg font-semibold text-slate-500 mt-1">{formatCurrency(stats.agedTotalValue)}</p>

                            </div>
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/20 text-slate-500 flex items-center justify-center transition-colors group-hover:bg-slate-500 group-hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-slate-500">
                                View aged inventory
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </button>

                {/* Card 3: Put-Away */}

                <button
                    onClick={() => handleCardClick("Put-Away")}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "Put-Away"
                        ? "border-amber-400 ring-2 ring-amber-400/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-amber-400/50"
                        }`}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-200"></div>
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <Link href="#" onClick={() => handleCardClick("Put-Away")} className="hover:underline block">
                                    <p className="text-sm font-medium text-gray-400 dark:text-gray-400 mb-1" title="Put-Away">Put-Away</p>
                                </Link>
                                <div className="flex items-baseline gap-2 group/count">
                                    <Link href="#" onClick={() => handleCardClick("Put-Away")} className="hover:underline block">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white group-hover/count:underline transition-all decoration-2 underline-offset-4">{stats.putAwayCount}</span>
                                    </Link>
                                    <Link href="#" onClick={() => handleCardClick("Put-Away")} className="hover:underline block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Inventory Positions</span>
                                    </Link>
                                </div>

                                <p className="text-xl font-bold text-amber-500 mt-2">{formatCurrency(stats.putAwayTotalValue)}</p>
                            </div>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === "Put-Away" ? "bg-amber-500 text-white" : "bg-amber-50 dark:bg-amber-900/20 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-amber-500">
                                View put-away items
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </button>

                {/* Card 4: Products On Hold */}
                <button
                    onClick={() => handleCardClick("On Hold")}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg flex flex-col h-full ${activeTab === "On Hold"
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                        }`}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-300"></div>
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                                <Link href="#" onClick={() => handleCardClick("On Hold")} className="hover:underline block">
                                    <p className="text-sm font-medium text-gray-400 dark:text-gray-400 mb-1" title="Products On Hold">Products On Hold</p>
                                </Link>
                                <div className="flex items-baseline gap-2 group/count">
                                    <Link href="#" onClick={() => handleCardClick("On Hold")} className="hover:underline block">

                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.onHoldCount}</span>
                                    </Link>
                                    <Link href="#" onClick={() => handleCardClick("On Hold")} className="hover:underline block">

                                        <span className="text-sm text-gray-500 dark:text-gray-400">Inventory Positions</span>
                                    </Link>
                                </div>
                                <p className="text-xl font-bold text-red-500 mt-2">{formatCurrency(stats.onHoldTotalValue)}</p>
                            </div>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "On Hold" ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                                } transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-red-500">
                                View items on hold
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </button>
            </div >

            {transferError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{transferError}</p>
                </div>
            )}

            {/* Filters & Table Section */}
            < div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden px-6 py-3" >
                <div className="pb-4 border-b border-gray-100 dark:border-gray-700 mb-2">
                    <div className="flex flex-wrap items-center gap-3 px-2">
                        <div className="relative min-w-[280px] max-w-xs flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search Inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="relative ">
                            <Tabs
                                tabs={(["All", "On Hold", "Put-Away", "Average Aged"] as TabFilter[]).map((tab) => ({ key: tab, label: tab }))}
                                activeKey={activeTab}
                                onChange={(key) => handleCardClick(key as TabFilter)}
                            />

                        </div>
                    </div>
                </div>

                <div className="rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <TableLoadingState message="Loading inventory data..." />
                        ) : paginatedInventory.length === 0 ? (
                            <TableEmptyState
                                message="No inventory items found"
                                description="Try adjusting your filters or search query to find what you're looking for."
                            />
                        ) : (
                            <Table className="text-sm table-fixed">
                                <THead>
                                    <tr>
                                        <Th className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" style={{ width: widths.checkbox, minWidth: widths.checkbox, maxWidth: widths.checkbox }}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                checked={
                                                    paginatedInventory.filter(i => i.qtyAvailable > 0).length > 0 &&
                                                    paginatedInventory.filter(i => i.qtyAvailable > 0).every(i => selectedItems.has(i.productId || i.id))
                                                }
                                                onChange={toggleSelectAll}
                                            />
                                        </Th>
                                        <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} className="sticky bg-primary-light dark:bg-gray-900 z-20" style={{ left: widths.checkbox }} />
                                        <SortableHeader label="Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                        <SortableHeader label="Brand Name" field="brand" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={handleResize} />
                                        <SortableHeader label="Product Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} width={widths.family} onResize={handleResize} />
                                        <SortableHeader label="Qty On Hand" field="qtyOnHand" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyOnHand} onResize={handleResize} />
                                        <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyAvailable} onResize={handleResize} />
                                        <SortableHeader label="Avg Unit Price" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                        <SortableHeader label="Total OH Value" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalValue} onResize={handleResize} />
                                        <SortableHeader label="Total CV (IN)" field="totalUnitCVInches" sortConfig={sortConfig} requestSort={requestSort} width={widths.cvIn} onResize={handleResize} />
                                        <SortableHeader label="Total CV (SQFT)" field="totalUnitCVSQFT" sortConfig={sortConfig} requestSort={requestSort} width={widths.cvSqft} onResize={handleResize} />
                                        <SortableHeader label="Avg Age (Days)" field="avgInventoryAge" sortConfig={sortConfig} requestSort={requestSort} width={widths.age} onResize={handleResize} />
                                        <SortableHeader label="Total Positions" field="totalPositions" sortConfig={sortConfig} requestSort={requestSort} width={widths.positions} onResize={handleResize} />
                                        <SortableHeader label="Sites" field="countSites" sortConfig={sortConfig} requestSort={requestSort} width={widths.sites} onResize={handleResize} />
                                        <Th style={{ width: widths.actions }}>Action</Th>
                                    </tr>
                                </THead>
                                <TBody>
                                    {paginatedInventory.map((item) => (
                                        <Tr key={item.id} className={`group ${selectedItems.has(item.productId || item.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                            <Td className={`px-3 py-2  sticky left-0 bg-white dark:bg-gray-800 text-left ${selectedItems.has(item.productId || item.id) ? 'bg-primary-light dark:bg-gray-700' : 'bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700'}`} style={{ width: widths.checkbox, minWidth: widths.checkbox, maxWidth: widths.checkbox }}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    checked={selectedItems.has(item.productId || item.id)}
                                                    onChange={() => toggleSelection(item.productId || item.id)}
                                                    disabled={item.qtyAvailable <= 0}
                                                />
                                            </Td>
                                            <Td className={`px-3 py-2 text-sm text-primary font-semibold text-gray-600 dark:text-gray-400 hover:underline sticky text-left truncate shadow-[1px_0_0_0_#f3f4f6] dark:shadow-[1px_0_0_0_#374151] z-20 ${selectedItems.has(item.productId || item.id) ? 'bg-primary-light dark:bg-gray-700' : 'bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700'}`} style={{ width: widths.productName, minWidth: widths.productName, maxWidth: widths.productName, left: widths.checkbox }}>
                                                <Link href={`/inventory/${item.productId || item.id}`} title={item.productName} className="hover:underline text-left truncate block w-full outline-none focus:text-primary-dark">
                                                    {displayCell(item.productName)}
                                                </Link>

                                            </Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.description, maxWidth: widths.description }}>
                                                <div className="truncate" title={item.productDescription}>{displayCell(item.productDescription)}</div>
                                            </Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.manufacturer, maxWidth: widths.manufacturer }}>
                                                <div className="truncate" title={item.brand}>{displayCell(item.brand)}</div>
                                            </Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                                                <div className="truncate">
                                                    <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-primary/10 text-primary truncate">{displayCell(item.productFamily)}</span>
                                                </div>
                                            </Td>
                                            <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium text-left truncate">{formatNumber(item.qtyOnHand)}</Td>
                                            <Td className={`px-3 py-2 text-sm font-bold text-left truncate ${item.qtyAvailable < 1 ? 'text-red-600' : 'text-green-600'}`}>{formatNumber(item.qtyAvailable)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-white text-left truncate">{formatCurrency(item.unitCost)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-white text-left truncate">{formatCurrency(item.totalPrice ?? 0)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">{formatNumber(item.totalUnitCVInches ?? 0)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">{formatNumber(item.totalUnitCVSQFT ?? 0)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-medium text-left truncate">{formatNumber(item.avgInventoryAge ?? 0)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-medium text-left truncate">{formatNumber(item.totalPositions ?? 0)}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-medium text-left truncate">{formatNumber(item.countSites ?? 0)}</Td>
                                            <Td className="px-3 py-2 text-sm text-left truncate">
                                                {!isManufacturer && (
                                                    <button
                                                        onClick={() => router.push(`/inventory/${item.productId || item.id}`)}
                                                        className="p-1.5 text-gray-600 hover:text-primary dark:text-gray-600 dark:hover:text-primary transition-all hover:scale-110 active:scale-95"
                                                        title="View details"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        )}
                    </div>
                </div>

                <div className="-mx-4 -mb-4 mt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={sortedInventory.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        itemName="inventory items"
                    />
                </div>
            </div >
        </div >
    );
}