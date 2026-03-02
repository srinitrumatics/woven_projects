"use client";

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
        <div className="flex flex-nowrap gap-2 overflow-x-auto w-full p-4">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        " (" + tab.count + ")"
                    )}
                </button>
            ))}
        </div>
    );
}
