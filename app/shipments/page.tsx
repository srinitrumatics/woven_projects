"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { ShippingManifest, ShipmentStatus } from "./types";
import { mockShipments, mockShipmentStats } from "./mockData";

export default function ShipmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return mockShipments.filter((shipment) => {
      const matchesSearch =
        shipment.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.carrier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || shipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "In Transit":
      case "Shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Pending":
      case "Picked":
      case "Packed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Exception":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your orders and delivery status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{mockShipmentStats.totalShipments}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Shipments</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-md border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{mockShipmentStats.inTransit}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">In Transit</p>
          <button
            onClick={() => setStatusFilter("In Transit")}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Track Now
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{mockShipmentStats.delivered}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 shadow-md border-2 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-700 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{mockShipmentStats.pending}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Pending</p>
          <button
            onClick={() => setStatusFilter("Pending")}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            View Pending
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by manifest, order, tracking number, or carrier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "Picked", "Packed", "Shipped", "In Transit", "Out for Delivery", "Delivered", "Exception"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as ShipmentStatus | "All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-light dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Manifest #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Order #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Account</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Carrier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Tracking #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ship Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Est. Delivery</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedShipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No shipments found</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        {searchQuery || statusFilter !== "All" ? "Try adjusting your filters" : "No shipments available"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    onClick={() => router.push(`/shipments/${shipment.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-primary">{shipment.manifestNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{shipment.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{shipment.accountName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{shipment.carrier}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{shipment.trackingNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{shipment.shipDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{shipment.estimatedDelivery}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/shipments/${shipment.id}`);
                        }}
                        className="px-3 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-xs font-medium"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredShipments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="shipments"
        />
      </div>
    </Sidebar>
  );
}
