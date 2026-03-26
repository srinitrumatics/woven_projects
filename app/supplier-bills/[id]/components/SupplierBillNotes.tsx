"use client";

import React from 'react';
import { SupplierBill } from "../../types";

interface SupplierBillNotesProps {
    bill: SupplierBill;
}

export default function SupplierBillNotes({ bill }: SupplierBillNotesProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col min-h-[180px]">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Supplier Bill Notes">Supplier Bill Notes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Special Instructions or Notes">Special Instructions or Notes</p>
                </div>
            </div>

            <div className="flex-1">
                <textarea
                    readOnly
                    className="w-full h-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:ring-0 focus:border-gray-300 min-h-[90px]"
                    value={bill.notes || "No special notes for this supplier bill."}
                />
            </div>
        </div>
    );
}
