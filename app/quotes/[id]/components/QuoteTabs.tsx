import { QuoteStatus } from "../../types";

export type QuoteTabType = "products" | "taxes" | "fulfillment" | "purchases" | "returns" | "files";

interface QuoteTabsProps {
    activeTab: QuoteTabType;
    onTabChange: (tab: QuoteTabType) => void;
    counts?: {
        products?: number;
        taxes?: number;
        fulfillment?: number;
        purchases?: number;
        returns?: number;
        files?: number;
    };
}

export default function QuoteTabs({ activeTab, onTabChange, counts = {} }: QuoteTabsProps) {
    const tabs: { id: QuoteTabType; label: string; count?: number }[] = [
        { id: "products", label: "Quote Lines", count: counts.products },
        { id: "taxes", label: "Taxes", count: counts.taxes },
        { id: "fulfillment", label: "Fulfillment", count: counts.fulfillment },
        { id: "purchases", label: "Purchases", count: counts.purchases },
        { id: "returns", label: "Returns", count: counts.returns },
        { id: "files", label: "Files", count: counts.files },
    ];

    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar mb-6 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
