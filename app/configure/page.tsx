import ConfigureOrderClientPage from "./ConfigureOrderClientPage";
import { getOrgConfig } from "@/lib/org-config";

export default async function ConfigureOrderPage() {
  const orgConfig = await getOrgConfig().catch(() => null);
  // Never fall back to a non-organization-specific index (e.g. NEXT_PUBLIC_ALGOLIA_INDEX_NAME) —
  // an unresolved org index must render as "unresolved", not silently show unrelated data.
  const indexName = orgConfig?.algoliaIndexName || "";

  return <ConfigureOrderClientPage indexName={indexName} />;
}
