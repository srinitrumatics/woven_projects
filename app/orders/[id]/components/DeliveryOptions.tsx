"use client";

import { ShippingMethodOption } from "../../types";

interface DeliveryOptionsProps {
    formData: any;
    setFormData: (data: any) => void;
    shippingMethods?: ShippingMethodOption[];
    incotermsOptions?: ShippingMethodOption[];
    isEditing?: boolean;
}

export default function DeliveryOptions({ formData, setFormData, shippingMethods = [], incotermsOptions = [], isEditing = false }: DeliveryOptionsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-auto h-[175px]">
            <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Options</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Previously Stored Location Delivery Details</p>
                </div>
            </div>
            <div className="px-6 pb-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Shipping Method</label>
                        <select
                            value={formData.shippingMethod || ''}
                            onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        >
                            <option value="">Select Shipping Method</option>
                            {formData.shippingMethod && !["Best Way", "Ground", "2nd Day Air", "Overnight", "Freight", "Customer Account", "Pick Up"].includes(formData.shippingMethod) && (
                                <option value={formData.shippingMethod}>{formData.shippingMethod}</option>
                            )}
                            {shippingMethods.length > 0 ? (
                                <>
                                    {shippingMethods.map((method) => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* Fallback hardcoded options if no API data */}
                                    <option value="Best Way">Best Way</option>
                                    <option value="Ground">Ground</option>
                                    <option value="2nd Day Air">2nd Day Air</option>
                                    <option value="Overnight">Overnight</option>
                                    <option value="Freight">Freight</option>
                                    <option value="Customer Account">Customer Account</option>
                                    <option value="Pick Up">Pick Up</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Incoterms</label>
                        <select
                            value={formData.incoterms || ''}
                            onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        >
                            <option value="">Select Incoterms</option>
                            {formData.incoterms && !incotermsOptions.some(opt => opt.value === formData.incoterms) && (
                                <option value={formData.incoterms}>{formData.incoterms}</option>
                            )}
                            {incotermsOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Delivery Notes</label>
                        <input
                            type="text"
                            placeholder="Special delivery instructions..."
                            value={formData.deliveryNotes || ''}
                            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                            readOnly={true}
                            className={`w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 ${!isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Lift Gate</label>
                        <div className="flex items-center h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                            <input
                                type="checkbox"
                                checked={formData.liftGateRequired}
                                disabled={true}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3 cursor-not-allowed opacity-60"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{formData.liftGateRequired ? "Required" : "Not Required"}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Inside Delivery</label>
                        <div className="flex items-center h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                            <input
                                type="checkbox"
                                checked={formData.insideDelivery}
                                disabled={true}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3 cursor-not-allowed opacity-60"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{formData.insideDelivery ? "Required" : "Not Required"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
