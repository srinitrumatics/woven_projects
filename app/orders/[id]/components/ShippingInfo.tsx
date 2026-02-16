"use client";

import { AuthorizedLocation } from "@/app/orders/types";

interface ShippingInfoProps {
    formData: any;
    setFormData: (data: any) => void;
    shipLocations: AuthorizedLocation[];
    locationsLoading: boolean;
    handleLocationSelect: (location: AuthorizedLocation) => void;
    isEditing?: boolean;
    accountName?: string;
    SF_ACCOUNT_ID?: string;
}

export default function ShippingInfo({ formData, setFormData, shipLocations, locationsLoading, handleLocationSelect, isEditing = false, accountName = '', SF_ACCOUNT_ID = '' }: ShippingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
            <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Destination</p>
                </div>
            </div>

            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ship to Account
                        </label>
                        <input
                            type="text"
                            value={(() => {
                                // 1. Try to find name in shipLocations for the current location
                                const location = shipLocations.find(l => l.Id === formData.shipTo);

                                if (location?.Account_Name__r?.Name) return location.Account_Name__r.Name;
                                if (location?.Account_Name__c === SF_ACCOUNT_ID && accountName) return accountName;

                                // 2. If formData already has a non-ID name, use it
                                if (formData.shipToAccountName && !formData.shipToAccountName.startsWith('001')) {
                                    return formData.shipToAccountName;
                                }

                                // 3. Try to find the name in any other location that shares the same Account ID
                                if (location?.Account_Name__c) {
                                    const otherLoc = shipLocations.find(l => l.Account_Name__c === location.Account_Name__c && l.Account_Name__r?.Name);
                                    if (otherLoc?.Account_Name__r?.Name) return otherLoc.Account_Name__r.Name;
                                }

                                // 4. Fallback to ID if we absolutely cannot resolve a name
                                return formData.shipToAccountName || location?.Account_Name__c || '';
                            })() || ''}
                            readOnly
                            disabled
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ship to Location <span className="text-red-500">*</span>
                        </label>
                        <select name="shipTo"
                            value={formData.shipTo}
                            onChange={(e) => {
                                const selectedLoc = shipLocations.find(l => l.Id === e.target.value);
                                if (selectedLoc) {
                                    handleLocationSelect(selectedLoc);
                                } else {
                                    setFormData({ ...formData, shipTo: e.target.value });
                                }
                            }}
                            disabled={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        >
                            <option key="select-ship" value="">Select a location...</option>
                            {locationsLoading ? (
                                <option key="loading">Loading locations...</option>
                            ) : shipLocations.length === 0 ? (
                                <option key="no-locations">No locations found. Please add a ship-to location.</option>
                            ) : (
                                shipLocations.map(location => (
                                    <option key={location.Id} value={location.Id}>
                                        {location.Name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>


                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shipping Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.shippingAddress || ''}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                            readOnly={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Request Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.requestedDeliveryDate || ''}
                            onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                            readOnly={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drop-Ship</label>
                        <div className={`flex items-center h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}>
                            <input
                                type="checkbox"
                                checked={formData.dropShip}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, dropShip: e.target.checked })}
                                className={`w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3 ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{formData.dropShip ? "Required" : "Not Required"}</span>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site</label>
                        <input
                            placeholder="Site"
                            type="text"
                            name="site"
                            value={formData.site || ''}
                            readOnly={!isEditing}
                            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
