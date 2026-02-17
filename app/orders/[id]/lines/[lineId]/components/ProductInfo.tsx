"use client";

import { formatNumber } from "@/lib/utils/formatting";

interface ProductInfoProps {
    product: {
        name: string;
        description: string;
        manufacturer: string;
        brand: string;
        productFamily: string;
        isTaxable: string;
        site: string;
        inventoryAccount: string;
        availableToSell: number;
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                        </p>
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Description
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-1 font-medium">
                            {product.description || "No description available"}
                        </p>
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Manufacturer Name
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {product.manufacturer}
                        </p>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3 py-6">
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Manufacturer DBA
                        </label>
                        <p className="text-sm text-gray-900 font-medium dark:text-white">
                            {product.brand}
                        </p>
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Product Family
                        </label>
                        <span className="inline-block px-2 py-0.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
                            {product.productFamily}
                        </span>
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            IsTaxable
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {product.isTaxable}
                        </p>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-3 py-6">
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Site
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {product.site}
                        </p>
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Inventory Account
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {product.inventoryAccount}
                        </p>
                    </div>
                    <div className="pb-6">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                            Available to Sell
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {formatNumber(product.availableToSell, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
