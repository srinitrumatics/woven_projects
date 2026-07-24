"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/formatting";
import { useUserSession } from "@/components/UserSessionContext";
import AddToOrderModal from "./AddToOrderModal";
import PermissionGate from "@/components/PermissionGate";

interface ProductInfoCardProps {
  product: any;
}

export default function ProductInfoCard({ product }: ProductInfoCardProps) {
  const moqValue = parseInt(product.moq) || 1;
  const [quantity, setQuantity] = useState(moqValue);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, selectedAccount } = useUserSession();
  const accountId = selectedAccount?.Id || selectedAccount?.id || "";
  const contactId = user?.contact?.Id || user?.contact?.id || "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 xl:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
      {/* Category Tag */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        <span className="text-[10px] font-bold text-blue-500 leading-none">
          {product.category}
        </span>
      </div>

      {/* Title & SKU */}
      <div className="mb-3">
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">
          {product.name}
        </h1>
        <div className="text-[10px] font-bold tracking-widest text-gray-400">
          SKU: {product.sku}
        </div>
      </div>

      {/* Inventory Status */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 mb-3 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-50"></div>
          <span className="text-xs font-bold text-green-600">{product.status}</span>
        </div>
        <div className="text-[10px] whitespace-nowrap font-bold text-gray-400">
          {product.onHand} Available • {product.warehouses} warehouses
        </div>
      </div>

      {/* Pricing Section */}
      <div className="p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 mb-3 relative group overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative">
          <div className="text-[10px] font-bold text-gray-400 mb-1">Unit Price</div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-gray-900 dark:text-blue-400 tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Controls */}
      <div className="space-y-3 mb-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400">Total Order Qty</label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 rounded-lg shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(0, quantity - moqValue))}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-lg font-medium text-gray-400 hover:text-primary"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + moqValue)}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-lg font-medium text-gray-400 hover:text-primary"
              >
                +
              </button>
            </div>

            <PermissionGate requiredPermissions={['order-create']} fallback={null}>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={quantity === 0}
                className="flex-1 py-2 px-4 font-bold rounded-xl shadow-md transform transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm active:scale-[0.98]"
              >
                Add to Order
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-px mt-auto rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-800 p-3.5">
          <div className="text-[9px] font-bold text-gray-400 mb-1 opacity-60">Lead Time</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">{product.leadTime}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3.5">
          <div className="text-[9px] font-bold text-gray-400 mb-1 opacity-60">MOQ</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">{product.moq}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3.5">
          <div className="text-[9px] font-bold text-gray-400 mb-1 opacity-60">Brand Name</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{product.brand}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3.5">
          <div className="text-[9px] font-bold text-gray-400 mb-1 opacity-60">Warranty</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{product.warranty}</div>
        </div>
      </div>

      <AddToOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        quantity={quantity}
        moq={moqValue}
        accountId={accountId}
        contactId={contactId}
      />
    </div>
  );
}
