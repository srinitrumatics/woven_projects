"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatTime } from "@/lib/utils/formatting";

import Pagination from "@/components/ui/Pagination";
import Tabs from "@/components/ui/Tabs";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { DeliveryWindow, DeliveryWindowStatus } from "./types";

type TabFilter = "Active" | "Inactive" | "All";

const ITEMS_PER_PAGE = 10;

import DeliveryWindowModal from "./components/DeliveryWindowModal";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DeliveryWindowsPage() {
    const router = useRouter();
    const params = useParams();
    const locationId = params.id as string;

    const [activeTab, setActiveTab] = useState<TabFilter>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deliveryWindows, setDeliveryWindows] = useState<DeliveryWindow[]>([]);
    const [locationName, setLocationName] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWindow, setEditingWindow] = useState<any>(null);

    const { user, selectedAccount } = useUserSession();
    const accountId = selectedAccount?.Id || selectedAccount?.id || "";
    const contactId = user?.contact?.Id || user?.contact?.id || "";
    const { confirm: confirmToast, success: successToast, error: errorToast } = useToast();

    const fetchDeliveryWindows = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/salesforce/deliverywindows?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&locationId=${encodeURIComponent(locationId)}`);

            if (!response.ok) {
                throw new Error("Failed to fetch delivery windows");
            }

            const responseData = await response.json();

            let windows: DeliveryWindow[] = [];
            if (responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                const dataObj = responseData.data[0];
                const items = dataObj.Delivery_Window__c || [];

                setTimeout(() => {
                    if (dataObj.Name) {
                        setLocationName(dataObj.Name);
                    } else if (items.length > 0 && items[0].Authorized_Ship_To_Location_Name) {
                        setLocationName(items[0].Authorized_Ship_To_Location_Name);
                    }
                }, 0);

                windows = items.map((item: any) => ({
                    id: item.Id,
                    name: item.Name || "",
                    shipToLocation: item.Authorized_Ship_To_Location_Name || "",
                    dayOfWeek: item.Day_of_Week__c || "",
                    windowStart: item.WindowStart__c || "",
                    windowEnd: item.WindowEnd__c || "",
                    open24Hours: !!item.Open_24_Hours__c,
                    receiveOnFederalHolidays: !!item.Receive_on_Federal_Holidays__c,
                    closedForDeliveries: !!item.Closed_for_Deliveries__c,
                    deliveryNotes: item.Delivery_Notes__c || "",
                    active: !!item.Active__c
                }));
            }

            setDeliveryWindows(windows);
        } catch (error) {
            console.error("Error loading delivery windows:", error);
            setDeliveryWindows([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWindow = async (formData: any) => {
        try {

            // If we are editing, we need to include the ID in the payload item
            const windowData = { ...formData };
            if (editingWindow?.id) {
                windowData.Id = editingWindow.id;
            }

            const payload = {
                deliveryWindows: [windowData],
                accountId,
                contactId
            };

            const response = await fetch('/api/salesforce/deliverywindows', {
                method: editingWindow ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save delivery window");
            }

            await fetchDeliveryWindows();
            setIsModalOpen(false);
            setEditingWindow(null);
        } catch (error) {
            console.error("Error saving delivery window:", error);
            throw error;
        }
    };

    const handleDeleteWindow = async (id: string) => {
        confirmToast("Are you sure you want to delete this delivery window?", async () => {
            try {
                const response = await fetch(`/api/salesforce/deliverywindows?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&deliveryWindowId=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to delete delivery window");
                }

                successToast("Delivery window deleted successfully");
                await fetchDeliveryWindows();
            } catch (error) {
                console.error("Error deleting delivery window:", error);
                errorToast("Failed to delete delivery window. Please try again.");
            }
        });
    };
    // Initialize resizable columns
    const [dayOfWeekPicklist, setDayOfWeekPicklist] = useState<string[]>([]);
    const { widths, handleResize } = useResizableColumns({
        name: 180,
        shipToLocation: 180,
        dayOfWeek: 140,
        windowStart: 140,
        windowEnd: 140,
        open24Hours: 140,
        receiveOnFederalHolidays: 250,
        closedForDeliveries: 180,
        deliveryNotes: 200,
        active: 100,
        actions: 100
    });

    useEffect(() => {
        const fetchPicklists = async () => {
            if (accountId && contactId) {
                try {
                    const res = await fetch(`/api/salesforce/picklists?accountId=${accountId}&contactId=${contactId}`);
                    const data = await res.json();
                    if (data.success && data.data?.[0]) {
                        const picks = data.data[0];
                        if (picks.Day_of_Week__c) setDayOfWeekPicklist(picks.Day_of_Week__c);
                    }
                } catch (error) {
                    console.error("Failed to load picklists:", error);
                }
            }
        };
        fetchPicklists();
    }, [accountId, contactId]);

    useEffect(() => {
        if (locationId) {
            fetchDeliveryWindows();
        }
    }, [locationId]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = deliveryWindows.length;
        const activeCount = deliveryWindows.filter(dw => dw.active).length;
        const inactiveCount = total - activeCount;

        return { total, activeCount, inactiveCount };
    }, [deliveryWindows]);

    // Filter 
    const filteredAndSearchedWindows = useMemo(() => {
        let filtered = deliveryWindows;

        if (activeTab === 'Active') {
            filtered = filtered.filter(dw => dw.active);
        } else if (activeTab === 'Inactive') {
            filtered = filtered.filter(dw => !dw.active);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(dw =>
                String(dw.name || '').toLowerCase().includes(query) ||
                String(dw.shipToLocation || '').toLowerCase().includes(query) ||
                String(dw.dayOfWeek || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [activeTab, searchQuery, deliveryWindows]);

    // Sorting
    const { items: sortedWindows, requestSort, sortConfig } = useSortableData<DeliveryWindow>(filteredAndSearchedWindows, { key: 'name', direction: 'asc' });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedWindows.length / ITEMS_PER_PAGE));
    const paginatedWindows = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedWindows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedWindows, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, sortedWindows.length]);

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between min-w-0">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 min-w-0">
                            <Link href="/admin/authorize-locations" className="hover:text-primary transition-colors truncate">Authorized Locations</Link>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">{locationName || ''}</span>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">Delivery Windows</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Delivery Windows</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-base mt-1 truncate" title="Manage and track delivery windows for this location">Manage and track delivery windows for this location</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-0">
                        <button
                            onClick={() => router.push(`/admin/authorize-locations`)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded shadow-sm hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Authorized Locations
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6">
                {/* Header with Search and Filter */}
                <div className="border-b border-gray-200 dark:border-gray-700 py-6">
                    <div className="flex flex-wrap items-center gap-3 px-2">
                        <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search delivery windows..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Status Pills */}
                        <div className="mr-auto min-w-0">
                            <Tabs
                                tabs={(['All', 'Active', 'Inactive'] as TabFilter[]).map((tab) => ({ key: tab, label: tab }))}
                                activeKey={activeTab}
                                onChange={(key) => setActiveTab(key as TabFilter)}
                            />
                        </div>

                        {/* Add Button */}
                        <div className="flex items-center gap-2 min-w-0">
                            <button
                                onClick={() => {
                                    setEditingWindow(null);
                                    setIsModalOpen(true);
                                }}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 px-3"
                                title="Add New Delivery Window"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm font-medium truncate">Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <TableLoadingState message="Loading delivery windows..." />
                    ) : paginatedWindows.length === 0 ? (
                        <TableEmptyState
                            message="No delivery windows found"
                            description="There are no delivery window records for this location"
                        />
                    ) : (
                        <Table className="border-collapse table-fixed" style={{ minWidth: Object.values(widths).reduce((a, b) => a + b, 0) }}>
                            <THead>
                                <tr>
                                    <SortableHeader label="Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                    <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={handleResize} />
                                    <SortableHeader label="Day of Week" field="dayOfWeek" sortConfig={sortConfig} requestSort={requestSort} width={widths.dayOfWeek} onResize={handleResize} />
                                    <SortableHeader label="Window Start" field="windowStart" sortConfig={sortConfig} requestSort={requestSort} width={widths.windowStart} onResize={handleResize} />
                                    <SortableHeader label="Window End" field="windowEnd" sortConfig={sortConfig} requestSort={requestSort} width={widths.windowEnd} onResize={handleResize} />
                                    <SortableHeader label="Open 24 Hours" field="open24Hours" sortConfig={sortConfig} requestSort={requestSort} width={widths.open24Hours} onResize={handleResize} />
                                    <SortableHeader label="Receive on Federal Holidays" field="receiveOnFederalHolidays" sortConfig={sortConfig} requestSort={requestSort} width={widths.receiveOnFederalHolidays} onResize={handleResize} />
                                    <SortableHeader label="Closed for Deliveries" field="closedForDeliveries" sortConfig={sortConfig} requestSort={requestSort} width={widths.closedForDeliveries} onResize={handleResize} />
                                    <SortableHeader label="Delivery Notes" field="deliveryNotes" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveryNotes} onResize={handleResize} />
                                    <SortableHeader label="Active" field="active" sortConfig={sortConfig} requestSort={requestSort} width={widths.active} onResize={handleResize} />
                                    <Th style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                                        Action
                                    </Th>
                                </tr>
                            </THead>
                            <TBody>
                                {paginatedWindows.map((dw) => (
                                    <Tr key={dw.id}>
                                        <Td className="text-primary font-semibold sticky left-0 bg-white dark:bg-gray-800 text-left truncate" title={dw.name} style={{ width: widths.name, minWidth: widths.name, maxWidth: widths.name }}>
                                            {dw.name}
                                        </Td>
                                        <Td className="truncate" title={dw.shipToLocation} style={{ width: widths.shipToLocation, minWidth: widths.shipToLocation, maxWidth: widths.shipToLocation }}>{dw.shipToLocation}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.dayOfWeek, minWidth: widths.dayOfWeek, maxWidth: widths.dayOfWeek }}>{dw.dayOfWeek}</Td>
                                        <Td className="font-medium truncate" style={{ width: widths.windowStart, minWidth: widths.windowStart, maxWidth: widths.windowStart }}>{formatTime(dw.windowStart)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.windowEnd, minWidth: widths.windowEnd, maxWidth: widths.windowEnd }}>{formatTime(dw.windowEnd)}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.open24Hours, minWidth: widths.open24Hours, maxWidth: widths.open24Hours }}>{dw.open24Hours ? 'Yes' : 'No'}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.receiveOnFederalHolidays, minWidth: widths.receiveOnFederalHolidays, maxWidth: widths.receiveOnFederalHolidays }}>{dw.receiveOnFederalHolidays ? 'Yes' : 'No'}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.closedForDeliveries, minWidth: widths.closedForDeliveries, maxWidth: widths.closedForDeliveries }}>{dw.closedForDeliveries ? 'Yes' : 'No'}</Td>
                                        <Td className="text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={dw.deliveryNotes} style={{ width: widths.deliveryNotes, minWidth: widths.deliveryNotes, maxWidth: widths.deliveryNotes }}>{dw.deliveryNotes}</Td>
                                        <Td className="truncate" style={{ width: widths.active, minWidth: widths.active, maxWidth: widths.active }}>
                                            <StatusBadge status={dw.active ? "Active" : "Inactive"} variant="pill" />
                                        </Td>
                                        <Td className="truncate" style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingWindow(dw);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWindow(dw.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredAndSearchedWindows.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="delivery windows"
                />
            </div>

            <DeliveryWindowModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveWindow}
                locationId={locationId}
                initialData={editingWindow}
                existingWindows={deliveryWindows}
                dayOfWeekPicklist={dayOfWeekPicklist}
                title={editingWindow ? "Edit Delivery Window" : "Add Delivery Window"}
            />
        </div>
    );
}

function StatCard({ label, value, color, active, onClick }: { label: string, value: number, color: string, active: boolean, onClick: () => void }) {
    const colors: Record<string, string> = {
        blue: "text-blue-600",
        green: "text-green-600",
        gray: "text-gray-600",
    };

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${active ? 'border-primary ring-1 ring-primary' : 'border-gray-100 dark:border-gray-700'} hover:border-primary transition-all`}
        >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400  truncate">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
        </div>
    );
}

