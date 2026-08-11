"use client";

import { useRouter } from "next/navigation";
import { InvoiceStatus } from "../../types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface InvoiceHeaderProps {
    invoiceNumber: string;
    status: InvoiceStatus;
    accountName: string;
    onBack: () => void;
}

export default function InvoiceHeader({ invoiceNumber, status, accountName, onBack }: InvoiceHeaderProps) {

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 min-w-0">
                <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300 truncate">Invoices</button>
                <span>&gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300 truncate">Invoice Details</span>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white truncate">{invoiceNumber}</span>
            </div>

            {/* Invoice header card (full width) */}
            <div className="w-full  p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white " title={invoiceNumber}>{invoiceNumber}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{accountName} • Invoice Details</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                        <StatusBadge status={status} variant="pill" />
                    </div>
                </div>
            </div>
        </div>
    );
}

