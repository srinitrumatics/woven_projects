"use client";

import { Contact } from "@/app/orders/types";

interface ShipToContactProps {
    shipContacts: Contact[];
    contactsLoading: boolean;
    selectedContactId: string;
    handleContactSelect: (contactId: string) => void;
    formData: any;
    setFormData: (data: any) => void;
    isEditing?: boolean;
}

export default function ShipToContact({
    shipContacts,
    contactsLoading,
    selectedContactId,
    handleContactSelect,
    formData,
    setFormData,
    isEditing = false
}: ShipToContactProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-[200px] overflow-hidden">
            <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ship to Contact</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Who Should We Contact About This Delivery?</p>
                </div>
            </div>
            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Contact Selection Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Contact
                        </label>
                        <select
                            value={selectedContactId}
                            onChange={(e) => handleContactSelect(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        >
                            <option value="">Select a contact...</option>
                            {contactsLoading ? (
                                <option>Loading contacts...</option>
                            ) : shipContacts.length === 0 ? (
                                <option>No contacts found</option>
                            ) : (
                                shipContacts.map(contact => (
                                    <option key={contact.Id} value={contact.Id}>
                                        {contact.Name} - {contact.Email}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Full name"
                            value={formData.locationContact}
                            onChange={(e) => setFormData({ ...formData, locationContact: e.target.value })}
                            readOnly={!isEditing}
                            className={`w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            readOnly={!isEditing}
                            className={`w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="contact@example.com"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            readOnly={!isEditing}
                            className={`w-full h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
