"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { useToast } from "@/components/ui/Toast";

interface Order {
  id: string;
  name: string;
  status: string;
  proposal_name: string;
  total: number;
}

interface AddToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  quantity: number;
  moq: number;
  accountId: string;
  contactId: string;
}

export default function AddToOrderModal({
  isOpen,
  onClose,
  product,
  quantity,
  moq,
  accountId,
  contactId,
}: AddToOrderModalProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { success, warning, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen && accountId && contactId) {
      fetchDraftOrders();
    }
  }, [isOpen, accountId, contactId]);

  const fetchDraftOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/salesforce/orders?accountId=${accountId}&contactId=${contactId}&action=list`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      const responseData = Array.isArray(data) ? data[0] : data;
      const rawItems = responseData?.Customer_Order__c || [];

      const draftOrders = rawItems
        .filter((o: any) => o.Status__c === "Draft")
        .map((o: any) => ({
          id: o.Id,
          name: o.Name,
          status: o.Status__c,
          proposal_name: o.Proposal_Name__c || o.Proposal_Name || "",
          total: Number(o.Total_Price__c || 0),
        }));

      setOrders(draftOrders);
      if (draftOrders.length > 0) {
        setSelectedOrderId(draftOrders[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching draft orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToOrder = async () => {
    if (!selectedOrderId) return;

    try {
      setAdding(true);
      setError(null);

      const payload = {
        order: {
          Id: selectedOrderId,
          Status__c: 'Draft',
          Bill_to_Account__c: accountId,
          Ship_to_Account__c: accountId,
          Inventory_Account__c: accountId,
        },
        orderLines: [{
          Status__c: 'Draft',
          Product_Name__c: product.id,
          Order_Qty__c: quantity / (moq || 1),
          Unit_Price__c: product.price,
          Inventory_Account__c: accountId,
          IsTaxable__c: false,
        }],
        accountId,
        contactId,
        isDraft: true,
      };

      const res = await fetch(`/api/salesforce/orders?orderId=${selectedOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add product to order");
      }

      success("Product added to order successfully!");
      router.push(`/orders/${selectedOrderId}`);
    } catch (err: any) {
      console.error("Error adding to order:", err);
      setError(err.message || "Failed to add product to order.");
    } finally {
      setAdding(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setCreating(true);
      setError(null);

      const createRes = await fetch('/api/salesforce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          contactId,
          Proposal_Requested__c: false,
          Transfer_Order__c: false,
        }),
      });

      if (!createRes.ok) throw new Error('Failed to create order');

      const createResult = await createRes.json();
      const newOrderId = createResult.data?.[0]?.Id ?? createResult.orderId ?? createResult.Id;

      if (!newOrderId) throw new Error('No order ID returned from server');

      const patchRes = await fetch(`/api/salesforce/orders?orderId=${newOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            Id: newOrderId,
            Status__c: 'Draft',
            Bill_to_Account__c: accountId,
            Ship_to_Account__c: accountId,
            Inventory_Account__c: accountId,
          },
          orderLines: [{
            Status__c: 'Draft',
            Product_Name__c: product.id,
            Order_Qty__c: quantity,
            Unit_Price__c: product.price,
            Inventory_Account__c: accountId,
            IsTaxable__c: false,
          }],
          accountId,
          contactId,
          isDraft: true,
        }),
      });

      if (!patchRes.ok) {
        warning('Order created, but the product line could not be added. Please add it manually.');
        router.push(`/orders/${newOrderId}`);
        return;
      }

      success('Order created and product added successfully!');
      router.push(`/orders/${newOrderId}`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add to Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Product Summary */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Product</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                <p className="text-sm font-bold text-primary">{formatNumber(quantity)}</p>
              </div>
            </div>
          </div>

          {/* Order Selection */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 block">
              Select Draft Order
            </label>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No draft orders found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center ${selectedOrderId === order.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800"
                      }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {order.proposal_name || "No Proposal Name"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                      <p className="text-xs font-bold text-amber-600 uppercase">{order.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          {!loading && orders.length === 0 && (
            <button
              onClick={handleCreateOrder}
              disabled={creating}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              {creating ? "Creating..." : "Create Order"}
            </button>
          )}
          {!loading && orders.length > 0 && (
            <button
              onClick={handleAddToOrder}
              disabled={!selectedOrderId || adding}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              {adding ? "Adding..." : "Add to Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
