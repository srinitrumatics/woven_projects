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

    // Track whether the entered qty exceeds available stock
    const [qtyWarning, setQtyWarning] = useState(false);

    const handleManualQtyChange = (val: string) => {
        if (val === "" || /^[0-9]+$/.test(val)) {
            const numVal = val === "" ? 0 : parseInt(val);
            const exceeded = numVal > available;
            setQtyWarning(exceeded);
            // Allow the value but show a warning (no silent clamping)
            onQtyChange(numVal);
        }
    };

    const incrementQty = () => {
        const newQty = Math.min(available, editedQty + moq);
        setQtyWarning(false);
        onQtyChange(newQty);
    };

    const decrementQty = () => {
        const newQty = Math.max(moq, editedQty - moq);
        setQtyWarning(false);
        onQtyChange(newQty);
    };

    return (
        <div className="w1400:col-span-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">

            {/* Mobile View (Card-like) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">Unit Price</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(unitPrice)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">Order Qty</label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {isEditing ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <button onClick={decrementQty} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 shadow-sm transition-colors text-lg">-</button>
                                    <input type="text" value={editedQty} onChange={(e) => handleManualQtyChange(e.target.value)} className={`w-16 h-8 px-1 border rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent ${qtyWarning ? 'border-amber-500 focus:ring-amber-400' : 'border-gray-300 dark:border-gray-600 focus:ring-primary'}`} />
                                    <button onClick={incrementQty} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 shadow-sm transition-colors text-lg">+</button>
                                </div>
                                {qtyWarning ? (
                                    <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                        Exceeds available ({available})
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">MOQ: {moq} / Avail: {available}</div>
                                )}
                            </div>
                        ) : (
                            formatNumber(displayQty)
                        )}
                    </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">MOQ</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(product.moq)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">Total Order Qty</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(displayQty, 0)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">Total Price</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">Taxes</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(taxes)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <label className="block text-sm font-bold  text-gray-700 dark:text-gray-400   mb-1">Shipping</label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(shippingCharges)}</span>
                </div>
                <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                    <label className="block text-sm font-bold  text-primary/70 dark:text-primary-light/70   mb-1">Grand Total</label>
                    <span className="text-base font-bold text-primary dark:text-primary-light">{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Unit Price</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Order Qty</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">MOQ</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Total Order Qty</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Total Price</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Taxes</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Shipping</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-400  ">Grand Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(unitPrice)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                {isEditing ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <button onClick={decrementQty} className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 shadow-sm">-</button>
                                            <input type="text" value={editedQty} onChange={(e) => handleManualQtyChange(e.target.value)} className={`w-16 px-1 py-0.5 border rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent ${qtyWarning ? 'border-amber-500 focus:ring-amber-400' : 'border-gray-300 dark:border-gray-600 focus:ring-primary'}`} />
                                            <button onClick={incrementQty} className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 shadow-sm">+</button>
                                        </div>
                                        {qtyWarning ? (
                                            <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                                Exceeds available ({available})
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-gray-700 dark:text-gray-400">MOQ: {moq} / Avail: {available}</div>
                                        )}
                                    </div>
                                ) : (
                                    formatNumber(displayQty)
                                )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{formatNumber(product.moq)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{formatNumber(displayQty, 0)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(subtotal)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(taxes)}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(shippingCharges)}</td>
                            <td className="px-4 py-4 text-sm font-bold text-primary dark:text-primary-light italic">{formatCurrency(grandTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
