import OrderClientPage from "./OrderClientPage";
import { getOrgConfig } from "@/lib/org-config";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const orgConfig = await getOrgConfig().catch(() => null);
  const indexName = orgConfig?.algoliaIndexName || "";

  return <OrderClientPage params={params} indexName={indexName} />;
}
