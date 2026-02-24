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
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Unit Price
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Order Qty
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                MOQ
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Total Order Qty
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Total Price
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Taxes
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Shipping
                            </th>
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Grand Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(unitPrice)}
                            </td>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {isEditing ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={decrementQty}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="text"
                                                value={editedQty}
                                                onChange={(e) => handleManualQtyChange(e.target.value)}
                                                className={`w-16 px-1 py-0.5 border rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent ${qtyWarning
                                                    ? 'border-amber-500 focus:ring-amber-400'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                                                    }`}
                                                min={moq}
                                            />
                                            <button
                                                onClick={incrementQty}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                        {qtyWarning ? (
                                            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                Exceeds available ({available})
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 text-left">
                                                MOQ: {moq} / Avail: {available}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    formatNumber(displayQty)
                                )}
                            </td>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {formatNumber(product.moq)}
                            </td>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {formatNumber(displayQty, 0)}
                            </td>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(subtotal)}
                            </td>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(taxes)}
                            </td>
                            <td className="px-2 py-3 text-sm text-left text-gray-900 dark:text-white">
                                {formatCurrency(shippingCharges)}
                            </td>
                            <td className="px-2 py-3 text-sm text-left font-bold text-primary">
                                {formatCurrency(grandTotal)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
