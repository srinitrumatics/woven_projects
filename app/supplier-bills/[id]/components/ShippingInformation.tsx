"use client";

import React from 'react';
import { SupplierBill } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface ShippingInformationProps {
    bill: SupplierBill;
}

export default function ShippingInformation({ bill }: ShippingInformationProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 shrink-0 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Shipping Information">Shipping Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Delivery Destination">Delivery Destination</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-3 gap-6 flex-1">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship-to Account">Ship-to Account</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.shipToAccount || '-'} title={bill.shipToAccount} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship-to Location">Ship-to Location</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.shipToLocation || '-'} title={bill.shipToLocation} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Shipping Address">Shipping Address</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.shippingAddress || '-'} title={bill.shippingAddress} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Goods Receipt Date">Receipt Date</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.goodsReceiptDate ? formatDate(bill.goodsReceiptDate, 'numeric-dash') : '-'} title={bill.goodsReceiptDate ? formatDate(bill.goodsReceiptDate, 'numeric-dash') : '-'} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Site">Site</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.site || '-'} title={bill.site} />
                </div>
                <div className="hidden w1025:block">
                    {/* Placeholder for 2nd row 3rd column if needed */}
                </div>
            </div>
        </div>
    );
}
