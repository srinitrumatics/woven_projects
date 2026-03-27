import React from 'react';
import { PurchaseOrder } from "../../types";
import { formatCurrency } from "@/lib/utils/formatting";

interface POSummaryProps {
    po: PurchaseOrder;
    poLines: any[];
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadPDF: () => void;
    className?: string;
}

export default function POSummary({
    po,
    poLines,
    isUploading,
    handleFileUpload,
    handleDownloadPDF,
    className = ""
}: POSummaryProps) {
    const serviceLines = poLines.filter(l => l.Product_Record_Type__c === 'Services');
    const serviceCost = serviceLines.reduce((sum, l) => sum + (l.Total_Product_Cost__c || 0), 0);
    const serviceCount = serviceLines.length;
    const productLinesCount = po.totalLines - serviceCount;

    // We assume po.productCost from the main record might already be the sum of product lines
    // but if it's the sum of all lines (Product + Services), we should adjust it.
    // However, usually Total_Product_Cost__c on PO record is the sum of all lines' Product Cost field.
    // If the user wants separate lines, we might need to adjust po.productCost if it includes services.

    // Let's assume po.productCost is actually the "All Lines Subtotal"
    const productSubtotal = po.productCost - serviceCost;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden w-full h-full flex flex-col ${className}`}>
            <div className="flex items-center gap-3 p-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Purchase Order Summary">Purchase Order Summary</h3>
                    <p className="text-sm text-gray-900 dark:text-gray-700 truncate" title="Review your Purchase Summary">Review your Purchase Summary</p>
                </div>
            </div>

            <div className="px-6 flex flex-col flex-1 divide-y divide-gray-300 dark:divide-gray-700 pt-6 text-[10px] w1025:text-sm">
                <div className="py-2 space-y-3">
                    <div className="flex justify-between min-w-0">
                        <span className="text-gray-900 dark:text-gray-700 mr-2 truncate" title={`(${productLinesCount}) Products - Subtotal`}>({productLinesCount}) Products - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate" title={formatCurrency(productSubtotal)}>{formatCurrency(productSubtotal)}</span>
                    </div>
                    <div className="flex justify-between min-w-0">
                        <span className="text-gray-900 dark:text-gray-700 mr-2 truncate" title={`(${serviceCount}) Services - Subtotal`}>({serviceCount}) Services - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate" title={formatCurrency(serviceCost)}>{formatCurrency(serviceCost)}</span>
                    </div>
                    <div className="flex justify-between min-w-0">
                        <span className="text-gray-900 dark:text-gray-700 mr-2 truncate" title="Shipping">Shipping</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate" title={formatCurrency(po.shippingCost)}>{formatCurrency(po.shippingCost)}</span>
                    </div>
                </div>

                <div className="p-2 ">
                    <div className="flex justify-between items-center min-w-0">
                        <span className="text-lg font-bold text-gray-900 dark:text-white mr-2 truncate" title="Grand Total">Grand Total</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400 truncate" title={formatCurrency(po.totalCost)}>{formatCurrency(po.totalCost)}</span>
                    </div>
                </div>
                <div className="p-8">
                    <button
                        onClick={() => { }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed truncate"
                        title="Download PDF"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
