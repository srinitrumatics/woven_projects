import React from 'react';
import { Proposal, ProposedProduct } from "../types";

interface ProposalSummaryProps {
    proposal: Proposal;
    proposedProducts: ProposedProduct[];
    grandTotal: number;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadPDF: () => void;
}

export default function ProposalSummary({
    proposal,
    proposedProducts,
    grandTotal,
    isUploading,
    handleFileUpload,
    handleDownloadPDF
}: ProposalSummaryProps) {
    // Financial Calculations
    const productItems = proposedProducts.filter(p => p.product_record_type === 'Product');
    const serviceItems = proposedProducts.filter(p => p.product_record_type === 'Services');

    const productsSubtotal = productItems.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    const servicesSubtotal = serviceItems.reduce((sum, p) => sum + (p.subtotal || 0), 0);

    // Calculate Total Cost based on margin
    // Cost = Subtotal * (1 - margin/100)
    const totalCost = proposedProducts.reduce((sum, p) => {
        const margin = p.margin || 0;
        const cost = (p.subtotal || 0) * (1 - margin / 100);
        return sum + cost;
    }, 0);

    const grossProfit = proposal.totalAmount - totalCost;
    const grossMargin = proposal.totalAmount > 0 ? (grossProfit / proposal.totalAmount) * 100 : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden w-full flex flex-col">
            <div className="w-full flex items-center gap-2 justify-start p-4 border-b border-gray-50 dark:border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proposal Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review Your Proposal Summary</p>
                </div>
            </div>

            <div className="p-5 flex flex-col">
                <div className="space-y-3 mb-4">
                    {/* Individual Subtotals */}
                    <div className="flex justify-between text-sm pb-2">
                        <span className="text-gray-700 dark:text-gray-300">({productItems.length}) Products - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-sm pb-2">
                        <span className="text-gray-700 dark:text-gray-300">({serviceItems.length}) Services - Subtotal</span>
                        <span className="text-gray-900 dark:text-white font-medium">${servicesSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-sm pt-1 font-medium border-t border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
                        <span className="text-gray-900 dark:text-white">${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-sm pb-1">
                        <span className="text-gray-700 dark:text-gray-300">Taxes</span>
                        <span className="text-gray-900 dark:text-white font-medium">${proposal.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-sm pb-1">
                        <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                        <span className="text-gray-900 dark:text-white font-medium">${proposal.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="border-t-2 border-primary/20 dark:border-primary/40 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white">Grand Total</span>
                            <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                </div>

                {/* Download PDF Button */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 ">
                    <button onClick={handleDownloadPDF} className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                    </button>
                </div>
                {/* Upload Attachments */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Upload Files (Max 10MB)</label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                        <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center pt-3"> PDF · JPEG · PNG · CSV · XLS · XLSX · DOC · TXT </span>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            className="hidden "
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                    {isUploading && <p className="text-sm text-center text-primary mt-1">Uploading...</p>}
                </div>
            </div>
        </div>
    );
}
