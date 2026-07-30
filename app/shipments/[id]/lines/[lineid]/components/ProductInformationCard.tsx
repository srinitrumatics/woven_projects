import { formatDate } from "@/lib/utils/formatting";

export default function ProductInformationCard({ product }: { product: any }) {
    if (!product) return null;

    const serialControlled = product.IsSerialControlled__c !== undefined
        ? (product.IsSerialControlled__c ? "Yes" : "No")
        : "—";

    return (
        <div className="w1025:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
            <div className="flex items-center gap-2 mb-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white " title="Product Information">
                        Product Information
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title="Detailed Product Specifications">Detailed Product Specifications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-4 gap-y-3">
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Product Name">
                        Product Name
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.Product_Name || product.Product_Name__c || ""}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.Product_Name || product.Product_Name__c || ""}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Description">
                        Description
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.Product_Description__c || "No description available"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.Product_Description__c || "No description available"}
                    />
                </div>

                {/* Product Family */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Product Family">
                        Product Family
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.Product_Family__c || "—"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.Product_Family__c || "—"}
                    />
                </div>

                {/* Brand Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Brand Name">
                        Brand Name
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.Product_Brand_Name__c || product.Brand_Name__c || product.Brand__c || "—"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.Product_Brand_Name__c || product.Brand_Name__c || product.Brand__c || "—"}
                    />
                </div>

                {/* HTS Code */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="HTS Code">
                        HTS Code
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.HTS_Code__c || "—"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.HTS_Code__c || "—"}
                    />
                </div>

                {/* ECCN */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="ECCN">
                        ECCN
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.ECCN__c || "—"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.ECCN__c || "—"}
                    />
                </div>

                {/* UPC */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="UPC">
                        UPC
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.UPC__c || "—"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.UPC__c || "—"}
                    />
                </div>

                {/* GTIN */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="GTIN">
                        GTIN
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={product.GTIN__c || "—"}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={product.GTIN__c || "—"}
                    />
                </div>

                {/* Serial Controlled */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-500 mb-1 truncate" title="Serial Controlled">
                        Serial Controlled
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={serialControlled}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none cursor-default truncate"
                        title={serialControlled}
                    />
                </div>
            </div>
        </div>
    );
}
