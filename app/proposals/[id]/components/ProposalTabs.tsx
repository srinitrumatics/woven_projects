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
        fulfillment?: number;
        purchases?: number;
        returns?: number;
        taxes?: number;
    };
}

export default function ProposalTabs({ activeTab, onTabChange, counts = {} }: ProposalTabsProps) {
    const tabs: { id: ProposalTabType; label: string; count?: number }[] = [
        { id: "products", label: "Products", count: counts.products },
        { id: "elements", label: "Elements", count: counts.elements },
        { id: "taxes", label: "Taxes", count: counts.taxes },
        { id: "signatures", label: "Signatures" },
        { id: "projects", label: "Projects", count: counts.projects },
        { id: "orders", label: "Orders", count: counts.orders },
        { id: "fulfillment", label: "Fulfillment", count: counts.fulfillment },
        { id: "purchases", label: "Purchases", count: counts.purchases },
        { id: "returns", label: "Returns", count: counts.returns },
        { id: "files", label: "Files", count: counts.files },

    ];

    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
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
