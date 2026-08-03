"use client";

import React from "react";
import Modal from "@/components/ui/Modal";

interface timelineItem {
    status: string;
    description: string;
    location: string;
    dateTime: string;
    isCompleted?: boolean;
}

interface TrackingTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackingData?: any;
}

const mockTimelineData: timelineItem[] = [
    {
        status: "Delivered",
        description: "Package delivered to recipient",
        location: 'Oakland, CA " Oakland, CA 94612',
        dateTime: "11/12/2024, 2:32:00 PM",
        isCompleted: true
    },
    // ... rest of mock data can be assumed or kept simple for now
];

export default function TrackingTimelineModal({ isOpen, onClose, trackingData }: TrackingTimelineModalProps) {
    let displayData: timelineItem[] = [];

    if (trackingData?.data?.trackingEvents) {
        displayData = trackingData.data.trackingEvents.map((event: any, index: number) => ({
            status: event.statusDescription,
            description: event.exceptionDescription || event.statusDescription,
            location: [event.city, event.state, event.country].filter(Boolean).join(", "),
            dateTime: new Date(event.eventDateTime).toLocaleString(),
            isCompleted: index === 0 // Assuming first one is latest/current
        }));
    } else {
        displayData = mockTimelineData;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tracking Timeline"
            size="xl"
            footer={
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm truncate"
                >
                    Close
                </button>
            }
        >
                    <div className="relative">
                        {displayData.length > 0 ? (
                            displayData.map((item, index) => (
                                <div key={index} className="flex gap-4 mb-8 last:mb-0 relative">
                                    {/* Connector Line */}
                                    {index !== displayData.length - 1 && (
                                        <div className="absolute left-[15px] top-[30px] bottom-[-30px] w-0.5 bg-gray-100 dark:bg-gray-700" />
                                    )}

                                    {/* Icon/Dot */}
                                    <div className="relative shrink-0 mt-1">
                                        {item.isCompleted ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border-2 border-white dark:border-gray-800 z-10 relative">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 z-10 relative">
                                                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Details */}
                                    <div className="flex-1 min-w-0 flex justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white ">
                                                {item.status}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                                                {item.description}
                                            </p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 truncate">
                                                {item.location}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap truncate">
                                                {item.dateTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No tracking events found.
                            </div>
                        )}
                    </div>
        </Modal>
    );
}
