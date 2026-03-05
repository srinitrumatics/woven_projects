import React from 'react';
import { Proposal, ProposedProduct } from "../types";

interface ProposalSummaryProps {
    proposal: Proposal;
    proposedProducts: ProposedProduct[];
    grandTotal: number;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadPDF: () => void;
    className?: string;
}

export default function ProposalSummary({
    proposal,
    proposedProducts,
    grandTotal,
    isUploading,
    handleFileUpload,
    handleDownloadPDF,
    className = ""
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
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden w-full flex flex-col h-full ${className}`}>
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title="Proposal Summary">Proposal Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Review Your Proposal Summary</p>
                </div>
            </div>

            <div className="px-6 pb-6 flex flex-col flex-1">
                {/* Financial Details Section - This will take up remaining space */}
                <div className="flex-1">
                    <div className="space-y-3 mb-4">
                        {/* Individual Subtotals */}
                        <div className="flex justify-between text-sm pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`(${productItems.length}) Products - Subtotal`}>({productItems.length}) Products - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`(${serviceItems.length}) Services - Subtotal`}>({serviceItems.length}) Services - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0">${servicesSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm pt-1 font-medium border-t border-gray-100 dark:border-gray-700 pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Subtotal">Subtotal</span>
                            <span className="text-gray-900 dark:text-white shrink-0">${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm pb-1 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Taxes">Taxes</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0">${proposal.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Shipping">Shipping</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0">${proposal.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section - This will stay at the bottom of the card */}
                <div className="mt-auto space-y-3">
                    <div className="border-t-2 border-primary/20 dark:border-primary/40 pt-3 mb-1">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white">Grand Total</span>
                            <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Download PDF Button */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                        {/*<button onClick={handleDownloadPDF} className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>*/}
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>

                    {/* Upload Attachments */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Files (Max 10MB)</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                            <svg className="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center"> PDF · JPEG · PNG · CSV · XLS · XLSX · DOC · TXT </span>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.doc,.docx,.txt"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </label>
                        {isUploading && <p className="text-sm text-center text-primary mt-1">Uploading...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
