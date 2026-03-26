"use client";

interface POTabsProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
    counts?: {
        lines?: number;
        bills?: number;
        serialNumbers?: number;
        returns?: number;
        tracking?: number;
        files?: number;
    };
}

export default function POTabs({ activeTab, onTabChange, counts = {} }: POTabsProps) {
    const tabs = [
        { id: "lines", label: "Purchase Order Lines", count: counts.lines },
        { id: "bills", label: "Supplier Bills", count: counts.bills },
        { id: "serialNumbers", label: "Serial Numbers", count: counts.serialNumbers },
        { id: "returns", label: "Returns", count: counts.returns },
        { id: "tracking", label: "Tracking Information", count: counts.tracking },
        { id: "files", label: "Files", count: counts.files },
    ];

    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto py-2 w-full">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 ${activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                    title={`${tab.label}${tab.count !== undefined && tab.count > 0 ? ` (${tab.count})` : ''}`}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        ` (${tab.count})`
                    )}
                </button>
            ))}
        </div>
    );
}
