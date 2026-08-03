"use client";

import { useState, useEffect } from "react";
import { DeliveryWindow } from "../types";
import Modal from "@/components/ui/Modal";

interface DeliveryWindowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    locationId: string;
    initialData?: any;
    existingWindows: DeliveryWindow[];
    dayOfWeekPicklist?: string[];
    title: string;
}


interface TimePickerProps {
    value: string;
    onChange: (newValue: string) => void;
    label: string;
}

function TimePicker({ value, onChange, label }: TimePickerProps) {
    // Parse HH:mm:ss to 12h format
    const [hours24, minutes] = value.split(':');
    let h24 = parseInt(hours24 || "0", 10);
    const m = minutes || "00";
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    h12 = h12 === 0 ? 12 : h12;

    const handleTimeChange = (type: 'h' | 'm' | 'p', val: string) => {
        let newH = h12;
        let newM = m;
        let newP = ampm;

        if (type === 'h') newH = parseInt(val, 10);
        if (type === 'm') newM = val;
        if (type === 'p') newP = val;

        // Convert back to 24h
        let h24Final = newH;
        if (newP === 'PM' && newH < 12) h24Final += 12;
        if (newP === 'AM' && newH === 12) h24Final = 0;

        const hStr = h24Final.toString().padStart(2, '0');
        onChange(`${hStr}:${newM}:00`);
    };

    return (
        <div className="flex flex-col gap-2 min-w-0">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</label>
            <div className="flex items-center gap-2 min-w-0">
                <select
                    value={h12}
                    onChange={(e) => handleTimeChange('h', e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                    ))}
                </select>
                <span className="text-gray-400 truncate">:</span>
                <select
                    value={m}
                    onChange={(e) => handleTimeChange('m', e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                >
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                        <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                    ))}
                </select>
                <select
                    value={ampm}
                    onChange={(e) => handleTimeChange('p', e.target.value)}
                    className="w-40 px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
}

