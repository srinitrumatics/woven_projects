"use client";

import React from 'react';
import Tabs from "@/components/ui/Tabs";

interface SupplierBillTabsProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
    counts?: {
        lines?: number;
        payments?: number;
        debits?: number;
        files?: number;
    };
}

export default function SupplierBillTabs({ activeTab, onTabChange, counts = {} }: SupplierBillTabsProps) {
    const tabs = [
        { id: "lines", label: "Supplier Bill Lines", count: counts.lines },
        { id: "payments", label: "Payments", count: counts.payments },
        { id: "debits", label: "Debit Memos", count: counts.debits },
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
