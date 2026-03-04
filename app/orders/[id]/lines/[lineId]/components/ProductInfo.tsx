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
        <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Product Information
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Essential Details about the Item</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-4">
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Product Name">
                        Product Name
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.name || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.name}
                    />
                </div>

                {/* Manufacturer DBA */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Manufacturer DBA">
                        Manufacturer DBA
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.manufacturerDBA || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.manufacturerDBA}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Description">
                        Description
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.description || 'No description available'}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.description}
                    />
                </div>

                {/* Product Family */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Product Family">
                        Product Family
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.productFamily || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.productFamily}
                    />
                </div>

                {/* Manufacturer */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Manufacturer">
                        Manufacturer
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.manufacturer || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.manufacturer}
                    />
                </div>

                {/* Is Taxable */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Is Taxable">
                        Is Taxable
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.isTaxable || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.isTaxable}
                    />
                </div>

                {/* Site */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Site">
                        Site
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.site || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.site}
                    />
                </div>

                {/* Inventory Account */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Inventory Account">
                        Inventory Account
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.inventoryAccount || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.inventoryAccount}
                    />
                </div>

                {/* Available to Sell */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Available to Sell">
                        Available to Sell
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={formatNumber(product.availableToSell, 0)}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={formatNumber(product.availableToSell, 0)}
                    />
                </div>
            </div>
        </div>
    );
}
