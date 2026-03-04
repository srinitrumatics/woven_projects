"use client";

import { formatCurrency } from "@/lib/utils/formatting";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-2 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={title}>{title}</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide truncate" title={subtitle}>{subtitle}</p>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between items-center text-sm font-medium gap-2">
            <span className="text-gray-600 dark:text-gray-400 truncate" title={label}>{label}</span>
            <span className="text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(value)}</span>
        </div>
    );
}

function SummaryStatusRow({ label, value, variant }: { label: string; value?: string | number; variant: 'success' | 'danger' | 'neutral' }) {
    const textColor = variant === 'success' ? 'text-green-600 dark:text-green-400'
        : variant === 'danger' ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-500';

    return (
        <div className="flex justify-between items-center text-sm gap-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium truncate" title={label}>{label}</span>
            <span className={`font-bold ${textColor} whitespace-nowrap`}>{value || '—'}</span>
        </div>
    );
}

interface InvoiceSummaryProps {
    subtotal: number;
    taxTotal: number;
    shippingCost: number;
    discountTotal: number;
    grandTotal: number;
    amountPaid: number;
    amountDue: number;
    productCount: number;
    serviceCount: number;
    productsSubtotal: number;
    servicesSubtotal: number;
    appliedCredits: number;
    collectionStatus?: string;
    handleDownloadPDF: () => void;
    handleMakePayment: () => void;
}

export default function InvoiceSummary({
    subtotal,
    taxTotal,
    shippingCost,
    grandTotal,
    amountPaid,
    amountDue,
    productCount,
    serviceCount,
    productsSubtotal,
    servicesSubtotal,
    appliedCredits,
    collectionStatus,
    handleDownloadPDF,
    handleMakePayment
}: InvoiceSummaryProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <SectionTitle title="Invoice Summary" subtitle="Review Invoice Summary" />

            <div className="flex-1 flex flex-col justify-between pt-2">
                <div className="flex-1 space-y-4">
                    <SummaryRow label={`(${productCount}) Products - Subtotal`} value={productsSubtotal} />
                    <SummaryRow label={`(${serviceCount}) Services - Subtotal`} value={servicesSubtotal} />
                    <SummaryRow label="Shipping" value={shippingCost} />
                    <SummaryRow label="Taxes" value={taxTotal} />
                </div>

                <div className="mt-auto pt-2 flex flex-col gap-4">
                    <div className="border-t-2 border-b-2 border-primary/20 dark:border-primary/40 pt-1 flex justify-between items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white truncate" title="Grand Total">Grand Total</span>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">{formatCurrency(grandTotal)}</span>
                    </div>

                    <div className="space-y-2">
                        <SummaryStatusRow label="Collection Status" value={collectionStatus} variant="neutral" />
                        <SummaryStatusRow label="Amount Paid" value={formatCurrency(amountPaid)} variant="success" />
                        <SummaryStatusRow label="Applied Credits" value={formatCurrency(appliedCredits)} variant="success" />
                        <SummaryStatusRow label="Open Balance" value={formatCurrency(amountDue)} variant="danger" />
                    </div>


                </div>
            </div>
        </div>
    );
}
