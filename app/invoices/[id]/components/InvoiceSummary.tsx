"use client";

import { formatCurrency, formatDate } from "@/lib/utils/formatting";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-3 mb-6 min-w-0">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white " title={title}>{title}</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400" title={subtitle}>{subtitle}</p>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between items-center text-sm font-medium gap-2 min-w-0">
            <span className="text-gray-600 dark:text-gray-400" title={label}>{label}</span>
            <span className="text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(value)}</span>
        </div>
    );
}

function SummaryStatusRow({ label, value, variant }: { label: string; value?: string | number; variant: 'success' | 'danger' | 'neutral' }) {
    const textColor = variant === 'success' ? 'text-green-600 dark:text-green-400'
        : variant === 'danger' ? 'text-red-600 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400';

    return (
        <div className="flex justify-between items-center text-sm gap-2 min-w-0">
            <span className="text-gray-600 dark:text-gray-400 font-medium" title={label}>{label}</span>
            <span className={`font-bold ${textColor} whitespace-nowrap`}>{value || ""}</span>
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
    handleMakePayment: () => void;
    issuedDate: string;
    daysOutstanding: number;
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
    handleMakePayment,
    issuedDate,
    daysOutstanding
}: InvoiceSummaryProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
            <SectionTitle title="Invoice Summary" subtitle="Review your Invoice Summary" />

            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex-1 space-y-2">
                    <SummaryRow label={`(${productCount}) Products - Subtotal`} value={productsSubtotal} />
                    <SummaryRow label={`(${serviceCount}) Services - Subtotal`} value={servicesSubtotal} />
                    <SummaryRow label="Shipping" value={shippingCost} />
                    <SummaryRow label="Taxes" value={taxTotal} />
                </div>

                <div className="mt-auto pt-1 flex flex-col gap-4">
                    <div className="border-t-2 border-b-2 border-primary/20 dark:border-primary/40 pt-1 flex justify-between items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white" title="Grand Total">Grand Total</span>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">{formatCurrency(grandTotal)}</span>
                    </div>

                    <div className="space-y-2">
                        <SummaryStatusRow label="Issued Date" value={issuedDate ? formatDate(issuedDate, 'numeric-dash') : ''} variant="neutral" />
                        <SummaryStatusRow label="Days Outstanding" value={daysOutstanding ? daysOutstanding : 0} variant="neutral" />
                        <SummaryStatusRow label="Collection Status" value={collectionStatus} variant={collectionStatus === 'Past Due' ? 'danger' : 'neutral'} />
                        <SummaryStatusRow label="Amount Paid" value={formatCurrency(amountPaid)} variant="success" />
                        <SummaryStatusRow label="Applied Credits" value={formatCurrency(appliedCredits)} variant="success" />
                        <SummaryStatusRow label="Open Balance" value={formatCurrency(amountDue)} variant="danger" />
                    </div>
                </div>
            </div>
        </div>
    );
}
