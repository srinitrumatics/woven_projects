"use client";

import { useRouter } from "next/navigation";

interface ShipmentHeaderProps {
    name: string;
    status: string;
    onBack: () => void;
}

function getStatusColor(status: string): string {
    switch (status) {
        case "Approved":
        case "Delivered":
        case "Shipped":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        case "In Transit":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        case "Pending Shipment":
        case "Pending":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
}

export default function ShipmentHeader({ name, status, onBack }: ShipmentHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 min-w-0">
                <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-300 truncate">
                    Shipments
                </button>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white truncate">{name}</span>
            </div>

            <div className="w-full dark:bg-gray-800 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3h18v4H3z" />
                                <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 01-2-2V7" />
                                <path d="M7 12h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={name}>{name}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400" title="Shipping Manifest Details and Summary">Shipping Manifest Details and Summary</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(status)}`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
