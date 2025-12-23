"use client";

interface DeliveryOptionsProps {
    formData: any;
    setFormData: (data: any) => void;
}

export default function DeliveryOptions({ formData, setFormData }: DeliveryOptionsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Options</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Previously Store Location Delivery Details</p>
                </div>
            </div>
            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Shipping Method</label>
                        <input
                            type="text"
                            placeholder="Shipping Method"
                            value={formData.shippingMethod || ''}
                            onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                            className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Incoterms</label>
                        <input
                            type="text"
                            placeholder="Incoterms"
                            value={formData.incoterms || ''}
                            onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })}
                            className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Delivery Notes</label>
                        <input
                            type="text"
                            placeholder="Special delivery instructions..."
                            value={formData.deliveryNotes}
                            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                            className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Lift Gate</label>
                        <div className="flex items-center h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <input
                                type="checkbox"
                                checked={formData.liftGateRequired}
                                onChange={(e) => setFormData({ ...formData, liftGateRequired: e.target.checked })}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Equipment needed</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Inside Delivery</label>
                        <div className="flex items-center h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <input
                                type="checkbox"
                                checked={formData.insideDelivery}
                                onChange={(e) => setFormData({ ...formData, insideDelivery: e.target.checked })}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Bring inside facility</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
