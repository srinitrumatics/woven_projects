import { Proposal } from "../types";

interface BillingInfoProps {
    proposal: Proposal;
}

export default function BillingInfo({ proposal }: BillingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Destination</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Bill to Account</label>
                        <p className="text-gray-900 dark:text-white font-medium truncate" title={proposal.billToAccount}>{proposal.billToAccount}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Bill to Location</label>
                        <p className="text-gray-900 dark:text-white font-medium truncate" title={proposal.billTo}>{proposal.billTo}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Address</label>
                    <p className="text-gray-900 dark:text-white">{proposal.billingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Payment Terms</label>
                        <p className="text-gray-900 dark:text-white font-mono truncate" title={proposal.paymentTerms}> {proposal.paymentTerms}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">CPO</label>
                        <p className="text-gray-900 dark:text-white font-mono truncate" title={proposal.customerPO}>{proposal.customerPO}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">Price Book</label>
                    <p className="text-gray-900 dark:text-white truncate" title={proposal.priceBook}>{proposal.priceBook}</p>
                </div>
            </div>
        </div>
    );
}
