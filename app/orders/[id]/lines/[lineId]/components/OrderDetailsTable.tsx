"use client";

import { useState } from "react";

import { formatCurrency, formatNumber } from "@/lib/utils/formatting";

interface OrderDetailsTableProps {
    isEditing: boolean;
    product: {
        moq: number;
        availableToSell: number;
        qtyShipped: number;
    };
    editedQty: number;
    onQtyChange: (qty: number) => void;
    unitPrice: number;
    subtotal: number;
    taxes: number;
    shippingCharges: number;
    grandTotal: number;
    displayQty: number;
}

export default function OrderDetailsTable({
    isEditing,
    product,
    editedQty,
    onQtyChange,
    unitPrice,
    subtotal,
    taxes,
    shippingCharges,
    grandTotal,
    displayQty,
}: OrderDetailsTableProps) {
    const moq = product.moq || 1;
    const available = product.availableToSell || 0;

    const handleManualQtyChange = (val: string) => {
        if (val === "" || /^[0-9]+$/.test(val)) {
            const numVal = val === "" ? 0 : parseInt(val);
            onQtyChange(numVal);
        }
    };

    const incrementQty = () => {
        const newQty = editedQty + moq;
        onQtyChange(newQty);
    };

    const decrementQty = () => {
        const newQty = Math.max(0, editedQty - moq);
        onQtyChange(newQty);
    };

    return (
        <div className="w1025:col-span-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">

            {/* Mobile View (Card-like) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w1025:hidden">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="Unit Price">Unit Price</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{formatCurrency(unitPrice)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="Order Qty">Order Qty</label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {isEditing ? (
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <button
                                        onClick={decrementQty}
                                        className="w-8 h-8 flex items-center justify-center rounded border shadow-sm transition-colors text-lg bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-900 dark:text-white"
                                    >
                                        -
                                    </button>
                                    <input type="text" value={editedQty} onChange={(e) => handleManualQtyChange(e.target.value)} className="w-16 h-8 px-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    <button
                                        onClick={incrementQty}
                                        className="w-8 h-8 flex items-center justify-center rounded border shadow-sm transition-colors text-lg bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-900 dark:text-white"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">MOQ: {moq} / Avail: {available}</div>
                            </div>
                        ) : (
                            formatNumber(displayQty)
                        )}
                    </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="MOQ">MOQ</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{formatNumber(product.moq)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="Total Order Qty">Total Order Qty</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{formatNumber(displayQty, 0)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="Total Price">Total Price</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{formatCurrency(subtotal)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="Taxes">Taxes</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{formatCurrency(taxes)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1 truncate" title="Shipping">Shipping</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">{formatCurrency(shippingCharges)}</span>
                </div>
                <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                    <label className="block text-sm font-bold  text-primary/70 dark:text-primary-light/70   mb-1 truncate" title="Grand Total">Grand Total</label>
                    <span className="text-base font-bold text-primary dark:text-primary-light truncate block">{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden w1025:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Unit Price">Unit Price</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Order Qty">Order Qty</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="MOQ">MOQ</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Total Order Qty">Total Order Qty</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Total Price">Total Price</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Shipping">Shipping</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Taxes">Taxes</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400 " title="Grand Total">Grand Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(unitPrice)}>{formatCurrency(unitPrice)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate">
                                {isEditing ? (
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <button
                                                onClick={decrementQty}
                                                className="w-6 h-6 flex items-center justify-center rounded border shadow-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                            >
                                                -
                                            </button>
                                            <input type="text" value={editedQty} onChange={(e) => handleManualQtyChange(e.target.value)} className="w-16 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                                            <button
                                                onClick={incrementQty}
                                                className="w-6 h-6 flex items-center justify-center rounded border shadow-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="text-[10px] text-gray-700 dark:text-gray-400">MOQ: {moq} / Avail: {available}</div>
                                    </div>
                                ) : (
                                    formatNumber(displayQty)
                                )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate" title={formatNumber(product.moq)}>{formatNumber(product.moq)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate" title={formatNumber(displayQty, 0)}>{formatNumber(displayQty, 0)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(subtotal)}>{formatCurrency(subtotal)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(shippingCharges)}>{formatCurrency(shippingCharges)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(taxes)}>{formatCurrency(taxes)}</td>
                            <td className="px-4 py-4 text-sm font-bold text-primary dark:text-primary-light truncate" title={formatCurrency(grandTotal)}>{formatCurrency(grandTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
