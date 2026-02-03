"use client";

import { AuthorizedLocation } from "@/app/orders/types";

interface BillingInfoProps {
    formData: any;
    setFormData: (data: any) => void;
    shipLocations: AuthorizedLocation[];
    handleBillToChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    isEditing?: boolean;
}
export default function BillingInfo({ formData, setFormData, shipLocations, handleBillToChange, isEditing = false }: BillingInfoProps) {
    //console.log('billinginfo page', formData);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
            <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Destination</p>
                </div>
            </div>

            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bill to Account
                        </label>
                        <input
                            type="text"
                            value={formData.billToAccountName || ''}
                            readOnly
                            disabled
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bill to Location <span className="text-red-500">*</span>
                        </label>
                        <select name="billTo"
                            value={formData.billTo || ''}
                            onChange={handleBillToChange}
                            disabled={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
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

                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Billing Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.billingAddress || ''}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            readOnly={isEditing === false}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Customer PO <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter PO number"
                            value={formData.purchaseOrder || ''}
                            onChange={(e) => setFormData({ ...formData, purchaseOrder: e.target.value })}
                            readOnly={isEditing === false}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Terms</label>
                        <select
                            value={formData.paymentTerms || ''}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                            disabled
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                        >
                            {formData.paymentTerms && !["Net 30", "Net 45", "Net 60", "Due on Receipt"].includes(formData.paymentTerms) && (
                                <option value={formData.paymentTerms}>{formData.paymentTerms}</option>
                            )}
                            <option value="">Select Terms</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Net 45">Net 45</option>
                            <option value="Net 60">Net 60</option>
                            <option value="Due on Receipt">Due on Receipt</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Book</label>
                        <input
                            type="text"
                            name="priceBook"
                            value={formData.priceBook || ''}
                            readOnly
                            disabled
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
