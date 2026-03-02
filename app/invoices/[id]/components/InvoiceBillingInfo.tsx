"use client";

import { formatDate } from "@/lib/utils/formatting";

function InfoField({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="min-w-0">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate">{label}</p>
            <input
                type="text"
                readOnly
                value={String(value || '—')}
                className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-0 focus:border-gray-300"
                title={String(value || 'N/A')}
            />
        </div>
    );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">{subtitle}</p>
        </div>
    );
}

interface InvoiceBillingInfoProps {
    accountName: string;
    billToLocation?: string;
    billingAddress: string;
    paymentTerms: string;
    customerPO?: string;
    dueDate: string;
}

export default function InvoiceBillingInfo({
    accountName,
    billToLocation,
    billingAddress,
    paymentTerms,
    customerPO,
    dueDate
}: InvoiceBillingInfoProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <SectionTitle title="Billing Information" subtitle="Invoice Destination" />

            <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
                <InfoField label="Bill to Account" value={accountName} />
                <InfoField label="Bill to Location" value={billToLocation} />
            </div>

            <div className="mb-6">
                <InfoField label="Billing Address" value={billingAddress} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <InfoField label="Payment Terms" value={paymentTerms} />
                <InfoField label="Customer PO" value={customerPO} />
                <InfoField label="Due Date" value={formatDate(dueDate, 'numeric-dash')} />
            </div>
        </div>
    );
}
