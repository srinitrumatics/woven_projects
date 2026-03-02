"use client";

import { formatCurrency } from "@/lib/utils/formatting";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">{subtitle}</p>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(value)}</span>
        </div>
    );
}

function SummaryStatusRow({ label, value, variant }: { label: string; value?: string | number; variant: 'success' | 'danger' | 'neutral' }) {
    const textColor = variant === 'success' ? 'text-green-600 dark:text-green-400'
        : variant === 'danger' ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-500';

    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
            <span className={`font-bold ${textColor}`}>{value || '—'}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <SectionTitle title="Invoice Summary" subtitle="Review Invoice Summary" />

            <div className="mt-6 space-y-3">
                <SummaryRow label={`(${productCount}) Products - Subtotal`} value={productsSubtotal} />
                <SummaryRow label={`(${serviceCount}) Services - Subtotal`} value={servicesSubtotal} />
                <SummaryRow label="Taxes" value={taxTotal} />
                <SummaryRow label="Shipping" value={shippingCost} />

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="pt-2 space-y-2">
                    <SummaryStatusRow label="Collection Status" value={collectionStatus} variant="neutral" />
                    <SummaryStatusRow label="Amount Paid" value={formatCurrency(amountPaid)} variant="success" />
                    <SummaryStatusRow label="Applied Credits" value={formatCurrency(appliedCredits)} variant="success" />
                    <SummaryStatusRow label="Open Balance" value={formatCurrency(amountDue)} variant="danger" />
                </div>
            </div>

        </div>
    );
}
