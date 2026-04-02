"use client";

import React from 'react';

interface SupplierBillHeaderProps {
    billNumber: string;
    status: React.ReactNode;
    supplierName: string;
    onBack: () => void;
}

export default function SupplierBillHeader({ billNumber, status, supplierName, onBack }: SupplierBillHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 min-w-0">
                <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300 truncate">Supplier Bills</button>
                <span> &gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300 truncate" title="Supplier Bill Details">Supplier Bill Details</span>
                <span> &gt;</span>
                <span className="text-gray-900 dark:text-white truncate" title={billNumber}>{billNumber}</span>
            </div>

            <div className="w-full px-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate" title={billNumber}>{billNumber}</h1>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1" title={supplierName} >
                                {supplierName} • Supplier Bill Details
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                        {status}
                    </div>
                </div>
            </div>
        </div>
    );
}
