import Sidebar from "@/components/layouts/Sidebar";
import { requireAuth } from "@/lib/auth";
import ProductClientPage from "./ProductClientPage";
import { getOrgConfig } from "@/lib/org-config";

export default async function ProductsPage() {
  // Server-side authentication and permission check
  await requireAuth(['product-list', 'product-read']);

  const orgConfig = await getOrgConfig().catch(() => null);
  const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "wovn_products_local";

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Catalog</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 truncate" title="Browse our complete product catalog with pricing and availability">
          Browse our complete product catalog with pricing and availability
        </p>
      </div>
      <ProductClientPage indexName={indexName} />
    </Sidebar>
  );
}