export type ShipmentTabId = "lines" | "inventory" | "serial" | "files" | "tracking";

interface ShipmentTabsProps {
    activeTab: ShipmentTabId;
    onTabChange: (tab: ShipmentTabId) => void;
    counts?: {
        lines?: number;
        inventory?: number;
        serial?: number;
        files?: number;
        tracking?: number;
    };
}

const TAB_DEFS: { id: ShipmentTabId; label: string }[] = [
    { id: "lines", label: "Shipping Manifest Lines" },
    { id: "inventory", label: "Inventory Positions" },
    { id: "serial", label: "Serial Numbers Logs" },
    { id: "files", label: "Files" },
];

export default function ShipmentTabs({ activeTab, onTabChange, counts = {} }: ShipmentTabsProps) {
    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto w-full">
            {TAB_DEFS.map((tab) => {
                const count = counts[tab.id];
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 text-sm font-medium ${activeTab === tab.id
                            ? "bg-primary text-white"
                            : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                        title={`${tab.label}${count !== undefined && count > 0 ? ` (${count})` : ''}`}
                    >
                        {tab.label}
                        {count !== undefined && count > 0 && ` (${count})`}
                    </button>
                );
            })}
        </div>
    );
}
