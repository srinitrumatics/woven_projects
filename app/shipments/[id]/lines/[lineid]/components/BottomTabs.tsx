import { useState, useEffect } from "react";
import InventoryTab from "./InventoryTab";
import SerialNumbersTab from "./SerialNumbersTab";
import FilesTab from "./FilesTab";

export default function BottomTabs({ activeTab, setActiveTab, accountId, contactId, lineId, initialCounts }: {
    activeTab: "inventory" | "serial" | "files";
    setActiveTab: (tab: "inventory" | "serial" | "files") => void;
    accountId: string;
    contactId: string;
    lineId: string;
    initialCounts?: { inventory?: number; serial?: number; files?: number };
}) {
    const [counts, setCounts] = useState<{ inventory: number; serial: number; files: number }>({
        inventory: initialCounts?.inventory ?? 0,
        serial: initialCounts?.serial ?? 0,
        files: initialCounts?.files ?? 0
    });

    useEffect(() => {
        if (initialCounts?.inventory !== undefined && initialCounts?.serial !== undefined && initialCounts?.files !== undefined) {
            setCounts({
                inventory: initialCounts.inventory,
                serial: initialCounts.serial,
                files: initialCounts.files
            });
            return;
        }

        async function fetchCounts() {
            try {
                const [invRes, serRes, fileRes] = await Promise.all([
                    fetch(`/api/salesforce/shipments?${new URLSearchParams({ accountId, contactId, objectId: lineId, objectName: "Shipping_Manifest_Line__c", tabName: "Inventory" })}`),
                    fetch(`/api/salesforce/shipments?${new URLSearchParams({ accountId, contactId, objectId: lineId, objectName: "Shipping_Manifest_Line__c", tabName: "Serial_Numbers" })}`),
                    fetch(`/api/salesforce/shipments?${new URLSearchParams({ accountId, contactId, objectId: lineId, objectName: "Shipping_Manifest_Line__c", action: "files" })}`)
                ]);

                let invCount = 0;
                if (invRes.ok) {
                    const result = await invRes.json();
                    if (result && result.data && Array.isArray(result.data)) {
                        let records = [];
                        if (result.data.length > 0 && result.data[0].Inventory_Position__c) {
                            records = result.data[0].Inventory_Position__c;
                        } else if (result.data.length > 0 && !result.data[0].hasOwnProperty('Inventory_Position__c')) {
                            records = result.data;
                        }
                        invCount = records.length;
                    }
                }

                let serCount = 0;
                if (serRes.ok) {
                    const result = await serRes.json();
                    if (result && result.data && Array.isArray(result.data)) {
                        let records = [];
                        if (result.data.length > 0 && result.data[0].Serial_Number_Log__c) {
                            records = result.data[0].Serial_Number_Log__c;
                        } else if (result.data.length > 0 && !result.data[0].hasOwnProperty('Serial_Number_Log__c')) {
                            records = result.data;
                        }
                        serCount = records.length;
                    }
                }

                let fileCount = 0;
                if (fileRes.ok) {
                    const result = await fileRes.json();
                    if (Array.isArray(result)) {
                        fileCount = result.length;
                    }
                }

                setCounts({ inventory: invCount, serial: serCount, files: fileCount });
            } catch (error) {
                console.error("Error fetching tab counts:", error);
            }
        }

        if (accountId && contactId && lineId) {
            fetchCounts();
        }
    }, [accountId, contactId, lineId, initialCounts]);
    return (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 items-center">
                {[
                    { id: "inventory", label: `Inventory Positions${counts.inventory > 0 ? ` (${counts.inventory})` : ""}` },
                    { id: "serial", label: `Serial Numbers Logs${counts.serial > 0 ? ` (${counts.serial})` : ""}` },
                    { id: "files", label: `Files${counts.files > 0 ? ` (${counts.files})` : ""}` }
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
