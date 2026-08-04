"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";

// Component imports
import ShipmentHeader from "./components/ShipmentHeader";
import ShipmentDetails from "./components/ShipmentDetails";
import ShipmentNotes from "./components/ShipmentNotes";
import ShipmentInfo from "./components/ShipmentInfo";
import TrackingInfo from "./components/TrackingInfo";
import ManifestSummary from "./components/ManifestSummary";
import ShipmentTabs, { ShipmentTabId } from "./components/ShipmentTabs";
import ShipmentLinesTab from "./components/ShipmentLinesTab";
import InventoryTab from "./components/InventoryTab";
import ShipmentFilesTab from "./components/ShipmentFilesTab";
import SerialNumbersTab from "./components/SerialNumbersTab";
import { useUserSession } from "@/components/UserSessionContext";

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

const formatAddress = (addr: any): string => {
  if (!addr) return "N/A";
  return [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ");
};

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ShipmentTabId>("lines");
  const [inventoryCount, setInventoryCount] = useState<number | undefined>(undefined);
  const [serialCount, setSerialCount] = useState<number | undefined>(undefined);
  const [filesCount, setFilesCount] = useState<number | undefined>(undefined);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";

  useEffect(() => {
    async function fetchShipmentDetails() {
      try {
        setLoading(true);

        // Run both fetches in parallel
        const [manifestRes, inventoryRes, serialRes, filesRes] = await Promise.allSettled([
          fetch(`/api/salesforce/shipments?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}`),
          fetch(`/api/salesforce/shipments?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&tabName=Inventory`),
          fetch(`/api/salesforce/shipments?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&objectId=${id}&objectName=Shipping_Manifest__c&tabName=Serial_Numbers`),
          fetch(`/api/salesforce/shipments?action=files&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&objectId=${encodeURIComponent(id)}`),
        ]);

        // ── Manifest ──────────────────────────────────────────────────────
        if (manifestRes.status === "rejected" || !manifestRes.value.ok) {
          throw new Error("Failed to fetch shipment details");
        }
        const manifestJson = await manifestRes.value.json();
        const manifest = manifestJson?.data?.[0]?.Shipping_Manifest__c?.[0];
        if (!manifest) { setError("Shipment not found"); return; }
        setShipment(manifest);

        // ── Inventory count ───────────────────────────────────────────────
        if (inventoryRes.status === "fulfilled" && inventoryRes.value.ok) {
          const invJson = await inventoryRes.value.json();
          const invRows: any[] = invJson?.data?.[0]?.Inventory_Position__c ?? [];
          setInventoryCount(invRows.length);
        }

        // ── Serial Number count ───────────────────────────────────────────
        if (serialRes.status === "fulfilled" && serialRes.value.ok) {
          const serialJson = await serialRes.value.json();
          const serialRows: any[] = serialJson?.data?.[0]?.Serial_Number_Log__c ?? [];
          setSerialCount(serialRows.length);
        }

        // ── Files count ───────────────────────────────────────────────────
        if (filesRes.status === "fulfilled" && filesRes.value.ok) {
          const filesJson = await filesRes.value.json();
          const filesRows: any[] = Array.isArray(filesJson) ? filesJson : [];
          setFilesCount(filesRows.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id && SF_ACCOUNT_ID && SF_CONTACT_ID) fetchShipmentDetails();
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  const handleTrackShipment = async () => {
    try {
      setIsLoadingTracking(true);
      const res = await fetch(`/api/shipments/${id}/track`);
      if (!res.ok) throw new Error("Failed to fetch tracking");
      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      console.error("Error tracking shipment:", err);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center min-h-[400px] min-w-0">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-gray-500 dark:text-gray-400 truncate" title="Loading shipment details...">Loading shipment details...</p>
        </div>
      </Sidebar>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !shipment) {
    return (
      <Sidebar>
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2 ">Error</h2>
          <p className="text-red-600 dark:text-red-300 truncate">{error || "Shipment not found"}</p>
          <button
            onClick={() => router.push("/shipments")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Shipments
          </button>
        </div>
      </Sidebar>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────
  return (
    <Sidebar>
      {/* Header */}
      <ShipmentHeader
        name={shipment.Name}
        status={shipment.Status__c}
        onBack={() => router.push("/shipments")}
      />

      {/* Details grid */}
      <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6 items-stretch">
        {/* Row 1 — Details (7) + Notes (3) */}
        <div className="w1025:col-span-7">
          <ShipmentDetails shipment={shipment} />
        </div>
        <div className="w1025:col-span-3">
          <ShipmentNotes notes={shipment.Shipping_Manifest_Notes__c} />
        </div>

        {/* Row 2 — Shipping + Tracking (7) + Summary (3) */}
        <div className="w1025:col-span-7">
          <div className="flex flex-col gap-6 min-w-0">
            <ShipmentInfo shipment={shipment} formatAddress={formatAddress} />
            <TrackingInfo shipment={shipment} trackingData={trackingData} />
          </div>
        </div>
        <div className="w1025:col-span-3">
          <ManifestSummary
            shipment={shipment}
            onTrack={handleTrackShipment}
            isLoadingTracking={isLoadingTracking}
            trackingData={trackingData}
          />
        </div>
      </div>

      {/* Tabs section */}
      <div className="mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <ShipmentTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{ lines: shipment.Total_Lines__c, inventory: inventoryCount, serial: serialCount, files: filesCount }}
            />
          </div>

          {/* Tab content */}
          <div className="p-2">
            {activeTab === "lines" && <ShipmentLinesTab shipmentId={id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} />}
            {activeTab === "inventory" && <InventoryTab shipmentId={id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} onCountLoaded={setInventoryCount} />}
            {activeTab === "serial" && <SerialNumbersTab shipmentId={id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} onCountLoaded={setSerialCount} />}
            {activeTab === "files" && <ShipmentFilesTab shipmentId={id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} onFilesCountChange={setFilesCount} />}
          </div>
        </div>
      </div>

      {/* Floating action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] z-40">
        <button
          onClick={() => router.push("/shipments")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="h-24" />
    </Sidebar>
  );

}