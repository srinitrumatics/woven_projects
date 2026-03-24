"use client";

import React from 'react';
import { formatDate } from "@/lib/utils/formatting";

interface TrackingInfo {
    Logistics_Partner__c: string;
    Logistics_Contact__c: string;
    Shipping_Method__c: string;
    Service_Level__c: string;
    Tracking_URL__c: string;
    Tracking_Number__c: string;
    Tracking_Status__c: string;
    Estimated_Delivery_Date__c: string;
    Actual_Delivery_Date__c: string;
}

interface TrackingInformationTabProps {
    data: TrackingInfo[];
}

export default function TrackingInformationTab({ data }: TrackingInformationTabProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">There is no Tracking Information associated with this purchase order.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Logistics Partner</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Logistics Contact</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Shipping Method</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Service Level</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Tracking URL</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Tracking Number</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Tracking Status</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Estimated Delivery Date</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Actual Delivery Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.Logistics_Partner__c || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.Logistics_Contact__c || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.Shipping_Method__c || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.Service_Level__c || ' '}</td>
                                <td className="px-4 py-3 text-sm ext-gray-900 dark:text-white">
                                    {item.Tracking_URL__c ? (
                                        item.Tracking_URL__c
                                    ) : ' '}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.Tracking_Number__c || ' '}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${item.Tracking_Status__c === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        item.Tracking_Status__c === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                        {item.Tracking_Status__c || ' '}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatDate(item.Estimated_Delivery_Date__c, 'numeric-dash') || ' '}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatDate(item.Actual_Delivery_Date__c, 'numeric-dash') || ' '}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
