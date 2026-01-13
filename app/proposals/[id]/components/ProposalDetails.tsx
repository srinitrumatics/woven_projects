import { Proposal, ProposedProduct } from "../types";
import { formatAddress } from "../utils";

interface ProposalDetailsProps {
    proposal: Proposal;
    proposedProducts: ProposedProduct[];
    grandTotal: number;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDownloadPDF: () => void;
}

export default function ProposalDetails({
    proposal,
    proposedProducts,
    grandTotal,
    isUploading,
    handleFileUpload,
    handleDownloadPDF
}: ProposalDetailsProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Draft":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            case "Pending Review":
            case "Pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Under Review":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Approved":
            case "Accepted":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Expired":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Lead":
                return "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Left Column - Proposal Information (70%) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Key Dates */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Dates</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Important Timeline Information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Rep</label>
                            <p className="text-gray-900 dark:text-white font-medium">{proposal.accountExecutive}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proposal Type</label>
                            <p className="text-gray-900 dark:text-white">{proposal.proposalType}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issued Date</label>
                            <p className="text-gray-900 dark:text-white">{proposal.issuedDate}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date</label>
                            <p className="text-gray-900 dark:text-white font-semibold">{proposal.expirationDate}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Order</label>
                            <p className="text-gray-900 dark:text-white font-mono">{proposal.orderNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Billing and Shipping Information Cards - Side by Side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Billing Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Invoice destination</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill to Account</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{proposal.billToAccount}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill to Location</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{proposal.billTo}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Address</label>
                                <p className="text-gray-900 dark:text-white">{proposal.billingAddress}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                                    <p className="text-gray-900 dark:text-white font-mono"> {proposal.paymentTerms}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPO</label>
                                    <p className="text-gray-900 dark:text-white font-mono">{proposal.customerPO}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Book</label>
                                    <p className="text-gray-900 dark:text-white">{proposal.priceBook}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Delivery destination</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ship to Account</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{proposal.shipToAccount}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ship to Location</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{proposal.shipTo}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
                                <p className="text-gray-900 dark:text-white">{proposal.shippingAddress}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested Date</label>
                                    <p className="text-gray-900 dark:text-white">{proposal.requestedDeliveryDate}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Drop-Ship</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${proposal.dropShip ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {proposal.dropShip ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site</label>
                                    <p className="text-gray-900 dark:text-white">{proposal.site}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scope Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scope Summary</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Project Scope and Deliverables Overview</p>
                        </div>
                    </div>

                    <div className="w-full min-h-[120px] px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white leading-relaxed">
                        {proposal.description || "No scope summary provided for this proposal."}
                    </div>
                </div>
            </div>

            {/* Right Column - Proposal Summary (30%) */}
            <div className="lg:col-span-3 flex">
                {/* Proposal Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Proposal Summary</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Review proposal summary</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{proposedProducts.length} Product{proposedProducts.length !== 1 ? 's' : ''} - Subtotal</span>
                            <span className="text-gray-900 dark:text-white font-semibold">${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-700 dark:text-gray-300">Order Processing</span>
                                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-gray-900 dark:text-white">$0.00</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                            <span className="text-gray-900 dark:text-white">${proposal.totalShippingCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Total Taxes</span>
                            <span className="text-gray-900 dark:text-white font-semibold">${proposal.totalTaxesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                            <div className="flex justify-between text-lg font-bold">
                                <span className="text-gray-900 dark:text-white">Grand Total</span>
                                <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Proposal Notes - read-only display */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proposal Notes</label>
                        <div className="w-full flex-1 min-h-[60px] px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white">
                            {proposal.specialTerms || "No special notes for this proposal."}
                        </div>
                    </div>


                    {/* Download PDF Button */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                        <button onClick={handleDownloadPDF} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                    {/* Upload Attachments */}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                            <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Upload Attachments (Max 10MB).Allow pdf, jpeg, png, csv, xls, xlsx, doc,text
                            </span>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </label>
                        {isUploading && <p className="text-xs text-center text-primary mt-1">Uploading...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
