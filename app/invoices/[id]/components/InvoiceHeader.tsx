"use client";

import { useRouter } from "next/navigation";
import { InvoiceStatus } from "../../types";

interface InvoiceHeaderProps {
    invoiceNumber: string;
    status: InvoiceStatus;
    accountName: string;
    onBack: () => void;
}

export default function InvoiceHeader({ invoiceNumber, status, accountName, onBack }: InvoiceHeaderProps) {
    const getStatusStyles = (status: InvoiceStatus) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Partial":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Sent":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "Viewed":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "Overdue":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Draft":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            case "Cancelled":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Shipped":
                return "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300">Invoices</button>
                <span>&gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300">View Invoice</span>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white">{invoiceNumber}</span>
            </div>

            {/* Invoice header card (full width) */}
            <div className="w-full dark:bg-gray-800 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{invoiceNumber}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{accountName} • Invoice Details</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyles(status)}`}>
                            <StatusBadge status={status} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
function StatusBadge({ status }: { status: InvoiceStatus }) {
    const getStyles = () => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "Partial":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "Sent":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "Viewed":
                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "Overdue":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "Draft":
                return "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-400";
            case "Cancelled":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
            case "Shipped":
                return "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-500";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStyles()}`}>
            {status}
        </span>
    );
}
