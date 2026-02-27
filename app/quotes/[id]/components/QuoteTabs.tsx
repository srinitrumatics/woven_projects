import { QuoteStatus } from "@/app/quotes/types";

export type QuoteTabType = "quotelines" | "taxes" | "fulfillment" | "purchases" | "returns" | "files";

interface QuoteTabsProps {
    activeTab: QuoteTabType;
    onTabChange: (tab: QuoteTabType) => void;
    counts?: {
        quotelines?: number;
        taxes?: number;
        fulfillment?: number;
        purchases?: number;
        returns?: number;
        files?: number;
    };
}

export default function QuoteTabs({ activeTab, onTabChange, counts = {} }: QuoteTabsProps) {
    const tabs: { id: QuoteTabType; label: string; count?: number }[] = [
        { id: "quotelines", label: "Quote Lines", count: counts.quotelines },
        { id: "taxes", label: "Taxes", count: counts.taxes },
        { id: "fulfillment", label: "Fulfillment", count: counts.fulfillment },
        { id: "purchases", label: "Purchases", count: counts.purchases },
        { id: "returns", label: "Returns", count: counts.returns },
        { id: "files", label: "Files", count: counts.files },
    ];

    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar w-full">
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
