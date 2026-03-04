"use client";

import { formatDate } from "@/lib/utils/formatting";
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Destination</p>
            </div>

            <div className="text-sm">
                <div className="grid grid-cols-1 w1025:grid-cols-6 gap-4">
                    <div className="w1025:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship to Account">
                            Ship to Account
                        </label>
                        <input
                            type="text"
                            value={(() => {
                                const location = shipLocations.find(l => l.Id === formData.shipTo);

                                const relationshipName = location?.Account_Name__r?.Name || (location as any)?.['Account_Name__r.Name'] || (location as any)?.Account_Name_Name;
                                if (relationshipName) return relationshipName;

                                const isContextAccount = location?.Account_Name__c && SF_ACCOUNT_ID && location.Account_Name__c.substring(0, 15) === SF_ACCOUNT_ID.substring(0, 15);
                                if (isContextAccount && accountName && !accountName.startsWith('001')) return accountName;

                                if (formData.shipToAccountName && !formData.shipToAccountName.startsWith('001')) {
                                    return formData.shipToAccountName;
                                }

                                if (location?.Account_Name__c) {
                                    const otherLoc = shipLocations.find(l =>
                                        l.Account_Name__c &&
                                        l.Account_Name__c.substring(0, 15) === location.Account_Name__c.substring(0, 15) &&
                                        (l.Account_Name__r?.Name || (l as any)['Account_Name__r.Name'] || (l as any).Account_Name_Name)
                                    );
                                    const otherName = otherLoc?.Account_Name__r?.Name || (otherLoc as any)?.['Account_Name__r.Name'] || (otherLoc as any)?.Account_Name_Name;
                                    if (otherName) return otherName;
                                }

                                const finalDisplay = formData.shipToAccountName || location?.Account_Name__c || '';
                                return finalDisplay;
                            })() || ''}
                            readOnly
                            disabled
                            className="w-full h-11 px-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed truncate"
                        />
                    </div>

                    <div className="w1025:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Ship to Location">
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

                    <div className="w1025:col-span-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Shipping Address">
                            Shipping Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.shippingAddress || ''}
                            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                            readOnly={true}
                            title={formData.shippingAddress || ''}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all truncate ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div className="w1025:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Request Date">
                            Request Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type={isEditing ? "date" : "text"}
                            value={isEditing ? (formData.requestedDeliveryDate || '') : formatDate(formData.requestedDeliveryDate, 'numeric-dash')}
                            onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                            readOnly={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all truncate ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div className="w1025:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Drop-Ship">Drop-Ship</label>
                        <div className={`flex items-center h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}>
                            <input
                                type="checkbox"
                                checked={formData.dropShip}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, dropShip: e.target.checked })}
                                className={`w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3 ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{formData.dropShip ? "Required" : "Not Required"}</span>
                        </div>
                    </div>

                    <div className="w1025:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate" title="Site">Site</label>
                        <input
                            placeholder="Site"
                            type="text"
                            name="site"
                            value={formData.site || ''}
                            readOnly
                            title={formData.site || ''}
                            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all truncate ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
