"use client";

import { useRouter } from "next/navigation";

interface OrderHeaderProps {
    id: string;
    orderStatus: string;
    name?: string;
    isEditing?: boolean;
    onEditToggle?: () => void;
    onClone?: () => void;
    isNew?: boolean;
    isTransfer?: boolean;
    isProposal?: boolean;
}

export default function OrderHeader({ id, orderStatus, name, isEditing, onEditToggle, onClone, isNew, isTransfer, isProposal }: OrderHeaderProps) {
    const router = useRouter();

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 min-w-0">
                <button onClick={() => router.push("/orders")} className="hover:text-gray-700 dark:hover:text-gray-300">Orders</button>
                <span>&gt;</span>
                <span className="hover:text-gray-700 dark:text-gray-300 truncate">Order Details</span>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white truncate" title={name || id}>{name || id}</span>
            </div>

            {/* Order header card (full width) */}
            <div className="w-full rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 min-w-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 3h18v4H3z" />
                                <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 01-2-2V7" />
                                <path d="M7 12h10" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white " title={name}>{name}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">Order Details and Summary</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end min-w-0">

                        {!isNew && orderStatus !== "Canceled" && orderStatus !== "Cancelled" && (
                            <>
                                <button
                                    onClick={onClone}
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 truncate"
                                    title="Clone Order"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                    </svg>
                                    <span className="text-sm font-medium truncate">Clone</span>
                                </button>
                                {orderStatus === "Draft" && (
                                    <button
                                        onClick={onEditToggle}
                                        className={`px-3 py-2 rounded-lg transition-colors ms-auto flex items-center gap-2 ${isEditing
                                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            }`}
                                        title={isEditing ? "Stop Editing" : "Edit Order"}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {isEditing ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            )}
                                        </svg>
                                        <span className="text-sm font-medium truncate">{isEditing ? "Cancel" : "Edit"}</span>
                                    </button>
                                )}
                            </>
                        )}

                        <div className="flex items-center gap-4">
                            {/* Status Badge */}
                            <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${orderStatus === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : orderStatus === "Draft"
                                        ? "bg-blue-100 text-blue-800"
                                        : orderStatus === "Approved"
                                            ? "bg-green-200 text-green-900"
                                            : orderStatus === "In Progress"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : orderStatus === "Submitted" || orderStatus === "Submit"
                                                    ? "bg-yellow-200 text-yellow-900"
                                                    : orderStatus === "Canceled"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    }`}
                            >
                                {orderStatus}
                            </span>

                            {/* Request Transfer Checkbox - only shown when true */}
                            {!!isTransfer && (
                                <label className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300 shadow-sm cursor-default select-none" title="Request Transfer">
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked
                                        className="w-4 h-4 text-blue-600 rounded cursor-default"
                                        onChange={() => {}}
                                    />
                                    <span className="text-sm font-semibold whitespace-nowrap">Request Transfer</span>
                                </label>
                            )}

                            {/* Request Proposal Checkbox - only shown when true */}
                            {!!isProposal && (
                                <label className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300 shadow-sm cursor-default select-none" title="Request Proposal">
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked
                                        className="w-4 h-4 text-blue-600 rounded cursor-default"
                                        onChange={() => {}}
                                    />
                                    <span className="text-sm font-semibold whitespace-nowrap">Request Proposal</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
