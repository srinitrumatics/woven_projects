import { QuoteDetails } from "../../types";

interface QuoteBillingInfoProps {
    quote: QuoteDetails;
}

export default function QuoteBillingInfo({ quote }: QuoteBillingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Destination</p>
            </div>

            <div className="text-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Account">Bill to Account</label>
                            <input type="text" disabled value={quote.billToAccount} title={quote.billToAccount} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Location">Bill to Location</label>
                            <input type="text" disabled value={quote.billToLocation} title={quote.billToLocation} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billing Address">Billing Address</label>
                        <input type="text" disabled value={quote.billingAddress} title={quote.billingAddress} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Payment Terms">Payment Terms</label>
                            <input type="text" disabled value={quote.paymentTerms} title={quote.paymentTerms} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer PO">Customer PO</label>
                            <input type="text" disabled value={quote.customerPO} title={quote.customerPO} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Price Book">Price Book</label>
                            <input type="text" disabled value={quote.priceBook} title={quote.priceBook} className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm truncate" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
