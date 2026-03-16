"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Pagination from "@/components/ui/Pagination";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { AuthorizeLocation, LocationStatus } from "./types";

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
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [locations, setLocations] = useState<AuthorizeLocation[]>([]);
    const [loading, setLoading] = useState(true);

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
        const fetchLocations = async () => {
            try {
                // Use default ids from env, same pattern as other pages
                const accountId = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
                const contactId = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";
                const response = await fetch(`/api/salesforce/authorizedlocations?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch locations");
                }

                const responseData = await response.json();

                let authLocations: AuthorizeLocation[] = [];
                // Structure: { data: [{ AuthorizedLocation: [ ... ] }] }
                if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    const items = responseData.data[0].AuthorizedLocation || [];
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
                        status: item.Active__c ? "Active" : "Inactive"
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

        fetchLocations();
    }, []);

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
    const handleViewLocation = (id: string) => alert(`Viewing Location: ${id}`);

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Authorize Locations</h1>
                <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1">Manage and Track Authorized Locations</p>
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

                        <div className="flex flex-wrap items-center gap-2">
                            {['All', 'Active', 'Pending', 'Inactive'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status as TabFilter)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === status
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 ml-auto">
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

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <p className="text-sm">Loading locations...</p>
                        </div>
                    ) : viewMode === 'card' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                            {paginatedLocations.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No locations found</p>
                                    </div>
                                </div>
                            ) : (
                                paginatedLocations.map((loc) => (
                                    <div key={loc.id} className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer" onClick={() => handleViewLocation(loc.id)}>
                                        <div className="p-5 flex flex-col flex-grow">
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
                                                    <div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide">Location ID</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{loc.locationId}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide">Location Type</span>
                                                        <span className="font-medium text-gray-900 dark:text-white truncate block" title={loc.locationType}>{loc.locationType}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide">Address Type</span>
                                                        <span className="font-medium text-gray-900 dark:text-white truncate block" title={loc.addressType}>{loc.addressType}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5 uppercase tracking-wide">Address</span>
                                                        <span className="font-medium text-gray-900 dark:text-white block truncate" title={`${loc.street}, ${loc.city}`}>{loc.city}, {loc.state}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewLocation(loc.id); }}
                                                    className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <span>View Details</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-primary-light dark:bg-gray-900">
                                <tr>
                                    <SortableHeader label="Authorized Location" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Account Name" field="accountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.accountName} onResize={handleResize} />
                                    <SortableHeader label="Address Type" field="addressType" sortConfig={sortConfig} requestSort={requestSort} width={widths.addressType} onResize={handleResize} />
                                    <SortableHeader label="Location ID" field="locationId" sortConfig={sortConfig} requestSort={requestSort} width={widths.locationId} onResize={handleResize} />
                                    <SortableHeader label="Location Type" field="locationType" sortConfig={sortConfig} requestSort={requestSort} width={widths.locationType} onResize={handleResize} />
                                    <SortableHeader label="Street" field="street" sortConfig={sortConfig} requestSort={requestSort} width={widths.street} onResize={handleResize} />
                                    <SortableHeader label="City" field="city" sortConfig={sortConfig} requestSort={requestSort} width={widths.city} onResize={handleResize} />
                                    <SortableHeader label="State" field="state" sortConfig={sortConfig} requestSort={requestSort} width={widths.state} onResize={handleResize} />
                                    <SortableHeader label="ZIP Code" field="zipCode" sortConfig={sortConfig} requestSort={requestSort} width={widths.zipCode} onResize={handleResize} />
                                    <SortableHeader label="Country" field="country" sortConfig={sortConfig} requestSort={requestSort} width={widths.country} onResize={handleResize} />
                                    <SortableHeader label="Life Gate" field="liftGate" sortConfig={sortConfig} requestSort={requestSort} width={widths.liftGate} onResize={handleResize} />
                                    <SortableHeader label="Inside Delivery" field="insideDelivery" sortConfig={sortConfig} requestSort={requestSort} width={widths.insideDelivery} onResize={handleResize} />
                                    <SortableHeader label="Delivery Notes" field="deliveryNotes" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveryNotes} onResize={handleResize} />
                                    <SortableHeader label="Active" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white" style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedLocations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No locations found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLocations.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={loc.name}>
                                                {loc.name}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={loc.accountName}>{loc.accountName}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{loc.addressType}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">{loc.locationId}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{loc.locationType}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={loc.street}>{loc.street}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{loc.city}</td>
                                            <td className="px-3 py-2 text-sm text-red-500 font-medium">{loc.state}</td>
                                            <td className="px-3 py-2 text-sm text-red-500 font-medium">{loc.zipCode}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{loc.country}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{loc.liftGate ? 'Edit' : 'No'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{loc.insideDelivery ? 'Edit' : 'No'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={loc.deliveryNotes}>{loc.deliveryNotes}</td>
                                            <td className="px-3 py-2">
                                                <StatusBadge status={loc.status} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleViewLocation(loc.id)} className="px-3 py-1.5 bg-primary-light/30 text-primary hover:bg-primary hover:text-white text-xs font-semibold rounded transition-colors whitespace-nowrap border border-primary/20" title="View Delivery Window Modal">
                                                        Add / View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredAndSearchedLocations.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="locations"
                />
            </div>
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
