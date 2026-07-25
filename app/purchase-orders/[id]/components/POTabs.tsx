"use client";

import Tabs from "@/components/ui/Tabs";

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
        { id: "serialNumbers", label: "Serial Number Logs", count: counts.serialNumbers },
        { id: "returns", label: "Returns", count: counts.returns },
        { id: "tracking", label: "Tracking Information", count: counts.tracking },
        { id: "files", label: "Files", count: counts.files },
    ];

    return (
        <Tabs
            tabs={tabs.map((tab) => ({ key: tab.id, label: tab.label, count: tab.count }))}
            activeKey={activeTab}
            onChange={onTabChange}
        />
    );
}
