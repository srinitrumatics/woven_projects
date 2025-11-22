"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/utils/formatting";
import { OrderStatus } from "./types";

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

  // Fetch from backend API (backend should handle Salesforce auth)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Change accountId as needed or make dynamic later
        const res = await fetch(`/api/salesforce/orders?accountId=001WL00000bapRiYAI`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }

        const data = await res.json();

        // If API returns { records: [...] } or array directly, normalize
        let arrayData: any[] = [];
        if (Array.isArray(data)) {
          arrayData = data;
        } else if (Array.isArray(data.records)) {
          arrayData = data.records;
        } else if (data && data.length === undefined && Object.keys(data).length === 0) {
          arrayData = [];
        } else {
          // last resort: wrap single object
          arrayData = Array.isArray(data) ? data : [data];
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
      billTo: o.Bill_To_Contact_Name ?? o.Bill_To_Contact_Name ?? "",
      shipTo: o.Ship_To_Contact_Name ?? o.Ship_To_Contact_Name ?? "",
      items: o.Total_Lines__c ?? o.Total_Lines__c?.Total_Lines__c ?? 0,
      total: Number(o.Total_Price__c ?? 0),
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
        String(order.billTo || "").toLowerCase().includes(q) ||
        String(order.shipTo || "").toLowerCase().includes(q) ||
        String(order.status || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [uiOrders, activeTab, searchQuery]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredAndSearchedOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSearchedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSearchedOrders, currentPage]);

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

  return (
    <Sidebar>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            More actions
          </button>
          <Link href="/orders/create">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Create order
            </button>
          </Link>
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
          value={`${stats.totalOrders} -`}
          change={stats.totalOrdersChange}
          trend="up"
        />
        <StatCard
          title="Order items over time"
          value={`${stats.orderItems} -`}
          change={stats.orderItemsChange}
          trend="up"
        />
        <StatCard
          title="Returns Orders"
          value={`${stats.returnsOrders} -`}
          change={stats.returnsOrdersChange}
          trend="down"
        />
        <StatCard
          title="Fulfilled orders over time"
          value={`${stats.fulfilledOrders} -`}
          change={stats.fulfilledOrdersChange}
          trend="up"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        {/* Tabs and Search */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 gap-3 flex-wrap">
            <div className="flex items-center gap-6 flex-wrap">
              {(["All", "Pending", "Success", "Draft", "Cancelled"] as TabFilter[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-[260px]">
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
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            <table className="w-full table-auto ">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Bill To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship To</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Items</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
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
                    <tr key={order.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        <Link href={`/orders/${order.id}`}>#{order.name}</Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] line-clamp-2">{order.billTo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] line-clamp-2">{order.shipTo}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">{order.items}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-semibold">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
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
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Delete order"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
                    key={p}
                    onClick={() => setCurrentPage(Number(p))}
                    aria-current={p === Number(currentPage) ? "page" : undefined}
                    className={`px-3 py-1 rounded border text-sm ${
                      p === Number(currentPage) ? "bg-[var(--primary)] text-white" : "bg-white"
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
    </Sidebar>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-sm flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(change)}% last week
        </span>
      </div>
      <div className="mt-4 h-12 flex items-end gap-1">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[30%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[45%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[60%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[80%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[70%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[55%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[85%]"></div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm h-[95%]"></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const getStyles = () => {
    switch ((status || "").toString()) {
      case "Success":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {status || "N/A"}
    </span>
  );
}
