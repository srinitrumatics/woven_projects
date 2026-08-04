import Tabs from "@/components/ui/Tabs";

export type ShipmentTabId = "lines" | "inventory" | "serial" | "files";

interface ShipmentTabsProps {
    activeTab: ShipmentTabId;
    onTabChange: (tab: ShipmentTabId) => void;
    counts?: {
        lines?: number;
        inventory?: number;
        serial?: number;
        files?: number;
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
        <Tabs
            tabs={TAB_DEFS.map((tab) => ({ key: tab.id, label: tab.label, count: counts[tab.id] }))}
            activeKey={activeTab}
            onChange={(key) => onTabChange(key as ShipmentTabId)}
        />
    );
}
