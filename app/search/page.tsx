import { getOrgConfig } from "@/lib/org-config";
import SearchClientPage from "./SearchClientPage";
import { requireAuth } from "@/lib/auth";

export default async function SearchPage() {
  // Optional: add auth checks if search requires it
  await requireAuth(['product-list', 'product-read']);

  const orgConfig = await getOrgConfig().catch(() => null);
  const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "movies_index";

  return <SearchClientPage indexName={indexName} />;
}
