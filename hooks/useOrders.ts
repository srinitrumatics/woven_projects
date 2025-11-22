/**
 * Custom React hooks for Orders data fetching
 *
 * These hooks handle data fetching, loading states, and error handling
 * for the Orders module. They integrate with the Salesforce API and
 * fall back to mock data when Salesforce is not configured.
 */

import { useState, useEffect } from "react";
import { Order, OrderStats } from "@/app/orders/types";
import { mockOrders, mockStats } from "@/app/orders/mockData";
import {
  fetchOrders,
  fetchOrderStats,
  fetchOrderById,
  isSalesforceConfigured,
} from "@/lib/api/salesforce";

/**
 * Hook to fetch all orders
 * @returns Orders data, loading state, and error
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        // Check if Salesforce is configured
        if (isSalesforceConfigured()) {
          const data = await fetchOrders();
          setOrders(data);
        } else {
          // Fall back to mock data
          console.info("Salesforce not configured, using mock data");
          setOrders(mockOrders);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setError(err instanceof Error ? err : new Error("Failed to load orders"));
        // Fall back to mock data on error
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return { orders, loading, error, refetch: () => window.location.reload() };
}

/**
 * Hook to fetch order statistics
 * @returns Order stats, loading state, and error
 */
export function useOrderStats() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);

        if (isSalesforceConfigured()) {
          const data = await fetchOrderStats();
          setStats(data);
        } else {
          console.info("Salesforce not configured, using mock stats");
          setStats(mockStats);
        }
      } catch (err) {
        console.error("Error loading order stats:", err);
        setError(err instanceof Error ? err : new Error("Failed to load stats"));
        // Fall back to mock data on error
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return { stats, loading, error };
}

/**
 * Hook to fetch a single order by ID
 * @param orderId Order ID to fetch
 * @returns Order data, loading state, and error
 */
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isSalesforceConfigured()) {
          const data = await fetchOrderById(orderId);
          setOrder(data);
        } else {
          console.info("Salesforce not configured, using mock data");
          // Find order in mock data
          const mockOrder = mockOrders.find(o => o.id === orderId);
          setOrder(mockOrder || null);
        }
      } catch (err) {
        console.error("Error loading order:", err);
        setError(err instanceof Error ? err : new Error("Failed to load order"));
        // Try to fall back to mock data
        const mockOrder = mockOrders.find(o => o.id === orderId);
        setOrder(mockOrder || null);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  return { order, loading, error };
}
