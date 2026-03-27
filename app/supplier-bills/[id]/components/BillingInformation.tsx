"use client";

import React from 'react';
import { SupplierBill } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface BillingInformationProps {
    bill: SupplierBill;
}

export default function BillingInformation({ bill }: BillingInformationProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 shrink-0 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Billing Information">Billing Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Bill Destination">Bill Destination</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 w1025:grid-cols-3 gap-6 flex-1">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill-to Account">Bill to Account</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.billToAccount || ''} title={bill.billToAccount} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill-to Location">Bill to Location</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.billToLocation || ''} title={bill.billToLocation} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billing Address">Billing Address</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.billingAddress || ''} title={bill.billingAddress} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Payment Terms">Payment Terms</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.paymentTerms || ''} title={bill.paymentTerms} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Due Date">Due Date</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.dueDate ? formatDate(bill.dueDate, 'numeric-dash') : ''} title={bill.dueDate} />
                </div>
                <div className="hidden w1025:block">
                    {/* Placeholder for 2nd row 3rd column if needed */}
                </div>
            </div>
        </div>
    );
}
