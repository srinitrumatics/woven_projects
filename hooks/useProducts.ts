/**
 * Custom React hook for Products data fetching
 */

import { useState, useEffect } from "react";
import { Product } from "@/app/orders/types";
import { fetchProducts, isSalesforceConfigured } from "@/lib/api/salesforce";

// Mock products for development (matches Product interface)
const mockProducts: Product[] = [
  {
    id: "1",
    name: "PB&J Gummies, 100mg",
    description: "Delicious peanut butter and jelly flavored gummies with 100mg THC",
    manufacturer: "Elefante Labs",
    productFamily: "Edibles",
    brand: "Elefante",
    sku: "ELE-PBJ-H-E-C",
    availableQty: 90,
    moq: 5,
    listPrice: 12.00,
    unitPrice: 8.50,
    orderQty: 0,
    subtotal: 0,
  },
  {
    id: "2",
    name: "Biscotti, 1g Preroll",
    description: "Premium Biscotti strain pre-rolled joint, 1 gram",
    manufacturer: "Juniper Cannabis",
    productFamily: "Pre-Rolls",
    brand: "Juniper",
    sku: "JUN-Biscotti-LPR-L",
    availableQty: 50,
    moq: 10,
    listPrice: 6.00,
    unitPrice: 4.40,
    orderQty: 0,
    subtotal: 0,
  },
];

/**
 * Hook to fetch all products
 * @returns Products data, loading state, and error
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        if (isSalesforceConfigured()) {
          const data = await fetchProducts();
          setProducts(data);
        } else {
          console.info("Salesforce not configured, using mock products");
          setProducts(mockProducts);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err : new Error("Failed to load products"));
        // Fall back to mock data on error
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return { products, loading, error };
}
