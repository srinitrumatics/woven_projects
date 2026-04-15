import { formatCurrency } from "@/lib/utils/formatting";

export default function MetricsTable({ product }: { product: any }) {
    if (!product) return null;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden p-4 mb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900">
                            <tr>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Unit Price</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Total Qty</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Total Price</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Qty Shipped</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Box Count</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">DIM Length</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">DIM Width</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">DIM Height</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Net Weight</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">Gross Weight</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">DW 139</th>
                                <th className="px-3 py-2 font-bold text-gray-900 ">DW 166</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-3 py-2 text-gray-600 font-medium truncate">{formatCurrency(product.Unit_Price__c || 0)}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Total_Order_Qty__c !== undefined ? product.Total_Order_Qty__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 font-bold truncate">{formatCurrency(product.Total_Price__c || 0)}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Qty_Shipped__c !== undefined ? product.Qty_Shipped__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Box__c !== undefined ? product.Box__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_Length__c !== undefined ? product.Case_Length__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_Width__c !== undefined ? product.Case_Width__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_Height__c !== undefined ? product.Case_Height__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_Net_Weight__c !== undefined ? product.Case_Net_Weight__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_Gross_Weight__c !== undefined ? product.Case_Gross_Weight__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_DW_139__c !== undefined ? product.Case_DW_139__c : ""}</td>
                                <td className="px-3 py-2 text-gray-600 truncate">{product.Case_DW_166__c !== undefined ? product.Case_DW_166__c : ""}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
