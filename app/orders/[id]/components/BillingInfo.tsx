"use client";

import { AuthorizedLocation } from "@/app/orders/types";

interface BillingInfoProps {
    formData: any;
    setFormData: (data: any) => void;
    shipLocations: AuthorizedLocation[];
    handleBillToChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    isEditing?: boolean;
    accountName?: string;
    SF_ACCOUNT_ID?: string;
}
export default function BillingInfo({ formData, setFormData, shipLocations, handleBillToChange, isEditing = false, accountName = '', SF_ACCOUNT_ID = '' }: BillingInfoProps) {
    const billToAccountDisplay = (() => {
        // 1. Try to find name in shipLocations for the current location
        const location = formData.billTo === 'same'
            ? shipLocations.find(l => l.Id === formData.shipTo)
            : shipLocations.find(l => l.Id === formData.billTo);

        const relationshipName = location?.Account_Name__r?.Name || (location as any)?.['Account_Name__r.Name'] || (location as any)?.Account_Name_Name;
        if (relationshipName) return relationshipName;

        const isContextAccount = location?.Account_Name__c && SF_ACCOUNT_ID && location.Account_Name__c.substring(0, 15) === SF_ACCOUNT_ID.substring(0, 15);
        if (isContextAccount && accountName && !accountName.startsWith('001')) return accountName;

        // 2. If formData already has a non-ID name, use it
        if (formData.billToAccountName && !formData.billToAccountName.startsWith('001')) {
            return formData.billToAccountName;
        }

        // 3. Try to find the name in any other location that shares the same Account ID
        if (location?.Account_Name__c) {
            const otherLoc = shipLocations.find(l =>
                l.Account_Name__c &&
                l.Account_Name__c.substring(0, 15) === location.Account_Name__c.substring(0, 15) &&
                (l.Account_Name__r?.Name || (l as any)['Account_Name__r.Name'] || (l as any).Account_Name_Name)
            );
            const otherName = otherLoc?.Account_Name__r?.Name || (otherLoc as any)?.['Account_Name__r.Name'] || (otherLoc as any)?.Account_Name_Name;
            if (otherName) return otherName;
        }

        // 4. Fallback to ID if we absolutely cannot resolve a name
        return formData.billToAccountName || location?.Account_Name__c || '';
    })() || '';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">Billing Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Invoice Destination">Invoice Destination</p>
                </div>
            </div>

            <div className="text-sm">
                <div className="grid grid-cols-1 w1025:grid-cols-6 gap-4">
                    <div className="w1025:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Account">
                            Bill to Account
                        </label>
                        <input
                            type="text"
                            value={billToAccountDisplay}
                            readOnly
                            disabled
                            title={billToAccountDisplay}
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400  truncate"
                        />
                    </div>

                    <div className="w1025:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Bill to Location">
                            Bill to Location <span className="text-red-500 truncate">*</span>
                        </label>
                        <select name="billTo"
                            value={formData.billTo || ''}
                            onChange={handleBillToChange}
                            disabled={!isEditing}
                            className={`w-full h-11 px-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'}`}
                        >
                            <option key="select-bill" value="">Select a location...</option>
                            <option key="same-as-shipping" value="same">Same as Shipping</option>
                            {shipLocations.map(location => (
                                <option key={location.Id} value={location.Id}>
                                    {location.Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w1025:col-span-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Billing Address">
                            Billing Address <span className="text-red-500 truncate">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.billingAddress || ''}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            readOnly={true}
                            title={formData.billingAddress || ''}
                            className={`w-full h-11 px-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all truncate cursor-text ${!isEditing ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'}`}
                        />
                    </div>
                    <div className="w1025:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Payment Terms">Payment Terms</label>
                        <input
                            type="text"
                            value={formData.paymentTerms || ''}
                            readOnly
                            title={formData.paymentTerms || ''}
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400  truncate"
                        />
                    </div>
                    <div className="w1025:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Customer PO">
                            Customer PO <span className="text-red-500 truncate">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter PO number"
                            value={formData.purchaseOrder || ''}
                            onChange={(e) => setFormData({ ...formData, purchaseOrder: e.target.value })}
                            readOnly={isEditing === false}
                            title={formData.purchaseOrder || ''}
                            className={`w-full h-11 px-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 truncate cursor-text ${!isEditing ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'}`}
                        />
                    </div>



                    <div className="w1025:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Price Book">Price Book</label>
                        <input
                            type="text"
                            name="priceBook"
                            value={formData.priceBook || ''}
                            readOnly
                            title={formData.priceBook || ''}
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400 truncate"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