export default function DeliveryWindowModal({
    isOpen,
    onClose,
    onSave,
    locationId,
    initialData,
    existingWindows,
    dayOfWeekPicklist = [],
    title
}: DeliveryWindowModalProps) {
    const [formData, setFormData] = useState({
        Authorized_Ship_To_Location__c: locationId,
        Day_of_Week__c: "Monday",
        WindowStart__c: "09:00:00",
        WindowEnd__c: "17:00:00",
        Open_24_Hours__c: false,
        Receive_on_Federal_Holidays__c: false,
        Closed_for_Deliveries__c: false,
        Delivery_Notes__c: "",
        Active__c: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const cleanTime = (timeStr: string) => {
            if (!timeStr) return "";
            return timeStr.split('.')[0].replace('Z', '');
        };

        if (initialData) {
            setFormData({
                Authorized_Ship_To_Location__c: locationId,
                Day_of_Week__c: initialData.dayOfWeek || "Monday",
                WindowStart__c: cleanTime(initialData.windowStart || "09:00:00"),
                WindowEnd__c: cleanTime(initialData.windowEnd || "17:00:00"),
                Open_24_Hours__c: !!initialData.open24Hours,
                Receive_on_Federal_Holidays__c: !!initialData.receiveOnFederalHolidays,
                Closed_for_Deliveries__c: !!initialData.closedForDeliveries,
                Delivery_Notes__c: initialData.deliveryNotes || "",
                Active__c: !!initialData.active
            });
        } else {
            setFormData({
                Authorized_Ship_To_Location__c: locationId,
                Day_of_Week__c: "Monday",
                WindowStart__c: "09:00:00",
                WindowEnd__c: "17:00:00",
                Open_24_Hours__c: false,
                Receive_on_Federal_Holidays__c: false,
                Closed_for_Deliveries__c: false,
                Delivery_Notes__c: "",
                Active__c: true
            });
        }
    }, [initialData, isOpen, locationId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTimeChange = (name: 'WindowStart__c' | 'WindowEnd__c', value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation 1: Window start must be before window end
        if (formData.WindowStart__c >= formData.WindowEnd__c) {
            setError("Window Start must be before Window End.");
            return;
        }

        // Validation 2: Overlap check
        const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
            // HH:mm:ss comparison works direct with strings
            return start1 < end2 && start2 < end1;
        };

        const hasOverlap = existingWindows.some(dw =>
            dw.dayOfWeek === formData.Day_of_Week__c &&
            (initialData ? dw.id !== initialData.id : true) &&
            isOverlapping(formData.WindowStart__c, formData.WindowEnd__c, dw.windowStart, dw.windowEnd)
        );

        if (hasOverlap) {
            setError(`This delivery window overlaps with an existing window on ${formData.Day_of_Week__c}.`);
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving delivery window:", error);
            setError("Failed to save delivery window. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="md"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium truncate"
                    >
                        Cancel
                    </button>
                    <button
                        form="delivery-window-modal-form"
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-md flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            "Save Window"
                        )}
                    </button>
                </>
            }
        >
                <form id="delivery-window-modal-form" onSubmit={handleSubmit}>
                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-300 flex justify-between items-center">
                            <span>{error}</span>
                            <button 
                                type="button" 
                                onClick={() => setError(null)}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Day of Week */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 truncate">Day of Week</label>
                            <select
                                name="Day_of_Week__c"
                                value={formData.Day_of_Week__c}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                required
                            >
                                {dayOfWeekPicklist.map((day, index) => {
                                    const val = typeof day === 'object' ? (day as any).value || (day as any).label : day;
                                    const lab = typeof day === 'object' ? (day as any).label || (day as any).value : day;
                                    return <option key={val || index} value={val}>{lab}</option>;
                                })}
                                {formData.Day_of_Week__c && !dayOfWeekPicklist.some(d => (typeof d === 'object' ? (d as any).value : d) === formData.Day_of_Week__c) && (
                                    <option value={formData.Day_of_Week__c}>{formData.Day_of_Week__c}</option>
                                )}
                            </select>
                        </div>

                        {/* Window Start */}
                        <TimePicker
                            label="Window Start Time"
                            value={formData.WindowStart__c}
                            onChange={(val) => handleTimeChange('WindowStart__c', val)}
                        />

                        {/* Window End */}
                        <TimePicker
                            label="Window End Time"
                            value={formData.WindowEnd__c}
                            onChange={(val) => handleTimeChange('WindowEnd__c', val)}
                        />

                        {/* Toggles */}
                        <div className="space-y-4 col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="flex items-center gap-3 cursor-pointer group truncate">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="Open_24_Hours__c"
                                        checked={formData.Open_24_Hours__c}
                                        onChange={handleChange}
                                        className="sr-only truncate"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${formData.Open_24_Hours__c ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.Open_24_Hours__c ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Open 24 Hours</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group truncate">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="Receive_on_Federal_Holidays__c"
                                        checked={formData.Receive_on_Federal_Holidays__c}
                                        onChange={handleChange}
                                        className="sr-only truncate"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${formData.Receive_on_Federal_Holidays__c ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.Receive_on_Federal_Holidays__c ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Receive on Federal Holidays</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group truncate">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="Closed_for_Deliveries__c"
                                        checked={formData.Closed_for_Deliveries__c}
                                        onChange={handleChange}
                                        className="sr-only truncate"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${formData.Closed_for_Deliveries__c ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.Closed_for_Deliveries__c ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Closed for Deliveries</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group truncate">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="Active__c"
                                        checked={formData.Active__c}
                                        onChange={handleChange}
                                        className="sr-only truncate"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${formData.Active__c ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.Active__c ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Active</span>
                            </label>
                        </div>

                        {/* Delivery Notes */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 truncate">Delivery Notes</label>
                            <textarea
                                name="Delivery_Notes__c"
                                value={formData.Delivery_Notes__c}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Add any special instructions..."
                            />
                        </div>
                    </div>
                </form>
        </Modal>
    );
}
