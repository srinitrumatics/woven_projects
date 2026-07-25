import { formatCurrency } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/DataTable";

export default function MetricsTable({ product }: { product: any }) {
    if (!product) return null;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden p-4 mb-4">
                <div className="overflow-x-auto">
                    <Table className="text-sm text-left table-fixed">
                        <THead>
                            <tr>
                                <Th className="font-bold">Unit Price</Th>
                                <Th className="font-bold">Total Qty</Th>
                                <Th className="font-bold">Total Price</Th>
                                <Th className="font-bold">Qty Shipped</Th>
                                <Th className="font-bold">Box Count</Th>
                                <Th className="font-bold">DIM Length</Th>
                                <Th className="font-bold">DIM Width</Th>
                                <Th className="font-bold">DIM Height</Th>
                                <Th className="font-bold">Net Weight</Th>
                                <Th className="font-bold">Gross Weight</Th>
                                <Th className="font-bold">DW 139</Th>
                                <Th className="font-bold">DW 166</Th>
                            </tr>
                        </THead>
                        <TBody>
                            <Tr>
                                <Td className="text-gray-600 font-medium truncate">{formatCurrency(product.Unit_Price__c || 0)}</Td>
                                <Td className="text-gray-600 truncate">{product.Total_Order_Qty__c !== undefined ? product.Total_Order_Qty__c : ""}</Td>
                                <Td className="text-gray-600 font-bold truncate">{formatCurrency(product.Total_Price__c || 0)}</Td>
                                <Td className="text-gray-600 truncate">{product.Qty_Shipped__c !== undefined ? product.Qty_Shipped__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Box__c !== undefined ? product.Box__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_Length__c !== undefined ? product.Case_Length__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_Width__c !== undefined ? product.Case_Width__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_Height__c !== undefined ? product.Case_Height__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_Net_Weight__c !== undefined ? product.Case_Net_Weight__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_Gross_Weight__c !== undefined ? product.Case_Gross_Weight__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_DW_139__c !== undefined ? product.Case_DW_139__c : ""}</Td>
                                <Td className="text-gray-600 truncate">{product.Case_DW_166__c !== undefined ? product.Case_DW_166__c : ""}</Td>
                            </Tr>
                        </TBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
