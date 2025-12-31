import { ProposalTabType } from "../types";

interface ProposalTabsProps {
    activeTab: ProposalTabType;
    onTabChange: (tab: ProposalTabType) => void;
    counts?: {
        products?: number;
        elements?: number;
        files?: number;
        projects?: number;
        orders?: number;
        fulfillments?: number;
        purchases?: number;
        returns?: number;
    };
}

export default function ProposalTabs({ activeTab, onTabChange, counts = {} }: ProposalTabsProps) {
    const tabs: { id: ProposalTabType; label: string; count?: number }[] = [
        { id: "products", label: "Products", count: counts.products },
        { id: "elements", label: "Elements", count: counts.elements },
        { id: "files", label: "Files", count: counts.files },
        { id: "signatures", label: "Signatures" },
        { id: "projects", label: "Projects", count: counts.projects },
        { id: "orders", label: "Orders", count: counts.orders },
        { id: "fulfillments", label: "Fulfillments", count: counts.fulfillments },
        { id: "purchases", label: "Purchase Orders", count: counts.purchases },
        { id: "returns", label: "Returns", count: counts.returns },
    ];

    return (
        <div className="flex gap-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                            ? "bg-white/20 text-white"
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
