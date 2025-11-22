import Sidebar from "@/components/layouts/Sidebar";

export default function InventoryPage() {
  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track inventory positions across all locations
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Overview</h2>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Export Report
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Inventory page coming soon...</p>
      </div>
    </Sidebar>
  );
}
