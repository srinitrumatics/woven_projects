"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/formatting";

interface ProductInfoCardProps {
  product: any;
}

export default function ProductInfoCard({ product }: ProductInfoCardProps) {
  const moqValue = parseInt(product.moq) || 1;
  const [quantity, setQuantity] = useState(moqValue);


  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
      {/* Category Tag */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <span className="text-[10px] font-bold text-blue-500  leading-none">
          {product.category}
        </span>
      </div>

      {/* Title & SKU/MPN */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold tracking-widest text-gray-400 ">
          <span>SKU: {product.sku}</span>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50"></div>
          <span className="text-xs font-bold text-green-600">{product.status}</span>
        </div>
        <div className="text-[10px] whitespace-nowrap font-bold text-gray-400 ">
          {product.onHand} Available to Sell • {product.warehouses} warehouses
        </div>
      </div>

      {/* Pricing Section */}
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 mb-8 relative group overflow-hidden">
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
      <div className="space-y-4 mb-10">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 ">Order Qty</label>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(moqValue, quantity - moqValue))}
                disabled={product.onHand <= 0}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xl font-medium ${product.onHand <= 0 ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-primary'}`}
              >
                -
              </button>
              <span className="w-12 text-center text-base font-bold text-gray-900 dark:text-white tabular-nums">
                {product.onHand <= 0 ? 0 : quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + moqValue)}
                disabled={product.onHand <= 0}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xl font-medium ${product.onHand <= 0 ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-primary'}`}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button 
          disabled={product.onHand <= 0}
          className={`w-full py-4 font-bold rounded-2xl shadow-lg transform transition-all duration-200 ${
            product.onHand <= 0 
              ? "bg-gray-400 cursor-not-allowed text-white opacity-70" 
              : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
          }`}
        >
          {product.onHand <= 0 ? "Out of Stock" : "Add to Order"}
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
    </div>
  );
}
