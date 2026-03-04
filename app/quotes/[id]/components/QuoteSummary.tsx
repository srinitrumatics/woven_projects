import React from 'react';
import { QuoteDetails, QuoteLine } from "@/app/quotes/types";
import { formatCurrency } from "@/lib/utils/formatting";

interface QuoteSummaryProps {
    quote: QuoteDetails;
    lines: QuoteLine[];
    grandTotal: number;
    isUploading?: boolean;
    handleFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export default function QuoteSummary({
    quote,
    lines,
    grandTotal,
    isUploading,
    handleFileUpload,
    className = ""
}: QuoteSummaryProps) {
    const productsSubtotal = lines.reduce((sum, line) => sum + line.totalPrice, 0);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col h-full ${className}`}>
            <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Summary</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review Quote Summary</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between pt-4">
                {/* Content Area */}
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">({lines.length}) Products - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(productsSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">({quote.serviceLinesCount}) Service - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(quote.serviceTotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Taxes</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(quote.taxTotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(quote.shippingCost)}</span>
                    </div>
                </div>

                {/* Footer Area */}
                <div className="mt-auto pt-4">
                    <div className="border-t-2 border-primary/20 dark:border-primary/40 pt-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white">Grand Total</span>
                            <span className="text-primary dark:text-primary">{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
