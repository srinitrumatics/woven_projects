"use client";

import { formatNumber } from "@/lib/utils/formatting";

interface ProductInfoProps {
    product: {
        name: string;
        description: string;
        brand: string;
        productFamily: string;
        grouping: string;
        isTaxable: string;
        moq: number;
        leadTimeWks?: number;
        shippingDimensions: string;
    };
}

export default function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">
                        Product Information
                    </h3>
                </div>
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

                {/* Brand Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Brand Name">
                        Brand Name
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.brand || '—'}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.brand}
                    />
                </div>

                {/* Grouping */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Grouping">
                        Grouping
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.grouping || '—'}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.grouping}
                    />
                </div>

                {/* Taxable */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Taxable">
                        Taxable
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.isTaxable || ''}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.isTaxable}
                    />
                </div>

                {/* MOQ */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="MOQ">
                        MOQ
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={formatNumber(product.moq, 0)}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={formatNumber(product.moq, 0)}
                    />
                </div>

                {/* Lead-Time (Wks) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Lead-Time (Wks)">
                        Lead-Time (Wks)
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.leadTimeWks != null ? formatNumber(product.leadTimeWks, 0) : '—'}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.leadTimeWks != null ? String(product.leadTimeWks) : '—'}
                    />
                </div>

                {/* Shipping Dimensions */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate" title="Shipping Dimensions">
                        Shipping Dimensions
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.shippingDimensions || '—'}
                        className="w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 cursor-not-allowed focus:outline-none truncate"
                        title={product.shippingDimensions}
                    />
                </div>
            </div>
        </div>
    );
}
