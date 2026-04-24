"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/formatting";
import { useUserSession } from "@/components/UserSessionContext";
import AddToOrderModal from "./AddToOrderModal";

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
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 p-6 xl:p-8 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
      {/* Category Tag */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <span className="text-[10px] font-bold text-blue-500  leading-none">
          {product.category}
        </span>
      </div>

      {/* Title & SKU/MPN */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold tracking-widest text-gray-400 ">
          <span>SKU: {product.sku}</span>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 mb-4 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50"></div>
          <span className="text-xs font-bold text-green-600">{product.status}</span>
        </div>
        <div className="text-[10px] whitespace-nowrap font-bold text-gray-400 ">
          {product.onHand} Available to Sell • {product.warehouses} warehouses
        </div>
      </div>

      {/* Pricing Section */}
      <div className="p-3 md:p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 mb-4 relative group overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="relative">
          <div className="text-[10px] font-bold text-gray-400  mb-2">Unit Selling Price</div>
          <div className="flex items-baseline gap-4 mb-1">
            <span className="text-3xl font-black text-gray-900 dark:text-blue-400 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm font-bold text-gray-400 line-through opacity-60">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Order Controls */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 ">Order Qty</label>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(0, quantity - moqValue))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xl font-medium text-gray-400 hover:text-primary"
              >
                -
              </button>
              <span className="w-12 text-center text-base font-bold text-gray-900 dark:text-white tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + moqValue)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xl font-medium text-gray-400 hover:text-primary"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 font-bold rounded-2xl shadow-lg transform transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
        >
          Add to Order
        </button>

      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-px mt-auto rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="text-[9px] font-bold text-gray-400  mb-1.5 opacity-60">Lead Time</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">{product.leadTime}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="text-[9px] font-bold text-gray-400  mb-1.5 opacity-60">MOQ</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">{product.moq}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="text-[9px] font-bold text-gray-400  mb-1.5 opacity-60">Manufacturer</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product.manufacturer}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="text-[9px] font-bold text-gray-400  mb-1.5 opacity-60">Warranty</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product.warranty}</div>
        </div>
      </div>

      <AddToOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        quantity={quantity}
        accountId={accountId}
        contactId={contactId}
      />
    </div>
  );
}
