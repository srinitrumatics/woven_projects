"use client";

import React from 'react';
import { SupplierBill } from "../../types";
import { formatDate } from "@/lib/utils/formatting";

interface SupplierBillDetailProps {
    bill: SupplierBill;
}

export default function SupplierBillDetail({ bill }: SupplierBillDetailProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Supplier Bill Detail">Supplier Bill Detail</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Bill Information">Bill Information</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="AP Rep">AP Rep</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.apRep || '-'} title={bill.apRep} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Proposal Name">Proposal Name</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.proposalName || '-'} title={bill.proposalName} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer Order">Customer Order</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.customerOrderName || '-'} title={bill.customerOrderName} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer Quote">Customer Quote</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.customerQuoteName || '-'} title={bill.customerQuoteName} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Purchase Order">Purchase Order</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.purchaseOrderName || '-'} title={bill.purchaseOrderName} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billed Date">Billed Date</label>
                    <input type="text" readOnly className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300 truncate" value={bill.billedDate ? formatDate(bill.billedDate, 'numeric-dash') : '-'} title={bill.billedDate ? formatDate(bill.billedDate, 'numeric-dash') : '-'} />
                </div>
            </div>
        </div>
    );
}
