import React from 'react';
import { QuoteDetails, QuoteLine } from "@/app/quotes/types";
import { formatCurrency } from "@/lib/utils/formatting";

interface QuoteSummaryProps {
    quote: QuoteDetails;
    lines: QuoteLine[];
    grandTotal: number;
    isUploading?: boolean;
    handleFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadPDF?: () => void;
    className?: string;
}

export default function QuoteSummary({
    quote,
    lines,
    grandTotal,
    isUploading,
    handleFileUpload,
    handleDownloadPDF,
    className = ""
}: QuoteSummaryProps) {
    const productsSubtotal = lines.reduce((sum, line) => sum + line.totalPrice, 0);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col h-full ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Quote Summary">Quote Summary</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Review Your Quote Summary</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between pt-2">
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
                    <div className="border-t-2 border-primary/20 dark:border-primary/40 pt-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white">Grand Total</span>
                            <span className="text-primary dark:text-primary">{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>

                    {/* Download PDF Button */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-2">
                        {/*<button
                            onClick={handleDownloadPDF}
                            className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>*/}
                        <button

                            className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
