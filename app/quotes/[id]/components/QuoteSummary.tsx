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
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Quote Summary">Quote Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Review Quote Summary</p>
            </div>

            <div className="flex-1 flex flex-col justify-between pt-4">
                {/* Content Area */}
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between text-sm gap-4">
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`(${lines.length}) Products - Subtotal`}>({lines.length}) Products - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium shrink-0">{formatCurrency(productsSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm gap-4">
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`(${quote.serviceLinesCount}) Service - Subtotal`}>({quote.serviceLinesCount}) Service - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium shrink-0">{formatCurrency(quote.serviceTotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm gap-4">
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Taxes">Taxes</span>
                        <span className="text-gray-900 dark:text-white font-medium shrink-0">{formatCurrency(quote.taxTotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm gap-4">
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Shipping">Shipping</span>
                        <span className="text-gray-900 dark:text-white font-medium shrink-0">{formatCurrency(quote.shippingCost)}</span>
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
