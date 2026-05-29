const fs = require('fs');
let content = fs.readFileSync('app/api/algolia/route.ts', 'utf8');

content = content.replace(/import \{ NextResponse \} from "next\/server";/, `import { NextResponse } from "next/server";
import { getOrgConfig } from "@/lib/org-config";`);

content = content.replace(/const indexName = process\.env\.NEXT_PUBLIC_ALGOLIA_INDEX_NAME \|\| "wovn_products_local";/g, 
`const orgConfig = await getOrgConfig().catch(() => null);
    const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "wovn_products_local";`);

fs.writeFileSync('app/api/algolia/route.ts', content);
