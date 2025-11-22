"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { mockShipments, mockTrackingEvents } from "../mockData";
import { ShippingManifest, TrackingEvent } from "../types";

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = use(params);

  const shipment = useMemo(() => {
    return mockShipments.find((s) => s.id === id);
  }, [id]);

  const trackingEvents = useMemo(() => {
    return mockTrackingEvents[id] || [];
  }, [id]);

  if (!shipment) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Shipment not found</p>
          <Link
            href="/shipments"
            className="mt-4 inline-block text-primary hover:text-primary-dark"
          >
            Back to Shipments
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Delivered": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "In Transit": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Out for Delivery": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Shipped": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      "Pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Packed": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      "Picked": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      "Exception": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Cancelled": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      "Will Call": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/shipments" className="hover:text-primary">
          Shipments
        </Link>
        <span>&gt;</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {shipment.manifestNumber}
        </span>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {shipment.manifestNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Order #{shipment.orderNumber} " {shipment.accountName}
            </p>
          </div>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(shipment.status)}`}>
            {shipment.status}
          </span>
        </div>
      </div>

      {/* Main Content - 70/30 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 70% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Shipment Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Carrier</p>
                <p className="font-semibold text-gray-900 dark:text-white">{shipment.carrier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono text-sm">
                  {shipment.trackingNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ship Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(shipment.shipDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
              {shipment.actualDelivery && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actual Delivery</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {new Date(shipment.actualDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Shipping Address
            </h2>
            <p className="text-gray-900 dark:text-white font-medium mb-2">{shipment.accountName}</p>
            <p className="text-gray-600 dark:text-gray-400">{shipment.shippingAddress}</p>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Tracking Timeline
            </h2>
            {trackingEvents.length > 0 ? (
              <div className="space-y-6">
                {trackingEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {/* Timeline Line */}
                    {index !== trackingEvents.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}

                    {/* Event */}
                    <div className="flex items-start space-x-4">
                      {/* Timeline Dot */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-primary text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                        {index === 0 ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                        )}
                      </div>

                      {/* Event Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {event.status}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.description}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-500 ml-4 whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {event.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {event.location}
                            {event.city && event.state && ` " ${event.city}, ${event.state} ${event.zip || ''}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No tracking information available yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Tracking updates will appear here once the carrier picks up the package
                </p>
              </div>
            )}
          </div>

          {/* Package Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Package Details
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Package Count</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shipment.packageCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Weight</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shipment.totalWeight} lbs
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Line Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shipment.lineItemCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 30% */}
        <div className="space-y-6">
          {/* Shipment Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Shipment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${shipment.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Packages</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shipment.packageCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Weight</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shipment.totalWeight} lbs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Items</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shipment.lineItemCount}
                </span>
              </div>
            </div>
          </div>

          {/* Carrier Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Carrier Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carrier</p>
                <p className="font-semibold text-gray-900 dark:text-white">{shipment.carrier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tracking Number</p>
                <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all">
                  {shipment.trackingNumber}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`https://www.google.com/search?q=${shipment.carrier}+tracking+${shipment.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Track on Carrier Site
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Download BOL
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Print Label
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-10">
        <div className="max-w-7xl mx-auto flex justify-end space-x-4">
          <Link
            href="/shipments"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Shipments
          </Link>
          <Link
            href={`/orders/${shipment.orderNumber.replace('ORD-', '')}`}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            View Related Order
          </Link>
        </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20" />
    </div>
  );
}
