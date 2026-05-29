import { getOrgConfig } from "@/lib/org-config";
import SearchClientPage from "./SearchClientPage";

export default async function SearchPage() {
  const orgConfig = await getOrgConfig().catch(() => null);
  const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "movies_index";
  
  return <SearchClientPage indexName={indexName} />;
}
