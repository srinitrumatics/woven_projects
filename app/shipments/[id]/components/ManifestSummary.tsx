import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import TrackingTimelineModal from "./TrackingTimelineModal";

interface ManifestSummaryProps {
    shipment: any;
}

function SummaryItem({ label, value, isMain = false }: { label: string; value: string; isMain?: boolean }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span
                className={`text-gray-700 dark:text-gray-300 truncate flex-1 ${isMain ? "font-medium" : "text-sm"}`}
                title={label}
            >
                {label}
            </span>
            <span className={`text-gray-900 dark:text-white shrink-0 ${isMain ? "font-bold" : "font-medium text-sm"}`}>
                {value}
            </span>
        </div>
    );
}

export default function ManifestSummary({ shipment }: ManifestSummaryProps) {
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manifest Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Financial and Package Review</p>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                <SummaryItem
                    label={`(${shipment.Total_Lines__c || 0}) Products - Total`}
                    value={formatCurrency(shipment.Total_Price__c || 0)}
                    isMain
                />
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <SummaryItem label="Box Count" value={formatNumber(shipment.Box__c || 0, 2)} />
                    <SummaryItem label="Net Weight (lbs)" value={formatNumber(shipment.Case_Net_Weight__c || 0, 2)} />
                    <SummaryItem label="Gross Weight (lbs)" value={formatNumber(shipment.Case_Gross_Weight__c || 0, 2)} />
                    <SummaryItem label="DW 139 (lbs)" value={formatNumber(shipment.Case_DW_139__c || 0, 2)} />
                    <SummaryItem label="DW 166 (lbs)" value={formatNumber(shipment.Case_DW_166__c || 0, 2)} />
                </div>
            </div>

            <div className="flex gap-2 mt-6">
                <button className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                    Track Shipment
                </button>
                <button
                    onClick={() => setIsTimelineOpen(true)}
                    className="flex-1 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                >
                    Tracking Timeline
                </button>
            </div>

            <TrackingTimelineModal
                isOpen={isTimelineOpen}
                onClose={() => setIsTimelineOpen(false)}
            />
        </div>
    );
}
