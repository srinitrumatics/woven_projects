"use client";

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
            let numVal = val === "" ? 0 : Number(val);
            if (numVal > available) {
                numVal = available;
            }
            onQtyChange(numVal);
        }
    };

    const incrementQty = () => {
        onQtyChange(Math.min(available, editedQty + moq));
    };

    const decrementQty = () => {
        onQtyChange(Math.max(moq, editedQty - moq));
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
                                            className="w-16 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            onClick={incrementQty}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            +
                                        </button>
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
