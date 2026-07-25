"use client";

import { useState } from "react";

import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/DataTable";

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
                <Table>
                    <THead>
                        <tr>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Unit Price</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Order Qty</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">MOQ</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Total Order Qty</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Total Price</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Shipping</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Taxes</Th>
                            <Th className="font-bold text-gray-700 dark:text-gray-400">Grand Total</Th>
                        </tr>
                    </THead>
                    <TBody>
                        <Tr>
                            <Td className="truncate" title={formatCurrency(unitPrice)}>{formatCurrency(unitPrice)}</Td>
                            <Td className="truncate">
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
                                        <div className="text-xs text-gray-700 dark:text-gray-400">MOQ: {moq} / Avail: {available}</div>
                                    </div>
                                ) : (
                                    formatNumber(displayQty)
                                )}
                            </Td>
                            <Td className="truncate" title={formatNumber(product.moq)}>{formatNumber(product.moq)}</Td>
                            <Td className="truncate" title={formatNumber(displayQty, 0)}>{formatNumber(displayQty, 0)}</Td>
                            <Td className="truncate" title={formatCurrency(subtotal)}>{formatCurrency(subtotal)}</Td>
                            <Td className="truncate" title={formatCurrency(shippingCharges)}>{formatCurrency(shippingCharges)}</Td>
                            <Td className="truncate" title={formatCurrency(taxes)}>{formatCurrency(taxes)}</Td>
                            <Td className="font-bold text-primary dark:text-primary-light truncate" title={formatCurrency(grandTotal)}>{formatCurrency(grandTotal)}</Td>
                        </Tr>
                    </TBody>
                </Table>
            </div>
        </div>
    );
}
