"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { InventoryPosition, InventoryStatus } from "./types";
import Link from "next/link";
import { useUserSession } from "@/components/UserSessionContext";

type TabFilter = "All" | "On Hold" | "Put-Away" | "Average Aged";

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [inventoryData, setInventoryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Top-level session hook
    const { user, selectedAccount } = useUserSession();
    const accountId = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
    const contactId = user?.Id || "";

    const fetchInventory = async () => {
        if (!accountId) return; // Wait for accountId
        try {
            setLoading(true);

            const response = await fetch(`/api/salesforce/inventory?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&isInventory=true`);

            if (response.ok) {
                const responseData = await response.json();
                console.log("Inventory API Raw Response:", responseData);

                if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    console.log("Inventory API Processed Data (responseData.data):", responseData.data);
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

    // Map raw data from API to InventoryPosition objects
    const mappedInventory = useMemo((): InventoryPosition[] => {
        if (!inventoryData) return [];

        let rawRecords = [];
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
            productFamily: item.Product_Name_Family || "",
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
            status: (item.Qty_Available__c > 0 ? "Available" : "Reserved") as InventoryStatus,
            receivedDate: "",
            daysInInventory: item.Avg_Inventory_Age__c || item.gtherp__Days_in_Inventory__c || 0,
            supplierName: "",
            purchaseOrder: "",
            inventoryLocation: item.Inventory_Location__c || item.Inventory_Location || "",
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

    const { items: sortedInventory, requestSort, sortConfig } = useSortableData<InventoryPosition>(filteredInventory);

    // Pagination
    const totalPages = Math.ceil(sortedInventory.length / ITEMS_PER_PAGE);
    const paginatedInventory = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedInventory.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedInventory, currentPage]);

    // Resizable columns
    const { widths, handleResize } = useResizableColumns({
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

    // Summary stats
    const stats = useMemo(() => {
        if (!inventoryData) return { total: 0, totalValue: 0, uniqueProducts: 0, agedUniqueProducts: 0, agedTotalValue: 0, putAwayCount: 0, putAwayUniqueProducts: 0, putAwayTotalValue: 0, onHoldCount: 0, onHoldUniqueProducts: 0, onHoldTotalValue: 0 };

        // Card 1: Total Inventory Value - from API "Total Inventory Value" array
        const totalInvItems = inventoryData["Total Inventory Value"] || [];
        const filteredTotalInvItems = totalInvItems.filter((item: any) => item.gtherp__Enable_Inventory_Calculation__c === true || item.gtherp__Enable_Inventory_Calculation__c === 'true');
        const itemsToUse = filteredTotalInvItems.length > 0 ? filteredTotalInvItems : totalInvItems; // fallback if true not present
        const totalValue = itemsToUse.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);
        const uniqueProducts = new Set(itemsToUse.map((item: any) => item.Product_Name || item.Name)).size;

        // Card 2: Average Aged
        const agedItemsRaw = inventoryData["Average Aged"] || inventoryData["Total Inventory Value"] || [];
        const filteredAgedItems = agedItemsRaw.filter((item: any) =>
            (item.gtherp__Enable_Inventory_Calculation__c === true || item.gtherp__Enable_Inventory_Calculation__c === 'true') &&
            (item.gtherp__Days_in_Inventory__c !== null && item.gtherp__Days_in_Inventory__c !== undefined)
        );
        const agedItemsToUse = filteredAgedItems.length > 0 ? filteredAgedItems : agedItemsRaw;
        const agedUniqueProducts = new Set(agedItemsToUse.map((item: any) => item.Product_Name || item.Name)).size;
        const agedTotalValue = agedItemsToUse.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);

        // Card 3: Put-Away - from API "Put-Away" array
        const putAwayItems = inventoryData["Put-Away"] || [];
        const putAwayCount = putAwayItems.length;
        const putAwayUniqueProducts = new Set(putAwayItems.map((item: any) => item.Product_Name || item.Name)).size;
        const putAwayTotalValue = putAwayItems.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);

        // Card 4: Products On Hold - from API "Products On Hold" array
        const onHoldItems = inventoryData["Products On Hold"] || [];
        const onHoldCount = onHoldItems.length;
        const onHoldUniqueProducts = new Set(onHoldItems.map((item: any) => item.Product_Name || item.Name)).size;
        const onHoldTotalValue = onHoldItems.reduce((sum: number, item: any) => sum + (item.Total_Price__c || 0), 0);

        return {
            total: totalInvItems.length,
            totalValue,
            uniqueProducts,
            agedUniqueProducts,
            agedTotalValue,
            putAwayCount,
            putAwayUniqueProducts,
            putAwayTotalValue,
            onHoldCount,
            onHoldUniqueProducts,
            onHoldTotalValue
        };
    }, [inventoryData]);

    const handleCardClick = (filter: TabFilter) => {
        setActiveTab(filter);
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col gap-6 p-1 min-w-0">
            <div className="flex flex-col min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">Inventory</h1>
                <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Manage and track your product inventory across all locations.">Manage and track your product inventory across all locations.</p>
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
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Total Inventory Value">Total Inventory Value</p>
                                </Link>
                                <div className="flex items-baseline gap-2 group/count">
                                    <Link
                                        href="#"
                                        onClick={() => handleCardClick("All")}
                                        className="hover:underline block">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white group-hover/count:underline transition-all decoration-2 underline-offset-4 truncate">{stats.uniqueProducts}</span>
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={() => handleCardClick("All")}
                                        className="hover:underline block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Products</span>
                                    </Link>
                                </div>
                                <p className="text-lg font-semibold text-primary mt-1 truncate">{formatCurrency(stats.totalValue)}</p>
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
                                <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-blue-500 truncate">
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
                                <Link
                                    href="#"
                                    onClick={() => handleCardClick("Average Aged")}
                                    className="hover:underline block">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Average Aged">Average Aged</p>
                                </Link>
                                <div className="flex items-baseline gap-2 group/count">
                                    <Link
                                        href="#"
                                        onClick={() => handleCardClick("Average Aged")}
                                        className="hover:underline block">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white group-hover/count:underline transition-all decoration-2 underline-offset-4 truncate">{stats.agedUniqueProducts}</span>
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={() => handleCardClick("Average Aged")}
                                        className="hover:underline block">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Products</span>
                                    </Link>
                                </div>
                                <p className="text-lg font-semibold text-slate-500 mt-1 truncate">{formatCurrency(stats.agedTotalValue)}</p>
                            </div>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Average Aged" ? "bg-slate-500 text-white" : "bg-slate-50 dark:bg-slate-900/20 text-slate-500 group-hover:bg-slate-500 group-hover:text-white"
                                } transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2h2m-4-2H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-slate-500 truncate">
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
                                <p className="text-sm font-medium text-gray-400 dark:text-gray-400 mb-1 truncate" title="Put-Away">Put-Away</p>
                                <div className="flex items-baseline gap-2 group/count">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white group-hover/count:underline transition-all decoration-2 underline-offset-4 truncate">{stats.putAwayCount}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Items</span>
                                </div>
                                <p className="text-xl font-bold text-amber-500 mt-2 truncate">{formatCurrency(stats.putAwayTotalValue)}</p>
                            </div>
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center min-w-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-amber-500 truncate">
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
                                <p className="text-sm font-medium text-gray-400 dark:text-gray-400 mb-1 truncate" title="Products On Hold">Products On Hold</p>
                                <div className="flex items-baseline gap-2 group/count">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white group-hover/count:underline transition-all decoration-2 underline-offset-4 truncate">{stats.onHoldCount}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Items</span>
                                </div>
                                <p className="text-xl font-bold text-red-500 mt-2 truncate">{formatCurrency(stats.onHoldTotalValue)}</p>
                            </div>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "On Hold" ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                                } transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center text-xs font-medium text-gray-400 group-hover:text-red-500 truncate">
                                View items on hold
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            {/* Filters & Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                    <div className="flex flex-wrap items-center gap-3 px-2 pb-4">
                        <div className="relative min-w-[280px] max-w-xs flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {(["All", "Average Aged", "On Hold", "Put-Away"] as TabFilter[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleCardClick(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>


                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg min-w-0">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                            <p className="text-sm font-medium text-gray-500 truncate" title="Loading inventory data...">Loading inventory data...</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-primary-light dark:bg-gray-900">
                                <tr>
                                    <SortableHeader label="Product Name" field="productName" sortConfig={sortConfig} requestSort={requestSort} width={widths.productName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Description" field="productDescription" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={handleResize} />
                                    <SortableHeader label="Manufacturer DBA" field="manufacturerDBA" sortConfig={sortConfig} requestSort={requestSort} width={widths.manufacturer} onResize={handleResize} />
                                    <SortableHeader label="Product Family" field="productFamily" sortConfig={sortConfig} requestSort={requestSort} width={widths.family} onResize={handleResize} />
                                    <SortableHeader label="Qty On Hand" field="qtyOnHand" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyOnHand} onResize={handleResize} />
                                    <SortableHeader label="Qty Available" field="qtyAvailable" sortConfig={sortConfig} requestSort={requestSort} width={widths.qtyAvailable} onResize={handleResize} />
                                    <SortableHeader label="Avg Unit Price" field="unitCost" sortConfig={sortConfig} requestSort={requestSort} width={widths.unitPrice} onResize={handleResize} />
                                    <SortableHeader label="Total OH Value" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalValue} onResize={handleResize} />
                                    <SortableHeader label="Total CV (IN)" field="totalUnitCVInches" sortConfig={sortConfig} requestSort={requestSort} width={widths.cvIn} onResize={handleResize} />
                                    <SortableHeader label="Total CV (SQFT)" field="totalUnitCVSQFT" sortConfig={sortConfig} requestSort={requestSort} width={widths.cvSqft} onResize={handleResize} />
                                    <SortableHeader label="Avg Inventory Age" field="avgInventoryAge" sortConfig={sortConfig} requestSort={requestSort} width={widths.age} onResize={handleResize} />
                                    <SortableHeader label="Total Positions" field="totalPositions" sortConfig={sortConfig} requestSort={requestSort} width={widths.positions} onResize={handleResize} />
                                    <SortableHeader label="Count Sites" field="countSites" sortConfig={sortConfig} requestSort={requestSort} width={widths.sites} onResize={handleResize} />
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white truncate" style={{ width: widths.actions }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {paginatedInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} className="px-6 py-16 text-center text-gray-500 rounded-b-lg truncate">
                                            <div className="flex flex-col items-center justify-center min-w-0">
                                                <svg className="w-20 h-20 text-gray-200 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate" title="No inventory items found">No inventory items found</p>
                                                <p className="text-gray-500 truncate" title="Try adjusting your filters or search query to find what you&apos;re looking for.">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedInventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-primary-light/20 dark:hover:bg-primary/5 transition-colors group">
                                            <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate" style={{ width: widths.productName, maxWidth: widths.productName }}>
                                                <button onClick={() => router.push(`/inventory/${item.productId || item.id}`)} title={item.productName} className="hover:underline text-left truncate block w-full outline-none focus:text-primary-dark">
                                                    {item.productName}
                                                </button>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.description, maxWidth: widths.description }}>
                                                <div className="truncate" title={item.productDescription}>{item.productDescription}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.manufacturer, maxWidth: widths.manufacturer }}>
                                                <div className="truncate" title={item.manufacturerDBA}>{item.manufacturerDBA}</div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                                                <div className="truncate">
                                                    <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-primary/10 text-primary truncate">{item.productFamily}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium text-left truncate">{formatNumber(item.qtyOnHand)}</td>
                                            <td className="px-3 py-2 text-sm text-primary font-bold text-left truncate">{formatNumber(item.qtyAvailable)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-white text-left truncate">{formatCurrency(item.unitCost)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-semibold text-left truncate">{formatCurrency(item.totalPrice ?? 0)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">{formatNumber(item.totalUnitCVInches ?? 0)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">{formatNumber(item.totalUnitCVSQFT ?? 0)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-medium text-left truncate">{formatNumber(item.avgInventoryAge ?? 0)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-medium text-left truncate">{formatNumber(item.totalPositions ?? 0)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-medium text-left truncate">{formatNumber(item.countSites ?? 0)}</td>
                                            <td className="px-3 py-2 text-sm text-left truncate">
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
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={sortedInventory.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        itemName="inventory items"
                    />
                </div>
            </div>
        </div>
    );
}