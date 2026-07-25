import { QuoteStatus } from "@/app/quotes/types";
import Tabs from "@/components/ui/Tabs";

export type QuoteTabType = "quotelines" | "taxes" | "fulfillment" | "purchases" | "returns" | "files";

interface QuoteTabsProps {
    activeTab: QuoteTabType;
    onTabChange: (tab: QuoteTabType) => void;
    accountType?: string;
    counts?: {
        quotelines?: number;
        taxes?: number;
        fulfillment?: number;
        purchases?: number;
        returns?: number;
        files?: number;
    };
}

export default function QuoteTabs({ activeTab, onTabChange, accountType, counts = {} }: QuoteTabsProps) {
    const isCustomerOrNSO = accountType?.toLowerCase() === 'customer' || accountType?.toLowerCase() === 'nso';

    const tabs: { id: QuoteTabType; label: string; count?: number }[] = (([
        { id: "quotelines", label: "Quote Lines", count: counts.quotelines },
        { id: "taxes", label: "Taxes", count: counts.taxes },
        { id: "fulfillment", label: "Fulfillment", count: counts.fulfillment },
        { id: "purchases", label: "Purchases", count: counts.purchases },
        { id: "returns", label: "Returns", count: counts.returns },
        { id: "files", label: "Files", count: counts.files },
    ] as { id: QuoteTabType; label: string; count?: number }[]).filter(tab => {
        if (isCustomerOrNSO && tab.id === 'purchases') return false;
        return true;
    }));

    return (
        <Tabs
            tabs={tabs.map((tab) => ({ key: tab.id, label: tab.label, count: tab.count }))}
            activeKey={activeTab}
            onChange={(key) => onTabChange(key as QuoteTabType)}
        />
    );
}
