"use client";

import type { TabItem } from "./Tabs";

export interface SubTabsProps {
    tabs: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
    className?: string;
}

export default function SubTabs({ tabs, activeKey, onChange, className }: SubTabsProps) {
    return (
        <div className={`flex gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-3  ${className ?? ""}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => !tab.disabled && onChange(tab.key)}
                    disabled={tab.disabled}
                    className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px flex-shrink-0 ${activeKey === tab.key
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
