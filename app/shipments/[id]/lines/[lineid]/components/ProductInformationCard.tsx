import { formatDate } from "@/lib/utils/formatting";

export default function ProductInformationCard({ product }: { product: any }) {
    if (!product) return null;

    return (
        <div className="w1025:col-span-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[380px]">
            <div className="flex items-center gap-3 mb-6 min-w-0">
                <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h2 className="text-base font-bold text-gray-800 tracking-tight truncate" title="Product Information">Product Information</h2>
                    <p className="text-sm text-gray-500 truncate" title="Detailed Specifications">Detailed Specifications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Product Name">Product Name</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Product_Name || product.Product_Name__c || ""} value={product.Product_Name || product.Product_Name__c || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="HTS Code">HTS Code</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.HTS_Code__c || ""} value={product.HTS_Code__c || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Tracking URL">Tracking URL</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Tracking_URL__c || ""} value={product.Tracking_URL__c || ""} />
                </div>

                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Description">Description</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Product_Description__c || ""} value={product.Product_Description__c || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Proposed Product">Proposed Product</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Proposed_Product_Name || ""} value={product.Proposed_Product_Name || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Tracking Number">Tracking Number</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Tracking_Number__c || ""} value={product.Tracking_Number__c || ""} />
                </div>

                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Manufacturer DBA">Manufacturer DBA</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Manufacturer_DBA__c || ""} value={product.Manufacturer_DBA__c || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Customer Quote Line">Customer Quote Line</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Customer_Quote_Line_Name || ""} value={product.Customer_Quote_Line_Name || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Tracking Status">Tracking Status</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Tracking_Status__c || ""} value={product.Tracking_Status__c || ""} />
                </div>

                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Product Family">Product Family</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Product_Family__c || ""} value={product.Product_Family__c || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Sales Order Line">Sales Order Line</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={product.Sales_Order_Line_Name || ""} value={product.Sales_Order_Line_Name || ""} />
                </div>
                <div className="md:col-span-1">
                    <label className="text-gray-700 text-sm font-bold block mb-1 truncate" title="Estimated Delivery Date">Est Delivery Date</label>
                    <input readOnly type="text" className="w-full bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-sm text-gray-700 outline-none truncate cursor-default" title={formatDate(product.Estimated_Delivery_Date__c, 'numeric-dash') || ""} value={formatDate(product.Estimated_Delivery_Date__c, 'numeric-dash') || ""} />
                </div>
            </div>
        </div>
    );
}
