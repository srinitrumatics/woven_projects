"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Pagination from "@/components/ui/Pagination";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { AuthorizeLocation, LocationStatus } from "./types";
import LocationModal from "./components/LocationModal";
import { useUserSession } from "@/components/UserSessionContext";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState } from "@/components/ui/DataTable";

type TabFilter = "Active" | "Inactive" | "Pending" | "All";

const ITEMS_PER_PAGE = 10;

// Mock data generator
const generateMockLocations = (): AuthorizeLocation[] => [
    { id: "L001", name: "Headquarters", accountName: "Gtherp Corp", addressType: "Commercial", locationId: "LOC-001", locationType: "Hub", street: "123 Main St", city: "New York", state: "NY", zipCode: "10001", country: "USA", liftGate: true, insideDelivery: true, deliveryNotes: "Deliver to back dock", status: "Active", contactName: "Alice Smith", address: "123 Main St", code: "LOC-001" },
    { id: "L002", name: "West Coast Hub", accountName: "Logistic LLC", addressType: "Warehouse", locationId: "LOC-002", locationType: "Distribution", street: "456 Market St", city: "San Francisco", state: "CA", zipCode: "94105", country: "USA", liftGate: false, insideDelivery: true, deliveryNotes: "Call upon arrival", status: "Active", contactName: "Bob Jones", address: "456 Market St", code: "LOC-002" },
    { id: "L003", name: "London Branch", accountName: "Euro Traders", addressType: "Office", locationId: "LOC-003", locationType: "Sales Office", street: "10 Downing St", city: "London", state: "LDN", zipCode: "SW1A 2AA", country: "UK", liftGate: false, insideDelivery: false, deliveryNotes: "Ring bell", status: "Pending", contactName: "Charlie Brown", address: "10 Downing St", code: "LOC-003" },
    { id: "L004", name: "Tokyo Office", accountName: "Asia Partners", addressType: "Commercial", locationId: "LOC-004", locationType: "Regional Office", street: "1-1 Chiyoda", city: "Tokyo", state: "TKY", zipCode: "100-8111", country: "Japan", liftGate: true, insideDelivery: false, deliveryNotes: "Need security pass", status: "Inactive", contactName: "Diana Ross", address: "1-1 Chiyoda", code: "LOC-004" },
    { id: "L005", name: "Texas Distribution", accountName: "Southern Dist", addressType: "Warehouse", locationId: "LOC-005", locationType: "Hub", street: "789 Austin Blvd", city: "Austin", state: "TX", zipCode: "73301", country: "USA", liftGate: true, insideDelivery: true, deliveryNotes: "Gate code 1234", status: "Active", contactName: "Evan Peters", address: "789 Austin Blvd", code: "LOC-005" },
];

