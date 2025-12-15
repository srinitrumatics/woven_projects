"use client";

import { useRouter } from "next/navigation";

interface OrderHeaderProps {
    id: string;
    orderStatus: string;
}

export default function OrderHeader({ id, orderStatus }: OrderHeaderProps) {
    const router = useRouter();

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <button onClick={() => router.push("/orders")} className="hover:text-gray-700 dark:hover:text-gray-300">Orders</button>
                <span>&gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300">Edit Order</span>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white">Order #{id}</span>
            </div>

            {/* Order header card (full width) */}
            <div className="w-full dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 3h18v4H3z" />
                                <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 01-2-2V7" />
                                <path d="M7 12h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{id}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Order details and summary</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${orderStatus === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : orderStatus === "Draft"
                                    ? "bg-blue-100 text-blue-800"
                                    : orderStatus === "Approved"
                                        ? "bg-green-200 text-green-900"
                                        : orderStatus === "In Progress"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : orderStatus === "Submitted"
                                                ? "bg-yellow-200 text-yellow-900"
                                                : orderStatus === "Canceled"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                }`}
                        >
                            {orderStatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
