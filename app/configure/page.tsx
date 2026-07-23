import ConfigureOrderClientPage from "./ConfigureOrderClientPage";
import { getOrgConfig } from "@/lib/org-config";

export default async function ConfigureOrderPage() {
  const orgConfig = await getOrgConfig().catch(() => null);
  const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "";

  return <ConfigureOrderClientPage indexName={indexName} />;
}
