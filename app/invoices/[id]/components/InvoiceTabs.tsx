"use client";

import Tabs from "@/components/ui/Tabs";

export type InvoiceTabType = "products" | "taxes" | "payments" | "credits" | "files";

interface InvoiceTabsProps {
    activeTab: InvoiceTabType;
    onTabChange: (tab: InvoiceTabType) => void;
    counts?: {
        products?: number;
        taxes?: number;
        payments?: number;
        credits?: number;
        files?: number;
    };
}

export default function InvoiceTabs({ activeTab, onTabChange, counts = {} }: InvoiceTabsProps) {
    const tabs: { id: InvoiceTabType; label: string; count?: number }[] = [
        { id: "products", label: "Invoice Lines", count: counts.products },
        { id: "taxes", label: "Taxes", count: counts.taxes },
        { id: "payments", label: "Payments", count: counts.payments },
        { id: "credits", label: "Credits", count: counts.credits },
        { id: "files", label: "Files", count: counts.files },
    ];

    return (
        <Tabs
            tabs={tabs.map((tab) => ({ key: tab.id, label: tab.label, count: tab.count }))}
            activeKey={activeTab}
            onChange={(key) => onTabChange(key as InvoiceTabType)}
        />
    );
}
