const fs = require('fs');
let content = fs.readFileSync('app/products/page.tsx', 'utf8');

content = content.replace(/import ProductClientPage from "\.\/ProductClientPage";/, `import ProductClientPage from "./ProductClientPage";
import { getOrgConfig } from "@/lib/org-config";`);

content = content.replace(/await requireAuth\(\['product-list', 'product-read'\]\);/, 
`await requireAuth(['product-list', 'product-read']);
  const orgConfig = await getOrgConfig().catch(() => null);
  const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "wovn_products_local";`);

content = content.replace(/<ProductClientPage \/>/, `<ProductClientPage indexName={indexName} />`);

fs.writeFileSync('app/products/page.tsx', content);
