import React from 'react';
import Link from 'next/link';
import { Proposal, ProposedProduct } from "../types";
import { isServiceRecordType } from "@/lib/utils/product-record-type";

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
    const productItems = proposedProducts.filter(p => !isServiceRecordType(p.product_record_type));
    const serviceItems = proposedProducts.filter(p => isServiceRecordType(p.product_record_type));

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
            <div className="flex items-center gap-3 p-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Proposal Summary">Proposal Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Review Proposal Summary">Review Proposal Summary</p>
                </div>
            </div>

            <div className="px-6 pb-6 flex flex-col flex-1">
                {/* Financial Details Section - This will take up remaining space */}
                <div className="flex-1">
                    <div className="space-y-3 mb-4">
                        {/* Individual Subtotals */}
                        <div className="flex justify-between text-sm pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`(${productItems.length}) Products - Subtotal`}>({productItems.length}) Products - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0 truncate">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`(${serviceItems.length}) Services - Subtotal`}>({serviceItems.length}) Services - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0 truncate">${servicesSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm pt-1 font-medium border-t border-gray-100 dark:border-gray-700 pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Subtotal">Subtotal</span>
                            <span className="text-gray-900 dark:text-white shrink-0 truncate">${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm pb-2 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Shipping">Shipping</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0 truncate">${proposal.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm pb-1 gap-4">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Taxes">Taxes</span>
                            <span className="text-gray-900 dark:text-white font-medium shrink-0 truncate">${proposal.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section - This will stay at the bottom of the card */}
                <div className="mt-auto space-y-3">
                    <div className="border-t-2 border-primary/20 dark:border-primary/40 pt-3 mb-1">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white truncate">Grand Total</span>
                            <span className="text-primary dark:text-primary truncate">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Proposal Vendor Page Link (Button Style) and Download PDF Button */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex flex-col gap-2">
                        {proposal.Project_Workspace__c ? (
                            <Link
                                href={`/proposals/${proposal.id}/summary`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md truncate"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Proposal Workspace
                            </Link>
                        ) : (
                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-sm truncate" title="No Workspace URL Found">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Proposal Workspace
                            </div>
                        )}
                        <button
                            onClick={handleDownloadPDF}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md truncate"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>

                    {/* Upload Attachments */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 truncate">Upload Files</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all truncate">
                            <svg className="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center truncate"> Max 10MB </span>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.doc,.docx,.txt"
                                multiple
                                className="hidden truncate"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                title=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.doc,.docx,.txt"
                            />
                        </label>
                        {isUploading && <p className="text-sm text-center text-primary mt-1 truncate" title="Uploading...">Uploading...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

