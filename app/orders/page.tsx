"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";

import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/formatting";
import { OrderStatus } from "./types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useUserSession } from "@/components/UserSessionContext";

type TabFilter = string;

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
    name: 200,
    status: 120,
    proposal_name: 180,
    customerPO: 150,
    billTo: 180,
    shipTo: 180,
    items: 120,
    total: 140,
    requestedDate: 170,
    actions: 150
  });

  const { user, selectedAccount } = useUserSession();
  const accountId = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
  const contactId = user?.Id || "";


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
        // console.log("Fetched orders data:", data[0]?.Customer_Order__c);

        // Based on API: [ { Customer_Order__c: [...], Status__c: [...] } ]
        const responseData = Array.isArray(data) ? data[0] : data;
        const rawItems = responseData?.Customer_Order__c || [];
        const apiStatuses = responseData?.Status__c || [];

        setSfOrders(rawItems);

        // DEBUG: log first order to verify field names
        if (rawItems.length > 0) {
          console.log('[Orders DEBUG] Total orders received:', rawItems.length);
          console.log('[Orders DEBUG] First order keys:', Object.keys(rawItems[0]));
          console.log('[Orders DEBUG] First order data:', JSON.stringify(rawItems[0], null, 2));
        } else {
          console.warn('[Orders DEBUG] Customer_Order__c is empty or missing. Full response:', JSON.stringify(data, null, 2)?.slice(0, 500));
        }


      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (accountId && contactId) {
      fetchOrders();
    }
  }, [accountId, contactId]);

  // Map Salesforce records to UI-friendly order shape
  const uiOrders = useMemo(() => {
    return sfOrders.map((o: any) => ({
      Id: o.Id,
      id: o.Id,
      name: o.Name,
      status: o.Status__c ?? "N/A",
      proposal_name: o.Proposal_Name ?? "",
      proposal_id: o.Proposal__c ?? "",
      customerPO: o.Customer_PO__c ?? "",
      shipTo: o.Authorized_Ship_To_Location_Name ?? "",
      billTo: o.Authorized_Bill_To_Location_Name ?? "",
      items: o.Total_Lines__c ?? 0,
      total: Number(o.Total_Price__c ?? 0),
      requestedDate: o.Request_Date__c ?? "",
      raw: o,
    }));
  }, [sfOrders]);

  // Unique statuses derived from loaded records (used for filter buttons)
  const uniqueStatuses = useMemo(() => {
    const seen = new Set<string>();
    uiOrders.forEach(o => { if (o.status && o.status !== 'N/A') seen.add(o.status); });
    return Array.from(seen).sort();
  }, [uiOrders]);

  // Derived stats
  const stats = useMemo(() => {
    const allCount = uiOrders.length;
    const allValue = uiOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const activeOrders = uiOrders.filter(o => ["Submitted", "Approved", "Closed"].includes(o.status));
    const totalOrders = activeOrders.length;
    const totalValue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const draftOrders = uiOrders.filter(o => o.status === "Draft");
    const draftCount = draftOrders.length;
    const draftValue = draftOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = uiOrders.filter(o => o.status === "Pending" || o.status === "Submitted");
    const pendingCount = pendingOrders.length;
    const pendingValue = pendingOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const fulfilledOrders = uiOrders.filter(o => o.status === "Success" || o.status === "Approved" || o.status === "Delivered");
    const fulfilledCount = fulfilledOrders.length;
    const fulfilledValue = fulfilledOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      allCount, allValue,
      totalOrders, totalValue,
      draftCount, draftValue,
      pendingCount, pendingValue,
      fulfilledCount, fulfilledValue
    };
  }, [uiOrders]);

  // Filter + search using UI order shape
  const filteredAndSearchedOrders = useMemo(() => {
    let filtered = uiOrders;

    // Exact-match status filter ("All" = no filter)
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
        String(order.customerPO || "").toLowerCase().includes(q) ||
        String(order.shipTo || "").toLowerCase().includes(q) ||
        String(order.billTo || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [uiOrders, activeTab, searchQuery]);

  // Sorting
  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(filteredAndSearchedOrders);

  const isManufacturer = selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'manufacturer' || user?.role?.toLowerCase() === 'manufacturer';

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
        router.push(`/orders/${newOrderId}?new=true`);
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

  const handleDeleteOrder = async (orderId: string, status: string) => {
    if (status !== "Draft") {
      alert("Only draft orders can be deleted.");
      return;
    }

    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/salesforce/orders?accountId=${accountId}&orderId=${orderId}&contactId=${contactId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to delete order" }));
        throw new Error(errorData.error || "Failed to delete order");
      }

      const result = await res.json();
      console.log("Delete result:", result);

      if (result.success) {
        alert("Order deleted successfully.");
        // Refresh the list
        setSfOrders(prev => prev.filter(o => o.Id !== orderId));
      } else {
        throw new Error(result.message || "Failed to delete order");
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Failed to delete order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (tab: TabFilter) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Manage and Track Sales Orders">Manage and Track Sales Orders</p>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 truncate"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>

      {/* Stats Cards - New Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-4 gap-4 mb-6">
        {/* Total Orders Card */}
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
                  className="hover:underline block"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Total Orders">Total Orders</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Total")}
                  className="hover:underline block"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.totalOrders}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Orders</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-primary mt-1 truncate">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Total" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline truncate">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Total")}
                  className="hover:underline block">
                  View total orders</Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Draft Orders Card */}
        <button
          onClick={() => handleCardClick("Draft")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Draft"
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
                  onClick={() => handleCardClick("Draft")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Drafts">Drafts</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Draft")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.draftCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Orders</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-1 truncate">{formatCurrency(stats.draftValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Draft" ? "bg-gray-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-600 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:underline truncate">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Draft")}
                  className="hover:underline block">
                  View drafts</Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Pending Orders Card */}
        <button
          onClick={() => handleCardClick("Pending")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Pending"
            ? "border-yellow-500 ring-2 ring-yellow-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-yellow-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 min-w-0">
                  <Link
                    href="#"
                    onClick={() => handleCardClick("Pending")}
                    className="hover:underline block">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide truncate" title="Pending/Submitted">Pending/Submitted</p>
                  </Link>
                  {stats.pendingCount > 0 && (
                    <span className="flex h-2 w-2 truncate">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75 truncate"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500 truncate"></span>
                    </span>
                  )}
                </div>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Pending")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.pendingCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Orders</span>
                  </div>
                </Link>

                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mt-1 truncate">{formatCurrency(stats.pendingValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Pending" ? "bg-yellow-500 text-white" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400 group-hover:underline truncate">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Pending")}
                  className="hover:underline block">
                  View pending</Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* Success/Fulfilled Orders Card */}
        <button
          onClick={() => handleCardClick("Success")}
          className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border transition-all duration-200 text-left hover:shadow-lg ${activeTab === "Success"
            ? "border-green-500 ring-2 ring-green-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-green-400"
            }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Success")}
                  className="hover:underline block">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Fulfilled/Success">Fulfilled/Success</p>
                </Link>
                <Link
                  href="#"
                  onClick={() => handleCardClick("Success")}
                  className="hover:underline block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{stats.fulfilledCount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Orders</span>
                  </div>
                </Link>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1 truncate">{formatCurrency(stats.fulfilledValue)}</p>
              </div>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "Success" ? "bg-green-500 text-white" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white"
                } transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline truncate">
                <Link
                  href="#"
                  onClick={() => handleCardClick("Success")}
                  className="hover:underline block">
                  View fulfilled
                </Link>
                <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </button>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {/* Header with Search and Filter Buttons */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Heading row */}

          {/* Search + filter pills row */}
          <div className="flex flex-wrap items-center gap-3 px-2 pb-4">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-xs flex-shrink-0">
              <input
                type="text"
                placeholder="Search Orders"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* "All" pill */}
              <button
                onClick={() => setActiveTab('All')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'All'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                All
              </button>

              {/* Dynamic status pills from actual records */}
              {uniqueStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
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

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p className="text-sm truncate" title="Loading orders...">Loading orders...</p>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <SortableHeader label="Order Number" field="name" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-20" />
                  <SortableHeader label="Status" field="status" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={handleResize} />
                  <SortableHeader label="Proposal Name" field="proposal_name" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposal_name} onResize={handleResize} />
                  <SortableHeader label="Customer PO" field="customerPO" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerPO} onResize={handleResize} />
                  <SortableHeader label="Bill to Account" field="billTo" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.billTo} onResize={handleResize} />
                  <SortableHeader label="Ship to Account" field="shipTo" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.shipTo} onResize={handleResize} />
                  <SortableHeader label="Total Lines" field="items" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.items} onResize={handleResize} />
                  <SortableHeader label="Total Price" field="total" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.total} onResize={handleResize} />
                  <SortableHeader label="Request Date" field="requestedDate" align="left" sortConfig={sortConfig} requestSort={requestSort} width={widths.requestedDate} onResize={handleResize} />
                  <th
                    className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 truncate"
                    style={{ width: widths.actions, minWidth: widths.actions, maxWidth: widths.actions }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center truncate">
                      <div className="flex flex-col items-center justify-center min-w-0">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 truncate" title="No orders found">No orders found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm truncate">
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
                      <td className="px-3 py-2 text-sm text-primary font-semibold sticky left-0 z-10 bg-white dark:bg-gray-800 text-left truncate">
                        <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-primary hover:underline truncate">
                          <div title={order.name}>{order.name}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-2 truncate">
                        <StatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="px-3 py-2 truncate text-gray-600 dark:text-white font-medium ">
                        {order.proposal_id && order.proposal_id !== '' ? (
                          !isManufacturer ? (
                            <Link href={`/proposals/${order.proposal_id}`} target="_blank" className="text-sm font-semibold text-primary hover:underline truncate">
                              {order.proposal_name}
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-white font-medium " title={order.proposal_name}>{order.proposal_name}</div>
                          )
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-white font-medium " title={order.proposal_name}>{order.proposal_name}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 truncate">
                        <div className="text-sm text-gray-600 dark:text-gray-400" title={order.customerPO}>{order.customerPO}</div>
                      </td>
                      <td className="px-3 py-2 truncate">
                        <div className="text-sm text-gray-600 dark:text-gray-400" title={order.billTo}>{order.billTo}</div>
                      </td>
                      <td className="px-3 py-2 truncate">
                        <div className="text-sm text-gray-600 dark:text-gray-400" title={order.shipTo}>{order.shipTo}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-white truncate">{formatNumber(order.items, 0)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-white font-semibold truncate">{formatCurrency(order.total)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{formatDate(order.requestedDate, 'numeric-dash')}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          {order.status !== "Canceled" && order.status !== "Cancelled" && (
                            <>
                              {order.status !== "Approved" && (
                                <button
                                  onClick={() => handleEditOrder(order.Id)}
                                  className="p-1.5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                                  title="Edit order"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleCloneOrder(order.Id)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                title="Clone order"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                              </button>
                            </>
                          )}
                          {order.status === "Draft" && (
                            <button
                              onClick={() => handleDeleteOrder(order.Id, order.status)}
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

        {/* Pagination component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAndSearchedOrders.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName="orders"
        />
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const getStyles = () => {
    switch ((status || "").toString()) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Submitted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Canceled":
      case "Cancelled":
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



