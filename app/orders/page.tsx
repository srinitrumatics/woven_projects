"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/formatting";
import { OrderStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";

type TabFilter = "All" | "Pending" | "Success" | "Draft" | "Cancelled";

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const router = useRouter();

  // raw SF orders array (use API shape)
  const [sfOrders, setSfOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [dateRange, setDateRange] = useState("Jan 1 - Jan 30, 2024");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize resizable columns
  const { widths, handleResize } = useResizableColumns({
    name: 150,
    status: 120,
    proposal_name: 180,
    cpo: 150,
    billTo: 180,
    shipTo: 180,
    items: 120,
    total: 140,
    requestedDate: 170,
    actions: 100
  });

  const accountId = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? ""; // override with real value
  const contactId = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? ""; //TODO: Get this from session / auth context


  // Fetch from backend API (backend should handle Salesforce auth)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Change accountId as needed or make dynamic later
        console.log("Fetching orders with accountId:", accountId, "contactId:", contactId);
        const res = await fetch(`/api/salesforce/orders?accountId=${accountId}&contactId=${contactId}&action=list`, {
          cache: "no-store",
        });
        console.log("res raw:", res);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }

        const data = await res.json();
        console.log("Fetched orders data:", data);

        // Normalize the data from Salesforce
        let arrayData: any[] = [];
        if (Array.isArray(data)) {
          arrayData = data;
        } else if (data && data.success && Array.isArray(data.data)) {
          arrayData = data.data;
        } else if (data && Array.isArray(data.records)) {
          arrayData = data.records;
        } else {
          console.warn("Unexpected data format from orders API:", data);
          arrayData = [];
        }

        setSfOrders(arrayData);
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Map Salesforce records to UI-friendly order shape used in your table
  const uiOrders = useMemo(() => {
    return sfOrders.map((o: any) => ({
      Id: o.Id,
      id: o.Id,
      name: o.Name,
      status: o.Status__c ?? o.Status__c ?? "N/A",
      proposal_name: o.Proposal_Name ?? o.Proposal_Name ?? "",
      cpo: o.Customer_PO__c ?? o.Customer_PO__c ?? "",
      shipTo: o.Authorized_Ship_To_Location_Name ?? o.Authorized_Ship_To_Location_Name ?? "",
      billTo: o.Authorized_Bill_To_Location_Name ?? o.Authorized_Bill_To_Location_Name ?? "",
      items: o.Total_Lines__c ?? o.Total_Lines__c?.Total_Lines__c ?? 0,
      total: Number(o.Total_Price__c ?? 0),
      requestedDate: o.Request_Date__c ?? "",
      raw: o,
    }));
  }, [sfOrders]);
  // Derived stats (simple)
  const stats = useMemo(() => {
    const totalOrders = uiOrders.length;
    const orderItems = uiOrders.reduce((s, it) => s + (Number(it.items) || 0), 0);
    const returnsOrders = 0; // no field in sample, keep 0
    const fulfilledOrders = uiOrders.filter(o => (o.status || "").toLowerCase().includes("success")).length;
    return {
      totalOrders,
      orderItems,
      returnsOrders,
      fulfilledOrders,
      // small change values are placeholders to keep card UI same
      totalOrdersChange: 5,
      orderItemsChange: 3,
      returnsOrdersChange: -1,
      fulfilledOrdersChange: 2,
    };
  }, [uiOrders]);

  // Filter + search using UI order shape
  const filteredAndSearchedOrders = useMemo(() => {
    let filtered = uiOrders;

    // Apply tab filter
    if (activeTab !== "All") {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        String(order.id).toLowerCase().includes(q) ||
        String(order.name || "").toLowerCase().includes(q) ||
        String(order.status || "").toLowerCase().includes(q) ||
        String(order.proposal_name || "").toLowerCase().includes(q) ||
        String(order.cpo || "").toLowerCase().includes(q) ||
        String(order.shipTo || "").toLowerCase().includes(q) ||
        String(order.billTo || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [uiOrders, activeTab, searchQuery]);

  // Sorting
  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(filteredAndSearchedOrders);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedOrders, currentPage]);

  // Ensure currentPage stays within bounds when totalPages changes
  useEffect(() => {
    const safePage = Number(currentPage) || 1;
    if (safePage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleEditOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call create order API with minimal data to create a draft order
      const response = await fetch('/api/salesforce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: {
            Bill_to_Account__c: accountId,
            Ship_to_Account__c: accountId,
            Inventory_Account__c: accountId,
            Status__c: 'Draft'
          },
          shipToContact: {},
          orderLines: [],
          accountId: accountId,
          contactId: contactId,
          isDraft: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create order' }));
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      console.log('Order created successfully:', result);

      // Extract the order ID from the response (nested in data[0].Id)
      let newOrderId = null;
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        newOrderId = result.data[0].Id;
      } else {
        // Fallback to other possible locations
        newOrderId = result.orderId || result.Id || result.id;
      }

      if (newOrderId) {
        router.push(`/orders/${newOrderId}`);
      } else {
        throw new Error('No order ID returned from API');
      }
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.message || 'Failed to create order');
      alert(`Failed to create order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to clone this order?")) return;

    try {
      setLoading(true);
      // 1. Fetch full order details
      const res = await fetch(`/api/salesforce/orders?accountId=${accountId}&orderId=${orderId}&contactId=${contactId}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      const data = await res.json();
      // The API might return an array or object depending on the response structure
      const sourceOrder = Array.isArray(data) ? data[0] : data;

      if (!sourceOrder) throw new Error("Order details not found");

      // Debug: Log the source order to see what fields are available
      console.log('Source order data:', sourceOrder);
      console.log('Source order keys:', Object.keys(sourceOrder));

      // 2. Fetch contact details if we have a Ship_to_Contact__c
      let contactDetails: any = null;
      if (sourceOrder.Ship_to_Contact__c) {
        try {
          const contactRes = await fetch(`/api/salesforce/orders?accountId=${accountId}&contactId=${contactId}&action=contacts`);
          if (contactRes.ok) {
            const contacts = await contactRes.json();
            contactDetails = Array.isArray(contacts) ? contacts.find((c: any) => c.Id === sourceOrder.Ship_to_Contact__c) : null;
            console.log('Contact details fetched:', contactDetails);
          }
        } catch (err) {
          console.warn('Failed to fetch contact details:', err);
        }
      }

      // 3. Prepare payload (excluding Request_Date__c as per requirement)
      // Build order object matching Salesforce API specification
      const orderData: any = {
        Bill_to_Account__c: sourceOrder.Bill_to_Account__c || accountId,
        Ship_to_Account__c: sourceOrder.Ship_to_Account__c || accountId,
        Inventory_Account__c: sourceOrder.Inventory_Account__c || accountId,
        Status__c: 'Draft'
      };

      // Add all available fields from source order (excluding Request_Date__c)
      if (sourceOrder.Authorized_Bill_To_Location__c) orderData.Authorized_Bill_To_Location__c = sourceOrder.Authorized_Bill_To_Location__c;
      if (sourceOrder.Authorized_Ship_To_Location__c) orderData.Authorized_Ship_To_Location__c = sourceOrder.Authorized_Ship_To_Location__c;

      // Contact fields - IMPORTANT: Include Bill_to_Contact__c if available
      if (sourceOrder.Bill_to_Contact__c) {
        orderData.Bill_to_Contact__c = sourceOrder.Bill_to_Contact__c;
      } else if (sourceOrder.Ship_to_Contact__c) {
        // Fallback: use Ship_to_Contact as Bill_to_Contact if Bill_to_Contact is missing
        orderData.Bill_to_Contact__c = sourceOrder.Ship_to_Contact__c;
      }

      if (sourceOrder.Ship_to_Contact__c) {
        orderData.Ship_to_Contact__c = sourceOrder.Ship_to_Contact__c;
      }

      // Other order fields
      if (sourceOrder.Customer_PO__c) orderData.Customer_PO__c = sourceOrder.Customer_PO__c;
      if (sourceOrder.Drop_Ship__c !== undefined) orderData.Drop_Ship__c = sourceOrder.Drop_Ship__c;
      if (sourceOrder.Customer_Order_Notes__c) orderData.Customer_Order_Notes__c = sourceOrder.Customer_Order_Notes__c;
      if (sourceOrder.Payment_Term__c) orderData.Payment_Term__c = sourceOrder.Payment_Term__c;

      // Build shipToContact object with Phone and Email
      const shipToContactData: any = {};
      if (sourceOrder.Ship_to_Contact__c) {
        shipToContactData.Id = sourceOrder.Ship_to_Contact__c;
      }

      // Try to get contact details from source order if available
      if (sourceOrder.ShipToContact) {
        if (sourceOrder.ShipToContact.Phone) shipToContactData.Phone = sourceOrder.ShipToContact.Phone;
        if (sourceOrder.ShipToContact.Email) shipToContactData.Email = sourceOrder.ShipToContact.Email;
      } else if (contactDetails) {
        // Use separately fetched contact details
        if (contactDetails.Phone) shipToContactData.Phone = contactDetails.Phone;
        if (contactDetails.Email) shipToContactData.Email = contactDetails.Email;
      }

      const payload = {
        order: orderData,
        shipToContact: shipToContactData,
        orderLines: (sourceOrder.CustomerOrderLines || []).map((line: any) => ({
          Status__c: 'Draft',
          Product_Name__c: line.Product_Name__c,
          Order_Qty__c: line.Order_Qty__c,
          Unit_Price__c: line.Unit_Price__c,
          MOQ__c: line.MOQ__c,
          Inventory_Account__c: accountId,
          IsTaxable__c: line.IsTaxable__c !== undefined ? line.IsTaxable__c : true,
          ...(line.Customer_Order_Line_Notes__c && { Customer_Order_Line_Notes__c: line.Customer_Order_Line_Notes__c })
        })),
        accountId: accountId,
        contactId: contactId,
        isDraft: true
      };
      console.log('Clone payload:', JSON.stringify(payload, null, 2));
      // 3. Create new order
      const createRes = await fetch('/api/salesforce/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({ error: 'Failed to clone order' }));
        throw new Error(errorData.error || 'Failed to clone order');
      }

      const result = await createRes.json();

      // 4. Redirect
      let newId = null;
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        newId = result.data[0].Id;
      } else {
        newId = result.orderId || result.Id || result.id;
      }

      if (newId) {
        router.push(`/orders/${newId}`);
      } else {
        throw new Error('No new order ID returned');
      }

    } catch (err: any) {
      console.error("Clone failed:", err);
      alert(`Failed to clone order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <div className="flex items-center gap-3">

          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateRange}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={`${formatNumber(stats.totalOrders, 0)} -`}
          change={stats.totalOrdersChange}
          trend="up"
        />
        <StatCard
          title="Order items over time"
          value={`${formatNumber(stats.orderItems, 0)} -`}
          change={stats.orderItemsChange}
          trend="up"
        />
        <StatCard
          title="Returns Orders"
          value={`${formatNumber(stats.returnsOrders, 0)} -`}
          change={stats.returnsOrdersChange}
          trend="down"
        />
        <StatCard
          title="Fulfilled orders over time"
          value={`${formatNumber(stats.fulfilledOrders, 0)} -`}
          change={stats.fulfilledOrdersChange}
          trend="up"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tabs and Search */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-6">
              {(["All", "Pending", "Success", "Draft", "Cancelled"] as TabFilter[]).map(tab => (
                <button
                  key={`orders-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium transition-colors font-semibold text-gray-900 dark:text-white relative ${activeTab === tab
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            // Spinner Loader
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin h-10 w-10 text-primary mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Order Number" field="name" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                  <SortableHeader label="Status" field="status" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                  <SortableHeader label="Proposal Name" field="proposal_name" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposal_name} onResize={handleResize} />
                  <SortableHeader label="Customer Order" field="cpo" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.cpo} onResize={handleResize} />
                  <SortableHeader label="Bill to Account" field="billTo" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.billTo} onResize={handleResize} />
                  <SortableHeader label="Ship to Account" field="shipTo" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipTo} onResize={handleResize} />
                  <SortableHeader label="Total Lines" field="items" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.items} onResize={handleResize} />
                  <SortableHeader label="Total Price" field="total" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.total} onResize={handleResize} />
                  <SortableHeader label="Request Date" field="requestedDate" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestedDate} onResize={handleResize} />

                  <th
                    className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-left">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No orders found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          {searchQuery || activeTab !== "All"
                            ? "Try adjusting your filters"
                            : "Get started by creating your first order"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={`order-row-${order.Id ?? order.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0  text-left">
                        <Link href={`/orders/${order.id}`} className="text-sm  text-primary hover:underline">{order.name}</Link>
                      </td>
                      <td className="px-3 py-2 text-left">
                        <StatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="px-3 py-2 text-left">
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={order.proposal_name}>{order.proposal_name}</div>
                      </td>
                      <td className="px-3 py-2 text-left">
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={order.cpo}>{order.cpo}</div>
                      </td>
                      <td className="px-3 py-2 text-left">
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={order.billTo}>{order.billTo}</div>
                      </td>
                      <td className="px-3 py-2 text-left">
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={order.shipTo}>{order.shipTo}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">{formatNumber(order.items, 0)}</td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold">{formatCurrency(order.total, 'USD', 2)}</td>
                      <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white">{formatDate(order.requestedDate, 'numeric-dash')}</td>

                      <td className="px-3 py-2 text-left">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditOrder(order.Id)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            title="Edit order"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleCloneOrder(order.Id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            title="Clone order"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                          </button>
                          {/* Only show delete for orders that are NOT Approved or Delivered */}
                          {!["Approved", "Delivered"].includes(order.status) && (
                            <button
                              className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                              title="Delete order"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination (use safe numeric handling) */}
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {(() => {
              const totalItems = filteredAndSearchedOrders.length;
              const safeCurrent = Number(currentPage) || 1;
              const start = totalItems === 0 ? 0 : (safeCurrent - 1) * ITEMS_PER_PAGE + 1;
              const end = Math.min(totalItems, safeCurrent * ITEMS_PER_PAGE);
              return (
                <div className="text-sm text-gray-500">
                  Showing {start} to {end} of {totalItems} orders
                </div>
              );
            })()}

            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={() =>
                  setCurrentPage((prev) => {
                    const p = Number(prev) || 1;
                    return Math.max(1, p - 1);
                  })
                }
                disabled={(Number(currentPage) || 1) <= 1}
                className="px-3 py-1 rounded border bg-white text-sm disabled:opacity-50"
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={`orders-page-${p}`}
                    onClick={() => setCurrentPage(Number(p))}
                    aria-current={p === Number(currentPage) ? "page" : undefined}
                    className={`px-3 py-1 rounded border text-sm ${p === Number(currentPage) ? "bg-[var(--primary)] text-white" : "bg-white"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="sm:hidden text-sm text-gray-600 px-2">
                {Number(currentPage) || 1} / {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => {
                    const p = Number(prev) || 1;
                    return Math.min(totalPages, p + 1);
                  })
                }
                disabled={(Number(currentPage) || 1) >= totalPages}
                className="px-3 py-1 rounded border bg-white text-sm disabled:opacity-50"
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, change, trend }: {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
}) {
  const isPositive = trend === "up";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center text-center">
      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <div className="flex items-baseline justify-center gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-sm flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(change)}% last week
        </span>
      </div>
      <div className="mt-4 h-12 w-full flex items-end justify-center gap-1">
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[30%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[45%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[60%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[80%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[70%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[55%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[85%]"></div>
        <div className="flex-1 max-w-[12px] bg-gray-200 dark:bg-gray-700 rounded-sm h-[95%]"></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const getStyles = () => {
    switch ((status || "").toString()) {
      case "Delivered":
        return "bg-green-300 text-green-900 dark:bg-green-1000/30 dark:text-green-500";
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Submitted":
        return "bg-yellow-200 text-blue-900 dark:bg-blue-1000/30 dark:text-yellow-500";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
      {status || "N/A"}
    </span>
  );
}
