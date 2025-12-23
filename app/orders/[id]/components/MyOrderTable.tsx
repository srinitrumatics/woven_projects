"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/app/orders/types";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";

interface MyOrderTableProps {
    loadingOrder: boolean;
    filteredOrderProducts: Product[];
    orderId: string;
    handleQuantityChange: (lineItemKey: string, newQuantity: number) => void;
    handleRemoveProduct: (lineItemKey: string) => void;
    searchQuery: string;
    setHoveredTooltip: Dispatch<SetStateAction<{ product: Product; x: number; y: number } | null>>;
    accountId: string;
    contactId: string;
    setOrderProducts: Dispatch<SetStateAction<Product[]>>;
}

export default function MyOrderTable({
    loadingOrder,
    filteredOrderProducts,
    orderId,
    handleQuantityChange,
    handleRemoveProduct,
    searchQuery,
    setHoveredTooltip,
    accountId,
    contactId,
    setOrderProducts
}: MyOrderTableProps) {

    // Fetch order lines on component mount or when dependencies change
    useEffect(() => {
        if (!orderId || orderId === "new" || !accountId) return;

        const fetchOrderLines = async () => {
            try {
                // Using the specific API endpoint logic requested
                const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&orderId=${encodeURIComponent(orderId)}&contactId=${encodeURIComponent(contactId)}&action=orderlines`);

                if (!res.ok) {
                    console.error("Failed to fetch order lines:", res.statusText);
                    return;
                }

                const data = await res.json();

                if (data && Array.isArray(data)) {
                    const mappedProducts: Product[] = data.map((item: any, index: number) => ({
                        id: item.Product_Name__c || item.Id,
                        name: item.ProductName || "N/A",
                        sku: item.Name || "",
                        description: item.Product_Description__c || "",
                        unitPrice: item.Unit_Price__c,
                        listPrice: item.Unit_Price__c,
                        brand: "",
                        manufacturer: item.Manufacturer_Name__c || "",
                        productFamily: item.ProductFamily || "",
                        availableQty: 999,
                        moq: item.MOQ__c || 1,
                        orderQty: item.Order_Qty__c,
                        subtotal: item.Total_Price__c,
                        orderLineId: item.Id,
                        lineItemKey: `${item.Id}-${Date.now()}-${index}-${Math.random()}`
                    }));
                    setOrderProducts(mappedProducts);
                }
            } catch (error) {
                console.error("Error fetching order lines in MyOrderTable:", error);
            }
        };

        fetchOrderLines();
    }, [orderId, accountId, contactId, setOrderProducts]);

    const handleTooltipEnter = (e: React.MouseEvent<HTMLElement>, product: Product) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredTooltip({
            product,
            x: rect.left,
            y: rect.top
        });
    };

    const handleTooltipLeave = () => {
        setHoveredTooltip(null);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Order Line #</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manufacturer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Family</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Order Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loadingOrder ? (
                        <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                Loading order details...
                            </td>
                        </tr>
                    ) : filteredOrderProducts.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? "No products found matching your search." : "Your order is empty. Click 'Add Products' to start adding items."}
                            </td>
                        </tr>
                    ) : (
                        filteredOrderProducts.map((product) => (
                            <tr key={product.lineItemKey || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                                <td className="px-4 py-3">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link
                                        href={`/orders/${orderId}/lines/${product.orderLineId || product.orderLineId}`}
                                        className="text-sm font-semibold text-primary hover:underline"
                                        title="View line details"
                                    >
                                        {product.orderLineId}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                    {/* Product name with hover tooltip showing full details */}
                                    <span
                                        className="underline cursor-help"
                                        onMouseEnter={(e) => handleTooltipEnter(e, product)}
                                        onMouseLeave={handleTooltipLeave}
                                    >
                                        {product.name}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                                        {product.productFamily}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const moq = product.moq || 1;
                                                    const newQty = Math.max(product.orderQty - moq, moq);
                                                    handleQuantityChange(product.lineItemKey!, newQty);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={product.orderQty}
                                                onChange={(e) => handleQuantityChange(product.lineItemKey!, parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                min={product.moq || 1}
                                                step={product.moq || 1}
                                            />
                                            <button
                                                onClick={() => {
                                                    const moq = product.moq || 1;
                                                    handleQuantityChange(product.lineItemKey!, product.orderQty + moq);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">MOQ: {product.moq || 1}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleRemoveProduct(product.lineItemKey!)}
                                        title="Remove from order"
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
