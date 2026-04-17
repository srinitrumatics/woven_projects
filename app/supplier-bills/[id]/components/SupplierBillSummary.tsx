import React from 'react';
import { SupplierBill } from "../../types";
import { formatCurrency } from "@/lib/utils/formatting";

interface SupplierBillSummaryProps {
    bill: SupplierBill;
    remittanceStatusNode?: React.ReactNode;
    className?: string;
}

export default function SupplierBillSummary({
    bill,
    remittanceStatusNode,
    className = ""
}: SupplierBillSummaryProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden w-full h-full flex flex-col ${className}`}>
            <div className="p-6 flex flex-col flex-1">
                {/* Header with Icon */}
                <div className="flex items-center gap-3 mb-6 shrink-0 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white " title="Supplier Bill Summary">Supplier Bill Summary</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Review Your Supplier Bill Summary">Review Supplier Bill Summary</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    {/* Primary Calculations */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">({bill.productLineCount || 0}) Products - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">{formatCurrency(bill.productsSubtotal || 0)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">({bill.serviceLineCount || 0}) Services - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">{formatCurrency(bill.servicesSubtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">Shipping</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">{formatCurrency(bill.totalShippingCharges || 0)}</span>
                        </div>

                        <div className="pt-1 mt-1 border-t border-gray-300 dark:border-white-900/40">
                            <div className="flex justify-between items-center text-lg font-bold min-w-0">
                                <span className="text-gray-900 dark:text-white truncate">Total Amount</span>
                                <span className="text-primary dark:text-primary truncate">{formatCurrency(bill.totalAmount || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Remittance Section */}
                    <div className="space-y-2 pt-2 border-t border-gray-300 dark:border-white-900/40">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-600 dark:text-gray-400 truncate">Remittance Status</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate">
                                {remittanceStatusNode || bill.remittanceStatus || 'Pending'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">Amount Paid</span>
                            <span className="text-green-600 dark:text-green-400 font-bold truncate">{formatCurrency(bill.amountPaid || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">Applied Debits</span>
                            <span className="text-green-600 dark:text-green-400 font-bold truncate">{formatCurrency(bill.appliedDebits || 0)}</span>
                        </div>

                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center text-sm  min-w-0">
                                <span className="text-gray-900 dark:text-white truncate">Open Balance</span>
                                <span className="text-red-500 dark:text-red-400 truncate font-semibold">{formatCurrency(bill.openBalance || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
