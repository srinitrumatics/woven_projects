"use client";

import React, { useState, useEffect } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import Sidebar from "@/components/layouts/Sidebar";
import { formatNumber } from "@/lib/utils/formatting";

export default function ProfilePage() {
    const { user, selectedAccount } = useUserSession();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [picklists, setPicklists] = useState<any>(null);

    useEffect(() => {
        const fetchPicklists = async () => {
            if (selectedAccount?.Id && user?.Id) {
                try {
                    const res = await fetch(`/api/salesforce/picklists?accountId=${selectedAccount.Id}&contactId=${user.Id}`);
                    const data = await res.json();
                    if (data.success) {
                        setPicklists(data.data?.[0] || null);
                    }
                } catch (error) {
                    console.error("Failed to load picklists:", error);
                }
            }
        };
        fetchPicklists();
    }, [selectedAccount?.Id, user?.Id]);

    // Sync formData with user_details once loaded, but don't overwrite if editing
    useEffect(() => {
        if (user?.user_details && !isEditing) {
            setFormData(user.user_details);
        }
    }, [user?.user_details, isEditing]);

    // Auto-clear success/error messages after 5 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    if (!user) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Sidebar>
        );
    }

    const details = user.user_details || {};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target;
        let value = e.target.value;

        // Sanitize phone numbers: Force remove alphabets and invalid symbols
        if (name === "MobilePhone" || name === "Phone") {
            value = value.replace(/[^0-9\+\-\s\(\)]/g, '');
        }

        // Clear or set field error when user types
        if (name === "MobilePhone" || name === "Phone") {
            if (value && value.trim() !== "") {
                const numericOnly = value.replace(/\D/g, '');
                if (numericOnly.length < 10 || numericOnly.length > 15) {
                    setFieldErrors((prev: any) => ({
                        ...prev,
                        [name]: "Please enter 10-15 digits."
                    }));
                } else {
                    setFieldErrors((prev: any) => {
                        const next = { ...prev };
                        delete next[name];
                        return next;
                    });
                }
            } else {
                // Clear error if empty (handle required check in Save)
                setFieldErrors((prev: any) => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
            }
        } else if (fieldErrors[name]) {
            setFieldErrors((prev: any) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }

        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const validatePhone = (phone: string) => {
        if (!phone || phone.trim() === "") return true;

        // Check for invalid characters (No alphabets allowed)
        const allowedCharsRegex = /^[0-9\+\-\s\(\)]*$/;
        if (!allowedCharsRegex.test(phone)) return false;

        const numericOnly = phone.replace(/\D/g, '');
        return numericOnly.length >= 10 && numericOnly.length <= 15;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure we don't submit if already loading
        if (loading) return;

        setFieldErrors({});
        setMessage({ type: "", text: "" });

        // Calculate all errors fresh
        const errors: any = {};

        // Mobile Phone validation
        if (formData.MobilePhone && formData.MobilePhone.trim() !== "") {
            if (!validatePhone(formData.MobilePhone)) {
                errors.MobilePhone = "Please enter a valid mobile number (10-15 digits).";
            }
        }

        // Work Phone validation (Mandatory)
        if (!formData.Phone || formData.Phone.trim() === "") {
            errors.Phone = "Work Phone is required.";
        } else if (!validatePhone(formData.Phone)) {
            errors.Phone = "Please enter a valid work phone number (10-15 digits).";
        }

        // If any errors exist, STOP here
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setMessage({
                type: "error",
                text: "Please fix the validation errors below."
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/salesforce/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.Id,
                    ...formData
                })
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                setIsEditing(false);

                // Refresh session data globally
                const sessionRes = await fetch('/api/auth/session');
                const sessionData = await sessionRes.json();
                if (sessionData.authenticated) {
                    // This will update the context state
                    setTimeout(() => window.location.reload(), 5000);
                }
            } else {
                setMessage({ type: "error", text: result.error || "Failed to update profile." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sidebar>
            <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-screen">
                <div className="mb-0">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage your personal information and contact details.</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 flex flex-col items-center text-center sticky top-6">
                                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative group">
                                    <span className="text-4xl font-bold text-primary">
                                        {details.Name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                    </span>
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{details.Name}</h2>
                                <p className="text-primary font-medium mb-4">{details.Title || 'Member'}</p>

                                <div className="w-full pt-6 border-t border-gray-100 dark:border-slate-800 mt-2 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Department</span>
                                        <span className="text-gray-900 dark:text-gray-300">{details.Department || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Account</span>
                                        <span className="text-gray-900 dark:text-gray-300">{details.Account_Name || selectedAccount?.Name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Role</span>
                                        <span className="text-gray-900 dark:text-gray-300">{user.role || 'Member'}</span>
                                    </div>
                                </div>

                                <div className={`w-full mt-8 ${isEditing ? 'invisible pointer-events-none' : 'visible'}`}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-2.5 px-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden text-sm h-full">
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
                                            {!isEditing && (
                                                <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full ">Active</span>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                                            <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent opacity-70">{details.Name}</p>
                                            {isEditing && <p className="text-xs text-gray-400 mt-1 ml-1 italic">* Name cannot be modified</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="Title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                                            {isEditing ? (
                                                <select
                                                    id="Title"
                                                    name="Title"
                                                    value={formData.Title || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                >
                                                    <option value="">Select Title</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Director">Director</option>
                                                    <option value="Senior Manager">Senior Manager</option>
                                                    <option value="VP">VP</option>
                                                    <option value="Associate">Associate</option>
                                                    <option value="Coordinator">Coordinator</option>
                                                </select>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.Title || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                            <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent opacity-70">{details.Email}</p>
                                            <p className="text-xs text-gray-400 mt-1 ml-1 italic">* Email cannot be modified</p>
                                        </div>

                                        <div>
                                            <label htmlFor="MobilePhone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mobile Phone</label>
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        type="tel"
                                                        id="MobilePhone"
                                                        name="MobilePhone"
                                                        placeholder="(555) 000-0000"
                                                        value={formData.MobilePhone || ''}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.MobilePhone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                                                    />
                                                    {fieldErrors.MobilePhone && (
                                                        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{fieldErrors.MobilePhone}</p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.MobilePhone || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="Phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Work Phone <span className="text-red-500">*</span>
                                            </label>
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        type="tel"
                                                        id="Phone"
                                                        name="Phone"
                                                        placeholder="(555) 000-0000"
                                                        value={formData.Phone || ''}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.Phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                                                    />
                                                    {fieldErrors.Phone && (
                                                        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{fieldErrors.Phone}</p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.Phone || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="Birthdate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Birthdate</label>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    id="Birthdate"
                                                    name="Birthdate"
                                                    value={formData.Birthdate || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.Birthdate || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mailing Address Card */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden text-sm">
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="md:col-span-2 lg:col-span-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0">Mailing Address</h3>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-4">
                                            <label htmlFor="MailingStreet" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="MailingStreet"
                                                    name="MailingStreet"
                                                    value={formData.MailingStreet || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.MailingStreet || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="MailingCity" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="MailingCity"
                                                    name="MailingCity"
                                                    value={formData.MailingCity || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.MailingCity || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="MailingState" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">State / Province</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="MailingState"
                                                    name="MailingState"
                                                    value={formData.MailingState || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.MailingState || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="MailingPostalCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="MailingPostalCode"
                                                    name="MailingPostalCode"
                                                    value={formData.MailingPostalCode || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.MailingPostalCode || 'N/A'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="MailingCountry" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="MailingCountry"
                                                    name="MailingCountry"
                                                    value={formData.MailingCountry || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent">{details.MailingCountry || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="px-8 py-6 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData(details);
                                                setMessage({ type: "", text: "" });
                                            }}
                                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Saving...
                                                </>
                                            ) : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Sidebar>
    );
}
