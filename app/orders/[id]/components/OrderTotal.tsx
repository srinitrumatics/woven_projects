"use client";

interface OrderTotalProps {
    productsSubtotal: number;
    totalExciseTax: number;
    grandTotal: number;
    shipping: number;
    orderProcessing: number;
    formData: any;
    setFormData: (data: any) => void;
    handleDownloadPDF: () => void;
    isGeneratingPDF: boolean;
    uploadedFiles: File[];
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadAll: () => void;
    handleDownloadFile: (file: File) => void;
    handleRemoveFile: (index: number) => void;
    productsCount: number;
    isEditing?: boolean;
    className?: string;
}

export default function OrderTotal({
    productsSubtotal,
    totalExciseTax,
    grandTotal,
    shipping,
    orderProcessing,
    formData,
    setFormData,
    handleDownloadPDF,
    isGeneratingPDF,
    uploadedFiles,
    handleFileUpload,
    handleDownloadAll,
    handleDownloadFile,
    handleRemoveFile,
    productsCount,
    isEditing = false,
    className = ""
}: OrderTotalProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col h-full ${className}`} role="region" aria-label="Order total">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white " title="Order Summary">Order Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Review Your Order Summary">Review Order Summary</p>
                </div>
            </div>
            {/* Price Breakdown */}
            <div className="flex-1 space-y-2 mb-2 pt-2">
                <div className="flex justify-between text-sm gap-4">
                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title={`${productsCount} Product${productsCount !== 1 ? 's' : ''} - Subtotal`}>{productsCount} Product{productsCount !== 1 ? 's' : ''} - Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium shrink-0 truncate">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm gap-4">
                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Shipping">Shipping</span>
                    <span className="text-gray-900 dark:text-white shrink-0 truncate">${shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm gap-4">
                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1" title="Taxes">Taxes</span>
                    <span className="text-gray-900 dark:text-white font-semibold shrink-0 truncate">${totalExciseTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

            </div>

            {/* Bottom Content Area */}
            <div className="mt-auto">
                {/* Grand Total */}
                <div className="border-t-2 border-primary/20 dark:border-primary/40 py-2">
                    <div className="flex justify-between items-center text-lg font-bold gap-4 min-w-0">
                        <span className="text-gray-900 dark:text-white truncate flex-1" title="Grand Total">Grand Total</span>
                        <span className="text-primary dark:text-primary font-extrabold shrink-0 truncate">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Download PDF Button */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 ">
                    {/*<button
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                        className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed truncate"
                    >
                        {isGeneratingPDF ? (
                            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                    </button>*/}
                    <button
                        disabled={isGeneratingPDF}
                        className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed truncate"
                    >
                        {isGeneratingPDF ? (
                            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                {/* Upload Attachments */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">Upload Files</label>
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-1 transition-all ${isEditing ? 'cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10' : 'cursor-not-allowed opacity-60'}`}>
                        <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center truncate"> Max 10MB</span>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.doc,.docx,.txt"
                            multiple
                            onChange={handleFileUpload}
                            disabled={!isEditing}
                            className="hidden truncate"
                        />
                    </label>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between items-center mb-2 min-w-0">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{uploadedFiles.length} file(s) attached</span>
                                {uploadedFiles.length > 1 && (
                                    <button
                                        onClick={handleDownloadAll}
                                        className="text-xs text-primary hover:text-primary-dark hover:underline flex items-center gap-1 truncate"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download All
                                    </button>
                                )}
                            </div>
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-1 py-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 min-w-0">
                                        <button
                                            onClick={() => handleDownloadFile(file)}
                                            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary p-1"
                                            title="Download"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                                title="Remove"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
