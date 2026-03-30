"use client";

interface ProductTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

export default function ProductTabs({ activeTab, setActiveTab, tabs }: ProductTabsProps) {
  return (
    <div className="flex bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 overflow-x-auto scrollbar-hide py-3 md:py-0">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-8 py-5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all relative group ${
            activeTab === tab
              ? "text-blue-500"
              : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {tab}
          <div
            className={`absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 transition-transform duration-300 origin-left ${
              activeTab === tab ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50 opacity-20"
            }`}
          ></div>
        </button>
      ))}
    </div>
  );
}
