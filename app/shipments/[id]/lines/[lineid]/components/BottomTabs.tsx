export default function BottomTabs({ activeTab, setActiveTab }: { activeTab: "inventory" | "serial" | "files"; setActiveTab: (tab: "inventory" | "serial" | "files") => void }) {
    return (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 items-center">
                {[
                    { id: "inventory", label: "Inventory" },
                    { id: "serial", label: "Serial Numbers" },
                    { id: "files", label: "Files" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg transition-colors truncate flex-shrink-0 ${activeTab === tab.id
                            ? "bg-primary text-white"
                            : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-4">
                {activeTab === 'inventory' && (
                    <div className="text-sm text-gray-500 p-4">Inventory Data...</div>
                )}
                {activeTab === 'serial' && (
                    <div className="text-sm text-gray-500 p-4">Serial Numbers Data...</div>
                )}
                {activeTab === 'files' && (
                    <div className="text-sm text-gray-500 p-4">Files Data...</div>
                )}
            </div>
        </div>
    );
}
