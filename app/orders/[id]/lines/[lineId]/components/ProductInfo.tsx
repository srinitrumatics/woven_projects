"use client";

import { formatNumber } from "@/lib/utils/formatting";
import ReadOnlyField from "@/components/ui/ReadOnlyField";

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
                <ReadOnlyField label="Product Name" value={product.name || ''} />
                <ReadOnlyField label="Description" value={product.description || 'No description available'} />
                <ReadOnlyField label="Product Family" value={product.productFamily || ''} />
                <ReadOnlyField label="Brand Name" value={product.brand || '—'} />
                <ReadOnlyField label="Grouping" value={product.grouping || '—'} />
                <ReadOnlyField label="Taxable" value={product.isTaxable || ''} />
                <ReadOnlyField label="MOQ" value={formatNumber(product.moq, 0)} />
                <ReadOnlyField label="Lead-Time (Wks)" value={product.leadTimeWks != null ? formatNumber(product.leadTimeWks, 0) : '—'} />
                <ReadOnlyField label="Shipping Dimensions" value={product.shippingDimensions || '—'} />
            </div>
        </div>
    );
}
