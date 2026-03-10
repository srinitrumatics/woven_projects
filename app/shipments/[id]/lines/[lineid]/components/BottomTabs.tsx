import InventoryTab from "./InventoryTab";
import SerialNumbersTab from "./SerialNumbersTab";
import FilesTab from "./FilesTab";

export default function BottomTabs({ activeTab, setActiveTab, accountId, contactId, lineId }: { activeTab: "inventory" | "serial" | "files"; setActiveTab: (tab: "inventory" | "serial" | "files") => void; accountId: string; contactId: string; lineId: string; }) {
    return (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 items-center">
                {[
                    { id: "inventory", label: "Inventory" },
                    { id: "serial", label: "Serial Numbers Logs" },
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
                    <InventoryTab accountId={accountId} contactId={contactId} lineId={lineId} />
                )}
                {activeTab === 'serial' && (
                    <SerialNumbersTab accountId={accountId} contactId={contactId} lineId={lineId} />
                )}
                {activeTab === 'files' && (
                    <FilesTab accountId={accountId} contactId={contactId} lineId={lineId} />
                )}
            </div>
        </div>
    );
}
