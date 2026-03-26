"use client";

import React, { useState, useEffect } from "react";
import { AuthorizeLocation } from "../types";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    location?: AuthorizeLocation | null;
    mode: "add" | "edit" | "view";
    onSave?: (data: Partial<AuthorizeLocation>) => void;
    locationTypes?: string[];
    addressTypes?: string[];
}

const USA_STATES = [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
];

export default function LocationModal({
    isOpen,
    onClose,
    location,
    mode,
    onSave,
    locationTypes = [],
    addressTypes = []
}: LocationModalProps) {
    const [formData, setFormData] = useState<Partial<AuthorizeLocation>>({
        name: "",
        addressType: "",
        locationId: "",
        locationType: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        liftGate: false,
        insideDelivery: false,
        deliveryNotes: "",
        status: "Active",
    });

    useEffect(() => {
        if (location && (mode === "edit" || mode === "view")) {
            // Map state name back to code if possible for the dropdown
            const stateMatch = USA_STATES.find(s =>
                s.name.toLowerCase() === (location.state || "").toLowerCase() ||
                s.code.toLowerCase() === (location.state || "").toLowerCase()
            );

            setFormData({
                name: location.name || "",
                addressType: location.addressType || "",
                locationId: location.locationId || "",
                locationType: location.locationType || "",
                street: location.street || "",
                city: location.city || "",
                state: stateMatch ? stateMatch.code : (location.state || ""),
                zipCode: location.zipCode || "",
                country: location.country || "",
                liftGate: !!location.liftGate,
                insideDelivery: !!location.insideDelivery,
                deliveryNotes: location.deliveryNotes || "",
                status: location.status || "Active",
            });
        } else if (mode === "add") {
            setFormData({
                name: "",
                addressType: "",
                locationId: "",
                locationType: "",
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "US",
                liftGate: false,
                insideDelivery: false,
                deliveryNotes: "",
                status: "Active",
            });
        }
    }, [location, mode, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const title = mode === "add" ? "Add Authorize Location" : mode === "edit" ? "Edit Authorize Location" : "View Authorize Location";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={title}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors truncate"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (onSave) {
                            onSave(formData);
                        }
                    }}
                    className="flex-1 overflow-y-auto flex flex-col"
                >
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Authorize Location Name <span className="text-red-500 truncate">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50 truncate"
                                    placeholder="Enter location name" title={String(formData.name ?? '')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Location ID <span className="text-red-500 truncate">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="locationId"
                                    value={formData.locationId}
                                    onChange={handleChange}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50 truncate"
                                    placeholder="Enter location ID" title={String(formData.locationId ?? '')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Location Type <span className="text-red-500 truncate">*</span>
                                </label>
                                <select
                                    name="locationType"
                                    value={formData.locationType}
                                    onChange={handleChange as any}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50"
                                >
                                    <option value="">Select Location Type</option>
                                    {locationTypes.map((type, index) => {
                                        const val = typeof type === 'object' ? (type as any).value || (type as any).label : type;
                                        const lab = typeof type === 'object' ? (type as any).label || (type as any).value : type;
                                        return <option key={val || index} value={val}>{lab}</option>;
                                    })}
                                    {formData.locationType && !locationTypes.some(t => (typeof t === 'object' ? (t as any).value : t) === formData.locationType) && (
                                        <option value={formData.locationType}>{formData.locationType}</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Address Type <span className="text-red-500 truncate">*</span>
                                </label>
                                <select
                                    name="addressType"
                                    value={formData.addressType}
                                    onChange={handleChange as any}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50"
                                >
                                    <option value="">Select Address Type</option>
                                    {addressTypes.map((type, index) => {
                                        const val = typeof type === 'object' ? (type as any).value || (type as any).label : type;
                                        const lab = typeof type === 'object' ? (type as any).label || (type as any).value : type;
                                        return <option key={val || index} value={val}>{lab}</option>;
                                    })}
                                    {formData.addressType && !addressTypes.some(t => (typeof t === 'object' ? (t as any).value : t) === formData.addressType) && (
                                        <option value={formData.addressType}>{formData.addressType}</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Street <span className="text-red-500 truncate">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50 truncate"
                                    placeholder="Enter street address" title={String(formData.street ?? '')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    City <span className="text-red-500 truncate">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50 truncate"
                                    placeholder="Enter city" title={String(formData.city ?? '')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    State <span className="text-red-500 truncate">*</span>
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange as any}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50"
                                >
                                    <option value="">Select State</option>
                                    {USA_STATES.map((state) => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                    {formData.state && !USA_STATES.some(s => s.code === formData.state) && (
                                        <option value={formData.state}>{formData.state}</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Zipcode <span className="text-red-500 truncate">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    disabled={mode === "view"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50 truncate"
                                    placeholder="Enter zipcode" title={String(formData.zipCode ?? '')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value="US"
                                    disabled={true}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:disabled:bg-gray-900/50 text-gray-500 outline-none cursor-not-allowed truncate"
                                    placeholder="US"
                                />
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                        Status <span className="text-red-500 truncate">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange as any}
                                        disabled={mode === "view"}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 pb-3 min-w-0">
                                    <input
                                        type="checkbox"
                                        id="liftGate"
                                        name="liftGate"
                                        checked={formData.liftGate}
                                        onChange={handleChange}
                                        disabled={mode === "view"}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary truncate"
                                    />
                                    <label htmlFor="liftGate" className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                        Lift Gate
                                    </label>
                                </div>

                                <div className="flex items-center gap-2 pb-3 min-w-0">
                                    <input
                                        type="checkbox"
                                        id="insideDelivery"
                                        name="insideDelivery"
                                        checked={formData.insideDelivery}
                                        onChange={handleChange}
                                        disabled={mode === "view"}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary truncate"
                                    />
                                    <label htmlFor="insideDelivery" className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                        Inside Delivery
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                                    Delivery Note
                                </label>
                                <textarea
                                    name="deliveryNotes"
                                    value={formData.deliveryNotes}
                                    onChange={handleChange}
                                    disabled={mode === "view"}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900/50 resize-none"
                                    placeholder="Enter delivery notes"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm truncate"
                        >
                            {mode === "view" ? "Close" : "Cancel"}
                        </button>
                        {mode !== "view" && (
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm truncate"
                            >
                                Save Location
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
