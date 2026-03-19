function EmptyTab({ label }: { label: string }) {
    return (
        <div className="p-12 text-center text-gray-400 italic">
            {label} content will appear here.
        </div>
    );
}



export function TrackingTimelineTab({ trackingData }: { trackingData?: any }) {
    if (!trackingData?.data?.trackingEvents) {
        return <EmptyTab label="Tracking Timeline" />;
    }

    const events = trackingData.data.trackingEvents.map((event: any, index: number) => ({
        status: event.statusDescription,
        description: event.exceptionDescription || event.statusDescription,
        location: [event.city, event.state, event.country].filter(Boolean).join(", "),
        dateTime: new Date(event.eventDateTime).toLocaleString(),
        isCompleted: index === 0
    }));

    return (
        <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tracking Status: {trackingData.data.currentStatusDescription}</h3>
            <div className="relative">
                {events.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 mb-8 last:mb-0 relative">
                        {index !== events.length - 1 && (
                            <div className="absolute left-[15px] top-[30px] bottom-[-30px] w-0.5 bg-gray-100 dark:bg-gray-700" />
                        )}
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
                        <div className="flex-1 min-w-0 flex justify-between gap-4">
                            <div className="min-w-0">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{item.status}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.description}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{item.location}</p>
                            </div>
                            <div className="shrink-0 text-right">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">{item.dateTime}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
