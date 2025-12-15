"use client";

import { formatCurrency } from "@/lib/utils/formatting";
import { Product, AuthorizedLocation } from "@/app/orders/types";

interface PDFTemplateProps {
    id: string;
    orderStatus: string;
    formData: any;
    shipLocations: AuthorizedLocation[];
    orderProducts: Product[];
    productsSubtotal: number;
    totalExciseTax: number;
    shipping: number;
    grandTotal: number;
}

export default function PDFTemplate({
    id,
    orderStatus,
    formData,
    shipLocations,
    orderProducts,
    productsSubtotal,
    totalExciseTax,
    shipping,
    grandTotal
}: PDFTemplateProps) {
    return (
        <div className="absolute top-0 left-[-9999px] w-[1000px] bg-white p-10 text-gray-900" id="pdf-template">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-primary" style={{ color: 'rgb(150, 194, 219)', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>WOVN</h1>
                    <div className="text-sm text-gray-600">
                        <p>123 Business Street</p>
                        <p>Business City, ST 12345</p>
                        <p>USA</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Purchase Order</h2>
                    <div className="text-sm">
                        <p><span className="font-semibold">PO No:</span> {formData.purchaseOrder || "N/A"}</p>
                        <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
                        <p><span className="font-semibold">Status:</span> {orderStatus}</p>
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Billing (Left) */}
                <div>
                    <div className="bg-primary-light dark:bg-gray-900 text-black px-4 font-semibold uppercase text-sm mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' }}>
                        Billing Information
                    </div>
                    <div className="px-4 text-sm text-gray-700">
                        <p className="font-bold mb-1">{formData.billTo !== "same" ? shipLocations.find(l => l.Id === formData.billTo)?.Name : "Same as Shipping"}</p>
                        <p className="whitespace-pre-wrap">{formData.billingAddress}</p>
                        <div className="mt-4">
                            <p><span className="font-semibold">Contact:</span> {formData.locationContact}</p>
                            <p><span className="font-semibold">Email:</span> {formData.contactEmail}</p>
                            <p><span className="font-semibold">Phone:</span> {formData.contactPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Shipping (Right) */}
                <div>
                    <div className="bg-primary-light dark:bg-gray-900 text-black px-4 font-semibold uppercase text-sm mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' }}>
                        Shipping Information
                    </div>
                    <div className="px-4 text-sm text-gray-700">
                        <p className="font-bold mb-1">{shipLocations.find(l => l.Id === formData.shipTo)?.Name}</p>
                        <p className="whitespace-pre-wrap">{formData.shippingAddress}</p>
                        <div className="mt-4">
                            <p><span className="font-semibold">Contact:</span> {formData.locationContact}</p>
                            <p><span className="font-semibold">Email:</span> {formData.contactEmail}</p>
                            <p><span className="font-semibold">Phone:</span> {formData.contactPhone}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Info Bar */}
            <div className="bg-primary-light dark:bg-gray-900 text-black px-4 py-2 grid grid-cols-4 gap-4 text-sm font-semibold uppercase mb-8 items-center text-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', alignItems: 'center', height: '35px', display: 'grid' }}>
                <div>Delivery Date</div>
                <div>Requested By</div>
                <div>Payment Terms</div>
                <div>Shipping Method</div>
            </div>
            <div className="px-4 grid grid-cols-4 gap-4 text-sm text-gray-700 mb-8 -mt-6">
                <div>{formData.requestedDeliveryDate || "N/A"}</div>
                <div>{formData.locationContact || "N/A"}</div>
                <div>{formData.paymentTerms || "N/A"}</div>
                <div>{formData.dropShip ? "Drop Ship" : "Standard"}</div>
            </div>

            {/* Notes */}
            {formData.orderNotes && (
                <div className="mb-8">
                    <div className="bg-primary-light dark:bg-gray-900 text-black px-4 py-2 font-semibold uppercase text-sm mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' }}>
                        Notes
                    </div>
                    <div className="px-4 text-sm text-gray-700 border border-gray-200 p-4 bg-gray-50">
                        {formData.orderNotes}
                    </div>
                </div>
            )}

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-primary-light dark:bg-gray-900 text-black text-sm uppercase font-semibold" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', verticalAlign: 'middle', height: '35px' }}>
                        <th className="px-4 py-2 text-left">Item Name</th>
                        <th className="px-4 py-2 text-left">SKU</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                    {orderProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="px-4 py-3">{product.name}</td>
                            <td className="px-4 py-3">{product.sku}</td>
                            <td className="px-4 py-3 text-center">{product.orderQty}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(product.unitPrice)}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(product.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-1/3">
                    <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                        <span className="font-semibold">Subtotal</span>
                        <span>{formatCurrency(productsSubtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                        <span className="font-semibold">Tax (15%)</span>
                        <span>{formatCurrency(totalExciseTax)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                        <span className="font-semibold">Shipping</span>
                        <span>{formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold bg-primary-light dark:bg-gray-900 text-black px-2 mt-2 items-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', height: '35px' }}>
                        <span>Order Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
