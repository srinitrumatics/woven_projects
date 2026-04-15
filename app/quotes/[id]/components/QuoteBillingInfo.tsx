import { QuoteDetails } from "../../types";

interface QuoteBillingInfoProps {
    quote: QuoteDetails;
}

export default function QuoteBillingInfo({ quote }: QuoteBillingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <div className="min-win-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white ">Billing Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Invoice Destination">Invoice Destination</p>
                </div>
            </div>


            <div className="text-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Account">Bill to Account</label>
                            <input type="text" readOnly value={quote.billToAccount} title={quote.billToAccount} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Location">Bill to Location</label>
                            <input type="text" readOnly value={quote.billToLocation} title={quote.billToLocation} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billing Address">Billing Address</label>
                        <input type="text" readOnly value={quote.billingAddress} title={quote.billingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Payment Terms">Payment Terms</label>
                            <input type="text" readOnly value={quote.paymentTerms} title={quote.paymentTerms} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer PO">Customer PO</label>
                            <input type="text" readOnly value={quote.customerPO} title={quote.customerPO} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Price Book">Price Book</label>
                            <input type="text" readOnly value={quote.priceBook} title={quote.priceBook} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
