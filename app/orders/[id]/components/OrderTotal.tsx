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
    isEditing = false
}: OrderTotalProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 h-full w-full flex flex-col" role="region" aria-label="Order total">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Total</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Review Order Summary</p>
                </div>
            </div>
            {/* Price Breakdown */}
            <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{productsCount} Product{productsCount !== 1 ? 's' : ''} - Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                    <span className="text-gray-900 dark:text-white">${shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Total Taxes</span>
                    <span className="text-gray-900 dark:text-white font-semibold">${totalExciseTax.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                </div>
            </div>

            {/* Grand Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 pb-3 mb-3">
                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-xl font-bold text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Download PDF Button */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Files (Max 10MB)</label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 transition-all ${isEditing ? 'cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10' : 'cursor-not-allowed opacity-60'}`}>
                    <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Accepted: PDF · JPEG · PNG · CSV · XLS · XLSX · DOC · TXT</span>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.doc,.text"
                        multiple
                        onChange={handleFileUpload}
                        disabled={!isEditing}
                        className="hidden"
                    />
                </label>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{uploadedFiles.length} file(s) attached</span>
                            {uploadedFiles.length > 1 && (
                                <button
                                    onClick={handleDownloadAll}
                                    className="text-xs text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download All
                                </button>
                            )}
                        </div>
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
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
    );
}
