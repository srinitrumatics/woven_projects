const fs = require('fs');
let content = fs.readFileSync('app/api/salesforce/orders/route.ts', 'utf8');

content = content.replace(/import \{ NextResponse \} from "next\/server";/, `import { NextResponse } from "next/server";
import { getOrgConfig } from "@/lib/org-config";`);

content = content.replace(/const baseUrl = \(process\.env\.SF_DATA_URL \|\| ""\)\.replace\(\/\\\/\+\$\/, ""\);/, 
`    const orgConfig = await getOrgConfig().catch(e => {
      console.warn("Could not load org config, falling back to env:", e.message);
      return null;
    });
    const baseUrl = (orgConfig?.salesforceUrl || process.env.SF_DATA_URL || "").replace(/\\/+$/, "");`);

content = content.replace(/orderUrl = \`\$\{process\.env\.SF_DATA_URL\}\/services\/apexrest\/gtherp\/orders\`;/g, 
`orderUrl = \`\$\{baseUrl\}/services/apexrest/gtherp/orders\`;`);

fs.writeFileSync('app/api/salesforce/orders/route.ts', content);
