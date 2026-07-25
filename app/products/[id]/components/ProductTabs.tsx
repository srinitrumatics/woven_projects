"use client";

import Tabs from "@/components/ui/Tabs";

interface ProductTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

export default function ProductTabs({ activeTab, setActiveTab, tabs }: ProductTabsProps) {
  return (
    <Tabs
      tabs={tabs.map((tab) => ({ key: tab, label: tab }))}
      activeKey={activeTab}
      onChange={setActiveTab}
    />
  );
}
