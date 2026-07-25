import { useUserSession } from "@/components/UserSessionContext";
import { ProposalTabType } from "../types";
import Tabs from "@/components/ui/Tabs";

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
    const { selectedAccount } = useUserSession();
    const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
    const isRestricted = accountType === 'Customer' || accountType === 'NSO';

    const tabs = ([
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
    ] as { id: ProposalTabType; label: string; count?: number }[]).filter(tab => {
        if (isRestricted && tab.id === 'purchases') return false;
        return true;
    });

    return (
        <Tabs
            tabs={tabs.map((tab) => ({ key: tab.id, label: tab.label, count: tab.count }))}
            activeKey={activeTab}
            onChange={(key) => onTabChange(key as ProposalTabType)}
        />
    );
}