export default function AuthorizeLocationsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [locations, setLocations] = useState<AuthorizeLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("view");
    const [selectedLocation, setSelectedLocation] = useState<AuthorizeLocation | null>(null);
    const [locationTypes, setLocationTypes] = useState<string[]>([]);
    const [addressTypes, setAddressTypes] = useState<string[]>([]);

    // User session for SF API queries
    const { user, selectedAccount } = useUserSession();
    const accountId = selectedAccount?.Id || selectedAccount?.id || "";
    const contactId = user?.contact?.Id || user?.contact?.id || "";

    // Initialize resizable columns
    const { widths, handleResize } = useResizableColumns({
        name: 180,
        accountName: 160,
        addressType: 140,
        locationId: 140,
        locationType: 140,
        street: 200,
        city: 140,
        state: 100,
        zipCode: 120,
        country: 120,
        liftGate: 120,
        insideDelivery: 140,
        deliveryNotes: 200,
        status: 120,
        actions: 140
    });

    useEffect(() => {
        const fetchPicklists = async () => {
            if (accountId && contactId) {
                try {
                    const res = await fetch(`/api/salesforce/picklists?accountId=${accountId}&contactId=${contactId}`);
                    const data = await res.json();
                    if (data.success && data.data?.[0]) {
                        const picks = data.data[0];
                        if (picks.Location_Type__c) setLocationTypes(picks.Location_Type__c);
                        if (picks.Address_Type__c) setAddressTypes(picks.Address_Type__c);
                    }
                } catch (error) {
                    console.error("Failed to load picklists:", error);
                }
            }
        };
        fetchPicklists();
    }, [accountId, contactId]);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            // Use user session ids
            const response = await fetch(`/api/salesforce/authorizedlocations?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`);

            if (!response.ok) {
                throw new Error("Failed to fetch locations");
            }

            const responseData = await response.json();

            let authLocations: AuthorizeLocation[] = [];
            // Structure: { data: [{ AuthorizedLocation: [ ... ] }] }
            if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                const dataObj = responseData.data[0];
                const items = dataObj.AuthorizedLocation || [];
                authLocations = items.map((item: any) => ({
                    id: item.Id,
                    name: item.Name || "",
                    accountName: item.Account_Name || "",
                    addressType: item.Address_Type__c || "",
                    locationId: item.Location_ID__c || "",
                    locationType: item.Location_Type__c || "", // Will fallback if missing in object payload
                    street: item.Address__c?.street || "",
                    city: item.Address__c?.city || "",
                    state: item.Address__c?.state || "",
                    zipCode: item.Address__c?.postalCode || "",
                    country: item.Address__c?.country || "",
                    liftGate: !!item.Lift_Gate__c,
                    insideDelivery: !!item.Inside_Delivery__c,
                    deliveryNotes: item.Delivery_Notes__c || "",
                    status: item.Active__c ? "Active" : "Inactive",
                    Site_Name: item.Site_Name || item.Site_Name__c || ""
                }));
            }

            setLocations(authLocations);
        } catch (error) {
            console.error("Error loading locations:", error);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId && contactId) {
            fetchLocations();
        }
    }, [accountId, contactId]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = locations.length;
        const activeCount = locations.filter(l => l.status === "Active").length;
        const pendingCount = locations.filter(l => l.status === "Pending").length;
        const inactiveCount = locations.filter(l => l.status === "Inactive").length;

        return { total, activeCount, pendingCount, inactiveCount };
    }, [locations]);

    // Filter 
    const filteredAndSearchedLocations = useMemo(() => {
        let filtered = locations;

        if (activeTab !== 'All') {
            filtered = filtered.filter(l => l.status === activeTab);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(l =>
                String(l.name || '').toLowerCase().includes(query) ||
                String(l.accountName || '').toLowerCase().includes(query) ||
                String(l.locationId || '').toLowerCase().includes(query) ||
                String(l.city || '').toLowerCase().includes(query) ||
                String(l.status || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [activeTab, searchQuery, locations]);

    // Sorting
    const { items: sortedLocations, requestSort, sortConfig } = useSortableData<AuthorizeLocation>(filteredAndSearchedLocations, { key: 'name', direction: 'asc' });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedLocations.length / ITEMS_PER_PAGE));
    const paginatedLocations = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedLocations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedLocations, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, sortedLocations.length]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleCardClick = (filter: TabFilter) => setActiveTab(filter);

    const openModal = (mode: "add" | "edit" | "view", location: AuthorizeLocation | null = null) => {
        setModalMode(mode);
        setSelectedLocation(location);
        setIsModalOpen(true);
    };

    const handleSaveLocation = async (data: Partial<AuthorizeLocation>) => {
        try {
            setLoading(true);

            const payload = {
                authorizedLocations: [{
                    ...(modalMode !== 'add' && selectedLocation?.id ? { Id: selectedLocation.id } : {}),
                    Name: data.name || "",
                    Account_Name__c: accountId,
                    Address_Type__c: data.addressType || "",
                    Location_ID__c: data.locationId || "",
                    Location_Type__c: data.locationType || "",
                    Street: data.street || "",
                    City: data.city || "",
                    State: data.state || "",
                    ZipCode: data.zipCode || "",
                    Country: "US",
                    Lift_Gate__c: !!data.liftGate,
                    Inside_Delivery__c: !!data.insideDelivery,
                    Delivery_Notes__c: data.deliveryNotes || "",
                    Active__c: data.status === "Active"
                }],
                accountId,
                contactId
            };

            const isEdit = modalMode === 'edit';
            const response = await fetch('/api/salesforce/authorizedlocations', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save location");
            }

            setIsModalOpen(false);
            fetchLocations(); // Refresh the list
        } catch (error: any) {
            console.error("Error saving location:", error);
            alert(error.message || "Failed to save location");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Authorized Locations</h1>
                <p className="text-gray-600 dark:text-gray-400 text-base mt-1 truncate" title="Manage and Track Authorized Locations">Manage and Track Authorized Locations</p>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                {/* Header with Search and Filter */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-3 px-2 pb-4">
                        <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>



                        {/* Add Button and View Mode Toggle */}
                        <div className="flex items-center gap-2 ml-auto min-w-0">
                            <button
                                onClick={() => openModal("add")}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 px-3"
                                title="Add New Location"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm font-medium truncate">Add</span>
                            </button>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                title="List View"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "card"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                title="Card View"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="overflow-x-auto">
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <p className="text-sm truncate" title="Loading locations...">Loading locations...</p>
                        </div>
                    </div>
                    ) : viewMode === 'card' ? (
                        <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                            {paginatedLocations.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center min-w-0">
                                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 truncate" title="No locations found">No locations found</p>
                                    </div>
                                </div>
                            ) : (
                                paginatedLocations.map((loc) => (
                                    <div key={loc.id} className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                                        <div className="p-5 flex flex-col flex-grow cursor-pointer" onClick={() => openModal("view", loc)}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="pr-2 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate" title={loc.name}>
                                                        {loc.name}
                                                    </h3>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1 truncate" title={loc.accountName}>
                                                        {loc.accountName}
                                                    </p>
                                                </div>
                                                <StatusBadge status={loc.status} />
                                            </div>

                                            <div className="space-y-3 mt-4 flex-grow">
                                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide truncate">Location ID</span>
                                                        <span className="font-medium text-gray-900 dark:text-white truncate block" title={loc.locationId}>{loc.locationId}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide truncate">Location Type</span>
                                                        <span className="font-medium text-gray-900 dark:text-white truncate block" title={loc.locationType}>{loc.locationType}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide truncate">Address Type</span>
                                                        <span className="font-medium text-gray-900 dark:text-white truncate block" title={loc.addressType}>{loc.addressType}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide truncate">Address</span>
                                                        <span className="font-medium text-gray-900 dark:text-white block truncate" title={`${loc.street}, ${loc.city}`}>{loc.city}, {loc.state}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openModal("view", loc); }}
                                                    className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center"
                                                    title="View Location"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openModal("edit", loc); }}
                                                    className="p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Edit Location"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/admin/authorize-locations/${loc.id}/delivery-windows`); }}
                                                    className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Delivery Windows"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 1V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m10 11V7a2 2 0 00-2-2h-3M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        </div>
                    ) : (
                        <div className="rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                        {paginatedLocations.length === 0 ? (
                            <TableEmptyState message="No locations found" />
                        ) : (
                        <Table className="border-collapse table-fixed" style={{ minWidth: Object.values(widths).reduce((a, b) => a + b, 0) }}>
                            <THead>
                                <tr>
                                    <SortableHeader label="Authorized Location" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Account Name" field="accountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.accountName} onResize={handleResize} />
                                    <SortableHeader label="Address Type" field="addressType" sortConfig={sortConfig} requestSort={requestSort} width={widths.addressType} onResize={handleResize} />
                                    <SortableHeader label="Location ID" field="locationId" sortConfig={sortConfig} requestSort={requestSort} width={widths.locationId} onResize={handleResize} />
                                    <SortableHeader label="Location Type" field="locationType" sortConfig={sortConfig} requestSort={requestSort} width={widths.locationType} onResize={handleResize} />
                                    <SortableHeader label="Street" field="street" sortConfig={sortConfig} requestSort={requestSort} width={widths.street} onResize={handleResize} />
                                    <SortableHeader label="City" field="city" sortConfig={sortConfig} requestSort={requestSort} width={widths.city} onResize={handleResize} />
                                    <SortableHeader label="State" field="state" sortConfig={sortConfig} requestSort={requestSort} width={widths.state} onResize={handleResize} />
                                    <SortableHeader label="Zip Code" field="zipCode" sortConfig={sortConfig} requestSort={requestSort} width={widths.zipCode} onResize={handleResize} />
                                    <SortableHeader label="Country" field="country" sortConfig={sortConfig} requestSort={requestSort} width={widths.country} onResize={handleResize} />
                                    <SortableHeader label="Life Gate" field="liftGate" sortConfig={sortConfig} requestSort={requestSort} width={widths.liftGate} onResize={handleResize} />
                                    <SortableHeader label="Inside Delivery" field="insideDelivery" sortConfig={sortConfig} requestSort={requestSort} width={widths.insideDelivery} onResize={handleResize} />
                                    <SortableHeader label="Delivery Notes" field="deliveryNotes" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveryNotes} onResize={handleResize} />
                                    <SortableHeader label="Active" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                    <Th style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                                        Action
                                    </Th>
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedLocations.map((loc) => (
                                        <Tr key={loc.id}>
                                            <Td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={loc.name} style={{ width: widths.name, minWidth: widths.name, maxWidth: widths.name }}>
                                                {loc.name}
                                            </Td>
                                            <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={loc.accountName} style={{ width: widths.accountName, minWidth: widths.accountName, maxWidth: widths.accountName }}>{loc.accountName}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.addressType, minWidth: widths.addressType, maxWidth: widths.addressType }}>{loc.addressType}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate" style={{ width: widths.locationId, minWidth: widths.locationId, maxWidth: widths.locationId }}>{loc.locationId}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.locationType, minWidth: widths.locationType, maxWidth: widths.locationType }}>{loc.locationType}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={loc.street} style={{ width: widths.street, minWidth: widths.street, maxWidth: widths.street }}>{loc.street}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.city, minWidth: widths.city, maxWidth: widths.city }}>{loc.city}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.state, minWidth: widths.state, maxWidth: widths.state }}>{loc.state}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.zipCode, minWidth: widths.zipCode, maxWidth: widths.zipCode }}>{loc.zipCode}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.country, minWidth: widths.country, maxWidth: widths.country }}>{loc.country}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.liftGate, minWidth: widths.liftGate, maxWidth: widths.liftGate }}>{loc.liftGate ? 'Yes' : 'No'}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.insideDelivery, minWidth: widths.insideDelivery, maxWidth: widths.insideDelivery }}>{loc.insideDelivery ? 'Yes' : 'No'}</Td>
                                            <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={loc.deliveryNotes} style={{ width: widths.deliveryNotes, minWidth: widths.deliveryNotes, maxWidth: widths.deliveryNotes }}>{loc.deliveryNotes}</Td>
                                            <Td className="px-3 py-2 truncate" style={{ width: widths.status, minWidth: widths.status, maxWidth: widths.status }}>
                                                <StatusBadge status={loc.status} />
                                            </Td>
                                            <Td className="px-3 py-2 truncate" style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openModal("view", loc)}
                                                        className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                                        title="View Location"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => openModal("edit", loc)}
                                                        className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                                        title="Edit Location"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => router.push(`/admin/authorize-locations/${loc.id}/delivery-windows`)}
                                                        className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                                        title="Delivery Windows"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 1V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m10 11V7a2 2 0 00-2-2h-3M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </Td>
                                        </Tr>
                                ))}
                            </TBody>
                        </Table>
                        )}
                        </div>
                        </div>
                    )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredAndSearchedLocations.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="locations"
                />
            </div>

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                location={selectedLocation}
                mode={modalMode}
                onSave={handleSaveLocation}
                locationTypes={locationTypes}
                addressTypes={addressTypes}
            />
        </>
    );
}

function StatusBadge({ status }: { status: LocationStatus }) {
    const getStyles = () => {
        switch (status) {
            case "Active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
