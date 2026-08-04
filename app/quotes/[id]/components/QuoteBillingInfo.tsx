import { QuoteDetails } from"../../types";
import ReadOnlyField from "@/components/ui/ReadOnlyField";

interface QuoteBillingInfoProps {
    quote: QuoteDetails;
}

export default function QuoteBillingInfo({ quote }: QuoteBillingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"/>
                    </svg>
                </div>
                <div className="min-win-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400"title="Invoice Destination">Invoice Destination</p>
                </div>
            </div>


            <div className="text-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Bill to Account" value={quote.billToAccount} />
                        <ReadOnlyField label="Bill to Location" value={quote.billToLocation} />
                    </div>

                    <ReadOnlyField label="Billing Address" value={quote.billingAddress} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ReadOnlyField label="Payment Terms" value={quote.paymentTerms} />
                        <ReadOnlyField label="Customer PO" value={quote.customerPO} />
                        <ReadOnlyField label="Price Book" value={quote.priceBook} />
                    </div>
                </div>
            </div>
        </div>
    );
}
