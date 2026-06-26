"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { ShippingManifest, ShipmentStatus } from "./types";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useSortableData } from "@/hooks/useSortableData";
import { useUserSession } from "@/components/UserSessionContext";

const ITEMS_PER_PAGE = 10;

export default function ShipmentsPage() {
  const router = useRouter();
  const [sfShipments, setSfShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ShipmentStatus | "All" | "Total">("Total");
  const [currentPage, setCurrentPage] = useState(1);

  const { user, selectedAccount } = useUserSession();
  const accountId = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
  const contactId = user?.Id || "";

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/salesforce/shipments?accountId=${accountId}&contactId=${contactId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch shipments");
        }
        const result = await res.json();

        // Handle nesting: result.data[0].Shipping_Manifest__c
        let rawData = [];
        if (result.data && result.data[0] && result.data[0].Shipping_Manifest__c) {
          rawData = result.data[0].Shipping_Manifest__c;
        } else if (Array.isArray(result.data)) {
          rawData = result.data;
        }

        setSfShipments(rawData);
      } catch (err: any) {
        console.error("Error fetching shipments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (accountId && contactId) {
      fetchShipments();
    }
  }, [accountId, contactId]);

  // Map SF records to UI shape
  const uiShipments = useMemo(() => {
    return sfShipments.map((s: any) => ({
      Id: s.Id,
      name: s.Name || "N/A",
      status: (s.Status__c || "Draft") as ShipmentStatus,
      salesOrder: s.Sales_Order_Name || "",
      salesOrderId: s.Sales_Order__c || "",
      customerQuote: s.Customer_Quote_Name || "",
      customerQuoteId: s.Customer_Quote__c || "",
      proposal: s.Proposal_Name || "",
      proposalId: s.Proposal__c || "",
      customerOrder: s.Customer_Order_Name || "",
      customerOrderId: s.Customer_Order__c || "",
      customerPO: s.Customer_PO__c || "",
      shipToAccount: s.Ship_to_Account_Name || "",
      shipToLocation: s.Authorized_Ship_To_Location_Name || "",
      totalLines: s.Total_Lines__c || 0,
      totalPrice: s.Total_Price__c || 0,
      logisticsPartner: s.Logistics_Partner_Name || "",
      shipDate: s.Ship_Date__c || "",
      trackingNumber: s.Tracking_Number__c || "",
      trackingStatus: s.Tracking_Status__c || "",
      deliveredDate: s.Delivered_Date__c || ""
    }));
  }, [sfShipments]);

  // Unique statuses for filter buttons
  const uniqueStatuses = useMemo(() => {
    const seen = new Set<string>();
    uiShipments.forEach(s => { if (s.status) seen.add(s.status); });
    return Array.from(seen).sort();
  }, [uiShipments]);

  // Stats derived from data
  const stats = useMemo(() => {
    const allManifests = uiShipments.filter(s => ["Approved", "Partial Shipment", "Shipped"].includes(s.status));
    const allCount = allManifests.length;
    const allValue = allManifests.reduce((sum, s) => sum + s.totalPrice, 0);

    const pendingShip = uiShipments.filter(s => s.status === "Approved");
    const pendingShipCount = pendingShip.length;
    const pendingShipValue = pendingShip.reduce((sum, s) => sum + s.totalPrice, 0);

    const shipped = uiShipments.filter(s => s.status === "Shipped");
    const shippedCount = shipped.length;
    const shippedValue = shipped.reduce((sum, s) => sum + s.totalPrice, 0);

    const partialShipment = uiShipments.filter(s => s.status === "Partial Shipment");
    const partialCount = partialShipment.length;
    const partialValue = partialShipment.reduce((sum, s) => sum + s.totalPrice, 0);

    const delivered = uiShipments.filter(s => s.status === "Delivered");
    const deliveredCount = delivered.length;
    const deliveredValue = delivered.reduce((sum, s) => sum + s.totalPrice, 0);

    const pending = uiShipments.filter(s => ["Draft", "Packed", "Pending"].includes(s.status));
    const pendingCount = pending.length;
    const pendingValue = pending.reduce((sum, s) => sum + s.totalPrice, 0);

    return {
      allCount, allValue,
      pendingShipCount, pendingShipValue,
      partialCount, partialValue,
      shippedCount, shippedValue,
      deliveredCount, deliveredValue,
      pendingCount, pendingValue
    };
  }, [uiShipments]);

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    name: 180,
    status: 120,
    salesOrder: 150,
    customerQuote: 150,
    proposal: 180,
    customerOrder: 150,
    customerPO: 150,
    shipToAccount: 180,
    shipToLocation: 180,
    totalLines: 140,
    totalPrice: 130,
    logisticsPartner: 160,
    shipDate: 180,
    trackingNumber: 170,
    trackingStatus: 170,
    deliveredDate: 180,
    actions: 80
  });

  // Filter + Search
  const filteredShipments = useMemo(() => {
    let filtered = uiShipments;

    if (activeTab === "Total") {
      filtered = filtered.filter(s => ["Approved", "Partial Shipment", "Shipped"].includes(s.status));
    } else if (activeTab !== "All") {
      filtered = filtered.filter(s => s.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.salesOrder.toLowerCase().includes(q) ||
        s.customerQuote.toLowerCase().includes(q) ||
        s.proposal.toLowerCase().includes(q) ||
        s.trackingNumber.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [uiShipments, activeTab, searchQuery]);

  // Sorting
  const { items: sortedShipments, requestSort, sortConfig } = useSortableData(filteredShipments, { key: 'name', direction: 'desc' });

  const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedShipments.length / ITEMS_PER_PAGE));
  const paginatedShipments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedShipments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedShipments, currentPage]);

  const handleCardClick = (tab: ShipmentStatus | "All" | "Total") => {
    setActiveTab(tab);
  };

  return (
    <Sidebar>
      <div className="mb-6 min-w-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Shipments</h1>
        <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Track and manage your shipping manifests">Track and manage your shipping manifests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Shipments */}
        <button
          onClick={() => handleCardClick("Total")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Total"
            ? "border-primary ring-2 ring-primary/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Total")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1  truncate" title="All Shipping Manifest">All Shipping Manifest</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Total")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.allCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Shipments</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-primary mt-1 truncate">{formatCurrency(stats.allValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Total" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"} transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline truncate">
                View all manifests
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Pending Ship */}
        <button
          onClick={() => handleCardClick("Approved")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Approved"
            ? "border-gray-500 ring-2 ring-gray-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Pending Ship">Pending Ship</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Approved")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.pendingShipCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Shipments</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mt-1 truncate">{formatCurrency(stats.pendingShipValue)}</p>
              </div>

              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Approved" ? "bg-gray-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-600 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:underline truncate">
                View pending ship
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Partial Shipment */}
        <button
          onClick={() => handleCardClick("Partial Shipment")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Pending"
            ? "border-yellow-500 ring-2 ring-yellow-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-yellow-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Partial Shipment")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Partial Shipment">Partial Shipment</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Partial Shipment")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.partialCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Shipments</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mt-1 truncate">{formatCurrency(stats.partialValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Partial Shipment" ? "bg-yellow-500 text-white" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white"} transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400 group-hover:underline truncate">
                View partial shipment
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Shipped */}
        <button
          onClick={() => handleCardClick("Shipped")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Shipped"
            ? "border-green-500 ring-2 ring-green-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-green-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Shipped")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Shipped">Shipped</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Shipped")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.shippedCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Shipments</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1 truncate">{formatCurrency(stats.shippedValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Shipped" ? "bg-green-500 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white"} transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline truncate">
                View shipped
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div >

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )
      }

      {/* Main Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header with Search and Filter Buttons */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-shrink-0">
              <input
                type="text"
                placeholder="Search manifests, orders, quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Tabs/Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('All')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'All'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                All
              </button>
              {uniqueStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status as ShipmentStatus)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === status
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="p-4">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 min-w-0">
                <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p className="text-sm font-medium truncate" title="Loading shipments...">Loading shipments...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                  <tr>
                    <SortableHeader label="Shipping Manifest" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                    <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                    <SortableHeader label="Sales Order" field="salesOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.salesOrder} onResize={handleResize} />
                    <SortableHeader label="Customer Quote" field="customerQuote" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerQuote} onResize={handleResize} />
                    <SortableHeader label="Proposal Name" field="proposal" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposal} onResize={handleResize} />
                    <SortableHeader label="Customer Order" field="customerOrder" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerOrder} onResize={handleResize} />
                    <SortableHeader label="Customer PO" field="customerPO" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                    <SortableHeader label="Ship to Account" field="shipToAccount" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToAccount} onResize={handleResize} />
                    <SortableHeader label="Ship to Location" field="shipToLocation" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipToLocation} onResize={handleResize} />
                    <SortableHeader label="Total Lines" field="totalLines" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalLines} onResize={handleResize} />
                    <SortableHeader label="Total Price" field="totalPrice" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalPrice} onResize={handleResize} />
                    <SortableHeader label="Logistics Partner" field="logisticsPartner" sortConfig={sortConfig} requestSort={requestSort} width={widths.logisticsPartner} onResize={handleResize} />
                    <SortableHeader label="Planned Ship Date" field="shipDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipDate} onResize={handleResize} />
                    <SortableHeader label="Tracking Number" field="trackingNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingNumber} onResize={handleResize} />
                    <SortableHeader label="Tracking Status" field="trackingStatus" sortConfig={sortConfig} requestSort={requestSort} width={widths.trackingStatus} onResize={handleResize} />
                    <SortableHeader label="Ship Confirmation" field="deliveredDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.deliveredDate} onResize={handleResize} />
                    <th
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 truncate"
                      style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedShipments.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="px-6 py-16 text-center truncate">
                        <div className="flex flex-col items-center justify-center min-w-0">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 truncate" title="No shipments found">No shipments found</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm truncate">
                            {searchQuery || activeTab !== "All" ? "Try adjusting your filters" : "No shipping manifests available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedShipments.map((shipment) => (
                      <tr
                        key={shipment.Id}
                        onClick={() => router.push(`/shipments/${shipment.Id}`)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-2 text-sm font-semibold text-primary sticky left-0 bg-white dark:bg-gray-800 z-10 truncate">
                          {shipment.name}
                        </td>
                        <td className="px-3 py-2 truncate">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-300 truncate">
                          {shipment.salesOrder || " "}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                          {shipment.customerQuoteId ? (
                            !isManufacturer ? (
                              <Link
                                href={`/quotes/${shipment.customerQuoteId}`}
                                target="_blank"
                                className="text-primary hover:underline font-medium"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {shipment.customerQuote || "View Quote"}
                              </Link>
                            ) : (
                              <span className="font-medium">{shipment.customerQuote || " "}</span>
                            )
                          ) : (
                            shipment.customerQuote || " "
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                          {shipment.proposalId ? (
                            !isManufacturer ? (
                              <Link
                                href={`/proposals/${shipment.proposalId}`}
                                target="_blank"
                                className="text-primary hover:underline font-medium"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {shipment.proposal || "View Proposal"}
                              </Link>
                            ) : (
                              <span className="font-medium">{shipment.proposal || " "}</span>
                            )
                          ) : (
                            shipment.proposal || " "
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                          {shipment.customerOrderId ? (
                            !isManufacturer ? (
                              <Link
                                href={`/orders/${shipment.customerOrderId}`}
                                target="_blank"
                                className="text-primary hover:underline font-medium"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {shipment.customerOrder || "View Order"}
                              </Link>
                            ) : (
                              <span className="font-medium">{shipment.customerOrder || " "}</span>
                            )
                          ) : (
                            shipment.customerOrder || " "
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{shipment.customerPO}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-300 truncate">{shipment.shipToAccount}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{shipment.shipToLocation}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-left truncate">{shipment.totalLines}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-300 font-semibold text-left truncate">{formatCurrency(shipment.totalPrice)}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{shipment.logisticsPartner}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(shipment.shipDate, 'numeric-dash')}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{shipment.trackingNumber}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{shipment.trackingStatus}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(shipment.deliveredDate, 'numeric-dash')}</td>
                        <td className="px-3 py-2 text-left truncate" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/shipments/${shipment.Id}`)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="View shipment" >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
        {/* Pagination Section */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredShipments.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="shipments"
          />
        </div>
      </div>
    </Sidebar >
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch (status) {
      case "Shipped":
      case "Delivered":
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "In Transit":
      case "Inprogress":
      case "Out for Delivery":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending":
      case "Draft":
      case "Picked":
      case "Packed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Cancelled":
      case "Exception":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
      {status || "N/A"}
    </span>
  );
}
