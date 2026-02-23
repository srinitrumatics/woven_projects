"use client";

import { formatNumber } from "@/lib/utils/formatting";

interface ProductInfoProps {
    product: {
        name: string;
        description: string;
        manufacturer: string;
        manufacturerDBA: string;
        brand: string;
        productFamily: string;
        isTaxable: string;
        site: string;
        inventoryAccount: string;
        availableToSell: number;
        productGrouping: string;
    };
}

export default function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Product Information
                </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                {/* Column 1 */}
                <div className="space-y-3 py-6">
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Product Name
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.name || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Description
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.description || 'No description available'}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Manufacturer
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.manufacturer || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3 py-6">
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Manufacturer DBA
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.manufacturerDBA || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Product Family
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.productFamily || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Is Taxable
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.isTaxable || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-3 py-6">
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Site
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.site || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Inventory Account
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={product.inventoryAccount || ''}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Available to Sell
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={formatNumber(product.availableToSell, 0)}
                            className="w-full h-9 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
