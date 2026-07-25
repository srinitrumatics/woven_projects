"use client";

export interface TabItem {
    key: string;
    label: string;
    count?: number;
    disabled?: boolean;
}

export interface TabsProps {
    tabs: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
    className?: string;
}

export default function Tabs({ tabs, activeKey, onChange, className = "" }: TabsProps) {
    return (
        <div className={`flex flex-nowrap gap-2 overflow-x-auto w-full ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => !tab.disabled && onChange(tab.key)}
                    disabled={tab.disabled}
                    className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 text-sm font-medium ${
                        activeKey === tab.key
                            ? "bg-primary text-white"
                            : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={`${tab.label}${tab.count !== undefined && tab.count > 0 ? ` (${tab.count})` : ""}`}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && ` (${tab.count})`}
                </button>
            ))}
        </div>
    );
}
